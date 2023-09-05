import { BigNumberish } from 'ethers';
import { CoreProtocol } from '../../../test/utils/setup';
import {
  ERC20,
  GLPIsolationModeTokenVaultV1,
  GLPIsolationModeVaultFactory,
  GmxRegistryV1,
  GmxRegistryV2,
  GmxV2IsolationModeTokenVaultV1,
  GmxV2IsolationModeVaultFactory,
  IGLPIsolationModeTokenVaultV1,
  IGLPIsolationModeVaultFactory,
  IGLPIsolationModeVaultFactoryOld,
  IGmxMarketToken,
  IGmxRegistryV1,
  IGmxRegistryV2,
  IGmxV2IsolationModeVaultFactory,
  TestGLPIsolationModeTokenVaultV1,
} from '../../types';
import { IERC20 } from '@dolomite-exchange/dolomite-margin/dist/build/wrappers/IERC20';

export function getGLPPriceOracleV1ConstructorParams(
  dfsGlp: IGLPIsolationModeVaultFactory | GLPIsolationModeVaultFactory | IGLPIsolationModeVaultFactoryOld,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
): any[] {
  return [gmxRegistry.address, dfsGlp.address];
}

export function getGLPUnwrapperTraderV1ConstructorParams(
  core: CoreProtocol,
  dfsGlp: IGLPIsolationModeVaultFactory | GLPIsolationModeVaultFactory,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
): any[] {
  return [
    core.tokens.usdc.address,
    gmxRegistry.address,
    dfsGlp.address,
    core.dolomiteMargin.address,
  ];
}

export function getGLPUnwrapperTraderV2ConstructorParams(
  core: CoreProtocol,
  dfsGlp: IGLPIsolationModeVaultFactory | GLPIsolationModeVaultFactory | IGLPIsolationModeVaultFactoryOld,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
): any[] {
  return [
    gmxRegistry.address,
    dfsGlp.address,
    core.dolomiteMargin.address,
  ];
}

export type GmxUserVaultImplementation =
  IGLPIsolationModeTokenVaultV1
  | GLPIsolationModeTokenVaultV1
  | TestGLPIsolationModeTokenVaultV1;

export function getGLPIsolationModeVaultFactoryConstructorParams(
  core: CoreProtocol,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
  userVaultImplementation: GmxUserVaultImplementation,
): any[] {
  return [
    core.tokens.weth.address,
    core.marketIds.weth,
    gmxRegistry.address,
    core.gmxEcosystem!.fsGlp.address,
    core.borrowPositionProxyV2.address,
    userVaultImplementation.address,
    core.dolomiteMargin.address,
  ];
}

export function getGLPWrapperTraderV1ConstructorParams(
  core: CoreProtocol,
  dfsGlp: IGLPIsolationModeVaultFactory | GLPIsolationModeVaultFactory,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
): any[] {
  return [
    core.tokens.usdc.address,
    gmxRegistry.address,
    dfsGlp.address,
    core.dolomiteMargin.address,
  ];
}

export function getGLPWrapperTraderV2ConstructorParams(
  core: CoreProtocol,
  dfsGlp: IGLPIsolationModeVaultFactory | GLPIsolationModeVaultFactory | IGLPIsolationModeVaultFactoryOld,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
): any[] {
  return [
    gmxRegistry.address,
    dfsGlp.address,
    core.dolomiteMargin.address,
  ];
}

export async function getGmxRegistryConstructorParams(
  implementation: GmxRegistryV1,
  core: CoreProtocol,
): Promise<any[]> {
  if (!core.gmxEcosystem) {
    throw new Error('GMX ecosystem not initialized');
  }

  const initializer = {
    esGmx: core.gmxEcosystem.esGmx.address,
    fsGlp: core.gmxEcosystem.fsGlp.address,
    glp: core.gmxEcosystem.glp.address,
    glpManager: core.gmxEcosystem.glpManager.address,
    glpRewardsRouter: core.gmxEcosystem.glpRewardsRouter.address,
    gmx: core.gmxEcosystem.gmx.address,
    gmxRewardsRouter: core.gmxEcosystem.gmxRewardsRouter.address,
    gmxVault: core.gmxEcosystem.gmxVault.address,
    sGlp: core.gmxEcosystem.sGlp.address,
    sGmx: core.gmxEcosystem.sGmx.address,
    sbfGmx: core.gmxEcosystem.sbfGmx.address,
    vGlp: core.gmxEcosystem.vGlp.address,
    vGmx: core.gmxEcosystem.vGmx.address,
  };

  return [
    implementation.address,
    core.dolomiteMargin.address,
    (await implementation.populateTransaction.initialize(initializer, core.dolomiteRegistry.address)).data!,
  ];
}

export async function getGmxRegistryV2ConstructorParams(
  core: CoreProtocol,
  implementation: GmxRegistryV2,
): Promise<any[]> {
  if (!core.gmxEcosystem) {
    throw new Error('GMX ecosystem not initialized');
  }

  const calldata = await implementation.populateTransaction.initialize(
    core.gmxEcosystem!.gmxExchangeRouter.address,
    core.gmxEcosystem!.gmxDataStore.address,
    core.gmxEcosystem!.gmxReader.address,
    core.gmxEcosystem!.gmxRouter.address,
    core.gmxEcosystem!.gmxDepositHandler.address,
    core.gmxEcosystem!.gmxDepositVault.address,
    core.gmxEcosystem!.gmxWithdrawalHandler.address,
    core.gmxEcosystem!.gmxEthUsdMarketToken.address,
    core.dolomiteRegistry.address,
  );

  return [
    implementation.address,
    core.dolomiteMargin.address,
    calldata.data,
  ];
}

export function getGmxV2IsolationModeVaultFactoryConstructorParams(
  core: CoreProtocol,
  gmxRegistry: IGmxRegistryV2,
  debtMarketIds: BigNumberish[],
  collateralMarketIds: BigNumberish[],
  gmToken: IGmxMarketToken,
  userVaultImplementation: GmxV2IsolationModeTokenVaultV1,
): any[] {
  if (!core.gmxEcosystem) {
    throw new Error('Gmx ecosystem not initialized');
  }

  return [
    gmxRegistry.address,
    [
      gmToken.address,
      core.tokens.weth.address,
      core.marketIds.weth,
      core.tokens.nativeUsdc!.address,
      core.marketIds.nativeUsdc,
      core.tokens.weth.address,
      core.marketIds.weth,
    ],
    debtMarketIds,
    collateralMarketIds,
    core.borrowPositionProxyV2.address,
    userVaultImplementation.address,
    core.dolomiteMargin.address,
  ];
}

export function getGmxV2IsolationModeUnwrapperTraderV2ConstructorParams(
  core: CoreProtocol,
  dGM: IGmxV2IsolationModeVaultFactory | GmxV2IsolationModeVaultFactory,
  gmxRegistryV2: IGmxRegistryV2 | GmxRegistryV2,
): any[] {
  if (!core.gmxEcosystem) {
    throw new Error('Gmx ecosystem not initialized');
  }

  return [
    gmxRegistryV2.address,
    dGM.address,
    core.dolomiteMargin.address,
  ];
}

export function getGmxV2IsolationModeWrapperTraderV2ConstructorParams(
  core: CoreProtocol,
  dGM: IGmxV2IsolationModeVaultFactory | GmxV2IsolationModeVaultFactory,
  gmxRegistryV2: IGmxRegistryV2 | GmxRegistryV2,
): any[] {
  if (!core.gmxEcosystem) {
    throw new Error('Gmx ecosystem not initialized');
  }

  return [
    gmxRegistryV2.address,
    dGM.address,
    core.dolomiteMargin.address,
  ];
}

export function getGmxV2MarketTokenPriceOracleConstructorParams(
  core: CoreProtocol,
  dGm: IGmxV2IsolationModeVaultFactory | GmxV2IsolationModeVaultFactory,
  gmxRegistryV2: IGmxRegistryV2 | GmxRegistryV2,
): any[] {
  if (!core.gmxEcosystem) {
    throw new Error('Gmx ecosystem not initialized');
  }

  return [
    dGm.address,
    gmxRegistryV2.address,
    core.dolomiteMargin.address,
  ]
}