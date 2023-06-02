import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BaseRouter, Router } from '@pendle/sdk-v2';
import { CHAIN_ID_MAPPING } from '@pendle/sdk-v2/dist/common/ChainId';
import { expect } from 'chai';
import { BigNumber, ethers } from 'ethers';
import {
  IGmxRegistryV1,
  IPendlePtToken,
  PendlePtGLP2024IsolationModeTokenVaultV1,
  PendlePtGLP2024IsolationModeTokenVaultV1__factory,
  PendlePtGLP2024IsolationModeUnwrapperTraderV2,
  PendlePtGLP2024IsolationModeVaultFactory,
  PendlePtGLP2024IsolationModeWrapperTraderV2,
  PendlePtGLP2024Registry,
  PendlePtGLPPriceOracle,
} from '../../../src/types';
import { Account } from '../../../src/types/IDolomiteMargin';
import { BYTES_EMPTY, Network, ZERO_BI } from '../../../src/utils/no-deps-constants';
import { impersonate, revertToSnapshotAndCapture, snapshot } from '../../utils';
import { expectThrow } from '../../utils/assertions';
import {
  createPendlePtGLP2024IsolationModeTokenVaultV1,
  createPendlePtGLP2024IsolationModeUnwrapperTraderV2,
  createPendlePtGLP2024IsolationModeVaultFactory,
  createPendlePtGLP2024IsolationModeWrapperTraderV2,
  createPendlePtGLP2024Registry,
  createPendlePtGLPPriceOracle,
} from '../../utils/ecosystem-token-utils/pendle';
import {
  CoreProtocol,
  setupCoreProtocol,
  setupTestMarket,
  setupUSDCBalance,
  setupUserVaultProxy,
} from '../../utils/setup';

const defaultAccountNumber = '0';
const amountWei = BigNumber.from('200000000000000000000'); // $200
const otherAmountWei = BigNumber.from('10000000'); // $10
const FIVE_BIPS = 0.0005;

const abiCoder = ethers.utils.defaultAbiCoder;

describe('PendlePtGLP2024IsolationModeUnwrapperTraderV2', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let underlyingToken: IPendlePtToken;
  let underlyingMarketId: BigNumber;
  let gmxRegistry: IGmxRegistryV1;
  let pendleRegistry: PendlePtGLP2024Registry;
  let unwrapper: PendlePtGLP2024IsolationModeUnwrapperTraderV2;
  let wrapper: PendlePtGLP2024IsolationModeWrapperTraderV2;
  let factory: PendlePtGLP2024IsolationModeVaultFactory;
  let vault: PendlePtGLP2024IsolationModeTokenVaultV1;
  let vaultSigner: SignerWithAddress;
  let priceOracle: PendlePtGLPPriceOracle;
  let defaultAccount: Account.InfoStruct;
  let router: BaseRouter;

  let solidUser: SignerWithAddress;

  before(async () => {
    core = await setupCoreProtocol({
      blockNumber: 86413000,
      network: Network.ArbitrumOne,
    });
    underlyingToken = core.pendleEcosystem!.ptGlpToken;
    const userVaultImplementation = await createPendlePtGLP2024IsolationModeTokenVaultV1();
    gmxRegistry = core.gmxRegistry!;
    pendleRegistry = await createPendlePtGLP2024Registry(core);
    factory = await createPendlePtGLP2024IsolationModeVaultFactory(
      core,
      pendleRegistry,
      underlyingToken,
      userVaultImplementation,
    );

    unwrapper = await createPendlePtGLP2024IsolationModeUnwrapperTraderV2(core, factory, pendleRegistry);
    wrapper = await createPendlePtGLP2024IsolationModeWrapperTraderV2(core, factory, pendleRegistry);
    priceOracle = await createPendlePtGLPPriceOracle(core, factory, pendleRegistry);

    underlyingMarketId = await core.dolomiteMargin.getNumMarkets();
    await setupTestMarket(core, factory, true, priceOracle);
    await core.dolomiteMargin.ownerSetPriceOracle(underlyingMarketId, priceOracle.address);

    await factory.connect(core.governance).ownerInitialize([unwrapper.address, wrapper.address]);
    await core.dolomiteMargin.connect(core.governance).ownerSetGlobalOperator(factory.address, true);

    solidUser = core.hhUser5;

    await factory.createVault(core.hhUser1.address);
    const vaultAddress = await factory.getVaultByAccount(core.hhUser1.address);
    vault = setupUserVaultProxy<PendlePtGLP2024IsolationModeTokenVaultV1>(
      vaultAddress,
      PendlePtGLP2024IsolationModeTokenVaultV1__factory,
      core.hhUser1,
    );
    vaultSigner = await impersonate(vault.address, true);
    defaultAccount = { owner: vault.address, number: defaultAccountNumber };

    router = Router.getRouter({
      chainId: CHAIN_ID_MAPPING.ARBITRUM,
      provider: core.hhUser1.provider,
      signer: core.hhUser1,
    });

    const usdcAmount = amountWei.div(1e12).mul(8);
    await setupUSDCBalance(core, core.hhUser1, usdcAmount, core.gmxEcosystem!.glpManager);
    await core.gmxEcosystem!.glpRewardsRouter.connect(core.hhUser1)
      .mintAndStakeGlp(core.usdc.address, usdcAmount, 0, 0);
    const glpAmount = amountWei.mul(4);
    await core.gmxEcosystem!.sGlp.connect(core.hhUser1)
      .approve(core.pendleEcosystem!.pendleRouter.address, glpAmount);

    await router.swapExactTokenForPt(
      core.pendleEcosystem!.ptGlpMarket.address as any,
      core.gmxEcosystem!.sGlp.address as any,
      glpAmount,
      FIVE_BIPS,
    );
    await core.pendleEcosystem!.ptGlpToken.connect(core.hhUser1).approve(vault.address, amountWei);
    await vault.depositIntoVaultForDolomiteMargin(defaultAccountNumber, amountWei);

    expect(await underlyingToken.connect(core.hhUser1).balanceOf(vault.address)).to.eq(amountWei);
    expect((await core.dolomiteMargin.getAccountWei(defaultAccount, underlyingMarketId)).value).to.eq(amountWei);

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  describe('Actions.Call and Actions.Sell for non-liquidation', () => {
    it('should work when called with the normal conditions', async () => {
      const solidAccountId = 0;
      const liquidAccountId = 0;

      const [, , , tokenOutput] = await router.swapExactPtForToken(
        core.pendleEcosystem!.ptGlpMarket.address as any,
        amountWei,
        core.gmxEcosystem!.sGlp.address as any,
        FIVE_BIPS,
        { method: 'extractParams' },
      );

      const extraOrderData = abiCoder.encode(
        ['tuple(address,uint256,address,address,address,tuple(uint8,address,bytes,bool))'],
        [
          [
            tokenOutput.tokenOut,
            tokenOutput.minTokenOut,
            tokenOutput.tokenRedeemSy,
            tokenOutput.bulk,
            tokenOutput.pendleSwap,
            [
              tokenOutput.swapData.swapType,
              tokenOutput.swapData.extRouter,
              tokenOutput.swapData.extCalldata,
              tokenOutput.swapData.needScale,
            ],
          ],
        ],
      );
      const amountOut = await core.glpIsolationModeUnwrapperTraderV1!.connect(core.hhUser5).getExchangeCost(
        core.dfsGlp!.address,
        core.usdc.address,
        tokenOutput.minTokenOut,
        BYTES_EMPTY,
      );

      const actions = await unwrapper.createActionsForUnwrapping(
        solidAccountId,
        liquidAccountId,
        vault.address,
        vault.address,
        core.marketIds.usdc,
        underlyingMarketId,
        amountOut,
        amountWei,
        extraOrderData,
      );

      await core.dolomiteMargin.ownerSetGlobalOperator(core.hhUser5.address, true);
      await core.dolomiteMargin.connect(core.hhUser5).operate(
        [defaultAccount],
        actions,
      );

      const underlyingBalanceWei = await core.dolomiteMargin.getAccountWei(defaultAccount, underlyingMarketId);
      expect(underlyingBalanceWei.value).to.eq(ZERO_BI);
      expect(await vault.underlyingBalanceOf()).to.eq(ZERO_BI);

      const otherBalanceWei = await core.dolomiteMargin.getAccountWei(defaultAccount, core.marketIds.usdc);
      expect(otherBalanceWei.sign).to.eq(true);
      expect(otherBalanceWei.value).to.be.gt(amountOut);
    });
  });

  describe('#exchange', () => {
    it('should fail if not called by DolomiteMargin', async () => {
      await expectThrow(
        unwrapper.connect(core.hhUser1).exchange(
          vault.address,
          core.dolomiteMargin.address,
          core.usdc.address,
          factory.address,
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
          vault.address,
          core.dolomiteMargin.address,
          core.usdc.address,
          core.weth.address,
          amountWei,
          BYTES_EMPTY,
        ),
        `IsolationModeUnwrapperTraderV2: Invalid input token <${core.weth.address.toLowerCase()}>`,
      );
    });

    it('should fail if output token is incorrect', async () => {
      const dolomiteMarginImpersonator = await impersonate(core.dolomiteMargin.address, true);
      await core.pendleEcosystem!.ptGlpToken.connect(core.hhUser1).transfer(unwrapper.address, amountWei);
      await expectThrow(
        unwrapper.connect(dolomiteMarginImpersonator).exchange(
          vault.address,
          core.dolomiteMargin.address,
          core.dfsGlp!.address,
          factory.address,
          amountWei,
          abiCoder.encode(['uint256'], [otherAmountWei]),
        ),
        `IsolationModeUnwrapperTraderV2: Invalid output token <${core.dfsGlp!.address.toLowerCase()}>`,
      );
    });

    it('should fail if input amount is incorrect', async () => {
      const dolomiteMarginImpersonator = await impersonate(core.dolomiteMargin.address, true);
      await core.pendleEcosystem!.ptGlpToken.connect(core.hhUser1).transfer(unwrapper.address, amountWei);
      await expectThrow(
        unwrapper.connect(dolomiteMarginImpersonator).exchange(
          vault.address,
          core.dolomiteMargin.address,
          core.usdc.address,
          factory.address,
          ZERO_BI,
          abiCoder.encode(['uint256'], [otherAmountWei]),
        ),
        'IsolationModeUnwrapperTraderV2: Invalid input amount',
      );
    });
  });

  describe('#token', () => {
    it('should work', async () => {
      expect(await unwrapper.token()).to.eq(factory.address);
    });
  });

  describe('#actionsLength', () => {
    it('should work', async () => {
      expect(await unwrapper.actionsLength()).to.eq(2);
    });
  });

  describe('#gmxRegistry', () => {
    it('should work', async () => {
      expect(await unwrapper.GMX_REGISTRY()).to.eq(gmxRegistry.address);
    });
  });

  describe('#pendleRegistry', () => {
    it('should work', async () => {
      expect(await unwrapper.PENDLE_REGISTRY()).to.eq(pendleRegistry.address);
    });
  });

  describe('#getExchangeCost', () => {
    it('should fail because it is not implemented', async () => {
      await expectThrow(
        unwrapper.getExchangeCost(factory.address, core.usdc.address, ZERO_BI, BYTES_EMPTY),
        'PendlePtGLP2024UnwrapperV2: getExchangeCost is not implemented',
      );
    });
  });
});
