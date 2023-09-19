import { BalanceCheckFlag } from '@dolomite-exchange/dolomite-margin';
import { mine } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumber, BigNumberish } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import {
  GmxRegistryV2,
  GmxV2IsolationModeTokenVaultV1,
  GmxV2IsolationModeTokenVaultV1__factory,
  GmxV2IsolationModeUnwrapperTraderV2,
  GmxV2IsolationModeVaultFactory,
  GmxV2IsolationModeWrapperTraderV2,
  GmxV2MarketTokenPriceOracle,
  IGmxMarketToken,
} from 'src/types';
import { depositIntoDolomiteMargin } from 'src/utils/dolomite-utils';
import { BYTES_EMPTY, Network, ONE_BI, ONE_ETH_BI, ZERO_BI } from 'src/utils/no-deps-constants';
import {
  getRealLatestBlockNumber,
  impersonate,
  revertToSnapshotAndCapture,
  setEtherBalance,
  snapshot,
} from 'test/utils';
import { expectEvent, expectProtocolBalance, expectThrow, expectWalletBalance } from 'test/utils/assertions';
import {
  createGmxRegistryV2,
  createGmxV2IsolationModeTokenVaultV1,
  createGmxV2IsolationModeUnwrapperTraderV2,
  createGmxV2IsolationModeVaultFactory,
  createGmxV2IsolationModeWrapperTraderV2,
  createGmxV2MarketTokenPriceOracle,
  getDepositObject,
  getInitiateWrappingParams,
  getOracleParams,
} from 'test/utils/ecosystem-token-utils/gmx';
import {
  CoreProtocol,
  disableInterestAccrual,
  setupCoreProtocol,
  setupGMBalance,
  setupNativeUSDCBalance,
  setupTestMarket,
  setupUserVaultProxy,
  setupWETHBalance,
} from 'test/utils/setup';

const defaultAccountNumber = '0';
const borrowAccountNumber = '123';
const executionFee = parseEther('.01');
const usdcAmount = BigNumber.from('1000000000'); // $1000
const DUMMY_DEPOSIT_KEY = '0x6d1ff6ffcab884211992a9d6b8261b7fae5db4d2da3a5eb58647988da3869d6f';
const CALLBACK_GAS_LIMIT = BigNumber.from('1500000');
const SLIPPAGE_MINIMUM = 500;
const minAmountOut = parseEther('1800');

describe('GmxV2IsolationModeWrapperTraderV2', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let underlyingToken: IGmxMarketToken;
  let allowableMarketIds: BigNumberish[];
  let gmxRegistryV2: GmxRegistryV2;
  let unwrapper: GmxV2IsolationModeUnwrapperTraderV2;
  let wrapper: GmxV2IsolationModeWrapperTraderV2;
  let factory: GmxV2IsolationModeVaultFactory;
  let vault: GmxV2IsolationModeTokenVaultV1;
  let priceOracle: GmxV2MarketTokenPriceOracle;
  let marketId: BigNumber;

  before(async () => {
    const latestBlockNumber = await getRealLatestBlockNumber(true, Network.ArbitrumOne);
    core = await setupCoreProtocol({
      blockNumber: latestBlockNumber,
      network: Network.ArbitrumOne,
    });
    underlyingToken = core.gmxEcosystemV2!.gmxEthUsdMarketToken.connect(core.hhUser1);
    const userVaultImplementation = await createGmxV2IsolationModeTokenVaultV1(core);
    gmxRegistryV2 = await createGmxRegistryV2(core);

    allowableMarketIds = [core.marketIds.nativeUsdc!, core.marketIds.weth];
    factory = await createGmxV2IsolationModeVaultFactory(
      core,
      gmxRegistryV2,
      allowableMarketIds,
      allowableMarketIds,
      core.gmxEcosystemV2!.gmxEthUsdMarketToken,
      userVaultImplementation
    );
    wrapper = await createGmxV2IsolationModeWrapperTraderV2(core, factory, gmxRegistryV2);
    unwrapper = await createGmxV2IsolationModeUnwrapperTraderV2(core, factory, gmxRegistryV2);
    await gmxRegistryV2.connect(core.governance).ownerSetGmxV2UnwrapperTrader(unwrapper.address);
    await gmxRegistryV2.connect(core.governance).ownerSetGmxV2WrapperTrader(wrapper.address);
    priceOracle = await createGmxV2MarketTokenPriceOracle(core, gmxRegistryV2);
    await priceOracle.connect(core.governance).ownerSetMarketToken(factory.address, true);
    marketId = await core.dolomiteMargin.getNumMarkets();
    await setupTestMarket(core, factory, true, priceOracle);

    await disableInterestAccrual(core, core.marketIds.weth);
    await disableInterestAccrual(core, core.marketIds.nativeUsdc!);

    await factory.connect(core.governance).ownerInitialize([unwrapper.address, wrapper.address]);
    await core.dolomiteMargin.connect(core.governance).ownerSetGlobalOperator(factory.address, true);

    await factory.createVault(core.hhUser1.address);
    const vaultAddress = await factory.getVaultByAccount(core.hhUser1.address);
    vault = setupUserVaultProxy<GmxV2IsolationModeTokenVaultV1>(
      vaultAddress,
      GmxV2IsolationModeTokenVaultV1__factory,
      core.hhUser1
    );

    await setupWETHBalance(core, core.hhUser1, ONE_ETH_BI, core.dolomiteMargin);
    await depositIntoDolomiteMargin(core, core.hhUser1, defaultAccountNumber, core.marketIds.weth, ONE_ETH_BI);

    await setupNativeUSDCBalance(core, core.hhUser1, usdcAmount, core.dolomiteMargin);
    await depositIntoDolomiteMargin(core, core.hhUser1, defaultAccountNumber, core.marketIds.nativeUsdc!, usdcAmount);
    await wrapper.connect(core.governance).ownerSetIsHandler(core.gmxEcosystemV2!.gmxDepositHandler.address, true);
    await wrapper.connect(core.governance).ownerSetIsHandler(core.gmxEcosystemV2!.gmxWithdrawalHandler.address, true);
    await wrapper.connect(core.governance).ownerSetCallbackGasLimit(CALLBACK_GAS_LIMIT);
    await wrapper.connect(core.governance).ownerSetSlippageMinimum(SLIPPAGE_MINIMUM);
    await setEtherBalance(core.gmxEcosystemV2!.gmxExecutor.address, parseEther('100'));

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#initializer', () => {
    it('should work normally', async () => {
      expect(await wrapper.GMX_REGISTRY_V2()).to.eq(gmxRegistryV2.address);
    });

    it('should not initialize twice', async () => {
      await expectThrow(
        wrapper.initialize(
          gmxRegistryV2.address,
          core.tokens.weth.address,
          factory.address,
          core.dolomiteMargin.address
        ),
        'Initializable: contract is already initialized',
      );
    });
  });

  describe('#initiateWrapping', () => {
    it('should work normally with long token', async () => {
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both
      );
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, ONE_ETH_BI);

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        minAmountOut,
        wrapper,
        executionFee
      );
      await vault.connect(core.hhUser1).initiateWrapping(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee }
      );

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, 0);
      expect(await vault.isVaultFrozen()).to.eq(true);
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
    });

    it('should work normally with short token', async () => {
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        BalanceCheckFlag.Both
      );
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, usdcAmount);

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        marketId,
        minAmountOut,
        wrapper,
        executionFee
      );
      await vault.connect(core.hhUser1).initiateWrapping(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee } // @follow-up How to calculate executionFee
      );

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, 0);
      expect(await vault.isVaultFrozen()).to.eq(true);
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
    });

    it('should fail when slippage minimum is not met', async () => {
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both
      );
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, ONE_ETH_BI);

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        ONE_BI,
        wrapper,
        executionFee
      );
      await expectThrow(
        vault.connect(core.hhUser1).initiateWrapping(
          borrowAccountNumber,
          initiateWrappingParams.marketPath,
          initiateWrappingParams.amountIn,
          initiateWrappingParams.minAmountOut,
          initiateWrappingParams.traderParams,
          initiateWrappingParams.makerAccounts,
          initiateWrappingParams.userConfig,
          { value: executionFee }
        ),
        'GmxV2IsolationModeWrapperV2: Insufficient output amount'
      );
    });
  });

  describe('#afterDepositExecution', () => {
    it('should work normally with long token', async () => {
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both
      );
      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        parseEther('1700'),
        wrapper,
        executionFee
      );
      await vault.connect(core.hhUser1).initiateWrapping(
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
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
      const filter = wrapper.filters.DepositCreated();
      const depositKey = (await wrapper.queryFilter(filter))[0].args.key;

      await core.gmxEcosystemV2!.gmxDepositHandler.connect(core.gmxEcosystemV2!.gmxExecutor).executeDeposit(
        depositKey,
        getOracleParams(core.tokens.weth.address, core.tokens.nativeUsdc!.address)
      );

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, 0);
      expect((await core.dolomiteMargin.getAccountWei(
        { owner: vault.address, number: borrowAccountNumber },
        marketId
      )).value).to.be.gte(parseEther('1700'));
      expect(await underlyingToken.balanceOf(vault.address)).to.be.gte(parseEther('1700'));
      expect(await vault.isVaultFrozen()).to.eq(false);
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
      expect(await underlyingToken.allowance(wrapper.address, vault.address)).to.eq(0);
    });

    it('should work normally with short token', async () => {
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        BalanceCheckFlag.Both
      );
      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        marketId,
        parseEther('1060'),
        wrapper,
        executionFee
      );
      await vault.connect(core.hhUser1).initiateWrapping(
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
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
      const filter = wrapper.filters.DepositCreated();
      const depositKey = (await wrapper.queryFilter(filter))[0].args.key;

      await core.gmxEcosystemV2!.gmxDepositHandler.connect(core.gmxEcosystemV2!.gmxExecutor).executeDeposit(
        depositKey,
        getOracleParams(core.tokens.weth.address, core.tokens.nativeUsdc!.address)
      );

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, 0);
      expect((await core.dolomiteMargin.getAccountWei(
        { owner: vault.address, number: borrowAccountNumber },
        marketId
      )).value).to.be.gte(parseEther('1000'));
      expect(await underlyingToken.balanceOf(vault.address)).to.be.gte(parseEther('1000'));
      expect(await vault.isVaultFrozen()).to.eq(false);
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
      expect(await underlyingToken.allowance(wrapper.address, vault.address)).to.eq(0);
    });

    it('should work when received market tokens equals min market tokens', async () => {
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both
      );
      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        minAmountOut,
        wrapper,
        executionFee
      );
      await vault.connect(core.hhUser1).initiateWrapping(
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
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
      const filter = wrapper.filters.DepositCreated();
      const depositKey = (await wrapper.queryFilter(filter))[0].args.key;

      await setupGMBalance(core, wrapper.address, minAmountOut, vault);
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
        minAmountOut
      );
      await wrapper.connect(depositExecutor).afterDepositExecution(
        depositKey,
        depositInfo.deposit,
        depositInfo.eventData
      );

      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, 0);
      await expectWalletBalance(vault.address, underlyingToken, minAmountOut);
      expect(await vault.isVaultFrozen()).to.eq(false);
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
      expect(await underlyingToken.allowance(wrapper.address, vault.address)).to.eq(0);
    });

    it('should fail if eventData is not crafted properly', async () => {
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both
      );
      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        minAmountOut,
        wrapper,
        executionFee
      );
      await vault.connect(core.hhUser1).initiateWrapping(
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
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
      const filter = wrapper.filters.DepositCreated();
      const depositKey = (await wrapper.queryFilter(filter))[0].args.key;

      await setupGMBalance(core, wrapper.address, minAmountOut, vault);
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
        minAmountOut
      );
      depositInfo.eventData.uintItems.items[0].key = 'receivedBadTokens';
      await expectThrow(
        wrapper.connect(depositExecutor).afterDepositExecution(
          depositKey,
          depositInfo.deposit,
          depositInfo.eventData
        ),
        'GmxV2IsolationModeWrapperV2: Unexpected return data'
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
          depositInfo.eventData
        ),
        `GmxV2IsolationModeTraderBase: Only handler can call <${core.hhUser1.address.toLowerCase()}>`
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
        wrapper.connect(depositExecutor).afterDepositExecution(
          DUMMY_DEPOSIT_KEY,
          depositInfo.deposit,
          depositInfo.eventData
        ),
        'GmxV2IsolationModeWrapperV2: Invalid deposit key'
      );
    });
  });

  describe('#afterDepositCancellation', () => {
    it('should work normally with long token', async () => {
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both
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
        executionFee
      );
      await vault.connect(core.hhUser1).initiateWrapping(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee }
      );

      const filter = wrapper.filters.DepositCreated();
      const depositKey = (await wrapper.queryFilter(filter))[0].args.key;
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, 0);
      expect(await vault.isVaultFrozen()).to.eq(true);
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);

      // Mine blocks so we can cancel deposit
      await mine(1200);
      await vault.connect(core.hhUser1).cancelDeposit(depositKey);

      expect(await core.tokens.weth.balanceOf(core.dolomiteMargin.address)).to.eq(wethBalanceBefore);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, 0);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.weth, ONE_ETH_BI);
      expect(await vault.isVaultFrozen()).to.eq(false);
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);
    });

    it('should work normally with short token', async () => {
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.nativeUsdc!,
        usdcAmount,
        BalanceCheckFlag.Both
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
        executionFee
      );
      await vault.connect(core.hhUser1).initiateWrapping(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee }
      );

      const filter = wrapper.filters.DepositCreated();
      const depositKey = (await wrapper.queryFilter(filter))[0].args.key;
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, minAmountOut);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, 0);
      expect(await vault.isVaultFrozen()).to.eq(true);
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
      expect(await vault.isDepositSourceWrapper()).to.eq(false);

      // Mine blocks so we can cancel deposit
      await mine(1200);
      await vault.connect(core.hhUser1).cancelDeposit(depositKey);

      expect(await core.tokens.nativeUsdc!.balanceOf(core.dolomiteMargin.address)).to.eq(usdcBalanceBefore);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, 0);
      await expectProtocolBalance(core, vault.address, borrowAccountNumber, core.marketIds.nativeUsdc!, usdcAmount);
      expect(await vault.isVaultFrozen()).to.eq(false);
      expect(await vault.isShouldSkipTransfer()).to.eq(false);
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
          depositInfo.eventData
        ),
        `GmxV2IsolationModeTraderBase: Only handler can call <${core.hhUser1.address.toLowerCase()}>`
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
          depositInfo.eventData
        ),
        'GmxV2IsolationModeWrapperV2: Invalid deposit key'
      );
    });

    xit('should handle case when we receive callback but our function fails', async () => {});
  });

  describe('#cancelDeposit', () => {
    it('should work normally', async () => {
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both
      );

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        minAmountOut,
        wrapper,
        executionFee
      );
      await vault.connect(core.hhUser1).initiateWrapping(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee }
      );
      const filter = wrapper.filters.DepositCreated();
      const depositKey = (await wrapper.queryFilter(filter))[0].args.key;

      // Mine blocks so we can cancel deposit
      await mine(1200);
      const result = await vault.connect(core.hhUser1).cancelDeposit(depositKey);
      await expectEvent(wrapper, result, 'DepositCancelled', {
        key: depositKey,
      });
    });

    it('should work normally when called by valid handler', async () => {
      const depositExecutor = await impersonate(core.gmxEcosystemV2!.gmxDepositHandler.address, true);
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both
      );

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        minAmountOut,
        wrapper,
        executionFee
      );
      await vault.connect(core.hhUser1).initiateWrapping(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee }
      );
      const filter = wrapper.filters.DepositCreated();
      const depositKey = (await wrapper.queryFilter(filter))[0].args.key;

      // Mine blocks so we can cancel deposit
      await mine(1200);
      const result = await wrapper.connect(depositExecutor).cancelDeposit(depositKey);
      await expectEvent(wrapper, result, 'DepositCancelled', {
        key: depositKey,
      });
    });

    it('should fail if not called by deposit creator (vault)', async () => {
      await vault.connect(core.hhUser1).transferIntoPositionWithOtherToken(
        defaultAccountNumber,
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        BalanceCheckFlag.Both
      );

      const initiateWrappingParams = await getInitiateWrappingParams(
        borrowAccountNumber,
        core.marketIds.weth,
        ONE_ETH_BI,
        marketId,
        minAmountOut,
        wrapper,
        executionFee
      );
      await vault.connect(core.hhUser1).initiateWrapping(
        borrowAccountNumber,
        initiateWrappingParams.marketPath,
        initiateWrappingParams.amountIn,
        initiateWrappingParams.minAmountOut,
        initiateWrappingParams.traderParams,
        initiateWrappingParams.makerAccounts,
        initiateWrappingParams.userConfig,
        { value: executionFee }
      );
      const filter = wrapper.filters.DepositCreated();
      const depositKey = (await wrapper.queryFilter(filter))[0].args.key;

      await expectThrow(
        wrapper.connect(core.hhUser1).cancelDeposit(depositKey),
        'GmxV2IsolationModeWrapperV2: Only vault or handler can cancel'
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

  describe('#getExchangeCost', () => {
    it('should fail because it is not implemented', async () => {
      await expectThrow(
        wrapper.getExchangeCost(core.tokens.nativeUsdc!.address, factory.address, ONE_ETH_BI, BYTES_EMPTY),
        'GmxV2IsolationModeWrapperV2: getExchangeCost is not implemented'
      );
    });
  });
});
