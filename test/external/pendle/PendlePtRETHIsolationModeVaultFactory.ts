import { expect } from 'chai';
import {
  PendleRETHRegistry,
  PendlePtRETHIsolationModeTokenVaultV1,
  PendlePtRETHIsolationModeVaultFactory,
} from '../../../src/types';
import { Network } from '../../../src/utils/no-deps-constants';
import { revertToSnapshotAndCapture, snapshot } from '../../utils';
import { expectEvent, expectThrow } from '../../utils/assertions';
import {
  createPendleRETHRegistry,
  createPendlePtRETHIsolationModeTokenVaultV1,
  createPendlePtRETHIsolationModeVaultFactory,
} from '../../utils/ecosystem-token-utils/pendle';
import { CoreProtocol, getDefaultCoreProtocolConfig, setupCoreProtocol } from '../../utils/setup';

const OTHER_ADDRESS = '0x1234567812345678123456781234567812345678';

describe('PendlePtRETHIsolationModeVaultFactory', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let pendleRegistry: PendleRETHRegistry;
  let vaultImplementation: PendlePtRETHIsolationModeTokenVaultV1;
  let factory: PendlePtRETHIsolationModeVaultFactory;

  before(async () => {
    core = await setupCoreProtocol(getDefaultCoreProtocolConfig(Network.ArbitrumOne));
    pendleRegistry = await createPendleRETHRegistry(core);
    vaultImplementation = await createPendlePtRETHIsolationModeTokenVaultV1();
    factory = await createPendlePtRETHIsolationModeVaultFactory(
      core,
      pendleRegistry,
      core.pendleEcosystem!.ptRETHToken,
      vaultImplementation,
    );

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#contructor', () => {
    it('should initialize variables properly', async () => {
      expect(await factory.pendleRETHRegistry()).to.equal(pendleRegistry.address);
      expect(await factory.UNDERLYING_TOKEN()).to.equal(core.pendleEcosystem!.ptRETHToken.address);
      expect(await factory.BORROW_POSITION_PROXY()).to.equal(core.borrowPositionProxyV2.address);
      expect(await factory.userVaultImplementation()).to.equal(vaultImplementation.address);
      expect(await factory.DOLOMITE_MARGIN()).to.equal(core.dolomiteMargin.address);
    });
  });

  describe('#ownerSetPendleGLPRegistry', () => {
    it('should work normally', async () => {
      const result = await factory.connect(core.governance).ownerSetPendleRETHRegistry(OTHER_ADDRESS);
      await expectEvent(factory, result, 'PendleRETHRegistrySet', {
        pendleRETHRegistry: OTHER_ADDRESS,
      });
      expect(await factory.pendleRETHRegistry()).to.equal(OTHER_ADDRESS);
    });

    it('should fail when not called by owner', async () => {
      await expectThrow(
        factory.connect(core.hhUser1).ownerSetPendleRETHRegistry(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });
  });

  // @todo Double check allowable debt and collateral market ids
  describe('#allowableCollateralMarketIds', () => {
    it('should work normally', async () => {
      expect(await factory.allowableCollateralMarketIds()).to.deep.equal([]);
    });
  });

  describe('#allowableDebtMarketIds', () => {
    it('should work normally', async () => {
      expect(await factory.allowableDebtMarketIds()).to.deep.equal([]);
    });
  });
});
