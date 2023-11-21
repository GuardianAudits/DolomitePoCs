import { expect } from 'chai';
import {
  GLPIsolationModeTokenVaultV2__factory,
  GLPIsolationModeVaultFactory,
  GMXIsolationModeTokenVaultV1,
  GMXIsolationModeTokenVaultV1__factory,
  GMXIsolationModeVaultFactory,
  GmxRegistryV1,
  IsolationModeUpgradeableProxy,
  IsolationModeUpgradeableProxy__factory,
} from '../../../src/types';
import { MAX_UINT_256_BI, Network, ONE_BI, ZERO_BI } from '../../../src/utils/no-deps-constants';
import { impersonate, revertToSnapshotAndCapture, snapshot } from '../../utils';
import { expectEvent, expectProtocolBalance, expectThrow, expectWalletBalance } from '../../utils/assertions';
import { createGMXIsolationModeVaultFactory, createGMXIsolationModeTokenVaultV1, createGmxRegistry, createGLPIsolationModeVaultFactory, createGLPIsolationModeTokenVaultV1, createGLPIsolationModeTokenVaultV2 } from '../../utils/ecosystem-token-utils/gmx';
import {
  CoreProtocol,
  getDefaultCoreProtocolConfig,
  setupCoreProtocol,
  setupGMXBalance,
  setupTestMarket,
  setupUSDCBalance,
  setupUserVaultProxy,
} from '../../utils/setup';
import { createContractWithAbi } from 'src/utils/dolomite-utils';
import { BigNumber, ContractTransaction } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ZERO_ADDRESS } from '@openzeppelin/upgrades/lib/utils/Addresses';

const gmxAmount = parseEther('10');
const toAccountNumber = '0';
const OTHER_ADDRESS = '0x1234567812345678123456781234567812345678';
const usdcAmount = BigNumber.from('2000000000'); // 2,000 USDC

describe('GMXIsolationModeVaultFactory', () => {
  let snapshotId: string;

  let core: CoreProtocol;
  let gmxRegistry: GmxRegistryV1;
  let vaultImplementation: GMXIsolationModeTokenVaultV1;
  let factory: GMXIsolationModeVaultFactory;
  let glpFactory: GLPIsolationModeVaultFactory;
  let glpAmount: BigNumber;
  let underlyingMarketIdGlp: BigNumber;
  let underlyingMarketIdGmx: BigNumber;

  before(async () => {
    core = await setupCoreProtocol(getDefaultCoreProtocolConfig(Network.ArbitrumOne));

    const glpVaultImplementation = await createGLPIsolationModeTokenVaultV1();
    gmxRegistry = await createGmxRegistry(core);
    glpFactory = await createGLPIsolationModeVaultFactory(core, gmxRegistry, glpVaultImplementation);
    vaultImplementation = await createGMXIsolationModeTokenVaultV1();
    factory = await createGMXIsolationModeVaultFactory(core, gmxRegistry, vaultImplementation);

    underlyingMarketIdGlp = await core.dolomiteMargin.getNumMarkets();
    await core.testEcosystem!.testPriceOracle.setPrice(glpFactory.address, '1000000000000000000');
    await setupTestMarket(core, glpFactory, true);
    await core.dolomiteMargin.connect(core.governance).ownerSetGlobalOperator(glpFactory.address, true);
    await glpFactory.connect(core.governance).ownerInitialize([]);

    underlyingMarketIdGmx = await core.dolomiteMargin.getNumMarkets();
    await core.testEcosystem!.testPriceOracle.setPrice(factory.address, '1000000000000000000');
    await setupTestMarket(core, factory, true);
    await core.dolomiteMargin.connect(core.governance).ownerSetGlobalOperator(factory.address, true);
    await factory.connect(core.governance).ownerInitialize([]);

    await gmxRegistry.connect(core.governance).ownerSetGlpVaultFactory(glpFactory.address);
    await gmxRegistry.connect(core.governance).ownerSetGmxVaultFactory(factory.address);

    await setupUSDCBalance(core, core.hhUser1, usdcAmount, core.gmxEcosystem!.glpManager);
    await core.gmxEcosystem!.glpRewardsRouter.connect(core.hhUser1).mintAndStakeGlp(
      core.tokens.usdc.address,
      usdcAmount,
      ONE_BI,
      ONE_BI,
    );
    // use sGLP for approvals/transfers and fsGLP for checking balances
    glpAmount = await core.gmxEcosystem!.fsGlp.connect(core.hhUser1).balanceOf(core.hhUser1.address);

    snapshotId = await snapshot();
  });

  beforeEach(async () => {
    snapshotId = await revertToSnapshotAndCapture(snapshotId);
  });

  async function checkVaultCreationResults(result: ContractTransaction) {
    const vault = await factory.getVaultByAccount(core.hhUser1.address);
    const account = await factory.getAccountByVault(vault);
    expect(account).to.eq(core.hhUser1.address);
    await expectEvent(factory, result, 'VaultCreated', {
      account: core.hhUser1.address,
      vault: vault.toString(),
    });
    await expect(await core.borrowPositionProxyV2.isCallerAuthorized(vault)).to.eq(true);

    const vaultContract = setupUserVaultProxy<IsolationModeUpgradeableProxy>(
      vault,
      IsolationModeUpgradeableProxy__factory,
      core.hhUser1,
    );
    expect(await vaultContract.isInitialized()).to.eq(true);
    expect(await vaultContract.owner()).to.eq(core.hhUser1.address);
  }


  describe('#contructor', () => {
    it('should initialize variables properly', async () => {
      expect(await factory.WETH()).to.equal(core.tokens.weth.address);
      expect(await factory.WETH_MARKET_ID()).to.equal(core.marketIds.weth);
      expect(await factory.gmxRegistry()).to.equal(gmxRegistry.address);
      expect(await factory.UNDERLYING_TOKEN()).to.equal(core.gmxEcosystem!.gmx.address);
      expect(await factory.BORROW_POSITION_PROXY()).to.equal(core.borrowPositionProxyV2.address);
      expect(await factory.userVaultImplementation()).to.equal(vaultImplementation.address);
      expect(await factory.DOLOMITE_MARGIN()).to.equal(core.dolomiteMargin.address);
    });
  });

  describe('#createVault', () => {
    it('should work properly with GLP vault with no balance', async () => {
      // Upgrade GLP vault factory
      const glpV2VaultImplemenation = await createGLPIsolationModeTokenVaultV2();
      await glpFactory.connect(core.governance).ownerSetUserVaultImplementation(glpV2VaultImplemenation.address);

      await glpFactory.connect(core.hhUser1).createVault(core.hhUser1.address);
      const glpVault = await glpFactory.getVaultByAccount(core.hhUser1.address);
      const glpVaultContract = GLPIsolationModeTokenVaultV2__factory.connect(
        glpVault,
        core.hhUser1,
      );

      const result = await factory.connect(core.hhUser1).createVault(core.hhUser1.address);
      await checkVaultCreationResults(result);
      expect(await glpVaultContract.hasSynced()).to.be.true;
    });

    it('should work properly with no GLP vault', async () => {
      const result = await factory.connect(core.hhUser1).createVault(core.hhUser1.address);
      await checkVaultCreationResults(result);
    });

    it('should work properly with Glp vault with balance', async () => {
      // Create and deposit GLP into vault
      const glpVaultAddress = await glpFactory.calculateVaultByAccount(core.hhUser1.address);
      await core.gmxEcosystem!.sGlp.connect(core.hhUser1).approve(glpVaultAddress, MAX_UINT_256_BI);

      const account = { owner: glpVaultAddress, number: ZERO_BI };
      await glpFactory.connect(core.hhUser1).createVaultAndDepositIntoDolomiteMargin(
        toAccountNumber,
        glpAmount,
      );
      const glpVault = GLPIsolationModeTokenVaultV2__factory.connect(
        glpVaultAddress,
        core.hhUser1,
      );

      // Stake GMX
      await setupGMXBalance(core, core.hhUser1, gmxAmount, glpVault);
      await glpVault.stakeGmx(gmxAmount);
      expect(await glpVault.gmxBalanceOf()).to.eq(gmxAmount);
      expect(await core.gmxEcosystem!.sbfGmx.balanceOf(glpVault.address)).to.eq(gmxAmount);

      // Upgrade GLP vault factory
      const glpV2VaultImplemenation = await createGLPIsolationModeTokenVaultV2();
      await glpFactory.connect(core.governance).ownerSetUserVaultImplementation(glpV2VaultImplemenation.address);

      // Create GMX vault and check balance
      const result = await factory.connect(core.hhUser1).createVault(core.hhUser1.address);
      const gmxVaultAddress = await factory.calculateVaultByAccount(core.hhUser1.address);
      const gmxVault = GMXIsolationModeTokenVaultV1__factory.connect(
        gmxVaultAddress,
        core.hhUser1,
      );

      await checkVaultCreationResults(result);
      expect(await glpVault.hasSynced()).to.be.true;
      expect(await gmxVault.shouldSkipTransfer()).to.be.false;
      await expectProtocolBalance(core, gmxVault.address, 0, underlyingMarketIdGmx, gmxAmount);
      await expectProtocolBalance(core, glpVault.address, 0, underlyingMarketIdGmx, ZERO_BI);
      await expectWalletBalance(gmxVault.address, core.gmxEcosystem!.gmx, ZERO_BI);
      expect(await core.gmxEcosystem!.sbfGmx.balanceOf(glpVault.address)).to.eq(gmxAmount);
    });

    it('should fail when account passed is the zero address', async () => {
      await expectThrow(
        factory.createVault(ZERO_ADDRESS),
        'GMXIsolationModeVaultFactory: Invalid account',
      );
    });

    it('should fail when vault is already created', async () => {
      const result = await factory.createVault(core.hhUser1.address);
      await checkVaultCreationResults(result);

      await expectThrow(
        factory.createVault(core.hhUser1.address),
        'GMXIsolationModeVaultFactory: Vault already exists',
      );
    });

    it('should fail when factory is not initialized', async () => {
      const uninitializedFactory = await createGMXIsolationModeVaultFactory(core, gmxRegistry, vaultImplementation);
      await expectThrow(
        uninitializedFactory.createVault(core.hhUser1.address),
        'IsolationModeVaultFactory: Not initialized',
      );
    });
  });

  describe('#executeDepositIntoVaultFromGLPVault', () => {
    it('should work normally', async () => {
      const glpV2VaultImplemenation = await createGLPIsolationModeTokenVaultV2();
      await glpFactory.connect(core.governance).ownerSetUserVaultImplementation(glpV2VaultImplemenation.address);
      await glpFactory.connect(core.hhUser1).createVault(core.hhUser1.address);
      const glpVault = await glpFactory.getVaultByAccount(core.hhUser1.address);
      const glpVaultImpersonator = await impersonate(glpVault, true);

      await factory.connect(core.hhUser1).createVault(core.hhUser1.address);
      const gmxVaultAddress = await factory.calculateVaultByAccount(core.hhUser1.address);
      const gmxVault = GMXIsolationModeTokenVaultV1__factory.connect(
        gmxVaultAddress,
        core.hhUser1,
      );

      await factory.connect(glpVaultImpersonator).executeDepositIntoVaultFromGLPVault(
        gmxVault.address,
        toAccountNumber,
        gmxAmount
      );
      expect(await gmxVault.shouldSkipTransfer()).to.be.false;
      await expectProtocolBalance(core, gmxVault.address, toAccountNumber, underlyingMarketIdGmx, gmxAmount);
    });

    it('should fail if not called by GLP vault', async () => {
      const result = await factory.connect(core.hhUser1).createVault(core.hhUser1.address);
      const gmxVaultAddress = await factory.calculateVaultByAccount(core.hhUser1.address);
      const gmxVault = GMXIsolationModeTokenVaultV1__factory.connect(
        gmxVaultAddress,
        core.hhUser1,
      );

      await expectThrow(
        factory.connect(core.hhUser1).executeDepositIntoVaultFromGLPVault(
          gmxVault.address,
          toAccountNumber,
          parseEther('10'),
        ),
        'GMXIsolationModeVaultFactory: Invalid GLP vault',
      );
    });
  });

  // describe('#createVaultAndAcceptFullAccountTransfer', () => {
  //   it('should work normally', async () => {
  //     const usdcAmount = BigNumber.from('100000000'); // 100 USDC
  //     await setupUSDCBalance(core, core.hhUser1, usdcAmount, core.gmxEcosystem!.glpManager);
  //     await core.gmxEcosystem!.glpRewardsRouter.connect(core.hhUser1).mintAndStakeGlp(
  //       core.tokens.usdc.address,
  //       usdcAmount,
  //       ONE_BI,
  //       ONE_BI,
  //     );
  //     // use sGLP for approvals/transfers and fsGLP for checking balances
  //     const glpAmount = await core.gmxEcosystem!.fsGlp.connect(core.hhUser1).balanceOf(core.hhUser1.address);
  //     const vaultAddress = await factory.connect(core.hhUser2).calculateVaultByAccount(core.hhUser2.address);
  //     await core.gmxEcosystem!.gmxRewardsRouter.connect(core.hhUser1).signalTransfer(vaultAddress);

  //     await core.testEcosystem!.testPriceOracle.setPrice(factory.address, '1000000000000000000');
  //     await core.dolomiteMargin.connect(core.governance).ownerSetGlobalOperator(factory.address, true);
  //     await setupTestMarket(core, factory, true);
  //     await factory.connect(core.governance).ownerInitialize([]);

  //     await factory.connect(core.hhUser2).createVaultAndAcceptFullAccountTransfer(core.hhUser1.address);
  //     const vault = setupUserVaultProxy<GLPIsolationModeTokenVaultV1>(
  //       vaultAddress,
  //       GLPIsolationModeTokenVaultV1__factory,
  //       core.hhUser2,
  //     );
  //     expect(await core.gmxEcosystem!.fsGlp.connect(core.hhUser1).balanceOf(core.hhUser1.address)).to.eq(ZERO_BI);
  //     expect(await core.gmxEcosystem!.fsGlp.connect(core.hhUser1).balanceOf(vaultAddress)).to.eq(glpAmount);
  //     expect(await vault.underlyingBalanceOf()).to.eq(glpAmount);
  //   });

  //   it('should fail when not initialized yet', async () => {
  //     await expectThrow(
  //       factory.connect(core.hhUser2).createVaultAndAcceptFullAccountTransfer(core.hhUser1.address),
  //       'IsolationModeVaultFactory: Not initialized',
  //     );
  //   });
  // });

  describe('#setGmxRegistry', () => {
    it('should work normally', async () => {
      const result = await factory.connect(core.governance).setGmxRegistry(OTHER_ADDRESS);
      await expectEvent(factory, result, 'GmxRegistrySet', {
        gmxRegistry: OTHER_ADDRESS,
      });
      expect(await factory.gmxRegistry()).to.equal(OTHER_ADDRESS);
    });

    it('should fail when not called by owner', async () => {
      await expectThrow(
        factory.connect(core.hhUser1).setGmxRegistry(OTHER_ADDRESS),
        `OnlyDolomiteMargin: Caller is not owner of Dolomite <${core.hhUser1.address.toLowerCase()}>`,
      );
    });
  });

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