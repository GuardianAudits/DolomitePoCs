import { CoreProtocol, getDefaultCoreProtocolConfig, setupCoreProtocol, setupTestMarket } from '../../utils/setup';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Network } from '../../../src/utils/no-deps-constants';
import { getBlockTimestamp, impersonate, revertToSnapshotAndCapture, snapshot } from '../../utils';
import {
  CustomTestToken,
  TestChainlinkAutomationPriceOracle,
  TestChainlinkAutomationPriceOracle__factory
} from '../../../src/types';
import { createContractWithAbi, createTestToken } from '../../../src/utils/dolomite-utils';
import { expect } from 'chai';
import { expectThrow } from '../../utils/assertions';
import { ethers } from 'hardhat';
import { BigNumber, BigNumberish } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ZERO_ADDRESS } from '@openzeppelin/upgrades/lib/utils/Addresses';
import { increase } from '@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time';

const CHAINLINK_REGISTRY_ADDRESS = '0x75c0530885F385721fddA23C539AF3701d6183D4';
const OTHER_ADDRESS = '0x1234567812345678123456781234567812345678';
describe('ChainlinkAutomationPriceOracle', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let token: CustomTestToken;
  let marketId: BigNumber;
  let chainlinkRegistry: SignerWithAddress;
  let deploymentTimestamp: BigNumberish;
  let zeroAddress: SignerWithAddress;

  let chainlinkAutomationPriceOracle: TestChainlinkAutomationPriceOracle;

  before(async () => {
    core = await setupCoreProtocol(getDefaultCoreProtocolConfig(Network.ArbitrumOne));
    chainlinkRegistry = await impersonate(CHAINLINK_REGISTRY_ADDRESS, true);
    zeroAddress = await impersonate(ZERO_ADDRESS);

    token = await createTestToken();
    await token.addBalance(core.hhUser1.address, parseEther('10000'));
    await core.testEcosystem!.testPriceOracle.setPrice(
      token.address,
      '1000000000000000000', // $1.00
    );
    marketId = await core.dolomiteMargin.getNumMarkets();
    await setupTestMarket(core, token, true);

    chainlinkAutomationPriceOracle = await createContractWithAbi<TestChainlinkAutomationPriceOracle>(
      TestChainlinkAutomationPriceOracle__factory.abi,
      TestChainlinkAutomationPriceOracle__factory.bytecode,
      [core.dolomiteMargin.address, chainlinkRegistry.address, token.address, marketId],
    );
    deploymentTimestamp = await getBlockTimestamp(await ethers.provider.getBlockNumber());

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#constructor', () => {
    it('should construct properly', async () => {
      expect(await chainlinkAutomationPriceOracle.HEARTBEAT()).to.eq(12 * 3600);
      expect(await chainlinkAutomationPriceOracle.GRACE_PERIOD()).to.eq(3600);
      expect(await chainlinkAutomationPriceOracle.UPPER_EDGE()).to.eq(10025);
      expect(await chainlinkAutomationPriceOracle.LOWER_EDGE()).to.eq(9975);
      expect(await chainlinkAutomationPriceOracle.CHAINLINK_REGISTRY()).to.eq(chainlinkRegistry.address);

      expect(await chainlinkAutomationPriceOracle.exchangeRate()).to.eq(parseEther('10000'));
      expect(await chainlinkAutomationPriceOracle.latestTimestamp()).to.eq(deploymentTimestamp);
    });
  });

  describe('#ownerSetHeartbeat', () => {
    it('should work', async () => {
      await chainlinkAutomationPriceOracle.connect(core.governance).ownerSetHeartbeat(11 * 3600);
      expect(await chainlinkAutomationPriceOracle.HEARTBEAT()).to.eq(11 * 3600);
    });
    it('should fail when not called by owner', async () => {
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.hhUser1).ownerSetHeartbeat(11 * 3600),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });
  });

  describe('#ownerSetGracePeriod', () => {
    it('should work', async () => {
      await chainlinkAutomationPriceOracle.connect(core.governance).ownerSetGracePeriod(2500);
      expect(await chainlinkAutomationPriceOracle.GRACE_PERIOD()).to.eq(2500);
    });
    it('should fail when not called by owner', async () => {
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.hhUser1).ownerSetGracePeriod(2500),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });
  });

  describe('#ownerSetUpperEdge', () => {
    it('should work', async () => {
      await chainlinkAutomationPriceOracle.connect(core.governance).ownerSetUpperEdge(10030);
      expect(await chainlinkAutomationPriceOracle.UPPER_EDGE()).to.eq(10030);
    });
    it('should fail when not called by owner', async () => {
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.hhUser1).ownerSetUpperEdge(10030),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });
    it('should fail when upperEdge less than 10000', async () => {
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.governance).ownerSetUpperEdge(10000),
        'ChainlinkAutomationPriceOracle: Invalid upper edge',
      );
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.governance).ownerSetUpperEdge(9999),
        'ChainlinkAutomationPriceOracle: Invalid upper edge',
      );
    });
  });

  describe('#ownerSetLowerEdge', () => {
    it('should work', async () => {
      await chainlinkAutomationPriceOracle.connect(core.governance).ownerSetLowerEdge(9980);
      expect(await chainlinkAutomationPriceOracle.LOWER_EDGE()).to.eq(9980);
    });
    it('should fail when not called by owner', async () => {
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.hhUser1).ownerSetLowerEdge(10030),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });
    it('should fail when lowerEdge more than 10000', async () => {
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.governance).ownerSetLowerEdge(10000),
        'ChainlinkAutomationPriceOracle: Invalid lower edge',
      );
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.governance).ownerSetLowerEdge(10020),
        'ChainlinkAutomationPriceOracle: Invalid lower edge',
      );
    });
  });

  describe('#ownerSetChainlinkRegistry', () => {
    it('should work', async () => {
      await chainlinkAutomationPriceOracle.connect(core.governance).ownerSetChainlinkRegistry(OTHER_ADDRESS);
      expect(await chainlinkAutomationPriceOracle.CHAINLINK_REGISTRY()).to.eq(OTHER_ADDRESS);
    });
    it('should fail when not called by owner', async () => {
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.hhUser1).ownerSetChainlinkRegistry(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });
    it('should fail when zero address is used', async () => {
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.governance).ownerSetChainlinkRegistry(ZERO_ADDRESS),
        'ChainlinkAutomationPriceOracle: Invalid chainlink registry',
      );
    });
  });

  describe('#checkUpkeep', () => {
    it('should work', async () => {
      expect((await chainlinkAutomationPriceOracle.connect(zeroAddress).checkUpkeep('0x')).upkeepNeeded).to.eq(false);
    });

    it('fails when called by address other than zero address', async () => {
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.governance).checkUpkeep('0x'),
        'ChainlinkAutomationPriceOracle: static rpc calls only',
      );
    });

    it('returns false when deviation is less than 0.25% and lastTimestamp is less than heartbeat', async () => {
      await token.addBalance(core.hhUser1.address, parseEther('24'));
      expect((await chainlinkAutomationPriceOracle.connect(zeroAddress).checkUpkeep('0x')).upkeepNeeded).to.eq(false);
    });

    it('returns true when deviation is greater than .25% and lastTimestamp is less than heartbeat', async () => {
      await token.addBalance(core.hhUser1.address, parseEther('25'));
      expect((await chainlinkAutomationPriceOracle.connect(zeroAddress).checkUpkeep('0x')).upkeepNeeded).to.eq(true);
    });

    it('returns true when deviation is less than 0.25% and lastTimestamp is more than heartbeat', async () => {
      await increase(12 * 3600);
      expect((await chainlinkAutomationPriceOracle.connect(zeroAddress).checkUpkeep('0x')).upkeepNeeded).to.eq(true);
    });
  });

  describe('#performUpkeep', () => {
    it('works if greater than heartbeat period', async () => {
      await increase(11 * 3600);
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(chainlinkRegistry).performUpkeep('0x'),
        'ChainlinkAutomationPriceOracle: checkUpkeep conditions not met'
      );

      await increase(3600);
      await chainlinkAutomationPriceOracle.connect(chainlinkRegistry).performUpkeep('0x');
      const updateTimestamp = await getBlockTimestamp(await ethers.provider.getBlockNumber());

      expect(await chainlinkAutomationPriceOracle.exchangeRate()).to.eq(parseEther('10000'));
      expect(await chainlinkAutomationPriceOracle.latestTimestamp()).to.eq(updateTimestamp);
    });

    it('works if greater than deviation upperEdge', async () => {
      await token.addBalance(core.hhUser1.address, parseEther('25'));
      await chainlinkAutomationPriceOracle.connect(chainlinkRegistry).performUpkeep('0x');
      const updateTimestamp = await getBlockTimestamp(await ethers.provider.getBlockNumber());

      expect(await chainlinkAutomationPriceOracle.exchangeRate()).to.eq(parseEther('10025'));
      expect(await chainlinkAutomationPriceOracle.latestTimestamp()).to.eq(updateTimestamp);
    });

    it('works if less than deviation lowerEdge', async () => {
      await token.connect(core.hhUser1).burn(parseEther('25'));
      await chainlinkAutomationPriceOracle.connect(chainlinkRegistry).performUpkeep('0x');
      const updateTimestamp = await getBlockTimestamp(await ethers.provider.getBlockNumber());

      expect(await chainlinkAutomationPriceOracle.exchangeRate()).to.eq(parseEther('9975'));
      expect(await chainlinkAutomationPriceOracle.latestTimestamp()).to.eq(updateTimestamp);
    });

    it('fails when not called by Chainlink', async () => {
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(core.hhUser1).performUpkeep('0x'),
        'ChainlinkAutomationPriceOracle: caller is not Chainlink'
      );
    });

    it('fails when before heartbeat and within deviation range', async () => {
      await token.connect(core.hhUser1).burn(parseEther('24'));
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(chainlinkRegistry).performUpkeep('0x'),
        'ChainlinkAutomationPriceOracle: checkUpkeep conditions not met'
      );

      await token.addBalance(core.hhUser1.address, parseEther('48'));
      await expectThrow(
        chainlinkAutomationPriceOracle.connect(chainlinkRegistry).performUpkeep('0x'),
        'ChainlinkAutomationPriceOracle: checkUpkeep conditions not met'
      );

      await token.addBalance(core.hhUser1.address, parseEther('1'));
      await chainlinkAutomationPriceOracle.connect(chainlinkRegistry).performUpkeep('0x');
      const updateTimestamp = await getBlockTimestamp(await ethers.provider.getBlockNumber());

      expect(await chainlinkAutomationPriceOracle.exchangeRate()).to.eq(parseEther('10025'));
      expect(await chainlinkAutomationPriceOracle.latestTimestamp()).to.eq(updateTimestamp);
    });
  });
});
