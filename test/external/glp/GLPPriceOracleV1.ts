import { ADDRESSES } from '@dolomite-exchange/dolomite-margin';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { GLPPriceOracleV1, GmxRegistryV1 } from '../../../src/types';
import { Network } from '../../../src/utils/no-deps-constants';
import { revertToSnapshotAndCapture, snapshot } from '../../utils';
import { expectThrow } from '../../utils/assertions';
import {
  createGLPIsolationModeTokenVaultV1,
  createGLPIsolationModeVaultFactory,
  createGLPPriceOracleV1,
  createGmxRegistry,
} from '../../utils/ecosystem-token-utils/gmx';
import { getDefaultCoreProtocolConfig, setupCoreProtocol } from '../../utils/setup';

const GLP_PRICE = BigNumber.from('1004371801993868870'); // $1.004371801993868870

describe('GLPPriceOracleV1', () => {
  let snapshotId: string;

  let glpPriceOracle: GLPPriceOracleV1;
  let gmxRegistry: GmxRegistryV1;

  before(async () => {
    const core = await setupCoreProtocol(getDefaultCoreProtocolConfig(Network.ArbitrumOne));
    gmxRegistry = await createGmxRegistry(core);
    const userVaultImplementation = await createGLPIsolationModeTokenVaultV1();
    const factory = await createGLPIsolationModeVaultFactory(core, gmxRegistry, userVaultImplementation);
    glpPriceOracle = await createGLPPriceOracleV1(factory, gmxRegistry);

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#getPrice', () => {
    it('returns the correct value under the correct conditions for dsGLP', async () => {
      const dfsGlp = await glpPriceOracle.DFS_GLP();
      const price = await glpPriceOracle.getPrice(dfsGlp);
      expect(price.value).to.eq(GLP_PRICE);
    });

    it('fails when token sent is not dsGLP', async () => {
      await expectThrow(
        glpPriceOracle.getPrice(ADDRESSES.ZERO),
        'GLPPriceOracleV1: invalid token',
      );
      await expectThrow(
        glpPriceOracle.getPrice(ADDRESSES.TEST_UNISWAP),
        'GLPPriceOracleV1: invalid token',
      );
      await expectThrow(
        glpPriceOracle.getPrice(await gmxRegistry.glp()),
        'GLPPriceOracleV1: invalid token',
      );
    });
  });
});
