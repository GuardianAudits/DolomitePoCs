import { ZERO_ADDRESS } from '@openzeppelin/upgrades/lib/utils/Addresses';
import { expect } from 'chai';
import { IPendlePtMarket, IPendleSyToken, PendleRegistry } from '../../../../src/types';
import { Network } from '../../../../src/utils/no-deps-constants';
import { revertToSnapshotAndCapture, snapshot } from '../../../utils';
import { expectEvent, expectThrow } from '../../../utils/assertions';
import { createPendleRegistry } from '../../../utils/ecosystem-token-utils/pendle';
import { CoreProtocol, getDefaultCoreProtocolConfig, setupCoreProtocol } from '../../../utils/setup';

const OTHER_ADDRESS = '0x1234567812345678123456781234567812345678';

describe('PendleREthJun2025Registry', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let registry: PendleRegistry;
  let ptMarket: IPendlePtMarket;
  let syToken: IPendleSyToken;

  before(async () => {
    core = await setupCoreProtocol(getDefaultCoreProtocolConfig(Network.ArbitrumOne));
    ptMarket = core.pendleEcosystem!.rEthJun2025.ptREthMarket;
    syToken = core.pendleEcosystem!.syREthToken;

    registry = await createPendleRegistry(core, ptMarket, core.pendleEcosystem!.rEthJun2025.ptOracle, syToken);

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#initialize', () => {
    it('should initialize variables properly', async () => {
      expect(await registry.pendleRouter()).to.equal(core.pendleEcosystem!.pendleRouter.address);
      expect(await registry.ptMarket()).to.equal(ptMarket.address);
      expect(await registry.ptOracle()).to.equal(core.pendleEcosystem!.rEthJun2025.ptOracle.address);
      expect(await registry.syToken()).to.equal(syToken.address);
      expect(await registry.dolomiteRegistry()).to.equal(core.dolomiteRegistry.address);
    });

    it('should fail if already initialized', async () => {
      await expectThrow(
        registry.initialize(
          core.pendleEcosystem!.pendleRouter.address,
          ptMarket.address,
          core.pendleEcosystem!.rEthJun2025.ptOracle.address,
          syToken.address,
          core.dolomiteRegistry.address,
        ),
        'Initializable: contract is already initialized',
      );
    });
  });

  describe('#ownerSetPendleRouter', () => {
    it('should work normally', async () => {
      const result = await registry.connect(core.governance).ownerSetPendleRouter(OTHER_ADDRESS);
      await expectEvent(registry, result, 'PendleRouterSet', {
        pendleRouter: OTHER_ADDRESS,
      });
      expect(await registry.pendleRouter()).to.equal(OTHER_ADDRESS);
    });

    it('should fail when not called by owner', async () => {
      await expectThrow(
        registry.connect(core.hhUser1).ownerSetPendleRouter(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail if zero address is set', async () => {
      await expectThrow(
        registry.connect(core.governance).ownerSetPendleRouter(ZERO_ADDRESS),
        'PendleRegistry: Invalid pendleRouter address',
      );
    });
  });

  describe('#ownerSetPtMarket', () => {
    it('should work normally', async () => {
      const result = await registry.connect(core.governance).ownerSetPtMarket(OTHER_ADDRESS);
      await expectEvent(registry, result, 'PtMarketSet', {
        ptMarket: OTHER_ADDRESS,
      });
      expect(await registry.ptMarket()).to.equal(OTHER_ADDRESS);
    });

    it('should fail when not called by owner', async () => {
      await expectThrow(
        registry.connect(core.hhUser1).ownerSetPtMarket(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail if zero address is set', async () => {
      await expectThrow(
        registry.connect(core.governance).ownerSetPtMarket(ZERO_ADDRESS),
        'PendleRegistry: Invalid ptMarket address',
      );
    });
  });

  describe('#ownerSetPtOracle', () => {
    it('should work normally', async () => {
      const result = await registry.connect(core.governance).ownerSetPtOracle(OTHER_ADDRESS);
      await expectEvent(registry, result, 'PtOracleSet', {
        ptOracle: OTHER_ADDRESS,
      });
      expect(await registry.ptOracle()).to.equal(OTHER_ADDRESS);
    });

    it('should fail when not called by owner', async () => {
      await expectThrow(
        registry.connect(core.hhUser1).ownerSetPtOracle(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail if zero address is set', async () => {
      await expectThrow(
        registry.connect(core.governance).ownerSetPtOracle(ZERO_ADDRESS),
        'PendleRegistry: Invalid ptOracle address',
      );
    });
  });

  describe('#ownerSetSyToken', () => {
    it('should work normally', async () => {
      const result = await registry.connect(core.governance).ownerSetSyToken(OTHER_ADDRESS);
      await expectEvent(registry, result, 'SyTokenSet', {
        syToken: OTHER_ADDRESS,
      });
      expect(await registry.syToken()).to.equal(OTHER_ADDRESS);
    });

    it('should fail when not called by owner', async () => {
      await expectThrow(
        registry.connect(core.hhUser1).ownerSetSyToken(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail if zero address is set', async () => {
      await expectThrow(
        registry.connect(core.governance).ownerSetSyToken(ZERO_ADDRESS),
        'PendleRegistry: Invalid syToken address',
      );
    });
  });

  describe('#ownerSetDolomiteRegistry', () => {
    it('should work normally', async () => {
      const result = await registry.connect(core.governance).ownerSetDolomiteRegistry(core.dolomiteRegistry.address);
      await expectEvent(registry, result, 'DolomiteRegistrySet', {
        dolomiteRegistry: core.dolomiteRegistry.address,
      });
      expect(await registry.dolomiteRegistry()).to.equal(core.dolomiteRegistry.address);
    });

    it('should fail when not called by owner', async () => {
      await expectThrow(
        registry.connect(core.hhUser1).ownerSetDolomiteRegistry(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail if zero address is set', async () => {
      await expectThrow(
        registry.connect(core.governance).ownerSetDolomiteRegistry(ZERO_ADDRESS),
        'BaseRegistry: Invalid dolomiteRegistry',
      );
    });
  });
});
