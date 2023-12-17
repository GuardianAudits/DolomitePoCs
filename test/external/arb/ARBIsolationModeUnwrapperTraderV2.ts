import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { AccountInfoStruct } from 'src/utils';
import {
  ARBIsolationModeTokenVaultV1,
  ARBIsolationModeTokenVaultV1__factory,
  ARBIsolationModeVaultFactory,
  ARBRegistry,
  SimpleIsolationModeUnwrapperTraderV2,
  SimpleIsolationModeWrapperTraderV2,
} from '../../../src/types';
import { ADDRESS_ZERO, BYTES_EMPTY, Network, ZERO_BI } from '../../../src/utils/no-deps-constants';
import { encodeExternalSellActionDataWithNoData, impersonate, revertToSnapshotAndCapture, snapshot } from '../../utils';
import { expectThrow } from '../../utils/assertions';
import {
  createARBIsolationModeTokenVaultV1,
  createARBIsolationModeVaultFactory,
  createARBRegistry,
  createARBUnwrapperTraderV2,
  createARBWrapperTraderV2,
} from '../../utils/ecosystem-token-utils/arb';
import {
  CoreProtocol,
  setupCoreProtocol,
  setupARBBalance,
  setupTestMarket,
  setupUserVaultProxy, disableInterestAccrual,
} from '../../utils/setup';
import { DEFAULT_BLOCK_NUMBER_FOR_ARB_TESTS } from './arb-utils';

const defaultAccountNumber = '0';
const amountWei = BigNumber.from('200000000000000000000'); // $200
const otherAmountWei = BigNumber.from('10000000'); // $10

describe('ARBIsolationModeUnwrapperTraderV2', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let arbRegistry: ARBRegistry;
  let unwrapper: SimpleIsolationModeUnwrapperTraderV2;
  let wrapper: SimpleIsolationModeWrapperTraderV2;
  let arbFactory: ARBIsolationModeVaultFactory;
  let arbVault: ARBIsolationModeTokenVaultV1;
  let dArbMarketId: BigNumber;
  let defaultAccount: AccountInfoStruct;

  before(async () => {
    core = await setupCoreProtocol({
      blockNumber: DEFAULT_BLOCK_NUMBER_FOR_ARB_TESTS,
      network: Network.ArbitrumOne,
    });
    await disableInterestAccrual(core, core.marketIds.arb!);

    arbRegistry = await createARBRegistry(core);

    const vaultImplementation = await createARBIsolationModeTokenVaultV1();
    arbFactory = await createARBIsolationModeVaultFactory(arbRegistry, vaultImplementation, core);

    unwrapper = await createARBUnwrapperTraderV2(arbFactory, core);
    wrapper = await createARBWrapperTraderV2(arbFactory, core);
    await core.chainlinkPriceOracle!.connect(core.governance).ownerInsertOrUpdateOracleToken(
      arbFactory.address,
      await arbFactory.decimals(),
      await core.chainlinkPriceOracle!.getAggregatorByToken(core.tokens.arb!.address),
      ADDRESS_ZERO,
    );

    dArbMarketId = await core.dolomiteMargin.getNumMarkets();
    await setupTestMarket(core, arbFactory, true, core.chainlinkPriceOracle);
    await core.dolomiteMargin.connect(core.governance).ownerSetGlobalOperator(arbFactory.address, true);
    await arbFactory.connect(core.governance).ownerInitialize([unwrapper.address, wrapper.address]);

    await arbFactory.createVault(core.hhUser1.address);
    arbVault = setupUserVaultProxy<ARBIsolationModeTokenVaultV1>(
      await arbFactory.getVaultByAccount(core.hhUser1.address),
      ARBIsolationModeTokenVaultV1__factory,
      core.hhUser1,
    );
    defaultAccount = {
      owner: arbVault.address,
      number: defaultAccountNumber,
    };

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('Actions.Call and Actions.Sell for non-liquidation', () => {
    it('should work when called with the normal conditions', async () => {
      await setupARBBalance(core, core.hhUser1, amountWei, arbVault);
      await arbVault.depositIntoVaultForDolomiteMargin(defaultAccountNumber, amountWei);

      const solidAccountId = 0;
      const liquidAccountId = 0;
      const actions = await unwrapper.createActionsForUnwrapping(
        solidAccountId,
        liquidAccountId,
        arbVault.address,
        arbVault.address,
        core.marketIds.arb!,
        dArbMarketId,
        ZERO_BI,
        amountWei,
        BYTES_EMPTY,
      );

      await core.dolomiteMargin.ownerSetGlobalOperator(core.hhUser5.address, true);
      await core.dolomiteMargin.connect(core.hhUser5).operate(
        [defaultAccount],
        actions,
      );

      const underlyingBalanceWei = await core.dolomiteMargin.getAccountWei(defaultAccount, dArbMarketId);
      expect(underlyingBalanceWei.value).to.eq(ZERO_BI);
      expect(await arbVault.underlyingBalanceOf()).to.eq(ZERO_BI);

      const otherBalanceWei = await core.dolomiteMargin.getAccountWei(defaultAccount, core.marketIds.arb!);
      expect(otherBalanceWei.sign).to.eq(true);
      expect(otherBalanceWei.value).to.eq(amountWei);
    });
  });

  describe('#exchange', () => {
    it('should fail if not called by DolomiteMargin', async () => {
      await expectThrow(
        unwrapper.connect(core.hhUser1).exchange(
          core.hhUser1.address,
          core.dolomiteMargin.address,
          core.tokens.usdc.address,
          arbFactory.address,
          amountWei,
          BYTES_EMPTY,
        ),
        `OnlyDolomiteMargin: Only Dolomite can call function <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail if input token is incorrect', async () => {
      const dolomiteMarginImpersonator = await impersonate(core.dolomiteMargin.address, true);
      await expectThrow(
        unwrapper.connect(dolomiteMarginImpersonator).exchange(
          core.hhUser1.address,
          core.dolomiteMargin.address,
          core.tokens.usdc.address,
          core.tokens.weth.address,
          amountWei,
          BYTES_EMPTY,
        ),
        `IsolationModeUnwrapperTraderV2: Invalid input token <${core.tokens.weth.address.toLowerCase()}>`,
      );
    });

    it('should fail if output token is incorrect', async () => {
      const dolomiteMarginImpersonator = await impersonate(core.dolomiteMargin.address, true);
      await setupARBBalance(core, core.hhUser1, amountWei, unwrapper);
      await core.tokens.arb!.connect(core.hhUser1).transfer(unwrapper.address, amountWei);
      await expectThrow(
        unwrapper.connect(dolomiteMarginImpersonator).exchange(
          core.hhUser1.address,
          core.dolomiteMargin.address,
          core.tokens.dfsGlp!.address,
          arbFactory.address,
          amountWei,
          encodeExternalSellActionDataWithNoData(otherAmountWei),
        ),
        `IsolationModeUnwrapperTraderV2: Invalid output token <${core.tokens.dfsGlp!.address.toLowerCase()}>`,
      );
    });

    it('should fail if input amount is incorrect', async () => {
      const dolomiteMarginImpersonator = await impersonate(core.dolomiteMargin.address, true);
      await setupARBBalance(core, core.hhUser1, amountWei, unwrapper);
      await core.tokens.arb!.connect(core.hhUser1).transfer(unwrapper.address, amountWei);
      await expectThrow(
        unwrapper.connect(dolomiteMarginImpersonator).exchange(
          core.hhUser1.address,
          core.dolomiteMargin.address,
          core.tokens.arb!.address,
          arbFactory.address,
          ZERO_BI,
          encodeExternalSellActionDataWithNoData(otherAmountWei),
        ),
        'IsolationModeUnwrapperTraderV2: Invalid input amount',
      );
    });
  });

  describe('#token', () => {
    it('should work', async () => {
      expect(await unwrapper.token()).to.eq(arbFactory.address);
    });
  });

  describe('#actionsLength', () => {
    it('should work', async () => {
      expect(await unwrapper.actionsLength()).to.eq(2);
    });
  });

  describe('#isValidOutputToken', () => {
    it('should work with ARB', async () => {
      expect(await unwrapper.isValidOutputToken(core.tokens.arb!.address)).to.eq(true);
    });

    it('should fail with any other token', async () => {
      expect(await unwrapper.isValidOutputToken(core.tokens.usdc.address)).to.eq(false);
    });
  });

  describe('#getExchangeCost', () => {
    it('should work normally', async () => {
      expect(await unwrapper.getExchangeCost(
        arbFactory.address,
        core.tokens.arb!.address,
        amountWei,
        BYTES_EMPTY,
      )).to.eq(amountWei);
    });
  });
});
