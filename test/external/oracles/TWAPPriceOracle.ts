import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { TWAPPriceOracle, TWAPPriceOracle__factory, TestPair, TestPair__factory } from '../../../src/types';
import { getTWAPPriceOracleParams } from '../../../src/utils/constructors/oracles';
import { createContractWithAbi } from '../../../src/utils/dolomite-utils';
import { Network, ONE_DAY_SECONDS } from '../../../src/utils/no-deps-constants';
import { revertToSnapshotAndCapture, snapshot } from '../../utils';
import { expectThrow } from '../../utils/assertions';
import { CoreProtocol, setupCoreProtocol } from '../../utils/setup';

const ARB_TOKEN = '0x912CE59144191C1204E64559FE8253a0e49E6548';
const ARB_WETH_POOL = '0xe51635ae8136aBAc44906A8f230C2D235E9c195F';

const GRAIL_USDC_PRICE = BigNumber.from('1314349704935686790000');
const GRAIL_WETH_PRICE = BigNumber.from('1313105224024545793160');
const ARB_WETH_PRICE = BigNumber.from('1109937600148875645');
const FIFTEEN_MINUTES = BigNumber.from('900');

describe('TWAPPriceOracle', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let oracle: TWAPPriceOracle;

  before(async () => {
    const blockNumber = 147_792_153;
    core = await setupCoreProtocol({
      blockNumber,
      network: Network.ArbitrumOne,
    });

    oracle = await createContractWithAbi<TWAPPriceOracle>(
      TWAPPriceOracle__factory.abi,
      TWAPPriceOracle__factory.bytecode,
      getTWAPPriceOracleParams(core, core.camelotEcosystem!.grail, [core.camelotEcosystem!.grailUsdcV3Pool.address])
    );

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#constructor', () => {
    it('should work normally', async () => {
      expect(await oracle.token()).to.eq(core.camelotEcosystem!.grail.address);
      expect(await oracle.DOLOMITE_MARGIN()).to.eq(core.dolomiteMargin.address);
      expect(await oracle.observationInterval()).to.eq(FIFTEEN_MINUTES);
      expect(await oracle.getPairs()).to.deep.equal([core.camelotEcosystem!.grailUsdcV3Pool.address]);
    });
  });

  describe('#getPrice', () => {
    it('should work normally with usdc as output token', async () => {
      const price = await oracle.getPrice(core.camelotEcosystem!.grail.address);
      expect(price.value).to.eq(GRAIL_USDC_PRICE);
    });

    it('should work normally with weth as output token', async () => {
      await oracle.connect(core.governance).ownerRemovePair(core.camelotEcosystem!.grailUsdcV3Pool.address);
      await oracle.connect(core.governance).ownerAddPair(core.camelotEcosystem!.grailWethV3Pool.address);
      const price = await oracle.getPrice(core.camelotEcosystem!.grail.address);
      expect(price.value).to.eq(GRAIL_WETH_PRICE);
    });

    it('should work normally with two pairs', async () => {
      await oracle.connect(core.governance).ownerAddPair(core.camelotEcosystem!.grailWethV3Pool.address);
      const price = await oracle.getPrice(core.camelotEcosystem!.grail.address);
      expect(price.value).to.eq(GRAIL_WETH_PRICE.add(GRAIL_USDC_PRICE).div(2));
    });

    // No pool with GRAIL for this so testing with ETH and ARB pool
    it('should work normally when output token is token0', async () => {
      const otherOracle = await createContractWithAbi<TWAPPriceOracle>(
        TWAPPriceOracle__factory.abi,
        TWAPPriceOracle__factory.bytecode,
        [ARB_TOKEN, [ARB_WETH_POOL], core.dolomiteMargin.address]
      );
      const price = (await otherOracle.getPrice(ARB_TOKEN)).value;
      expect(price).to.eq(ARB_WETH_PRICE);

      // Expect it to be within .35% of dolomite price
      const dolomiteArbPrice = (await core.dolomiteMargin.getMarketPrice(7)).value;
      if (dolomiteArbPrice.gt(price)) {
        expect(dolomiteArbPrice.sub(price)).to.be.lt(dolomiteArbPrice.mul(35).div(10_000));
      } else {
        expect(price.sub(dolomiteArbPrice)).to.be.lt(price.mul(35).div(10_000));
      }
    });

    it('should fail if invalid input token', async () => {
      await expectThrow(
        oracle.connect(core.hhUser1).getPrice(core.tokens.weth.address),
        `TWAPPriceOracle: Invalid token <${core.tokens.weth.address.toLowerCase()}>`
      );
    });

    it('should fail if oracle contains no pairs', async () => {
      await oracle.connect(core.governance).ownerRemovePair(core.camelotEcosystem!.grailUsdcV3Pool.address);
      await expectThrow(
        oracle.connect(core.hhUser1).getPrice(core.camelotEcosystem!.grail.address),
        'TWAPPriceOracle: Oracle contains no pairs'
      );
    });
  });

  describe('#ownerSetObservationInterval', () => {
    it('works normally', async () => {
      const stalenessThreshold = ONE_DAY_SECONDS;
      await oracle.connect(core.governance).ownerSetObservationInterval(stalenessThreshold);
      expect(await oracle.observationInterval()).to.eq(stalenessThreshold);
    });

    it('fails when invoked by non-admin', async () => {
      await expectThrow(
        oracle.connect(core.hhUser1).ownerSetObservationInterval(ONE_DAY_SECONDS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`
      );
    });
  });

  describe('#ownerAddPair', () => {
    it('can add a new pair if token is pair token0', async () => {
      await oracle.connect(core.governance).ownerRemovePair(core.camelotEcosystem!.grailUsdcV3Pool.address);
      expect(await oracle.getPairs()).to.deep.equal([]);
      await oracle.connect(core.governance).ownerAddPair(core.camelotEcosystem!.grailUsdcV3Pool.address);
      expect(await oracle.getPairs()).to.deep.equal([core.camelotEcosystem!.grailUsdcV3Pool.address]);
    });

    it('can add a new pair if token is pair token1', async () => {
      const myPair = await createContractWithAbi<TestPair>(
        TestPair__factory.abi,
        TestPair__factory.bytecode,
        [
          core.tokens.weth.address,
          core.camelotEcosystem!.grail.address,
        ]
      );
      await oracle.connect(core.governance).ownerAddPair(myPair.address);
      expect(await oracle.getPairs()).to.deep.equal([core.camelotEcosystem!.grailUsdcV3Pool.address, myPair.address]);
    });

    it('fails when pair does not contain token address', async () => {
      const myPair = await createContractWithAbi<TestPair>(
        TestPair__factory.abi,
        TestPair__factory.bytecode,
        [
          core.tokens.weth.address,
          core.tokens.usdc.address,
        ]
      );
      await expectThrow(
        oracle.connect(core.governance).ownerAddPair(myPair.address),
        'TWAPPriceOracle: Pair must contain oracle token'
      );
    });

    it('fails when invoked by non-admin', async () => {
      await expectThrow(
        oracle.connect(core.hhUser1).ownerAddPair(core.camelotEcosystem!.grailUsdcV3Pool.address),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`
      );
    });
  });

  describe('#ownerRemovePair', () => {
    it('can remove a pair', async () => {
      await oracle.connect(core.governance).ownerRemovePair(core.camelotEcosystem!.grailUsdcV3Pool.address);
      expect(await oracle.getPairs()).to.deep.equal([]);
    });

    it('fails when invoked by non-admin', async () => {
      await expectThrow(
        oracle.connect(core.hhUser1).ownerRemovePair(core.camelotEcosystem!.grailUsdcV3Pool.address),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`
      );
    });
  });
});
