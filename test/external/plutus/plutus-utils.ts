import {
  IPlutusVaultGLPFarm,
  IPlutusVaultGLPIsolationModeVaultFactory,
  IPlutusVaultGLPRouter,
  PlutusVaultGLPIsolationModeUnwrapperTraderV1,
  PlutusVaultGLPIsolationModeUnwrapperTraderV2,
  PlutusVaultGLPIsolationModeVaultFactory,
  PlutusVaultGLPIsolationModeWrapperTraderV1,
  PlutusVaultGLPIsolationModeWrapperTraderV2,
} from '../../../src/types';
import { impersonate } from '../../utils';
import { createDolomiteCompatibleWhitelistForPlutusDAO } from '../../utils/ecosystem-token-utils/plutus';
import { CoreProtocol } from '../../utils/setup';

export async function createAndSetPlutusVaultWhitelist(
  core: CoreProtocol,
  routerOrFarm: IPlutusVaultGLPRouter | IPlutusVaultGLPFarm,
  unwrapperTrader: PlutusVaultGLPIsolationModeUnwrapperTraderV1 | PlutusVaultGLPIsolationModeUnwrapperTraderV2,
  wrapperTrader: PlutusVaultGLPIsolationModeWrapperTraderV1 | PlutusVaultGLPIsolationModeWrapperTraderV2,
  dplvGlpToken: IPlutusVaultGLPIsolationModeVaultFactory | PlutusVaultGLPIsolationModeVaultFactory,
) {
  const plutusWhitelist = await routerOrFarm.connect(core.hhUser1).whitelist();
  const dolomiteWhitelist = await createDolomiteCompatibleWhitelistForPlutusDAO(
    core,
    unwrapperTrader,
    wrapperTrader,
    plutusWhitelist,
    dplvGlpToken,
  );

  const owner = await impersonate(await routerOrFarm.owner(), true);
  await routerOrFarm.connect(owner).setWhitelist(dolomiteWhitelist.address);
}
