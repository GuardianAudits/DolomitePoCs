import { BalanceCheckFlag } from "@dolomite-exchange/dolomite-margin";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { ZERO_ADDRESS } from "@openzeppelin/upgrades/lib/utils/Addresses";
import { expect } from "chai";
import { BigNumber, BigNumberish } from "ethers";
import { parseEther } from "ethers/lib/utils";
import {
  EventEmitterRegistry,
  GmxV2IsolationModeTokenVaultV1,
  GmxV2IsolationModeTokenVaultV1__factory,
  GmxV2IsolationModeUnwrapperTraderV2,
  GmxV2IsolationModeWrapperTraderV2,
  GmxV2MarketTokenPriceOracle,
  GmxV2Registry,
  IGmxMarketToken,
  TestGmxV2IsolationModeVaultFactory,
} from "src/types";
import { depositIntoDolomiteMargin } from "src/utils/dolomite-utils";
import {
  BYTES_EMPTY,
  BYTES_ZERO,
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
  expectWalletBalanceIsGreaterThan,
} from "test/utils/assertions";
import {
  createGmxV2IsolationModeTokenVaultV1,
  createGmxV2IsolationModeUnwrapperTraderV2,
  createGmxV2IsolationModeWrapperTraderV2,
  createGmxV2Library,
  createGmxV2MarketTokenPriceOracle,
  createGmxV2Registry,
  createTestGmxV2IsolationModeVaultFactory,
  getDepositObject,
  getInitiateWrappingParams,
  getOracleParams,
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
import { GMX_V2_CALLBACK_GAS_LIMIT } from "../../../src/utils/constructors/gmx";
import {
  createDolomiteRegistryImplementation,
  createEventEmitter,
} from "../../utils/dolomite";
import { defaultAbiCoder } from "ethers/lib/utils";
enum UnwrapTradeType {
  ForWithdrawal = 0,
  ForDeposit = 1,
}
enum ReversionType {
  None = 0,
  Assert = 1,
  Require = 2,
}

enum FreezeType {
  Deposit = 0,
  Withdrawal = 1,
}

const defaultAccountNumber = "0";
const borrowAccountNumber = "123";
const executionFee = parseEther(".01");
const usdcAmount = BigNumber.from("1000000000"); // $1000
const DUMMY_DEPOSIT_KEY =
  "0x6d1ff6ffcab884211992a9d6b8261b7fae5db4d2da3a5eb58647988da3869d6f";
const minAmountOut = parseEther("1600");

describe("GmxV2IsolationModeWrapperTraderV2", () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let underlyingToken: IGmxMarketToken;
  let allowableMarketIds: BigNumberish[];
  let gmxV2Registry: GmxV2Registry;
  let unwrapper: GmxV2IsolationModeUnwrapperTraderV2;
  let wrapper: GmxV2IsolationModeWrapperTraderV2;
  let factory: TestGmxV2IsolationModeVaultFactory;
  let vault: GmxV2IsolationModeTokenVaultV1;
  let priceOracle: GmxV2MarketTokenPriceOracle;
  let eventEmitter: EventEmitterRegistry;
  let marketId: BigNumber;

  before(async () => {
    core = await setupCoreProtocol(getDefaultCoreProtocolConfigForGmxV2());
    underlyingToken = core.gmxEcosystemV2!.gmxEthUsdMarketToken.connect(
      core.hhUser1
    );
    const library = await createGmxV2Library();
    const userVaultImplementation = await createGmxV2IsolationModeTokenVaultV1(
      core,
      library
    );
    gmxV2Registry = await createGmxV2Registry(core, GMX_V2_CALLBACK_GAS_LIMIT);

    allowableMarketIds = [core.marketIds.nativeUsdc!, core.marketIds.weth];
    factory = await createTestGmxV2IsolationModeVaultFactory(
      core,
      library,
      gmxV2Registry,
      allowableMarketIds,
      allowableMarketIds,
      core.gmxEcosystemV2!.gmxEthUsdMarketToken,
      userVaultImplementation
    );
    unwrapper = await createGmxV2IsolationModeUnwrapperTraderV2(
      core,
      factory,
      library,
      gmxV2Registry
    );
    wrapper = await createGmxV2IsolationModeWrapperTraderV2(
      core,
      factory,
      library,
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

    await factory.createVault(core.hhUser1.address);
    const vaultAddress = await factory.getVaultByAccount(core.hhUser1.address);
    vault = setupUserVaultProxy<GmxV2IsolationModeTokenVaultV1>(
      vaultAddress,
      GmxV2IsolationModeTokenVaultV1__factory,
      core.hhUser1
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

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe.only("Guardian:: Deposit Transfer Is Skipped Through Call Function", () => {
    let depositKey: string;

    async function setupBalances(
      inputMarketId: BigNumberish,
      inputAmount: BigNumberish,
      minAmountOut: BigNumberish,
      beforeInitiatingHook: () => Promise<void> = async () => {}
    ) {
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        inputMarketId,
        inputAmount,
        BalanceCheckFlag.Both
      );
      await beforeInitiatingHook();
      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        inputMarketId,
        inputAmount,
        marketId,
        minAmountOut,
        wrapper,
        executionFee
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee }
      );

      expect(await vault.isVaultFrozen()).to.eq(true);
      expect(await vault.shouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);

      const filter = eventEmitter.filters.AsyncDepositCreated();
      const eventArgs = (await eventEmitter.queryFilter(filter))[0].args;
      depositKey = eventArgs.key;
      expect(eventArgs.token).to.eq(factory.address);

      const deposit = await wrapper.getDepositInfo(depositKey);
      expect(deposit.key).to.eq(depositKey);
      expect(deposit.vault).to.eq(vault.address);
      expect(deposit.accountNumber).to.eq(borrowAccountNumber);
      expect(deposit.outputAmount).to.eq(minAmountOut);
      expect(deposit.isRetryable).to.eq(false);
      expect(eventArgs.deposit.key).to.eq(depositKey);
      expect(eventArgs.deposit.vault).to.eq(vault.address);
      expect(eventArgs.deposit.accountNumber).to.eq(borrowAccountNumber);
      expect(eventArgs.deposit.outputAmount).to.eq(minAmountOut);
      expect(eventArgs.deposit.isRetryable).to.eq(false);

      expect(await vault.isVaultAccountFrozen(defaultAccountNumber)).to.eq(
        false
      );
      expect(await vault.isVaultAccountFrozen(borrowAccountNumber)).to.eq(true);
      expect(
        await factory.getPendingAmountByAccount(
          vault.address,
          borrowAccountNumber,
          FreezeType.Deposit
        )
      ).to.eq(initiateWrappingParams.minAmountOut);
    }

    async function expectStateIsCleared() {
      expect(await vault.isVaultFrozen()).to.eq(false);
      expect(await vault.shouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
      expect(
        await underlyingToken.allowance(wrapper.address, vault.address)
      ).to.eq(0);

      const deposit = await wrapper.getDepositInfo(depositKey);
      expect(deposit.key).to.eq(depositKey);
      expect(deposit.vault).to.eq(ZERO_ADDRESS);
      expect(deposit.accountNumber).to.eq(ZERO_BI);
      expect(deposit.outputAmount).to.eq(ZERO_BI);

      expect(await vault.isVaultAccountFrozen(defaultAccountNumber)).to.eq(
        false
      );
      expect(await vault.isVaultAccountFrozen(borrowAccountNumber)).to.eq(
        false
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

    it("Guardian:: Deposit Transfer Is Skipped Through Call Function", async () => {
      const minAmountOut = parseEther("100");
      await setupBalances(core.marketIds.weth, ONE_ETH_BI, minAmountOut);

      // Skip Transfer is false prior to callFunction
      expect(await vault.shouldSkipTransfer()).to.eq(false);

      // Call the callFunction and skip the transfer
      const dolomiteMarginCaller = await impersonate(
        core.dolomiteMargin.address,
        true
      );
      await core.dolomiteMargin.ownerSetGlobalOperator(
        core.hhUser5.address,
        true
      );
      // Trigger callFunction to set shouldSkipTransfer = true
      await unwrapper
        .connect(dolomiteMarginCaller)
        .callFunction(
          core.hhUser5.address,
          { owner: vault.address, number: borrowAccountNumber },
          encodeWithdrawalKeyForCallFunction(
            "1",
            UnwrapTradeType.ForDeposit,
            depositKey
          )
        );
      // Now the transfer will be skipped on deposit execution
      expect(await vault.shouldSkipTransfer()).to.eq(true);

      // Wrapper Trader has 0 GM prior to deposit execution
      expect(await underlyingToken.balanceOf(wrapper.address)).to.eq(0);

      const result = await core
        .gmxEcosystemV2!.gmxDepositHandler.connect(
          core.gmxEcosystemV2!.gmxExecutor
        )
        .executeDeposit(
          depositKey,
          getOracleParams(
            core.tokens.weth.address,
            core.tokens.nativeUsdc!.address
          )
        );
      await expectEvent(eventEmitter, result, "AsyncDepositExecuted", {
        key: depositKey,
        token: factory.address,
      });

      // The excess funds were not transferred into the Vault
      expect(await underlyingToken.balanceOf(vault.address)).to.eq(
        minAmountOut
      );
      // Funds are in the Wrapper Trader
      expect(await underlyingToken.balanceOf(wrapper.address)).to.be.gt("0");
      // Deposit source wrapper is not reset since the shouldSkipTransfer() case is entered.
      expect(await vault.isDepositSourceWrapper()).to.eq(true);
    });
  });
});
