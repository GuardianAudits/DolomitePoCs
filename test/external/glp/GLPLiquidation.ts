import { BalanceCheckFlag } from '@dolomite-margin/dist/src';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import {
  GLPPriceOracleV1,
  GLPPriceOracleV1__factory,
  GLPUnwrapperProxyV1,
  GLPWrappedTokenUserVaultFactory,
  GLPWrappedTokenUserVaultFactory__factory,
  GLPWrappedTokenUserVaultV1,
  GLPWrappedTokenUserVaultV1__factory,
  GLPWrapperProxyV1,
  GmxRegistryV1,
  IERC20,
} from '../../../src/types';
import { Account } from '../../../src/types/IDolomiteMargin';
import { createContractWithAbi } from '../../../src/utils/dolomite-utils';
import { BYTES_EMPTY, NO_EXPIRY, ONE_BI, ZERO_BI } from '../../../src/utils/no-deps-constants';
import { getRealLatestBlockNumber, revertToSnapshotAndCapture, snapshot, waitDays, waitTime } from '../../utils';
import {
  expectProtocolBalance,
  expectProtocolBalanceIsGreaterThan,
  expectWalletBalanceOrDustyIfZero,
} from '../../utils/assertions';
import { setExpiry } from '../../utils/expiry-utils';
import { getCalldataForParaswap } from '../../utils/liquidation-utils';
import {
  CoreProtocol,
  setupCoreProtocol,
  setupGmxRegistry,
  setupTestMarket,
  setupUSDCBalance,
  setupUserVaultProxy,
} from '../../utils/setup';
import { createGlpUnwrapperProxy, createGlpWrapperProxy } from '../../utils/wrapped-token-utils';

const defaultAccountNumber = '0';
const otherAccountNumber = '420';
const heldAmountWei = BigNumber.from('200000000000000000000'); // $200

describe('GLPLiquidation', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let underlyingToken: IERC20;
  let underlyingMarketId: BigNumber;
  let gmxRegistry: GmxRegistryV1;
  let unwrapper: GLPUnwrapperProxyV1;
  let wrapper: GLPWrapperProxyV1;
  let factory: GLPWrappedTokenUserVaultFactory;
  let vault: GLPWrappedTokenUserVaultV1;
  let priceOracle: GLPPriceOracleV1;
  let defaultAccountStruct: Account.InfoStruct;
  let liquidAccountStruct: Account.InfoStruct;
  let solidAccountStruct: Account.InfoStruct;

  let solidUser: SignerWithAddress;

  before(async () => {
    const blockNumber = await getRealLatestBlockNumber(true);
    core = await setupCoreProtocol({
      blockNumber,
    });
    underlyingToken = core.gmxEcosystem.fsGlp;
    const userVaultImplementation = await createContractWithAbi(
      GLPWrappedTokenUserVaultV1__factory.abi,
      GLPWrappedTokenUserVaultV1__factory.bytecode,
      [],
    );
    gmxRegistry = await setupGmxRegistry(core);
    factory = await createContractWithAbi<GLPWrappedTokenUserVaultFactory>(
      GLPWrappedTokenUserVaultFactory__factory.abi,
      GLPWrappedTokenUserVaultFactory__factory.bytecode,
      [
        core.weth.address,
        core.marketIds.weth,
        gmxRegistry.address,
        underlyingToken.address,
        core.borrowPositionProxyV2.address,
        userVaultImplementation.address,
        core.dolomiteMargin.address,
      ],
    );
    priceOracle = await createContractWithAbi<GLPPriceOracleV1>(
      GLPPriceOracleV1__factory.abi,
      GLPPriceOracleV1__factory.bytecode,
      [gmxRegistry.address, factory.address],
    );

    underlyingMarketId = await core.dolomiteMargin.getNumMarkets();
    await setupTestMarket(core, factory, true, priceOracle);
    await core.dolomiteMargin.ownerSetPriceOracle(underlyingMarketId, priceOracle.address);

    unwrapper = await createGlpUnwrapperProxy(core, factory, gmxRegistry);
    wrapper = await createGlpWrapperProxy(core, factory, gmxRegistry);
    await factory.initialize([unwrapper.address, wrapper.address]);
    await core.dolomiteMargin.connect(core.governance).ownerSetGlobalOperator(factory.address, true);

    solidUser = core.hhUser5;

    await factory.createVault(core.hhUser1.address);
    const vaultAddress = await factory.getVaultByAccount(core.hhUser1.address);
    vault = setupUserVaultProxy<GLPWrappedTokenUserVaultV1>(
      vaultAddress,
      GLPWrappedTokenUserVaultV1__factory,
      core.hhUser1,
    );
    defaultAccountStruct = { owner: vault.address, number: defaultAccountNumber };
    liquidAccountStruct = { owner: vault.address, number: otherAccountNumber };
    solidAccountStruct = { owner: core.hhUser5.address, number: defaultAccountNumber };

    const usdcAmount = heldAmountWei.div(1e12).mul(4);
    await setupUSDCBalance(core.hhUser1, usdcAmount, core.gmxEcosystem.glpManager);
    await core.gmxEcosystem.glpRewardsRouter.connect(core.hhUser1).mintAndStakeGlp(core.usdc.address, usdcAmount, 0, 0);
    await core.gmxEcosystem.sGlp.connect(core.hhUser1).approve(vault.address, heldAmountWei);
    await vault.depositIntoVaultForDolomiteMargin(defaultAccountNumber, heldAmountWei);

    expect(await underlyingToken.balanceOf(vault.address)).to.eq(heldAmountWei);
    expect((await core.dolomiteMargin.getAccountWei(defaultAccountStruct, underlyingMarketId)).value)
      .to
      .eq(heldAmountWei);

    await core.dolomiteMargin.ownerSetGlobalOperator(core.liquidatorProxyV3.address, true);
    await core.liquidatorProxyV3.connect(core.governance).setMarketIdToTokenUnwrapperForLiquidationMap(
      underlyingMarketId,
      unwrapper.address,
    );

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('Perform liquidation with full integration', () => {
    it('should work when liquid account is borrowing the output token (USDC)', async () => {
      const [supplyValue, borrowValue] = await core.dolomiteMargin.getAccountValues(defaultAccountStruct);
      expect(borrowValue.value).to.eq(ZERO_BI);

      const usdcPrice = await core.dolomiteMargin.getMarketPrice(core.marketIds.usdc);
      const usdcDebtAmount = supplyValue.value.mul(100).div(116).div(usdcPrice.value);
      await vault.transferIntoPositionWithUnderlyingToken(defaultAccountNumber, otherAccountNumber, heldAmountWei);
      await vault.transferFromPositionWithOtherToken(
        otherAccountNumber,
        defaultAccountNumber,
        core.marketIds.usdc,
        usdcDebtAmount,
        BalanceCheckFlag.To,
      );
      await core.testPriceOracle.setPrice(core.usdc.address, '1050000000000000000000000000000');
      await core.dolomiteMargin.ownerSetPriceOracle(core.marketIds.usdc, core.testPriceOracle.address);

      const newAccountValues = await core.dolomiteMargin.getAccountValues(liquidAccountStruct);
      // check that the position is indeed under collateralized
      expect(newAccountValues[0].value).to.lt(newAccountValues[1].value.mul(115).div(100));

      const glpPrice = await core.dolomiteMargin.getMarketPrice(underlyingMarketId);
      const heldUpdatedWithReward = await newAccountValues[1].value.mul(105).div(100).div(glpPrice.value);
      const usdcOutputAmount = await unwrapper.getExchangeCost(
        factory.address,
        core.usdc.address,
        heldUpdatedWithReward,
        BYTES_EMPTY,
      );

      const txResult = await core.liquidatorProxyV3.connect(core.hhUser5).liquidate(
        solidAccountStruct,
        liquidAccountStruct,
        core.marketIds.usdc,
        underlyingMarketId,
        NO_EXPIRY,
        BYTES_EMPTY,
      );
      const receipt = await txResult.wait();
      console.log('\tliquidatorProxy#liquidate gas used:', receipt.gasUsed.toString());

      await expectProtocolBalance(
        core,
        solidAccountStruct.owner,
        solidAccountStruct.number,
        underlyingMarketId,
        ZERO_BI,
      );
      await expectProtocolBalanceIsGreaterThan(
        core,
        solidAccountStruct,
        core.marketIds.usdc,
        usdcOutputAmount.sub(usdcDebtAmount),
        '5',
      );
      await expectProtocolBalanceIsGreaterThan(
        core,
        liquidAccountStruct,
        underlyingMarketId,
        heldAmountWei.sub(heldUpdatedWithReward),
        '5',
      );
      await expectProtocolBalance(
        core,
        liquidAccountStruct.owner,
        liquidAccountStruct.number,
        core.marketIds.usdc,
        ZERO_BI,
      );

      await expectWalletBalanceOrDustyIfZero(core, core.liquidatorProxyV3.address, factory.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, core.liquidatorProxyV3.address, core.weth.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, unwrapper.address, core.gmxEcosystem.sGlp.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, unwrapper.address, core.usdc.address, ZERO_BI);
    });

    it('should work when liquid account is borrowing a different output token (WETH)', async () => {
      const [supplyValue, borrowValue] = await core.dolomiteMargin.getAccountValues(defaultAccountStruct);
      expect(borrowValue.value).to.eq(ZERO_BI);

      const wethPrice = await core.dolomiteMargin.getMarketPrice(core.marketIds.weth);
      const wethDebtAmount = supplyValue.value.mul(100).div(115).div(wethPrice.value);
      await vault.transferIntoPositionWithUnderlyingToken(defaultAccountNumber, otherAccountNumber, heldAmountWei);
      await vault.transferFromPositionWithOtherToken(
        otherAccountNumber,
        defaultAccountNumber,
        core.marketIds.weth,
        wethDebtAmount,
        BalanceCheckFlag.To,
      );
      // set the price of USDC to be 105% of the current price
      await core.testPriceOracle.setPrice(core.weth.address, wethPrice.value.mul(105).div(100));
      await core.dolomiteMargin.ownerSetPriceOracle(core.marketIds.weth, core.testPriceOracle.address);

      const newAccountValues = await core.dolomiteMargin.getAccountValues(liquidAccountStruct);
      // check that the position is indeed under collateralized
      expect(newAccountValues[0].value).to.lt(newAccountValues[1].value.mul(115).div(100));

      const glpPrice = await core.dolomiteMargin.getMarketPrice(underlyingMarketId);
      const heldUpdatedWithReward = await newAccountValues[1].value.mul(105).div(100).div(glpPrice.value);
      const usdcOutputAmount = await unwrapper.getExchangeCost(
        factory.address,
        core.usdc.address,
        heldUpdatedWithReward,
        BYTES_EMPTY,
      );
      const { calldata: paraswapCalldata, outputAmount: wethOutputAmount } = await getCalldataForParaswap(
        usdcOutputAmount,
        core.usdc,
        6,
        ONE_BI,
        core.weth,
        18,
        core.hhUser5,
        core.liquidatorProxyV3,
      );

      const txResult = await core.liquidatorProxyV3.connect(core.hhUser5).liquidate(
        solidAccountStruct,
        liquidAccountStruct,
        core.marketIds.weth,
        underlyingMarketId,
        NO_EXPIRY,
        paraswapCalldata,
      );
      const receipt = await txResult.wait();
      console.log('\tliquidatorProxy#liquidate gas used:', receipt.gasUsed.toString());

      await expectProtocolBalance(
        core,
        solidAccountStruct.owner,
        solidAccountStruct.number,
        underlyingMarketId,
        ZERO_BI,
      );
      await expectProtocolBalance(
        core,
        solidAccountStruct.owner,
        solidAccountStruct.number,
        core.marketIds.usdc,
        ZERO_BI,
      );
      await expectProtocolBalanceIsGreaterThan(
        core,
        solidAccountStruct,
        core.marketIds.weth,
        wethOutputAmount.sub(wethDebtAmount),
        '500',
      );
      await expectProtocolBalanceIsGreaterThan(
        core,
        liquidAccountStruct,
        underlyingMarketId,
        heldAmountWei.sub(heldUpdatedWithReward),
        '10',
      );
      await expectProtocolBalance(
        core,
        liquidAccountStruct.owner,
        liquidAccountStruct.number,
        core.marketIds.weth,
        ZERO_BI,
      );

      await expectWalletBalanceOrDustyIfZero(core, core.liquidatorProxyV3.address, core.usdc.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, core.liquidatorProxyV3.address, core.weth.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, unwrapper.address, core.gmxEcosystem.sGlp.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, unwrapper.address, core.usdc.address, ZERO_BI);
    });
  });

  describe('Perform expiration with full integration', () => {
    const collateralizationNumerator = 150;
    const collateralizationDenominator = 100;

    it('should work when expired account is borrowing the output token (USDC)', async () => {
      const glpPrice = await core.dolomiteMargin.getMarketPrice(underlyingMarketId);
      await vault.transferIntoPositionWithUnderlyingToken(defaultAccountNumber, otherAccountNumber, heldAmountWei);
      const [supplyValue, borrowValue] = await core.dolomiteMargin.getAccountValues(liquidAccountStruct);
      expect(borrowValue.value).to.eq(ZERO_BI);

      const usdcPrice = await core.dolomiteMargin.getMarketPrice(core.marketIds.usdc);
      const usdcDebtAmount = supplyValue.value.mul(collateralizationDenominator)
        .div(collateralizationNumerator)
        .div(usdcPrice.value); // 186450975758540302400 | 1000000730000000000
      await vault.transferFromPositionWithOtherToken(
        otherAccountNumber,
        defaultAccountNumber,
        core.marketIds.usdc,
        usdcDebtAmount,
        BalanceCheckFlag.To,
      );

      await setExpiry(core, liquidAccountStruct, core.marketIds.usdc, 1);
      const rampTime = await core.expiry.g_expiryRampTime();
      await waitTime(rampTime.add(ONE_BI).toNumber());
      const expiry = await core.expiry.getExpiry(liquidAccountStruct, core.marketIds.usdc);
      expect(expiry).to.not.eq(0);

      const newAccountValues = await core.dolomiteMargin.getAccountValues(liquidAccountStruct);
      // check that the position is over collateralized
      expect(newAccountValues[0].value).to.gte(newAccountValues[1].value.mul(115).div(collateralizationDenominator));

      const [heldPrice, owedPriceAdj] = await core.expiry.getSpreadAdjustedPrices(
        underlyingMarketId,
        core.marketIds.usdc,
        expiry,
      );

      const heldUpdatedWithReward = usdcDebtAmount.mul(owedPriceAdj.value).div(heldPrice.value);
      const usdcOutputAmount = await unwrapper.getExchangeCost(
        factory.address,
        core.usdc.address,
        heldUpdatedWithReward,
        BYTES_EMPTY,
      );

      const txResult = await core.liquidatorProxyV3.connect(core.hhUser5).liquidate(
        solidAccountStruct,
        liquidAccountStruct,
        core.marketIds.usdc,
        underlyingMarketId,
        expiry,
        BYTES_EMPTY,
      );
      const receipt = await txResult.wait();
      console.log('\tliquidatorProxy#liquidate gas used:', receipt.gasUsed.toString());

      await expectProtocolBalance(
        core,
        solidAccountStruct.owner,
        solidAccountStruct.number,
        underlyingMarketId,
        ZERO_BI,
      );
      await expectProtocolBalanceIsGreaterThan(
        core,
        solidAccountStruct,
        core.marketIds.usdc,
        usdcOutputAmount.sub(usdcDebtAmount),
        '5',
      );
      await expectProtocolBalanceIsGreaterThan(
        core,
        liquidAccountStruct,
        underlyingMarketId,
        heldAmountWei.sub(heldUpdatedWithReward),
        '5',
      );
      await expectProtocolBalance(
        core,
        liquidAccountStruct.owner,
        liquidAccountStruct.number,
        core.marketIds.usdc,
        ZERO_BI,
      );

      await expectWalletBalanceOrDustyIfZero(core, core.liquidatorProxyV3.address, factory.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, core.liquidatorProxyV3.address, core.weth.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, unwrapper.address, core.gmxEcosystem.sGlp.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, unwrapper.address, core.usdc.address, ZERO_BI);
    });

    it('should work when expired account is borrowing a different output token (WETH)', async () => {
      const [supplyValue, borrowValue] = await core.dolomiteMargin.getAccountValues(defaultAccountStruct);
      expect(borrowValue.value).to.eq(ZERO_BI);

      const wethPrice = await core.dolomiteMargin.getMarketPrice(core.marketIds.weth);
      const wethDebtAmount = supplyValue.value.mul(collateralizationDenominator)
        .div(collateralizationNumerator)
        .div(wethPrice.value);
      await vault.transferIntoPositionWithUnderlyingToken(defaultAccountNumber, otherAccountNumber, heldAmountWei);
      await vault.transferFromPositionWithOtherToken(
        otherAccountNumber,
        defaultAccountNumber,
        core.marketIds.weth,
        wethDebtAmount,
        BalanceCheckFlag.To,
      );

      const newAccountValues = await core.dolomiteMargin.getAccountValues(liquidAccountStruct);
      // check that the position is indeed over collateralized
      expect(newAccountValues[0].value).to.gte(newAccountValues[1].value.mul(115).div(collateralizationDenominator));

      const rampTime = await core.expiry.g_expiryRampTime();
      await setExpiry(core, liquidAccountStruct, core.marketIds.weth, 1);
      await waitTime(rampTime.add(ONE_BI).toNumber());
      const expiry = await core.expiry.getExpiry(liquidAccountStruct, core.marketIds.weth);
      expect(expiry).to.not.eq(0);

      const [heldPrice, owedPriceAdj] = await core.expiry.getSpreadAdjustedPrices(
        underlyingMarketId,
        core.marketIds.weth,
        expiry,
      );

      const heldUpdatedWithReward = wethDebtAmount.mul(owedPriceAdj.value).div(heldPrice.value);
      const usdcOutputAmount = await unwrapper.getExchangeCost(
        factory.address,
        core.usdc.address,
        heldUpdatedWithReward,
        BYTES_EMPTY,
      );
      const { calldata: paraswapCalldata, outputAmount: wethOutputAmount } = await getCalldataForParaswap(
        usdcOutputAmount,
        core.usdc,
        6,
        wethDebtAmount,
        core.weth,
        18,
        core.hhUser5,
        core.liquidatorProxyV3,
      );

      const txResult = await core.liquidatorProxyV3.connect(core.hhUser5).liquidate(
        solidAccountStruct,
        liquidAccountStruct,
        core.marketIds.weth,
        underlyingMarketId,
        expiry,
        paraswapCalldata,
      );
      const receipt = await txResult.wait();
      console.log('\tliquidatorProxy#liquidate gas used:', receipt.gasUsed.toString());

      await expectProtocolBalance(
        core,
        solidAccountStruct.owner,
        solidAccountStruct.number,
        underlyingMarketId,
        ZERO_BI,
      );
      await expectProtocolBalance(
        core,
        solidAccountStruct.owner,
        solidAccountStruct.number,
        core.marketIds.usdc,
        ZERO_BI,
      );
      await expectProtocolBalanceIsGreaterThan(
        core,
        solidAccountStruct,
        core.marketIds.weth,
        wethOutputAmount.sub(wethDebtAmount),
        '500',
      );
      await expectProtocolBalanceIsGreaterThan(
        core,
        liquidAccountStruct,
        underlyingMarketId,
        heldAmountWei.sub(heldUpdatedWithReward),
        '10',
      );
      await expectProtocolBalance(
        core,
        liquidAccountStruct.owner,
        liquidAccountStruct.number,
        core.marketIds.weth,
        ZERO_BI,
      );

      await expectWalletBalanceOrDustyIfZero(core, core.liquidatorProxyV3.address, core.usdc.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, core.liquidatorProxyV3.address, core.weth.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, unwrapper.address, core.gmxEcosystem.sGlp.address, ZERO_BI);
      await expectWalletBalanceOrDustyIfZero(core, unwrapper.address, core.usdc.address, ZERO_BI);
    });
  });
});
