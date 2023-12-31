import { ADDRESSES } from '@dolomite-exchange/dolomite-margin';
import { expect } from 'chai';
import { BigNumber, BigNumberish } from 'ethers';
import {
  PlutusVaultGLPIsolationModeUnwrapperTraderV1,
  PlutusVaultGLPIsolationModeVaultFactory,
  PlutusVaultGLPPriceOracle,
  PlutusVaultRegistry,
} from '../../../src/types';
import { createTestToken } from '../../../src/utils/dolomite-utils';
import { Network } from '../../../src/utils/no-deps-constants';
import { revertToSnapshotAndCapture, snapshot } from '../../utils';
import { expectThrow } from '../../utils/assertions';
import {
  createPlutusVaultGLPIsolationModeTokenVaultV1,
  createPlutusVaultGLPIsolationModeUnwrapperTraderV1,
  createPlutusVaultGLPIsolationModeVaultFactory,
  createPlutusVaultGLPPriceOracle,
  createPlutusVaultRegistry,
} from '../../utils/ecosystem-token-utils/plutus';
import { CoreProtocol, getDefaultCoreProtocolConfig, setupCoreProtocol, setupTestMarket } from '../../utils/setup';

const GLP_PRICE = BigNumber.from('1004371801993868870'); // $1.004371801993868870
const PLV_GLP_PRICE = BigNumber.from('1200844314982579522'); // $1.200844314982579522

describe('PlutusVaultGLPPriceOracle', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let plvGlpPriceOracle: PlutusVaultGLPPriceOracle;
  let plutusVaultRegistry: PlutusVaultRegistry;
  let factory: PlutusVaultGLPIsolationModeVaultFactory;
  let unwrapperTrader: PlutusVaultGLPIsolationModeUnwrapperTraderV1;
  let marketId: BigNumberish;

  before(async () => {
    core = await setupCoreProtocol(getDefaultCoreProtocolConfig(Network.ArbitrumOne));
    plutusVaultRegistry = await createPlutusVaultRegistry(core);
    const userVaultImplementation = await createPlutusVaultGLPIsolationModeTokenVaultV1();
    factory = await createPlutusVaultGLPIsolationModeVaultFactory(
      core,
      plutusVaultRegistry,
      core.plutusEcosystem!.plvGlp,
      userVaultImplementation,
    );
    unwrapperTrader = await createPlutusVaultGLPIsolationModeUnwrapperTraderV1(core, plutusVaultRegistry, factory);
    plvGlpPriceOracle = await createPlutusVaultGLPPriceOracle(
      core,
      plutusVaultRegistry,
      factory,
      unwrapperTrader,
    );
    marketId = await core.dolomiteMargin.getNumMarkets();
    await setupTestMarket(core, factory, true, plvGlpPriceOracle);

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#getPrice', () => {
    it('returns the correct value under normal conditions for dplvGLP', async () => {
      const price = await plvGlpPriceOracle.getPrice(factory.address);
      expect(price.value).to.eq(PLV_GLP_PRICE);
    });

    it('returns the correct value plvGLP has a total supply of 0', async () => {
      const testToken = await createTestToken();
      await plutusVaultRegistry.connect(core.governance).ownerSetPlvGlpToken(testToken.address);
      const price = await plvGlpPriceOracle.getPrice(factory.address);
      expect(price.value).to.eq(GLP_PRICE.sub(GLP_PRICE.mul(2).div(100)));
    });

    it('fails when token sent is not dplvGLP', async () => {
      await expectThrow(
        plvGlpPriceOracle.getPrice(ADDRESSES.ZERO),
        `PlutusVaultGLPPriceOracle: invalid token <${ADDRESSES.ZERO}>`,
      );
      await expectThrow(
        plvGlpPriceOracle.getPrice(core.gmxEcosystem!.fsGlp.address),
        `PlutusVaultGLPPriceOracle: invalid token <${core.gmxEcosystem!.fsGlp.address.toLowerCase()}>`,
      );
      await expectThrow(
        plvGlpPriceOracle.getPrice(core.tokens.dfsGlp!.address),
        `PlutusVaultGLPPriceOracle: invalid token <${(core.tokens.dfsGlp!.address).toLowerCase()}>`,
      );
      await expectThrow(
        plvGlpPriceOracle.getPrice(core.gmxEcosystem!.glp.address),
        `PlutusVaultGLPPriceOracle: invalid token <${core.gmxEcosystem!.glp.address.toLowerCase()}>`,
      );
    });

    it('fails when plvGLP is borrowable', async () => {
      await core.dolomiteMargin.ownerSetIsClosing(marketId, false);
      await expectThrow(
        plvGlpPriceOracle.getPrice(factory.address),
        'PlutusVaultGLPPriceOracle: plvGLP cannot be borrowable',
      );
    });
  });
});
