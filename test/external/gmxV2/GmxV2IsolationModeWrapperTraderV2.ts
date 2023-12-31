import { BalanceCheckFlag } from '@dolomite-exchange/dolomite-margin';
import { mine } from '@nomicfoundation/hardhat-network-helpers';
import { ZERO_ADDRESS } from '@openzeppelin/upgrades/lib/utils/Addresses';
import { expect } from 'chai';
import { BigNumber, BigNumberish } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
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
} from 'src/types';
import { depositIntoDolomiteMargin } from 'src/utils/dolomite-utils';
import { BYTES_EMPTY, BYTES_ZERO, ONE_BI, ONE_ETH_BI, ZERO_BI } from 'src/utils/no-deps-constants';
import { impersonate, revertToSnapshotAndCapture, setEtherBalance, snapshot } from 'test/utils';
import {
  expectEvent,
  expectProtocolBalance,
  expectProtocolBalanceIsGreaterThan,
  expectThrow,
  expectWalletBalance, expectWalletBalanceIsGreaterThan,
} from 'test/utils/assertions';
import {
  createGmxV2IsolationModeTokenVaultV1,
  createGmxV2IsolationModeUnwrapperTraderV2,
  createGmxV2IsolationModeWrapperTraderV2,
  createGmxV2Library,
  createGmxV2MarketTokenPriceOracle,
  createGmxV2Registry,
  createTestGmxV2IsolationModeVaultFactory, getDepositObject,
  getInitiateWrappingParams, getOracleParams,
} from 'test/utils/ecosystem-token-utils/gmx';
import {
  CoreProtocol,
  disableInterestAccrual,
  getDefaultCoreProtocolConfigForGmxV2,
  setupCoreProtocol, setupGMBalance,
  setupNativeUSDCBalance,
  setupTestMarket,
  setupUserVaultProxy,
  setupWETHBalance,
} from 'test/utils/setup';
import { GMX_V2_CALLBACK_GAS_LIMIT } from '../../../src/utils/constructors/gmx';
import { createDolomiteRegistryImplementation, createEventEmitter } from '../../utils/dolomite';

enum ReversionType {
  None = 0,
  Assert = 1,
  Require = 2,
}

enum FreezeType {
  Deposit = 0,
  Withdrawal = 1,
}

const defaultAccountNumber = '0';
const borrowAccountNumber = '123';
const executionFee = parseEther('.01');
const usdcAmount = BigNumber.from('1000000000'); // $1000
const DUMMY_DEPOSIT_KEY = '0x6d1ff6ffcab884211992a9d6b8261b7fae5db4d2da3a5eb58647988da3869d6f';
const minAmountOut = parseEther('1600');

describe('GmxV2IsolationModeWrapperTraderV2', () => {
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
    underlyingToken = core.gmxEcosystemV2!.gmxEthUsdMarketToken.connect(core.hhUser1);
    const library = await createGmxV2Library();
    const userVaultImplementation = await createGmxV2IsolationModeTokenVaultV1(core, library);
    gmxV2Registry = await createGmxV2Registry(core, GMX_V2_CALLBACK_GAS_LIMIT);

    allowableMarketIds = [core.marketIds.nativeUsdc!, core.marketIds.weth];
    factory = await createTestGmxV2IsolationModeVaultFactory(
      core,
      library,
      gmxV2Registry,
      allowableMarketIds,
      allowableMarketIds,
      core.gmxEcosystemV2!.gmxEthUsdMarketToken,
      userVaultImplementation,
    );
    unwrapper = await createGmxV2IsolationModeUnwrapperTraderV2(
      core,
      factory,
      library,
      gmxV2Registry,
    );
    wrapper = await createGmxV2IsolationModeWrapperTraderV2(
      core,
      factory,
      library,
      gmxV2Registry,
    );

    priceOracle = await createGmxV2MarketTokenPriceOracle(core, gmxV2Registry);
    await priceOracle.connect(core.governance).ownerSetMarketToken(factory.address, true);
    marketId = await core.dolomiteMargin.getNumMarkets();
    await setupTestMarket(core, factory, true, priceOracle);

    await disableInterestAccrual(core, core.marketIds.weth);
    await disableInterestAccrual(core, core.marketIds.nativeUsdc!);

    await factory.connect(core.governance).ownerInitialize([unwrapper.address, wrapper.address]);
    await core.dolomiteMargin.connect(core.governance).ownerSetGlobalOperator(factory.address, true);

    await gmxV2Registry.connect(core.governance).ownerSetUnwrapperByToken(factory.address, unwrapper.address);
    await gmxV2Registry.connect(core.governance).ownerSetWrapperByToken(factory.address, wrapper.address);

    eventEmitter = await createEventEmitter(core);
    const newRegistry = await createDolomiteRegistryImplementation();
    await core.dolomiteRegistryProxy.connect(core.governance).upgradeTo(newRegistry.address);
    await core.dolomiteRegistry.connect(core.governance).ownerSetEventEmitter(eventEmitter.address);

    await factory.createVault(core.hhUser1.address);
    const vaultAddress = await factory.getVaultByAccount(core.hhUser1.address);
    vault = setupUserVaultProxy<GmxV2IsolationModeTokenVaultV1>(
      vaultAddress,
      GmxV2IsolationModeTokenVaultV1__factory,
      core.hhUser1,
    );

    await setupWETHBalance(core, core.hhUser1, ONE_ETH_BI, core.dolomiteMargin);
    await depositIntoDolomiteMargin(core, core.hhUser1, defaultAccountNumber, core.marketIds.weth, ONE_ETH_BI);

    await setupNativeUSDCBalance(core, core.hhUser1, usdcAmount, core.dolomiteMargin);
    await depositIntoDolomiteMargin(core, core.hhUser1, defaultAccountNumber, core.marketIds.nativeUsdc!, usdcAmount);
    await setEtherBalance(core.gmxEcosystemV2!.gmxExecutor.address, parseEther('100'));

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#initializer', () => {
    it('should work normally', async () => {
      expect(await wrapper.GMX_REGISTRY_V2()).to.eq(gmxV2Registry.address);
    });

    it('should not initialize twice', async () => {
      await expectThrow(
        wrapper.initialize(
          factory.address,
          core.dolomiteMargin.address,
          gmxV2Registry.address,
        ),
        'Initializable: contract is already initialized',
      );
    });
  });

  describe('#initiateWrapping', () => {
    it('should work normally with long token', async () => {
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both,
      );
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, ONE_ETH_BI);

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        minAmountOut,
        wrapper,
        executionFee,
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee },
      );

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, 0);
      expect(await vault.isVaultFrozen()).to.eq(true);
      expect(await vault.shouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
    });

    it('should work normally with short token', async () => {
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        BalanceCheckFlag.Both,
      );
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, usdcAmount);

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        marketId,
        minAmountOut,
        wrapper,
        executionFee,
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee }, // @follow-up How to calculate executionFee
      );

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, 0);
      expect(await vault.isVaultFrozen()).to.eq(true);
      expect(await vault.shouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
    });
  });

  describe('#afterDepositExecution', () => {
    let depositKey: string;

    async function setupBalances(
      inputMarketId: BigNumberish,
      inputAmount: BigNumberish,
      minAmountOut: BigNumberish,
      beforeInitiatingHook: () => Promise<void> = async () => {
      },
    ) {
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        inputMarketId,
        inputAmount,
        BalanceCheckFlag.Both,
      );
      await beforeInitiatingHook();
      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        inputMarketId,
        inputAmount,
        marketId,
        minAmountOut,
        wrapper,
        executionFee,
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee },
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

      expect(await vault.isVaultAccountFrozen(defaultAccountNumber)).to.eq(false);
      expect(await vault.isVaultAccountFrozen(borrowAccountNumber)).to.eq(true);
      expect(await factory.getPendingAmountByAccount(vault.address, borrowAccountNumber, FreezeType.Deposit))
        .to
        .eq(initiateWrappingParams.minAmountOut);
    }

    async function expectStateIsCleared() {
      expect(await vault.isVaultFrozen()).to.eq(false);
      expect(await vault.shouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
      expect(await underlyingToken.allowance(wrapper.address, vault.address)).to.eq(0);

      const deposit = await wrapper.getDepositInfo(depositKey);
      expect(deposit.key).to.eq(depositKey);
      expect(deposit.vault).to.eq(ZERO_ADDRESS);
      expect(deposit.accountNumber).to.eq(ZERO_BI);
      expect(deposit.outputAmount).to.eq(ZERO_BI);

      expect(await vault.isVaultAccountFrozen(defaultAccountNumber)).to.eq(false);
      expect(await vault.isVaultAccountFrozen(borrowAccountNumber)).to.eq(false);
    }

    it('should work normally with long token', async () => {
      const minAmountOut = parseEther('100');
      await setupBalances(core.marketIds.weth, ONE_ETH_BI, minAmountOut);
      const result = await core.gmxEcosystemV2!.gmxDepositHandler.connect(core.gmxEcosystemV2!.gmxExecutor)
        .executeDeposit(
          depositKey,
          getOracleParams(core.tokens.weth.address, core.tokens.nativeUsdc!.address),
        );
      await expectEvent(eventEmitter, result, 'AsyncDepositExecuted', {
        key: depositKey,
        token: factory.address,
      });

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, 0);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, 0);
      await expectProtocolBalanceIsGreaterThan(
        core,
        { owner: vault.address, number: borrowAccountNumber },
        marketId,
        minAmountOut,
        10,
      );
      expect(await underlyingToken.balanceOf(vault.address)).to.be.gte(minAmountOut);
      await expectStateIsCleared();
    });

    it('should work normally with short token', async () => {
      const minAmountOut = parseEther('1060');
      await setupBalances(core.marketIds.nativeUsdc!, usdcAmount, minAmountOut);

      const result = await core.gmxEcosystemV2!.gmxDepositHandler.connect(core.gmxEcosystemV2!.gmxExecutor)
        .executeDeposit(
          depositKey,
          getOracleParams(core.tokens.weth.address, core.tokens.nativeUsdc!.address),
        );
      await expectEvent(eventEmitter, result, 'AsyncDepositExecuted', {
        key: depositKey,
        token: factory.address,
      });

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, 0);
      await expectProtocolBalanceIsGreaterThan(
        core,
        { owner: vault.address, number: borrowAccountNumber },
        marketId,
        minAmountOut,
        10,
      );
      expect(await underlyingToken.balanceOf(vault.address)).to.be.gte(minAmountOut);
      await expectStateIsCleared();
    });

    it('should work when deposit will fail because of max supply wei (sends diff to vault owner)', async () => {
      const minAmountOut = parseEther('1060');
      await setupBalances(core.marketIds.nativeUsdc!, usdcAmount, minAmountOut);
      await expectWalletBalance(core.hhUser1, underlyingToken, ZERO_BI);

      await core.dolomiteMargin.ownerSetMaxWei(marketId, ONE_BI);
      const result = await core.gmxEcosystemV2!.gmxDepositHandler.connect(core.gmxEcosystemV2!.gmxExecutor)
        .executeDeposit(
          depositKey,
          getOracleParams(core.tokens.weth.address, core.tokens.nativeUsdc!.address),
        );
      await expectEvent(eventEmitter, result, 'AsyncDepositFailed', {
        key: depositKey,
        token: factory.address,
        reason: `OperationImpl: Total supply exceeds max supply <${marketId.toString()}>`,
      });

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, 0);
      await expectProtocolBalance(
        core,
        vault.address,
        defaultAccountNumber,
        marketId,
        ZERO_BI,
      );
      await expectProtocolBalance(core, vault, borrowAccountNumber, marketId, minAmountOut);
      // The vault should only hold the min
      await expectWalletBalance(vault, underlyingToken, minAmountOut);
      // The owner should hold anything extra (beyond the min)
      await expectWalletBalanceIsGreaterThan(core.hhUser1, underlyingToken, ONE_BI);
      await expectStateIsCleared();
    });

    it('should work when deposit fails due to insufficient collateralization', async () => {
      const minAmountOut = parseEther('1060');
      await setupBalances(core.marketIds.nativeUsdc!, usdcAmount, minAmountOut, async () => {
        const oraclePrice = (await priceOracle.getPrice(factory.address)).value;
        const wethPrice = (await core.dolomiteMargin.getMarketPrice(core.marketIds.weth)).value;
        const wethAmountToBorrow = minAmountOut.mul(oraclePrice).div(wethPrice).mul(100).div(120);
        await vault.transferFromPositionWithOtherToken(
          borrowAccountNumber,
          defaultAccountNumber,
          core.marketIds.weth,
          wethAmountToBorrow,
          BalanceCheckFlag.To,
        );
      });

      await core.testEcosystem!.testPriceOracle.setPrice(factory.address, ONE_BI); // as close to 0 as possible
      await core.dolomiteMargin.ownerSetPriceOracle(marketId, core.testEcosystem!.testPriceOracle.address);
      const result = await core.gmxEcosystemV2!.gmxDepositHandler.connect(core.gmxEcosystemV2!.gmxExecutor)
        .executeDeposit(
          depositKey,
          getOracleParams(core.tokens.weth.address, core.tokens.nativeUsdc!.address),
        );
      await expectEvent(eventEmitter, result, 'AsyncDepositFailed', {
        key: depositKey,
        token: factory.address,
        reason: `OperationImpl: Undercollateralized account <${vault.address.toLowerCase()}, ${borrowAccountNumber.toString()}>`,
      });

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, 0);
      await expectProtocolBalanceIsGreaterThan(
        core,
        { owner: vault.address, number: defaultAccountNumber },
        marketId,
        ONE_BI,
        0,
      );
      await expectProtocolBalance(core, vault, borrowAccountNumber, marketId, minAmountOut);
      expect(await underlyingToken.balanceOf(vault.address)).to.be.gte(minAmountOut);
      await expectStateIsCleared();
    });

    it('should work when deposit fails due to reversion', async () => {
      const minAmountOut = parseEther('1060');
      await setupBalances(core.marketIds.nativeUsdc!, usdcAmount, minAmountOut);

      await factory.setReversionType(ReversionType.Assert);
      const result = await core.gmxEcosystemV2!.gmxDepositHandler.connect(core.gmxEcosystemV2!.gmxExecutor)
        .executeDeposit(
          depositKey,
          getOracleParams(core.tokens.weth.address, core.tokens.nativeUsdc!.address),
        );
      await expectEvent(eventEmitter, result, 'AsyncDepositFailed', {
        key: depositKey,
        token: factory.address,
        reason: '',
      });

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, 0);
      await expectProtocolBalanceIsGreaterThan(
        core,
        { owner: vault.address, number: defaultAccountNumber },
        marketId,
        ONE_BI,
        0,
      );
      await expectProtocolBalance(core, vault, borrowAccountNumber, marketId, minAmountOut);
      expect(await underlyingToken.balanceOf(vault.address)).to.be.gte(minAmountOut);
      await expectStateIsCleared();
    });

    it('should work when received market tokens equals min market tokens', async () => {
      const minAmountOut = parseEther('1700');
      await setupBalances(core.marketIds.weth, ONE_ETH_BI, minAmountOut);

      await setupGMBalance(core, await impersonate(wrapper.address, true), minAmountOut);
      const depositExecutor = await impersonate(core.gmxEcosystemV2!.gmxDepositHandler.address, true);
      const depositInfo = getDepositObject(
        wrapper.address,
        underlyingToken.address,
        core.tokens.weth.address,
        core.tokens.nativeUsdc!.address,
        ONE_ETH_BI,
        ZERO_BI,
        minAmountOut,
        executionFee,
        minAmountOut,
      );
      const result = await wrapper.connect(depositExecutor).afterDepositExecution(
        depositKey,
        depositInfo.deposit,
        depositInfo.eventData,
      );
      await expectEvent(eventEmitter, result, 'AsyncDepositExecuted', {
        key: depositKey,
        token: factory.address,
      });

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, 0);
      await expectWalletBalance(vault.address, underlyingToken, minAmountOut);
      await expectStateIsCleared();
    });

    it('should fail if eventData is not crafted properly', async () => {
      const minAmountOut = parseEther('1700');
      await setupBalances(core.marketIds.weth, ONE_ETH_BI, minAmountOut);

      await setupGMBalance(core, await impersonate(wrapper.address, true), minAmountOut, vault);
      const depositExecutor = await impersonate(core.gmxEcosystemV2!.gmxDepositHandler.address, true);
      const depositInfo = getDepositObject(
        wrapper.address,
        underlyingToken.address,
        core.tokens.weth.address,
        core.tokens.nativeUsdc!.address,
        ONE_ETH_BI,
        ZERO_BI,
        minAmountOut,
        executionFee,
        minAmountOut,
      );
      depositInfo.eventData.uintItems.items[0].key = 'receivedBadTokens';
      await expectThrow(
        wrapper.connect(depositExecutor).afterDepositExecution(
          depositKey,
          depositInfo.deposit,
          depositInfo.eventData,
        ),
        'GmxV2IsolationModeWrapperV2: Unexpected receivedMarketTokens',
      );
    });

    it('should fail when not called by deposit handler', async () => {
      const depositInfo = getDepositObject(
        wrapper.address,
        underlyingToken.address,
        core.tokens.weth.address,
        core.tokens.nativeUsdc!.address,
        ONE_ETH_BI,
        ZERO_BI,
        ONE_BI,
        executionFee,
      );
      await expectThrow(
        wrapper.connect(core.hhUser1).afterDepositExecution(
          DUMMY_DEPOSIT_KEY,
          depositInfo.deposit,
          depositInfo.eventData,
        ),
        `AsyncIsolationModeTraderBase: Only handler can call <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail when deposit was not created through wrapper', async () => {
      const depositExecutor = await impersonate(core.gmxEcosystemV2!.gmxDepositHandler.address, true);
      const depositInfo = getDepositObject(
        wrapper.address,
        underlyingToken.address,
        core.tokens.weth.address,
        core.tokens.nativeUsdc!.address,
        ONE_ETH_BI,
        ZERO_BI,
        ONE_BI,
        executionFee,
        ONE_BI,
      );
      await expectThrow(
        wrapper.connect(depositExecutor).afterDepositExecution(
          DUMMY_DEPOSIT_KEY,
          depositInfo.deposit,
          depositInfo.eventData,
        ),
        'IsolationModeWrapperTraderV2: Invalid deposit key',
      );
    });
  });

  describe('#afterDepositCancellation', () => {
    it('should work normally with long token', async () => {
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both,
      );
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, ONE_ETH_BI);
      const wethBalanceBefore = await core.tokens.weth.balanceOf(core.dolomiteMargin.address);

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        minAmountOut,
        wrapper,
        executionFee,
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee },
      );

      await expectProtocolBalance(core, vault, borrowAccountNumber, core.marketIds.weth, ZERO_BI);
      await expectProtocolBalance(core, vault, borrowAccountNumber, marketId, minAmountOut);
      expect(await vault.virtualBalance()).to.eq(minAmountOut);
      expect(await underlyingToken.balanceOf(vault.address)).to.eq(ZERO_BI);

      const filter = eventEmitter.filters.AsyncDepositCreated();
      const eventArgs = (await eventEmitter.queryFilter(filter))[0].args;
      expect(eventArgs.token).to.eq(factory.address);
      const depositKey = eventArgs.key;
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, 0);
      expect(await vault.isVaultFrozen()).to.eq(true);
      expect(await vault.shouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);

      // Mine blocks so we can cancel deposit
      await mine(1200);
      const result = await vault.cancelDeposit(depositKey, { gasLimit: GMX_V2_CALLBACK_GAS_LIMIT.mul(2) });
      await expectEvent(eventEmitter, result, 'AsyncDepositCancelled', {
        key: depositKey,
        token: factory.address,
      });

      expect(await core.tokens.weth.balanceOf(core.dolomiteMargin.address)).to.eq(wethBalanceBefore);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, 0);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, ONE_ETH_BI);
      expect(await vault.isVaultFrozen()).to.eq(false);
      expect(await vault.shouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
      await expectEmptyDepositInfo(depositKey);
    });

    it('should work normally with short token', async () => {
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        BalanceCheckFlag.Both,
      );
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, usdcAmount);
      const usdcBalanceBefore = await core.tokens.nativeUsdc!.balanceOf(core.dolomiteMargin.address);

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        marketId,
        minAmountOut,
        wrapper,
        executionFee,
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee },
      );

      const filter = eventEmitter.filters.AsyncDepositCreated();
      const eventArgs = (await eventEmitter.queryFilter(filter))[0].args;
      expect(eventArgs.token).to.eq(factory.address);
      const depositKey = eventArgs.key;
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, 0);
      expect(await vault.isVaultFrozen()).to.eq(true);
      expect(await vault.shouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);

      // Mine blocks so we can cancel deposit
      await mine(1200);
      await vault.cancelDeposit(depositKey, { gasLimit: GMX_V2_CALLBACK_GAS_LIMIT.mul(2) });

      expect(await core.tokens.nativeUsdc!.balanceOf(core.dolomiteMargin.address)).to.eq(usdcBalanceBefore);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, 0);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, usdcAmount);
      await expectEmptyDepositInfo(depositKey);
      expect(await vault.isVaultFrozen()).to.eq(false);
      expect(await vault.shouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
    });

    it('should fail when not called by deposit handler', async () => {
      const depositInfo = getDepositObject(
        wrapper.address,
        underlyingToken.address,
        core.tokens.weth.address,
        core.tokens.nativeUsdc!.address,
        ONE_ETH_BI,
        ZERO_BI,
        ONE_BI,
        executionFee,
      );
      await expectThrow(
        wrapper.connect(core.hhUser1).afterDepositCancellation(
          DUMMY_DEPOSIT_KEY,
          depositInfo.deposit,
          depositInfo.eventData,
        ),
        `AsyncIsolationModeTraderBase: Only handler can call <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail when deposit was not created through wrapper', async () => {
      const depositExecutor = await impersonate(core.gmxEcosystemV2!.gmxDepositHandler.address, true);
      const depositInfo = getDepositObject(
        wrapper.address,
        underlyingToken.address,
        core.tokens.weth.address,
        core.tokens.nativeUsdc!.address,
        ONE_ETH_BI,
        ZERO_BI,
        ONE_BI,
        executionFee,
      );
      await expectThrow(
        wrapper.connect(depositExecutor).afterDepositCancellation(
          DUMMY_DEPOSIT_KEY,
          depositInfo.deposit,
          depositInfo.eventData,
        ),
        'IsolationModeWrapperTraderV2: Invalid deposit key',
      );
    });

    it('should handle error when the callback throws with DolomiteMargin', async () => {
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        BalanceCheckFlag.Both,
      );
      const wethAmount = parseEther('0.1');
      await vault.transferFromPositionWithOtherToken(
        borrowAccountNumber,
        defaultAccountNumber,
        core.marketIds.weth,
        wethAmount,
        BalanceCheckFlag.None,
      );
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, usdcAmount);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, wethAmount.mul(-1));

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        marketId,
        minAmountOut,
        wrapper,
        executionFee,
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee },
      );

      const filter = eventEmitter.filters.AsyncDepositCreated();
      const eventArgs = (await eventEmitter.queryFilter(filter))[0].args;
      expect(eventArgs.token).to.eq(factory.address);
      const depositKey = eventArgs.key;
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, 0);
      expect(await vault.isVaultFrozen()).to.eq(true);
      expect(await vault.shouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);

      // Set the value of the USDC collateral to 0. When the deposit is cancelled, it'll fail
      await core.testEcosystem!.testPriceOracle.setPrice(core.tokens.nativeUsdc!.address, ONE_BI);
      await core.dolomiteMargin.ownerSetPriceOracle(
        core.marketIds.nativeUsdc!,
        core.testEcosystem!.testPriceOracle.address,
      );

      // Mine blocks, so we can cancel deposit
      await mine(1200);
      const result = await vault.cancelDeposit(depositKey, { gasLimit: GMX_V2_CALLBACK_GAS_LIMIT.mul(2) });
      await expectEvent(
        eventEmitter,
        result,
        'AsyncDepositCancelledFailed',
        {
          key: depositKey,
          token: factory.address,
          reason: `OperationImpl: Undercollateralized account <${vault.address.toLowerCase()}, ${borrowAccountNumber}>`,
        },
      );
    });
  });

  describe('#initiateCancelDeposit', () => {
    it('should work normally', async () => {
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both,
      );

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        minAmountOut,
        wrapper,
        executionFee,
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee },
      );

      const filter = eventEmitter.filters.AsyncDepositCreated();
      const eventArgs = (await eventEmitter.queryFilter(filter))[0].args;
      const depositKey = eventArgs.key;
      expect(eventArgs.token).to.eq(factory.address);

      // Mine blocks so we can cancel deposit
      await mine(1200);
      const result = await vault.cancelDeposit(depositKey, { gasLimit: GMX_V2_CALLBACK_GAS_LIMIT.mul(2) });
      await expectEvent(eventEmitter, result, 'AsyncDepositCancelled', {
        key: depositKey,
        token: factory.address,
      });
      await expectEmptyDepositInfo(depositKey);
    });

    it('should work normally when called by valid handler', async () => {
      const depositExecutor = await impersonate(core.gmxEcosystemV2!.gmxDepositHandler.address, true);
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both,
      );

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        minAmountOut,
        wrapper,
        executionFee,
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee },
      );

      const filter = eventEmitter.filters.AsyncDepositCreated();
      const eventArgs = (await eventEmitter.queryFilter(filter))[0].args;
      const depositKey = eventArgs.key;
      expect(eventArgs.token).to.eq(factory.address);

      // Mine blocks so we can cancel deposit
      await mine(1200);
      const result = await wrapper.connect(depositExecutor)
        .initiateCancelDeposit(depositKey, { gasLimit: GMX_V2_CALLBACK_GAS_LIMIT.mul(2) });
      await expectEvent(eventEmitter, result, 'AsyncDepositCancelled', {
        key: depositKey,
        token: factory.address,
      });
    });

    it('should fail if not called by deposit creator (vault)', async () => {
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both,
      );

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        minAmountOut,
        wrapper,
        executionFee,
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee },
      );

      const filter = eventEmitter.filters.AsyncDepositCreated();
      const eventArgs = (await eventEmitter.queryFilter(filter))[0].args;
      const depositKey = eventArgs.key;
      expect(eventArgs.token).to.eq(factory.address);

      await expectThrow(
        wrapper.connect(core.hhUser1).initiateCancelDeposit(depositKey),
        'GmxV2IsolationModeWrapperV2: Only vault or handler can cancel',
      );
    });
  });

  describe('#executeDepositCancellationForRetry', () => {
    it('should work normally', async () => {
      await gmxV2Registry.connect(core.governance).ownerSetIsHandler(core.hhUser1.address, true);
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both,
      );
      await vault.transferFromPositionWithOtherToken(
        borrowAccountNumber,
        defaultAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount.div(2),
        BalanceCheckFlag.None,
      );

      const minAmountOut = ONE_ETH_BI.mul(1000);
      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        marketId,
        ONE_ETH_BI.mul(1000),
        wrapper,
        executionFee,
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee },
      );

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, ONE_ETH_BI);
      await expectProtocolBalance(
        core,
        vault.address,
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        ZERO_BI.sub(usdcAmount.mul(3).div(2)),
      );
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);

      const filter = eventEmitter.filters.AsyncDepositCreated();
      const eventArgs = (await eventEmitter.queryFilter(filter))[0].args;
      expect(eventArgs.token).to.eq(factory.address);
      const depositKey = eventArgs.key;

      const oldOracle = await core.dolomiteMargin.getMarketPriceOracle(core.marketIds.weth);
      await core.testEcosystem!.testPriceOracle.setPrice(core.tokens.weth.address, 1);
      await core.dolomiteMargin.ownerSetPriceOracle(core.marketIds.weth, core.testEcosystem!.testPriceOracle.address);

      // Mine blocks so we can cancel deposit
      await mine(1200);
      const result1 = await vault.cancelDeposit(depositKey, { gasLimit: GMX_V2_CALLBACK_GAS_LIMIT.mul(2) });
      await expectEvent(eventEmitter, result1, 'AsyncDepositCancelledFailed', {
        key: depositKey,
        token: factory.address,
        reason: `OperationImpl: Undercollateralized account <${vault.address.toLowerCase()}, ${borrowAccountNumber.toString()}>`,
      });

      await core.dolomiteMargin.ownerSetPriceOracle(core.marketIds.weth, oldOracle);

      const result2 = await wrapper.connect(core.hhUser1)
        .executeDepositCancellationForRetry(depositKey, { gasLimit: GMX_V2_CALLBACK_GAS_LIMIT.mul(2) });
      await expectEvent(eventEmitter, result2, 'AsyncDepositCancelled', {
        key: depositKey,
        token: factory.address,
      });

      const deposit = await wrapper.getDepositInfo(depositKey);
      expect(deposit.vault).to.eq(ZERO_ADDRESS);
      expect(deposit.accountNumber).to.eq(ZERO_BI);
      expect(deposit.inputToken).to.eq(ZERO_ADDRESS);
      expect(deposit.inputAmount).to.eq(ZERO_BI);
      expect(deposit.outputAmount).to.eq(ZERO_BI);
      expect(deposit.isRetryable).to.eq(false);

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, ONE_ETH_BI);
      await expectProtocolBalance(
        core,
        vault.address,
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        ZERO_BI.sub(usdcAmount.div(2)),
      );
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, ZERO_BI);
    });

    it('should fail if not called by a handler', async () => {
      await expectThrow(
        wrapper.connect(core.hhUser1).executeDepositCancellationForRetry(BYTES_ZERO),
        `AsyncIsolationModeTraderBase: Only handler can call <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail if the deposit is not retryable yet', async () => {
      await gmxV2Registry.connect(core.governance).ownerSetIsHandler(core.hhUser1.address, true);
      await expectThrow(
        wrapper.connect(core.hhUser1).executeDepositCancellationForRetry(BYTES_ZERO),
        'AsyncIsolationModeTraderBase: Conversion is not retryable',
      );
    });
  });

  describe('#isValidInputToken', () => {
    it('should work normally', async () => {
      expect(await wrapper.isValidInputToken(core.tokens.weth.address)).to.eq(true);
      expect(await wrapper.isValidInputToken(core.tokens.nativeUsdc!.address)).to.eq(true);
    });

    it('should fail if token is not one of two assets in LP', async () => {
      expect(await wrapper.isValidInputToken(core.tokens.wbtc.address)).to.eq(false);
      expect(await wrapper.isValidInputToken(core.hhUser1.address)).to.eq(false);
    });
  });

  describe('#exchange', () => {
    it('should fail if the vault account is frozen', async () => {
      const amountWei = parseEther('0.01');
      await vault.transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        amountWei,
        BalanceCheckFlag.Both,
      );
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, amountWei);

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        amountWei,
        marketId,
        minAmountOut,
        wrapper,
        parseEther('.01'),
      );
      await vault.swapExactInputForOutput(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: parseEther('.01') },
      );

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, 0);
      expect(await vault.isVaultFrozen()).to.eq(true);
      expect(await vault.shouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);

      const wrapperImpersonator = await impersonate(wrapper.address, true);
      await expectThrow(
        vault.connect(wrapperImpersonator).swapExactInputForOutput(
          borrowAccountNumber,
          initiateWrappingParams.marketPath,
          initiateWrappingParams.amountIn,
          initiateWrappingParams.minAmountOut,
          initiateWrappingParams.traderParams,
          initiateWrappingParams.makerAccounts,
          initiateWrappingParams.userConfig,
          { value: parseEther('.01') },
        ),
        `IsolationModeWrapperTraderV2: Vault is frozen <${vault.address.toLowerCase()}>`,
      );
    });
  });

  describe('#getExchangeCost', () => {
    it('should fail because it is not implemented', async () => {
      await expectThrow(
        wrapper.getExchangeCost(core.tokens.nativeUsdc!.address, factory.address, ONE_ETH_BI, BYTES_EMPTY),
        'GmxV2IsolationModeWrapperV2: getExchangeCost is not implemented',
      );
    });
  });

  describe('#setDepositInfoAndReducePendingAmountFromUnwrapper', () => {
    it('should fail when caller is not unwrapper', async () => {
      await expectThrow(
        wrapper.connect(core.hhUser1).setDepositInfoAndReducePendingAmountFromUnwrapper(
          DUMMY_DEPOSIT_KEY,
          ONE_ETH_BI,
          {
            key: DUMMY_DEPOSIT_KEY,
            vault: vault.address,
            accountNumber: defaultAccountNumber,
            inputAmount: ONE_ETH_BI,
            inputToken: core.tokens.weth.address,
            outputAmount: ONE_ETH_BI,
            isRetryable: false,
          },
        ),
        `IsolationModeWrapperTraderV2: Only unwrapper can call <${core.hhUser1.address.toLowerCase()}>`,
      );
    });
  });

  async function expectEmptyDepositInfo(key: string) {
    const deposit = await wrapper.getDepositInfo(key);
    expect(deposit.key).to.eq(key);
    expect(deposit.vault).to.eq(ZERO_ADDRESS);
    expect(deposit.accountNumber).to.eq(ZERO_BI);
    expect(deposit.inputToken).to.eq(ZERO_ADDRESS);
    expect(deposit.inputAmount).to.eq(ZERO_BI);
    expect(deposit.outputAmount).to.eq(ZERO_BI);
  }
});
