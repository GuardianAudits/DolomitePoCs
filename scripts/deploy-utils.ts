import { address } from '@dolomite-exchange/dolomite-margin';
import { sleep } from '@openzeppelin/upgrades';
import { BaseContract, BigNumber, BigNumberish, PopulatedTransaction } from 'ethers';
import { FormatTypes, ParamType } from 'ethers/lib/utils';
import fs from 'fs';
import { network, run } from 'hardhat';
import { IERC20Metadata__factory } from '../src/types';
import { createContractWithName } from '../src/utils/dolomite-utils';
import { CoreProtocol } from '../test/utils/setup';

type ChainId = string;

export async function verifyContract(address: string, constructorArguments: any[]) {
  try {
    await run('verify:verify', {
      address,
      constructorArguments,
      noCompile: true,
    });
  } catch (e: any) {
    if (e?.message.toLowerCase().includes('already verified')) {
      console.log('EtherscanVerification: Swallowing already verified error');
    } else {
      throw e;
    }
  }
}

type ConstructorArgument = string | BigNumberish | boolean | ConstructorArgument[];

export async function deployContractAndSave(
  chainId: number,
  contractName: string,
  args: ConstructorArgument[],
  contractRename?: string,
): Promise<address> {
  const fileBuffer = fs.readFileSync('./scripts/deployments.json');

  let file: Record<string, Record<ChainId, any>>;
  try {
    file = JSON.parse(fileBuffer.toString()) ?? {};
  } catch (e) {
    file = {};
  }

  const usedContractName = contractRename ?? contractName;
  if (file[usedContractName]?.[chainId.toString()]) {
    const contract = file[usedContractName][chainId.toString()];
    console.log(`Contract ${usedContractName} has already been deployed to chainId ${chainId} (${contract.address}). Skipping...`);
    if (!contract.isVerified) {
      await prettyPrintAndVerifyContract(file, chainId, usedContractName, args);
    }
    return contract.address;
  }

  console.log(`Deploying ${usedContractName} to chainId ${chainId}...`);

  const contract = await createContractWithName(contractName, args);

  file[usedContractName] = {
    ...file[usedContractName],
    [chainId]: {
      address: contract.address,
      transaction: contract.deployTransaction.hash,
      isVerified: false,
    },
  };

  if (network.name !== 'hardhat') {
    writeFile(file);
  }

  await prettyPrintAndVerifyContract(file, chainId, usedContractName, args);

  return contract.address;
}

export function sortFile(file: Record<string, Record<ChainId, any>>) {
  const sortedFileKeys = Object.keys(file).sort();
  const sortedFile: Record<string, Record<ChainId, any>> = {};
  for (const key of sortedFileKeys) {
    sortedFile[key] = file[key];
  }
  return sortedFile;
}

async function prettyPrintAndVerifyContract(
  file: Record<string, Record<ChainId, any>>,
  chainId: number,
  contractName: string,
  args: any[],
) {
  const contract = file[contractName][chainId.toString()];

  console.log(`========================= ${contractName} =========================`);
  console.log('Address: ', contract.address);
  console.log('='.repeat(52 + contractName.length));

  if (network.name !== 'hardhat') {
    console.log('Sleeping for 5s to wait for the transaction to be indexed by Etherscan...');
    await sleep(5000);
    await verifyContract(contract.address, [...args]);
    file[contractName][chainId].isVerified = true;
    writeFile(file);
  } else {
    console.log('Skipping Etherscan verification...');
  }
}

let counter = 1;

export async function prettyPrintEncodedData(
  transactionPromise: Promise<PopulatedTransaction>,
  methodName: string,
): Promise<void> {
  const transaction = await transactionPromise;
  console.log(`=================================== ${counter++} - ${methodName} ===================================`);
  console.log('To: ', transaction.to);
  console.log('Data: ', transaction.data);
  console.log('='.repeat(75 + (counter - 1).toString().length + methodName.length));
  console.log(''); // add a new line
}

const numMarketsKey = 'numMarkets';
const marketIdToMarketNameCache: Record<string, string | undefined> = {};

async function getFormattedMarketName(core: CoreProtocol, marketId: BigNumberish): Promise<string> {
  let cachedNumMarkets = marketIdToMarketNameCache[numMarketsKey];
  if (!cachedNumMarkets) {
    cachedNumMarkets = (await core.dolomiteMargin.getNumMarkets()).toString();
    marketIdToMarketNameCache[cachedNumMarkets] = cachedNumMarkets;
  }
  if (BigNumber.from(marketId).gte(cachedNumMarkets)) {
    return '(Unknown)';
  }

  const cachedName = marketIdToMarketNameCache[marketId.toString()];
  if (typeof cachedName !== 'undefined') {
    return cachedName;
  }
  const tokenAddress = await core.dolomiteMargin.getMarketTokenAddress(marketId);
  const marketName = await getFormattedTokenName(core, tokenAddress);
  marketIdToMarketNameCache[marketId.toString()] = marketName;
  return marketName;
}

const tokenAddressToMarketNameCache: Record<string, string | undefined> = {};

async function getFormattedTokenName(core: CoreProtocol, tokenAddress: string): Promise<string> {
  const cachedName = tokenAddressToMarketNameCache[tokenAddress.toLowerCase()];
  if (typeof cachedName !== 'undefined') {
    return cachedName;
  }
  const token = IERC20Metadata__factory.connect(tokenAddress, core.hhUser1);
  try {
    tokenAddressToMarketNameCache[tokenAddress.toLowerCase()] = `(${await token.symbol()})`;
    return tokenAddressToMarketNameCache[tokenAddress.toLowerCase()]!;
  } catch (e) {
    tokenAddressToMarketNameCache[tokenAddress.toLowerCase()] = '';
    return '';
  }
}

function isMarketIdParam(paramType: ParamType): boolean {
  return paramType.name.includes('marketId') || paramType.name.includes('MarketId');
}

function isTokenParam(paramType: ParamType): boolean {
  return paramType.name.includes('token') || paramType.name.includes('Token');
}

export async function prettyPrintEncodedDataWithTypeSafety<
  T extends V[K],
  U extends keyof T['populateTransaction'],
  V extends Record<K, BaseContract>,
  K extends keyof V,
>(
  core: CoreProtocol,
  liveMap: V,
  key: K,
  methodName: U,
  args: Parameters<T['populateTransaction'][U]>,
): Promise<void> {
  const contract = liveMap[key];
  const transaction = await contract.populateTransaction[methodName.toString()](...(args as any));
  const fragment = contract.interface.getFunction(methodName.toString());
  const mappedArgs = await Promise.all((args as any[]).map(async (arg, i) => {
    const inputParam = fragment.inputs[i];
    const formattedInputParamName = inputParam.format(FormatTypes.full);
    if (BigNumber.isBigNumber(arg)) {
      if (isMarketIdParam(inputParam)) {
        return `${formattedInputParamName} = ${arg.toString()} ${await getFormattedMarketName(core, arg)}`;
      }
      return `${formattedInputParamName} = ${arg.toString()}`;
    }

    if (Array.isArray(arg)) {
      if (isMarketIdParam(inputParam)) {
        const formattedArgs = await Promise.all(arg.map(async marketId => {
          return `${marketId} ${await getFormattedMarketName(core, marketId)}`;
        }));
        return `${formattedInputParamName} = [\n\t\t\t\t${formattedArgs.join(' ,\n\t\t\t\t')}\n\t\t\t]`;
      }
      if (isTokenParam(inputParam)) {
        const formattedArgs = await Promise.all(arg.map(async tokenAddress => {
          return `${tokenAddress} ${await getFormattedTokenName(core, tokenAddress)}`;
        }));
        return `${formattedInputParamName} = [\n\t\t\t\t${formattedArgs.join(' ,\n\t\t\t\t')}\n\t\t\t]`;
      }
      return `${formattedInputParamName} = [\n\t\t\t\t${arg.join(' ,\n\t\t\t\t')}\n\t\t\t]`;
    }

    if (typeof arg === 'object') {
      if (fragment.inputs[i].baseType !== 'tuple') {
        return Promise.reject(new Error('Object type is not tuple'));
      }
      const values = Object.keys(arg).reduce<string[]>((memo, key, j) => {
        const component = fragment.inputs[i].components[j];
        const name = component.format(FormatTypes.full);
        let value: string;
        if (isMarketIdParam(component)) {
          value = `${arg[key].toString()} ${getFormattedMarketName(core, arg[key])}`;
        } else if (isTokenParam(component)) {
          value = `${arg[key]} ${getFormattedTokenName(core, arg[key])}`;
        } else {
          value = arg[key];
        }
        memo.push(`${name} = ${value}`);
        return memo;
      }, []);
      return `${formattedInputParamName} = {\n\t\t\t\t${values.join(' ,\n\t\t\t\t')}\n\t\t\t}`;
    }

    if (isMarketIdParam(inputParam)) {
      return `${formattedInputParamName} = ${arg} ${await getFormattedMarketName(core, arg)}`;
    }
    if (isTokenParam(inputParam)) {
      return `${formattedInputParamName} = ${arg} ${await getFormattedTokenName(core, arg)}`;
    }

    return `${formattedInputParamName} = ${arg}`;
  }));
  console.log(''); // add a new line
  console.log(`=================================== ${counter++} - ${key}.${methodName} ===================================`);
  console.log('Readable:\t', `${key}.${methodName}(\n\t\t\t${mappedArgs.join(' ,\n\t\t\t')}\n\t\t)`);
  console.log('To:\t\t', transaction.to);
  console.log('Data:\t\t', transaction.data);
  console.log('='.repeat(76 + (counter - 1).toString().length + key.toString().length + methodName.toString().length));
  console.log(''); // add a new line
}

export function writeFile(file: Record<string, Record<ChainId, any>>) {
  fs.writeFileSync(
    './scripts/deployments.json',
    JSON.stringify(sortFile(file), null, 2),
    { encoding: 'utf8', flag: 'w' },
  );
}
