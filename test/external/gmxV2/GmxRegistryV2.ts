import { expect } from 'chai';
import { GmxRegistryV2 } from 'src/types';
import { createGmxRegistryV2 } from 'test/utils/ecosystem-token-utils/gmx';
import { CoreProtocol, getDefaultCoreProtocolConfig, setupCoreProtocol } from '../../utils/setup';
import { Network } from 'src/utils/no-deps-constants';
import { revertToSnapshotAndCapture, snapshot } from 'test/utils';
import { expectEvent, expectThrow } from 'test/utils/assertions';
import { ZERO_ADDRESS } from '@openzeppelin/upgrades/lib/utils/Addresses';
const OTHER_ADDRESS = '0x1234567812345678123456781234567812345678';

describe('GmxRegistryV2', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let registry: GmxRegistryV2;

  before(async () => {
    core = await setupCoreProtocol(getDefaultCoreProtocolConfig(Network.ArbitrumOne));
    registry = await createGmxRegistryV2(core);

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#initialize', () => {
    it('should initialize variables properly', async () => {
      expect(await registry.gmxExchangeRouter()).to.eq(core.gmxEcosystem!.gmxExchangeRouter.address);
      expect(await registry.ethUsdMarketToken()).to.eq(core.gmxEcosystem!.gmxEthUsdMarketToken.address);
      expect(await registry.dolomiteRegistry()).to.eq(core.dolomiteRegistry.address);
    });
  });

  describe('#ownerSetGmxExchangeRouter', () => {
    it('should work normally', async () => {
      const result = await registry.connect(core.governance).ownerSetGmxExchangeRouter(OTHER_ADDRESS);
      await expectEvent(registry, result, 'GmxExchangeRouterSet', {
        gmxExchangeRouter: OTHER_ADDRESS,
      });
      expect(await registry.gmxExchangeRouter()).to.eq(OTHER_ADDRESS);
    });

    it('should fail when not called by owner', async () => {
      await expectThrow(
        registry.connect(core.hhUser1).ownerSetGmxExchangeRouter(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail if zero address is set', async () => {
      await expectThrow(
        registry.connect(core.governance).ownerSetGmxExchangeRouter(ZERO_ADDRESS),
        'GmxRegistryV2: Invalid address',
      );
    });
  });

  describe('#ownerSetGmxDepositHandler', () => {
    it('should work normally', async () => {
      const result = await registry.connect(core.governance).ownerSetGmxDepositHandler(OTHER_ADDRESS);
      await expectEvent(registry, result, 'GmxDepositHandlerSet', {
        gmxDepositHandler: OTHER_ADDRESS,
      });
      expect(await registry.gmxDepositHandler()).to.eq(OTHER_ADDRESS);
    });

    it('should fail when not called by owner', async () => {
      await expectThrow(
        registry.connect(core.hhUser1).ownerSetGmxDepositHandler(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail if zero address is set', async () => {
      await expectThrow(
        registry.connect(core.governance).ownerSetGmxDepositHandler(ZERO_ADDRESS),
        'GmxRegistryV2: Invalid address',
      );
    });
  });

  describe('#ownerSetGmxWithdrawalHandler', () => {
    it('should work normally', async () => {
      const result = await registry.connect(core.governance).ownerSetGmxWithdrawalHandler(OTHER_ADDRESS);
      await expectEvent(registry, result, 'GmxWithdrawalHandlerSet', {
        gmxWithdrawalHandler: OTHER_ADDRESS,
      });
      expect(await registry.gmxWithdrawalHandler()).to.eq(OTHER_ADDRESS);
    });

    it('should fail when not called by owner', async () => {
      await expectThrow(
        registry.connect(core.hhUser1).ownerSetGmxWithdrawalHandler(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail if zero address is set', async () => {
      await expectThrow(
        registry.connect(core.governance).ownerSetGmxWithdrawalHandler(ZERO_ADDRESS),
        'GmxRegistryV2: Invalid address',
      );
    });
  });

  describe('#ownerSetEthUsdMarketToken', () => {
    it('should work normally', async () => {
      const result = await registry.connect(core.governance).ownerSetEthUsdMarketToken(OTHER_ADDRESS);
      await expectEvent(registry, result, 'EthUsdMarketTokenSet', {
        ethUsdMarketToken: OTHER_ADDRESS,
      });
      expect(await registry.ethUsdMarketToken()).to.eq(OTHER_ADDRESS);
    });

    it('should fail when not called by owner', async () => {
      await expectThrow(
        registry.connect(core.hhUser1).ownerSetEthUsdMarketToken(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });

    it('should fail if zero address is set', async () => {
      await expectThrow(
        registry.connect(core.governance).ownerSetEthUsdMarketToken(ZERO_ADDRESS),
        'GmxRegistryV2: Invalid address',
      );
    });
  });
})