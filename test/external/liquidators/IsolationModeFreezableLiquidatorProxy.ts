import { BalanceCheckFlag } from '@dolomite-margin/dist/src';
import { mine } from '@nomicfoundation/hardhat-network-helpers';
import { ZERO_ADDRESS } from '@openzeppelin/upgrades/lib/utils/Addresses';
import { expect } from 'chai';
import { BigNumber, BigNumberish, ContractTransaction, ethers } from 'ethers';
import {
  DolomiteRegistryImplementation,
  DolomiteRegistryImplementation__factory,
  EventEmitterRegistry,
  GmxV2IsolationModeTokenVaultV1,
  GmxV2IsolationModeTokenVaultV1__factory,
  GmxV2IsolationModeUnwrapperTraderV2,
  GmxV2IsolationModeVaultFactory,
  GmxV2IsolationModeWrapperTraderV2,
  GmxV2Registry,
  IGmxMarketToken,
  IGmxMarketToken__factory,
  IsolationModeFreezableLiquidatorProxy,
  IsolationModeFreezableLiquidatorProxy__factory,
} from '../../../src/types';
import { AccountStruct } from '../../../src/utils/constants';
import { GMX_V2_CALLBACK_GAS_LIMIT, GMX_V2_EXECUTION_FEE } from '../../../src/utils/constructors/gmx';
import { createContractWithAbi, depositIntoDolomiteMargin } from '../../../src/utils/dolomite-utils';
import { MAX_UINT_256_BI, NO_EXPIRY, ONE_BI, ONE_ETH_BI, ZERO_BI } from '../../../src/utils/no-deps-constants';
import { getBlockTimestamp, impersonate, increaseByTimeDelta, revertToSnapshotAndCapture, snapshot } from '../../utils';
import {
  expectEvent,
  expectProtocolBalance,
  expectProtocolBalanceIsGreaterThan,
  expectThrow,
  expectWalletBalance,
} from '../../utils/assertions';
import { createDolomiteRegistryImplementation, createEventEmitter } from '../../utils/dolomite';
import {
  createGmxV2IsolationModeTokenVaultV1,
  createGmxV2IsolationModeUnwrapperTraderV2,
  createGmxV2IsolationModeVaultFactory,
  createGmxV2IsolationModeWrapperTraderV2,
  createGmxV2Library,
  createGmxV2MarketTokenPriceOracle,
  createGmxV2Registry,
  getInitiateWrappingParams,
  getOracleParams,
} from '../../utils/ecosystem-token-utils/gmx';
import { setExpiry } from '../../utils/expiry-utils';
import { liquidateV4WithZapParam } from '../../utils/liquidation-utils';
import {
  CoreProtocol,
  disableInterestAccrual,
  getDefaultCoreProtocolConfigForGmxV2,
  setupCoreProtocol,
  setupGMBalance,
  setupTestMarket,
  setupUserVaultProxy,
  setupWETHBalance,
} from '../../utils/setup';
import { getLiquidateIsolationModeZapPath } from '../../utils/zap-utils';

const defaultAccountNumber = ZERO_BI;
const borrowAccountNumber = defaultAccountNumber.add(ONE_BI);
const borrowAccountNumber2 = borrowAccountNumber.add(ONE_BI);
const borrowAccountNumber3 = borrowAccountNumber2.add(ONE_BI);

const amountWei = ONE_ETH_BI.mul('1234'); // 1,234

describe('IsolationModeFreezableLiquidatorProxy', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let underlyingToken: IGmxMarketToken;
  let gmxV2Registry: GmxV2Registry;
  let allowableMarketIds: BigNumberish[];
  let unwrapper: GmxV2IsolationModeUnwrapperTraderV2;
  let wrapper: GmxV2IsolationModeWrapperTraderV2;
  let factory: GmxV2IsolationModeVaultFactory;
  let vault: GmxV2IsolationModeTokenVaultV1;
  let marketId: BigNumber;
  let liquidatorProxy: IsolationModeFreezableLiquidatorProxy;
  let eventEmitter: EventEmitterRegistry;

  let solidAccount: AccountStruct;
  let liquidAccount: AccountStruct;
  let liquidAccount2: AccountStruct;
  let withdrawalKeys: string[];
  let depositKey: string | undefined;
  let depositAmountIn: BigNumber;
  let depositMinAmountOut: BigNumber;

  before(async () => {
    core = await setupCoreProtocol(getDefaultCoreProtocolConfigForGmxV2());

    const newImplementation = await createContractWithAbi<DolomiteRegistryImplementation>(
      DolomiteRegistryImplementation__factory.abi,
      DolomiteRegistryImplementation__factory.bytecode,
      [],
    );
    await core.dolomiteRegistryProxy.upgradeTo(newImplementation.address);

    liquidatorProxy = await createContractWithAbi<IsolationModeFreezableLiquidatorProxy>(
      IsolationModeFreezableLiquidatorProxy__factory.abi,
      IsolationModeFreezableLiquidatorProxy__factory.bytecode,
      [
        core.dolomiteRegistry.address,
        core.dolomiteMargin.address,
        core.expiry.address,
        core.liquidatorAssetRegistry.address,
      ],
    );

    const gmxV2Library = await createGmxV2Library();
    const userVaultImplementation = await createGmxV2IsolationModeTokenVaultV1(core, gmxV2Library);
    gmxV2Registry = await createGmxV2Registry(core, GMX_V2_CALLBACK_GAS_LIMIT);

    allowableMarketIds = [core.marketIds.nativeUsdc!, core.marketIds.weth];
    factory = await createGmxV2IsolationModeVaultFactory(
      core,
      gmxV2Library,
      gmxV2Registry,
      allowableMarketIds,
      allowableMarketIds,
      core.gmxEcosystemV2!.gmxEthUsdMarketToken,
      userVaultImplementation,
    );
    underlyingToken = IGmxMarketToken__factory.connect(await factory.UNDERLYING_TOKEN(), core.hhUser1);
    unwrapper = await createGmxV2IsolationModeUnwrapperTraderV2(
      core,
      factory,
      gmxV2Library,
      gmxV2Registry,
    );
    wrapper = await createGmxV2IsolationModeWrapperTraderV2(
      core,
      factory,
      gmxV2Library,
      gmxV2Registry,
    );
    const priceOracle = await createGmxV2MarketTokenPriceOracle(core, gmxV2Registry);
    await priceOracle.connect(core.governance).ownerSetMarketToken(factory.address, true);

    // Use actual price oracle later
    marketId = await core.dolomiteMargin.getNumMarkets();
    await setupTestMarket(core, factory, true, priceOracle);
    await disableInterestAccrual(core, core.marketIds.weth);
    await disableInterestAccrual(core, core.marketIds.nativeUsdc!);

    await factory.connect(core.governance).ownerSetAllowableCollateralMarketIds(
      [...allowableMarketIds, marketId],
    );

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

    await setupWETHBalance(core, core.hhUser1, amountWei, core.dolomiteMargin);
    await depositIntoDolomiteMargin(core, core.hhUser1, defaultAccountNumber, core.marketIds.weth, amountWei);

    await core.dolomiteRegistry.ownerSetLiquidatorAssetRegistry(core.liquidatorAssetRegistry.address);
    await core.liquidatorAssetRegistry.ownerAddLiquidatorToAssetWhitelist(marketId, core.liquidatorProxyV4.address);
    await core.liquidatorAssetRegistry.ownerAddLiquidatorToAssetWhitelist(marketId, liquidatorProxy.address);
    await core.dolomiteMargin.ownerSetGlobalOperator(liquidatorProxy.address, true);

    solidAccount = { owner: core.hhUser5.address, number: defaultAccountNumber };
    liquidAccount = { owner: vault.address, number: borrowAccountNumber };
    liquidAccount2 = { owner: vault.address, number: borrowAccountNumber2 };

    await setupGMBalance(core, core.hhUser1, amountWei.mul(2), vault);
    await vault.depositIntoVaultForDolomiteMargin(defaultAccountNumber, amountWei.mul(2));
    await vault.openBorrowPosition(
      defaultAccountNumber,
      borrowAccountNumber,
      amountWei,
      { value: GMX_V2_EXECUTION_FEE },
    );
    await vault.openBorrowPosition(
      defaultAccountNumber,
      borrowAccountNumber2,
      amountWei,
      { value: GMX_V2_EXECUTION_FEE },
    );
    await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, amountWei);
    await expectProtocolBalance(core, vault.address, borrowAccountNumber2, marketId, amountWei);
    await expectWalletBalance(vault, underlyingToken, amountWei.mul(2));
    expect(await vault.isVaultAccountFrozen(defaultAccountNumber)).to.eq(false);
    expect(await vault.isVaultAccountFrozen(borrowAccountNumber)).to.eq(false);
    expect(await vault.isVaultAccountFrozen(borrowAccountNumber2)).to.eq(false);

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    withdrawalKeys = [];
    depositKey = undefined;
    depositAmountIn = ZERO_BI;
    depositMinAmountOut = ZERO_BI;
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#prepareForLiquidation', () => {
    let wethAmount: BigNumber;
    let amountWeiForLiquidation: BigNumber;

    async function setupBalances(
      account: BigNumber,
      devalueCollateral: boolean = true,
      pushFullyUnderwater: boolean = true,
      zapIntoBorrow: boolean = false,
    ) {
      // Create debt for the position
      let gmPrice = (await core.dolomiteMargin.getMarketPrice(marketId)).value;
      let wethPrice = (await core.dolomiteMargin.getMarketPrice(core.marketIds.weth)).value;

      wethAmount = amountWei.mul(gmPrice).div(wethPrice).mul(100).div(121);
      await vault.transferFromPositionWithOtherToken(
        account,
        defaultAccountNumber,
        core.marketIds.weth,
        wethAmount,
        BalanceCheckFlag.To,
      );

      if (zapIntoBorrow) {
        depositAmountIn = amountWei.mul(gmPrice).div(wethPrice).mul(10).div(100);
        depositMinAmountOut = amountWei.mul(99).div(100).mul(10).div(100);

        const initiateWrappingParams = await getInitiateWrappingParams(
          account,
          core.marketIds.weth,
          depositAmountIn,
          marketId,
          depositMinAmountOut,
          wrapper,
          GMX_V2_EXECUTION_FEE,
        );
        await vault.swapExactInputForOutput(
          initiateWrappingParams.accountNumber,
          initiateWrappingParams.marketPath,
          initiateWrappingParams.amountIn,
          initiateWrappingParams.minAmountOut,
          initiateWrappingParams.traderParams,
          initiateWrappingParams.makerAccounts,
          initiateWrappingParams.userConfig,
          { value: GMX_V2_EXECUTION_FEE },
        );
      }

      if (devalueCollateral) {
        // Devalue the collateral so it's underwater
        gmPrice = gmPrice.mul(95).div(100);
        await core.testEcosystem!.testPriceOracle.setPrice(factory.address, gmPrice);
        await core.dolomiteMargin.ownerSetPriceOracle(marketId, core.testEcosystem!.testPriceOracle.address);
      }

      if (pushFullyUnderwater) {
        // Increase the of ETH, so it's underwater after the liquidation is handled too
        wethPrice = wethPrice.mul(107).div(100);
        await core.testEcosystem!.testPriceOracle.setPrice(core.tokens.weth.address, wethPrice);
        await core.dolomiteMargin.ownerSetPriceOracle(core.marketIds.weth, core.testEcosystem!.testPriceOracle.address);
      }
      amountWeiForLiquidation = wethAmount.mul(wethPrice).mul(105).div(100).div(gmPrice);
      if (amountWeiForLiquidation.gt(amountWei)) {
        // Cap the size at amountWei
        amountWeiForLiquidation = amountWei;
      }
    }

    async function cancelWrapping(): Promise<ContractTransaction> {
      await mine(1200);
      const filter = eventEmitter.filters.AsyncDepositCreated();
      depositKey = (await eventEmitter.queryFilter(filter))[0].args.key;
      return await vault.connect(core.hhUser1).cancelDeposit(depositKey);
    }

    async function performUnwrapping(key?: string): Promise<ContractTransaction> {
      if (!key) {
        const filter = eventEmitter.filters.AsyncWithdrawalCreated();
        withdrawalKeys.push((await eventEmitter.queryFilter(filter))[0].args.key);
      }
      return await core.gmxEcosystemV2!.gmxWithdrawalHandler.connect(core.gmxEcosystemV2!.gmxExecutor)
        .executeWithdrawal(
          withdrawalKeys[withdrawalKeys.length - 1],
          getOracleParams(core.tokens.weth.address, core.tokens.nativeUsdc!.address),
          { gasLimit: 10_000_000 },
        );
    }

    enum UnwrapperTradeType {
      FromWithdrawal = 0,
      FromDeposit = 1,
    }

    enum FinishState {
      WithdrawalFailed = 1,
      WithdrawalSucceeded = 2,
      Liquidated = 3,
      Expired = 4,
    }

    async function checkStateAfterUnwrapping(
      accountNumber: BigNumber,
      state: FinishState,
      vaultErc20Balance: BigNumber = amountWei,
      outputAmount: BigNumber = ZERO_BI,
      isFrozenAfterLiquidation?: boolean,
    ) {
      await expectWalletBalance(vault, underlyingToken, vaultErc20Balance);

      const withdrawals = await Promise.all(withdrawalKeys.map(key => unwrapper.getWithdrawalInfo(key)));
      let totalOutputAmount = withdrawals.reduce((acc, withdrawal, i) => {
        expect(withdrawal.key).to.eq(withdrawalKeys[i]);
        if (
          state === FinishState.WithdrawalSucceeded
          || state === FinishState.Liquidated
          || state === FinishState.Expired
        ) {
          expect(withdrawal.vault).to.eq(ZERO_ADDRESS);
          expect(withdrawal.accountNumber).to.eq(ZERO_BI);
          expect(withdrawal.inputAmount).to.eq(ZERO_BI);
          expect(withdrawal.outputToken).to.eq(ZERO_ADDRESS);
          expect(withdrawal.outputAmount).to.eq(ZERO_BI);
        } else {
          expect(withdrawal.vault).to.eq(vault.address);
          expect(withdrawal.accountNumber).to.eq(borrowAccountNumber);
          expect(withdrawal.inputAmount).to.eq(amountWei);
          expect(withdrawal.outputToken).to.eq(core.tokens.nativeUsdc!.address);
          expect(withdrawal.outputAmount).to.gt(ZERO_BI);
        }
        return acc.add(withdrawal.outputAmount);
      }, ZERO_BI);

      const deposit = depositKey ? await wrapper.getDepositInfo(depositKey) : undefined;
      if (deposit) {
        totalOutputAmount = totalOutputAmount.add(deposit.inputAmount);
        expect(deposit.vault).to.eq(vault.address);
        expect(deposit.accountNumber).to.eq(borrowAccountNumber);
        expect(deposit.inputToken).to.eq(core.tokens.weth!.address);
        expect(deposit.inputAmount).to.eq(depositAmountIn);
        expect(deposit.outputAmount).to.eq(depositMinAmountOut);
      }

      if (
        state === FinishState.WithdrawalSucceeded
        || state === FinishState.Liquidated
        || state === FinishState.Expired
      ) {
        await expectProtocolBalance(core, vault.address, accountNumber, marketId, ZERO_BI);
        expect(await vault.isVaultAccountFrozen(defaultAccountNumber)).to.eq(false);
        expect(await vault.isVaultAccountFrozen(accountNumber)).to.eq(false);
        expect(await vault.shouldSkipTransfer()).to.eq(false);
        expect(await vault.isDepositSourceWrapper()).to.eq(false);

        if (state === FinishState.Liquidated && isFrozenAfterLiquidation) {
          expect(await vault.isVaultFrozen()).to.eq(isFrozenAfterLiquidation);
        } else {
          expect(await vault.isVaultFrozen()).to.eq(false);
        }

        if (state === FinishState.Liquidated) {
          await expectProtocolBalance(
            core,
            vault.address,
            accountNumber,
            core.marketIds.nativeUsdc!,
            outputAmount.sub(outputAmount.mul(amountWeiForLiquidation).div(amountWei)),
          );
          await expectProtocolBalance(
            core,
            vault,
            accountNumber,
            core.marketIds.weth,
            ZERO_BI,
          );
          await expectProtocolBalance(
            core,
            solidAccount.owner,
            solidAccount.number,
            core.marketIds.nativeUsdc!,
            ZERO_BI,
          );
          await expectProtocolBalance(
            core,
            solidAccount.owner,
            solidAccount.number,
            marketId,
            ZERO_BI,
          );
          // The trader always outputs the debt amount (which means the solid account does not earn a profit in ETH)
          await expectProtocolBalance(
            core,
            solidAccount.owner,
            solidAccount.number,
            core.marketIds.weth,
            ZERO_BI,
          );
        } else if (state === FinishState.WithdrawalSucceeded) {
          await expectProtocolBalance(core, vault.address, accountNumber, core.marketIds.weth, wethAmount.mul(-1));
        } else {
          await expectProtocolBalanceIsGreaterThan(
            core,
            { owner: vault.address, number: accountNumber },
            core.marketIds.weth,
            ONE_BI,
            0,
          );
        }
      } else {
        await expectProtocolBalance(core, vault.address, accountNumber, marketId, amountWei.add(depositMinAmountOut));
        await expectProtocolBalance(
          core,
          vault.address,
          accountNumber,
          core.marketIds.weth,
          wethAmount.add(depositAmountIn).mul(-1),
        );
        expect(await vault.isVaultAccountFrozen(defaultAccountNumber)).to.eq(false);
        expect(await vault.isVaultAccountFrozen(accountNumber)).to.eq(true);
        expect(await vault.isVaultFrozen()).to.eq(true);
        expect(await vault.shouldSkipTransfer()).to.eq(false);
        expect(await vault.isDepositSourceWrapper()).to.eq(false);
        await expectWalletBalance(vault, underlyingToken, vaultErc20Balance);
      }

      if (state === FinishState.WithdrawalFailed) {
        expect(totalOutputAmount).to.be.gt(ZERO_BI);
        if (withdrawals[0].outputToken === core.tokens.weth.address) {
          await expectWalletBalance(unwrapper, core.tokens.weth, totalOutputAmount);
          await expectWalletBalance(unwrapper, core.tokens.nativeUsdc!, ZERO_BI);
        } else {
          await expectWalletBalance(unwrapper, core.tokens.nativeUsdc!, totalOutputAmount);
          await expectWalletBalance(unwrapper, core.tokens.weth, ZERO_BI);
        }
      } else {
        await expectWalletBalance(unwrapper, core.tokens.weth, ZERO_BI);
        await expectWalletBalance(unwrapper, core.tokens.nativeUsdc!, ZERO_BI);
      }
    }

    async function performLiquidationAndCheckState(vaultErc20Balance: BigNumber, isFrozen: boolean) {
      // Give the contract the WETH needed to complete the exchange
      const testTrader = await impersonate(core.testEcosystem!.testExchangeWrapper.address, true, wethAmount.mul(10));
      await setupWETHBalance(
        core,
        testTrader,
        wethAmount.mul(5),
        { address: '0x000000000000000000000000000000000000dead' },
      );

      const allKeys = withdrawalKeys.concat(depositKey ? [depositKey] : []);
      const tradeTypes = allKeys.map(key => key === depositKey
        ? UnwrapperTradeType.FromDeposit
        : UnwrapperTradeType.FromWithdrawal);
      const liquidationData = ethers.utils.defaultAbiCoder.encode(
        ['uint8[]', 'bytes32[]'],
        [tradeTypes, allKeys],
      );
      const withdrawals = await Promise.all(withdrawalKeys.map(key => unwrapper.getWithdrawalInfo(key)));
      const deposit = depositKey ? await wrapper.getDepositInfo(depositKey) : undefined;
      const totalOutputAmount = withdrawals.reduce((acc, withdrawal) => acc.add(withdrawal.outputAmount), ZERO_BI)
        .add(deposit ? deposit.inputAmount : ZERO_BI);
      const outputAmount = totalOutputAmount.mul(amountWeiForLiquidation).div(amountWei);
      const zapParam = await getLiquidateIsolationModeZapPath(
        [marketId, core.marketIds.nativeUsdc!, core.marketIds.weth],
        [amountWeiForLiquidation, outputAmount, wethAmount],
        unwrapper,
        core,
      );
      zapParam.tradersPath[0].tradeData = liquidationData;
      await liquidateV4WithZapParam(
        core,
        solidAccount,
        liquidAccount,
        zapParam,
      );

      await checkStateAfterUnwrapping(
        borrowAccountNumber,
        FinishState.Liquidated,
        vaultErc20Balance,
        totalOutputAmount,
        isFrozen,
      );
    }

    it('should work normally for underwater account', async () => {
      await setupBalances(borrowAccountNumber, true, false);
      await liquidatorProxy.prepareForLiquidation(
        liquidAccount,
        marketId,
        amountWei,
        core.marketIds.nativeUsdc!,
        ONE_BI,
        NO_EXPIRY,
      );
      const result = await performUnwrapping();
      await expectEvent(eventEmitter, result, 'AsyncWithdrawalExecuted', {
        key: withdrawalKeys[0],
        token: factory.address,
      });
      await checkStateAfterUnwrapping(borrowAccountNumber, FinishState.WithdrawalSucceeded);

      // it's sufficiently collateralized now
      const [supplyValue, borrowValue] = await core.dolomiteMargin.getAccountValues(liquidAccount);
      expect(supplyValue.value.mul(ONE_ETH_BI).div(borrowValue.value)).to.be.gt(ONE_ETH_BI.mul(115).div(100));
    });

    it('should work normally for underwater account that must be liquidated', async () => {
      await setupBalances(borrowAccountNumber);
      await liquidatorProxy.prepareForLiquidation(
        liquidAccount,
        marketId,
        amountWei,
        core.marketIds.nativeUsdc!,
        ONE_BI,
        NO_EXPIRY,
      );
      const result = await performUnwrapping();
      await expectEvent(eventEmitter, result, 'AsyncWithdrawalFailed', {
        key: withdrawalKeys[0],
        token: factory.address,
        reason: `OperationImpl: Undercollateralized account <${vault.address.toLowerCase()}, ${borrowAccountNumber.toString()}>`,
      });
      await checkStateAfterUnwrapping(borrowAccountNumber, FinishState.WithdrawalFailed);

      await performLiquidationAndCheckState(amountWei, false);
    });

    it('should work normally for underwater account when vault is frozen', async () => {
      await setupBalances(borrowAccountNumber2, false, false);
      await setupBalances(borrowAccountNumber);
      await liquidatorProxy.prepareForLiquidation(
        liquidAccount,
        marketId,
        amountWei,
        core.marketIds.nativeUsdc!,
        ONE_BI,
        NO_EXPIRY,
      );

      const filter = eventEmitter.filters.AsyncWithdrawalCreated();
      withdrawalKeys.push((await eventEmitter.queryFilter(filter))[0].args.key);

      await liquidatorProxy.prepareForLiquidation(
        liquidAccount2,
        marketId,
        amountWei,
        core.marketIds.nativeUsdc!,
        ONE_BI,
        NO_EXPIRY,
      );

      const result = await performUnwrapping(withdrawalKeys[withdrawalKeys.length - 1]);
      await expectEvent(eventEmitter, result, 'AsyncWithdrawalFailed', {
        key: withdrawalKeys[withdrawalKeys.length - 1],
        token: factory.address,
        reason: `OperationImpl: Undercollateralized account <${vault.address.toLowerCase()}, ${borrowAccountNumber.toString()}>`,
      });
      withdrawalKeys[0] = withdrawalKeys.pop()!;
      await checkStateAfterUnwrapping(borrowAccountNumber, FinishState.WithdrawalFailed, ZERO_BI);

      await performLiquidationAndCheckState(ZERO_BI, true);
    });

    it('should work normally for expired account (same expired market as unwind)', async () => {
      await setupBalances(borrowAccountNumber, false, false);
      const owedMarket = core.marketIds.weth;
      await setExpiry(core, liquidAccount, owedMarket, 123);
      const expiry = await core.expiry.getExpiry(liquidAccount, owedMarket);
      await increaseByTimeDelta(1234);
      await liquidatorProxy.prepareForLiquidation(
        liquidAccount,
        marketId,
        amountWei,
        owedMarket,
        ONE_BI,
        expiry,
      );

      const result = await performUnwrapping();
      await expectEvent(eventEmitter, result, 'AsyncWithdrawalExecuted', {
        key: withdrawalKeys[0],
        token: factory.address,
      });
      await checkStateAfterUnwrapping(borrowAccountNumber, FinishState.Expired);

      // At this point the expiration should not be unset but the user's owed balance should be gt 0
      await expectProtocolBalanceIsGreaterThan(core, liquidAccount, owedMarket, ONE_BI, 0);
      expect(await core.expiry.getExpiry(liquidAccount, owedMarket)).to.eq(expiry);
    });

    it('should work for underwater account when there is already a pending deposit', async () => {
      await setupBalances(borrowAccountNumber, true, true, true);
      await liquidatorProxy.prepareForLiquidation(
        liquidAccount,
        marketId,
        amountWei,
        core.marketIds.nativeUsdc!,
        ONE_BI,
        NO_EXPIRY,
      );
      const result1 = await cancelWrapping();
      await expectEvent(eventEmitter, result1, 'AsyncDepositCancelledFailed', {
        key: depositKey,
        token: factory.address,
        reason: `OperationImpl: Undercollateralized account <${vault.address.toLowerCase()}, ${borrowAccountNumber.toString()}>`,
      });
      const result2 = await performUnwrapping();
      await expectEvent(eventEmitter, result2, 'AsyncWithdrawalFailed', {
        key: withdrawalKeys[0],
        token: factory.address,
        reason: `OperationImpl: Undercollateralized account <${vault.address.toLowerCase()}, ${borrowAccountNumber.toString()}>`,
      });
      await checkStateAfterUnwrapping(borrowAccountNumber, FinishState.WithdrawalFailed);

      await performLiquidationAndCheckState(amountWei, false);
    });

    it('should work for underwater account when there is already a pending withdrawal', async () => {
    });

    it('should fail when liquid account is not a valid vault', async () => {
      const liquidAccount = { owner: ZERO_ADDRESS, number: ZERO_BI };
      await expectThrow(
        liquidatorProxy.prepareForLiquidation(
          liquidAccount,
          marketId,
          amountWei,
          core.marketIds.weth,
          ONE_BI,
          NO_EXPIRY,
        ),
        `FreezableVaultLiquidatorProxy: Invalid liquid account <${liquidAccount.owner}>`,
      );
    });

    it('should fail when expiration overflows', async () => {
      await expectThrow(
        liquidatorProxy.prepareForLiquidation(
          liquidAccount,
          marketId,
          amountWei,
          core.marketIds.weth,
          ONE_BI,
          MAX_UINT_256_BI,
        ),
        'FreezableVaultLiquidatorProxy: Invalid expiration timestamp',
      );
    });

    it('should fail when position is not expired', async () => {
      const timestamp = await getBlockTimestamp(core.config.blockNumber);
      await expectThrow(
        liquidatorProxy.prepareForLiquidation(
          liquidAccount,
          marketId,
          amountWei,
          core.marketIds.weth,
          ONE_BI,
          timestamp + 3600,
        ),
        'FreezableVaultLiquidatorProxy: Account not expired',
      );
    });

    it('should fail when position expiration does not match input', async () => {
      await setupBalances(borrowAccountNumber, false, false);
      const owedMarket = core.marketIds.weth;
      await setExpiry(core, liquidAccount, owedMarket, 123);
      const expiry = await core.expiry.getExpiry(liquidAccount, owedMarket);
      await increaseByTimeDelta(1234);
      await expectThrow(
        liquidatorProxy.prepareForLiquidation(
          liquidAccount,
          marketId,
          amountWei,
          owedMarket,
          ONE_BI,
          expiry + 321,
        ),
        'FreezableVaultLiquidatorProxy: Expiration mismatch',
      );
    });

    it('should fail when liquid account has no supply', async () => {
      await expectThrow(
        liquidatorProxy.prepareForLiquidation(
          { owner: vault.address, number: borrowAccountNumber3 },
          marketId,
          amountWei,
          core.marketIds.weth,
          ONE_BI,
          NO_EXPIRY,
        ),
        'FreezableVaultLiquidatorProxy: Liquid account has no supply',
      );
    });

    it('should fail when vault account is frozen', async () => {
      await setupBalances(borrowAccountNumber, true, false);
      await liquidatorProxy.prepareForLiquidation(
        liquidAccount,
        marketId,
        amountWei,
        core.marketIds.weth,
        ONE_BI,
        NO_EXPIRY,
      );
      await expectThrow(
        liquidatorProxy.prepareForLiquidation(
          liquidAccount,
          marketId,
          amountWei,
          core.marketIds.weth,
          ONE_BI,
          NO_EXPIRY,
        ),
        `IsolationModeVaultV1Freezable: Account is frozen <${liquidAccount.owner.toLowerCase()}, ${liquidAccount.number.toString()}>`,
      );
    });

    it('should fail when vault withdraws too little', async () => {
      await setupBalances(borrowAccountNumber, true, false);
      await expectThrow(
        liquidatorProxy.prepareForLiquidation(
          liquidAccount,
          marketId,
          amountWei.div(3),
          core.marketIds.weth,
          ONE_BI,
          NO_EXPIRY,
        ),
        `IsolationModeVaultV1Freezable: Liquidation must be full balance <${liquidAccount.owner.toLowerCase()}, ${liquidAccount.number.toString()}>`,
      );
    });
  });
});
