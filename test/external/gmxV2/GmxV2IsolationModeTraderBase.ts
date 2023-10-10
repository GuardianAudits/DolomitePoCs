import { expect } from 'chai';
import { GmxRegistryV2, TestGmxV2IsolationModeTraderBase, TestGmxV2IsolationModeTraderBase__factory } from 'src/types';
import { createContractWithAbi } from 'src/utils/dolomite-utils';
import { ONE_ETH_BI } from 'src/utils/no-deps-constants';
import { revertToSnapshotAndCapture, setEtherBalance, snapshot } from 'test/utils';
import { expectEvent, expectThrow } from 'test/utils/assertions';
import { createIsolationModeTraderProxy } from 'test/utils/dolomite';
import { createGmxRegistryV2 } from 'test/utils/ecosystem-token-utils/gmx';
import { CoreProtocol, getDefaultCoreProtocolConfigForGmxV2, setupCoreProtocol } from 'test/utils/setup';
import { GMX_V2_CALLBACK_GAS_LIMIT } from '../../../src/utils/constructors/gmx';

describe('GmxV2IsolationModeTraderBase', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let gmxRegistryV2: GmxRegistryV2;
  let trader: TestGmxV2IsolationModeTraderBase;

  before(async () => {
    core = await setupCoreProtocol(getDefaultCoreProtocolConfigForGmxV2());
    gmxRegistryV2 = await createGmxRegistryV2(core, GMX_V2_CALLBACK_GAS_LIMIT);

    const implementation = await createContractWithAbi<TestGmxV2IsolationModeTraderBase>(
      TestGmxV2IsolationModeTraderBase__factory.abi,
      TestGmxV2IsolationModeTraderBase__factory.bytecode,
      [],
    );
    const calldata = await implementation.populateTransaction.initialize(
      gmxRegistryV2.address,
      core.tokens.weth.address,
      core.dolomiteMargin.address,
    );
    const proxy = await createIsolationModeTraderProxy(implementation.address, calldata.data!, core);
    trader = await TestGmxV2IsolationModeTraderBase__factory.connect(proxy.address, core.hhUser1);

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('#initialize', () => {
    it('should initialize correctly', async () => {
      expect(await trader.WETH()).to.eq(core.tokens.weth.address);
      expect(await trader.GMX_REGISTRY_V2()).to.eq(gmxRegistryV2.address);
      expect(await trader.callbackGasLimit()).to.eq(GMX_V2_CALLBACK_GAS_LIMIT);
      expect(await trader.DOLOMITE_MARGIN()).to.eq(core.dolomiteMargin.address);
    });

    it('should not initialize twice', async () => {
      await expectThrow(
        trader.triggerInternalInitializer(
          gmxRegistryV2.address,
          core.tokens.weth.address,
        ),
        'Initializable: contract is already initialized',
      );
    });
  });

  describe('#ownerWithdrawETH', () => {
    it('should work normally', async () => {
      await setEtherBalance(trader.address, ONE_ETH_BI);
      await expect(() =>
        trader.connect(core.governance).ownerWithdrawETH(core.governance.address),
      ).to.changeTokenBalance(core.tokens.weth, core.governance, ONE_ETH_BI);
    });

    it('should emit OwnerWithdrawETH', async () => {
      await setEtherBalance(trader.address, ONE_ETH_BI);
      const result = await trader.connect(core.governance).ownerWithdrawETH(core.governance.address);
      await expectEvent(trader, result, 'OwnerWithdrawETH', {
        receiver: core.governance.address,
        bal: ONE_ETH_BI,
      });
    });

    it('should fail if not called by dolomite margin owner', async () => {
      await expectThrow(
        trader.connect(core.hhUser1).ownerWithdrawETH(core.governance.address),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });
  });

  describe('#onlyHandler', () => {
    it('should work normally', async () => {
      await gmxRegistryV2.connect(core.governance).ownerSetIsHandler(core.hhUser4.address, true);
      await trader.connect(core.hhUser4).testOnlyHandler();
    });

    it('should fail if not called by valid handler', async () => {
      await expectThrow(
        trader.connect(core.hhUser1).testOnlyHandler(),
        `GmxV2IsolationModeTraderBase: Only handler can call <${core.hhUser1.address.toLowerCase()}>`,
      );
    });
  });
});
