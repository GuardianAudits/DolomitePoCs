import { ADDRESSES } from '@dolomite-exchange/dolomite-margin';
import { expect } from 'chai';
import { BigNumber, BigNumberish } from 'ethers';
import {
  PendlePtGLP2024IsolationModeUnwrapperTraderV2,
  PendlePtGLP2024IsolationModeVaultFactory,
  PendlePtGLP2024Registry,
  PendlePtGLPPriceOracle,
  TestPendlePtOracle,
  TestPendlePtOracle__factory,
} from '../../../src/types';
import { createContractWithAbi } from '../../../src/utils/dolomite-utils';
import { Network } from '../../../src/utils/no-deps-constants';
import { increaseToTimestamp, revertToSnapshotAndCapture, snapshot } from '../../utils';
import { expectThrow } from '../../utils/assertions';
import {
  createPendlePtGLP2024IsolationModeTokenVaultV1,
  createPendlePtGLP2024IsolationModeUnwrapperTraderV2,
  createPendlePtGLP2024IsolationModeVaultFactory,
  createPendlePtGLP2024Registry,
  createPendlePtGLPPriceOracle,
} from '../../utils/ecosystem-token-utils/pendle';
import { CoreProtocol, setupCoreProtocol, setupTestMarket } from '../../utils/setup';

/**
 * This is the expected price at the following timestamp: 1683002000
 *
 * Keep in mind that Pendle's prices tick upward each second.
 */
const PT_GLP_PRICE = BigNumber.from('811223271259012781'); // $0.811223271259012781

describe('PendlePtGLPPriceOracle', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let ptGlpOracle: PendlePtGLPPriceOracle;
  let pendleRegistry: PendlePtGLP2024Registry;
  let factory: PendlePtGLP2024IsolationModeVaultFactory;
  let unwrapperTrader: PendlePtGLP2024IsolationModeUnwrapperTraderV2;
  let marketId: BigNumberish;

  before(async () => {
    core = await setupCoreProtocol({
      blockNumber: 86413000,
      network: Network.ArbitrumOne,
    });

    pendleRegistry = await createPendlePtGLP2024Registry(core);
    const userVaultImplementation = await createPendlePtGLP2024IsolationModeTokenVaultV1();
    factory = await createPendlePtGLP2024IsolationModeVaultFactory(
      core,
      pendleRegistry,
      core.pendleEcosystem!.ptGlpToken,
      userVaultImplementation,
    );
    unwrapperTrader = await createPendlePtGLP2024IsolationModeUnwrapperTraderV2(core, factory, pendleRegistry);
    ptGlpOracle = await createPendlePtGLPPriceOracle(
      core,
      factory,
      pendleRegistry,
    );
    marketId = await core.dolomiteMargin.getNumMarkets();
    await setupTestMarket(core, factory, true, ptGlpOracle);

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('constructor', () => {
    it('should work normally', async () => {
      expect(await ptGlpOracle.DPT_GLP()).to.eq(factory.address);
      expect(await ptGlpOracle.REGISTRY()).to.eq(pendleRegistry.address);
      expect(await ptGlpOracle.DOLOMITE_MARGIN()).to.eq(core.dolomiteMargin.address);
      expect(await ptGlpOracle.DFS_GLP_MARKET_ID()).to.eq(core.marketIds.dfsGlp);
    });

    it('should fail when oracle is not ready yet', async () => {
      const testPtOracle = await createContractWithAbi<TestPendlePtOracle>(
        TestPendlePtOracle__factory.abi,
        TestPendlePtOracle__factory.bytecode,
        [],
      );
      await pendleRegistry.connect(core.governance).ownerSetPtOracle(testPtOracle.address);

      await testPtOracle.setOracleState(true, 0, false);
      await expectThrow(
        createPendlePtGLPPriceOracle(core, factory, pendleRegistry),
        'PendlePtGLPPriceOracle: Oracle not ready yet',
      );

      await testPtOracle.setOracleState(false, 0, false);
      await expectThrow(
        createPendlePtGLPPriceOracle(core, factory, pendleRegistry),
        'PendlePtGLPPriceOracle: Oracle not ready yet',
      );

      await testPtOracle.setOracleState(true, 0, true);
      await expectThrow(
        createPendlePtGLPPriceOracle(core, factory, pendleRegistry),
        'PendlePtGLPPriceOracle: Oracle not ready yet',
      );

      await testPtOracle.setOracleState(false, 0, true);
      await createPendlePtGLPPriceOracle(core, factory, pendleRegistry); // should work now
    });
  });

  describe('#getPrice', () => {
    it('returns the correct value under normal conditions for dptGLP', async () => {
      await increaseToTimestamp(1_683_002_000);
      const price = await ptGlpOracle.getPrice(factory.address);
      expect(price.value).to.eq(PT_GLP_PRICE);
    });

    it('fails when token sent is not dptGLP', async () => {
      await expectThrow(
        ptGlpOracle.getPrice(ADDRESSES.ZERO),
        `PendlePtGLPPriceOracle: invalid token <${ADDRESSES.ZERO}>`,
      );
      await expectThrow(
        ptGlpOracle.getPrice(core.gmxEcosystem!.fsGlp.address),
        `PendlePtGLPPriceOracle: invalid token <${core.gmxEcosystem!.fsGlp.address.toLowerCase()}>`,
      );
      await expectThrow(
        ptGlpOracle.getPrice(core.dfsGlp!.address),
        `PendlePtGLPPriceOracle: invalid token <${(core.dfsGlp!.address).toLowerCase()}>`,
      );
      await expectThrow(
        ptGlpOracle.getPrice(core.gmxEcosystem!.glp.address),
        `PendlePtGLPPriceOracle: invalid token <${core.gmxEcosystem!.glp.address.toLowerCase()}>`,
      );
    });

    it('fails when ptGLP is borrowable', async () => {
      await core.dolomiteMargin.ownerSetIsClosing(marketId, false);
      await expectThrow(
        ptGlpOracle.getPrice(factory.address),
        'PendlePtGLPPriceOracle: ptGLP cannot be borrowable',
      );
    });
  });
});