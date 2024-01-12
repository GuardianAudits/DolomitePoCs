import { getAndCheckSpecificNetwork } from '../../../../src/utils/dolomite-utils';
import { Network } from '../../../../src/utils/no-deps-constants';
import { CoreProtocol, setupCoreProtocol } from '../../../../test/utils/setup';
import {
  createFolder,
  DenJsonUpload,
  deployContractAndSave,
  EncodedTransaction,
  getTokenVaultLibrary,
  prettyPrintEncodedDataWithTypeSafety,
  writeFile,
} from '../../../deploy-utils';
import { BigNumberish } from 'ethers';
import { IIsolationModeVaultFactory__factory } from '../../../../src/types';

const genericTraderProxyV1OldAddress = '0xe50c3118349F09AbAfc1bb01AD5CB946B1De83f6';
const liquidatorProxyV4OldAddress = '0xfD84446AbCB9016F823904F13d16Fb7f103Ab6D7';

async function getGlpVaultTransactions(
  core: CoreProtocol,
  newGlpUserVaultImplementationAddress: string,
): Promise<EncodedTransaction[]> {
  const transactions: EncodedTransaction[] = [];

  transactions.push(
    await prettyPrintEncodedDataWithTypeSafety(
      core,
      core.gmxEcosystem!.live,
      'dGlp',
      'setUserVaultImplementation',
      [newGlpUserVaultImplementationAddress],
    ),
  );
  return transactions;
}

async function getIsolationModeTokenVaultTransactions(
  core: CoreProtocol,
  marketId: BigNumberish,
  userVaultImplementationAddress: string,
): Promise<EncodedTransaction[]> {
  const transactions: EncodedTransaction[] = [];
  const factory = IIsolationModeVaultFactory__factory.connect(
    await core.dolomiteMargin.getMarketTokenAddress(marketId),
    core.hhUser1
  );

  transactions.push(
    await prettyPrintEncodedDataWithTypeSafety(
      core,
      { factory },
      'factory',
      'ownerSetUserVaultImplementation',
      [userVaultImplementationAddress],
    ),
  );
  return transactions;
}

/**
 * This script encodes the following transactions:
 * - Upgrades the Event Emitter Proxy to V2
 * - Sets the Generic Trader Proxy as a global operator of Dolomite Margin
 * - Sets the Liquidator Proxy V4 as a global operator of Dolomite Margin
 * - Sets the Generic Trader Proxy on the Dolomite Registry
 * - Upgrades each Isolation Mode vault to use the new ActionsLib
 * - For each isolation mode asset, resets the Liquidator Asset Registry to use the new Liquidator Proxy V4
 * - Enables auto staking for plvGLP and GMX
 */
async function main(): Promise<DenJsonUpload> {
  const network = await getAndCheckSpecificNetwork(Network.ArbitrumOne);
  const core = await setupCoreProtocol({ network, blockNumber: 0 });

  await deployContractAndSave(
    Number(core.config.network),
    'IsolationModeTokenVaultV1ActionsImpl',
    [],
    'IsolationModeTokenVaultV1ActionsImplV3',
  );
  const libraries = getTokenVaultLibrary(core);
  const newGlpUserVaultImplementationAddress = await deployContractAndSave(
    Number(core.config.network),
    'GLPIsolationModeTokenVaultV2',
    [],
    'GLPIsolationModeTokenVaultV5',
    libraries,
  );
  const plvGlpUserVaultImplementationAddress = await deployContractAndSave(
    Number(core.config.network),
    'PlutusVaultGLPIsolationModeTokenVaultV1',
    [],
    'PlutusVaultGLPIsolationModeTokenVaultV4',
    libraries,
  );
  const jonesUsdcUserVaultImplementationAddress = await deployContractAndSave(
    Number(core.config.network),
    'JonesUSDCIsolationModeTokenVaultV2',
    [],
    'JonesUSDCIsolationModeTokenVaultV6',
    libraries,
  );
  const ptGlpUserVaultImplementationAddress = await deployContractAndSave(
    Number(core.config.network),
    'PendlePtGLP2024IsolationModeTokenVaultV1',
    [],
    'PendlePtGLP2024IsolationModeTokenVaultV4',
    libraries,
  );
  const ytGlpUserVaultImplementationAddress = await deployContractAndSave(
    Number(core.config.network),
    'PendleYtGLP2024IsolationModeTokenVaultV1',
    [],
    'PendleYtGLP2024IsolationModeTokenVaultV4',
    libraries,
  );
  const ptREthUserVaultImplementationAddress = await deployContractAndSave(
    Number(core.config.network),
    'PendlePtIsolationModeTokenVaultV1',
    [],
    'PendlePtREthJun2025IsolationModeTokenVaultV4',
    libraries,
  );
  const ptWstEthJun2024UserVaultImplementationAddress = await deployContractAndSave(
    Number(core.config.network),
    'PendlePtIsolationModeTokenVaultV1',
    [],
    'PendlePtWstEthJun2024IsolationModeTokenVaultV4',
    libraries,
  );
  const ptWstEthJun2025UserVaultImplementationAddress = await deployContractAndSave(
    Number(core.config.network),
    'PendlePtIsolationModeTokenVaultV1',
    [],
    'PendlePtWstEthJun2025IsolationModeTokenVaultV4',
    libraries,
  );
  const vArbUserVaultImplementationAddress = await deployContractAndSave(
    Number(core.config.network),
    'ARBIsolationModeTokenVaultV1',
    [],
    'ARBIsolationModeTokenVaultV6',
    libraries,
  );
  const gmxUserVaultImplementationAddress = await deployContractAndSave(
    Number(core.config.network),
    'GMXIsolationModeTokenVaultV1',
    [],
    'GMXIsolationModeTokenVaultV4',
    libraries,
  );

  const transactions: EncodedTransaction[] = [];
  transactions.push(
    ...await getGlpVaultTransactions(core, newGlpUserVaultImplementationAddress),
  );
  transactions.push(
    ...await getIsolationModeTokenVaultTransactions(
      core,
      core.marketIds.dplvGlp!,
      plvGlpUserVaultImplementationAddress,
    ),
  );
  transactions.push(
    ...await getIsolationModeTokenVaultTransactions(
      core,
      core.marketIds.djUSDC!,
      jonesUsdcUserVaultImplementationAddress,
    ),
  );
  transactions.push(
    ...await getIsolationModeTokenVaultTransactions(
      core,
      core.marketIds.dPtGlp!,
      ptGlpUserVaultImplementationAddress,
    ),
  );
  transactions.push(
    ...await getIsolationModeTokenVaultTransactions(
      core,
      core.marketIds.dYtGlp!,
      ytGlpUserVaultImplementationAddress,
    ),
  );
  transactions.push(
    ...await getIsolationModeTokenVaultTransactions(
      core,
      core.marketIds.dPtREthJun2025!,
      ptREthUserVaultImplementationAddress,
    ),
  );
  transactions.push(
    ...await getIsolationModeTokenVaultTransactions(
      core,
      core.marketIds.dPtWstEthJun2024!,
      ptWstEthJun2024UserVaultImplementationAddress,
    ),
  );
  transactions.push(
    ...await getIsolationModeTokenVaultTransactions(
      core,
      core.marketIds.dPtWstEthJun2025!,
      ptWstEthJun2025UserVaultImplementationAddress,
    ),
  );
  transactions.push(
    ...await getIsolationModeTokenVaultTransactions(
      core,
      core.marketIds.dArb!,
      vArbUserVaultImplementationAddress,
    ),
  );
  transactions.push(
    ...await getIsolationModeTokenVaultTransactions(
      core,
      core.marketIds.dGmx!,
      gmxUserVaultImplementationAddress,
    ),
  );

  return {
    transactions,
    chainId: network,
  };
}

main()
  .then(jsonUpload => {
    if (typeof jsonUpload === 'undefined') {
      return;
    }

    const path = require('path');
    const scriptName = path.basename(__filename).slice(0, -3);
    const dir = `${__dirname}/output`;
    createFolder(dir);
    writeFile(`${dir}/${scriptName}.json`, JSON.stringify(jsonUpload, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });