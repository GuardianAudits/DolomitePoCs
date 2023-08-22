import { address } from '@dolomite-exchange/dolomite-margin';
import { BigNumber as ZapBigNumber, ZapOutputParam } from '@dolomite-exchange/zap-sdk/dist';
import { GenericTraderType } from '@dolomite-margin/dist/src/modules/GenericTraderProxyV1';
import axios from 'axios';
import { BigNumber, BigNumberish, ContractTransaction } from 'ethers';
import { AccountInfoStruct, GenericTraderParamStruct } from '../../src/utils';
import { BYTES_EMPTY, MAX_UINT_256_BI, NO_EXPIRY, NO_PARASWAP_TRADER_PARAM } from '../../src/utils/no-deps-constants';
import { expectThrow } from './assertions';
import { CoreProtocol } from './setup';

const API_URL = 'https://apiv5.paraswap.io';

export function getParaswapTraderParamStruct(
  core: CoreProtocol,
  encodedTradeData: string,
): GenericTraderParamStruct {
  return {
    traderType: GenericTraderType.ExternalLiquidity,
    makerAccountIndex: 0,
    trader: core.paraswapTrader!.address,
    tradeData: encodedTradeData,
  };
}

export function toZapBigNumber(amount: BigNumberish): ZapBigNumber {
  return new ZapBigNumber(amount.toString());
}

export function getLastZapAmountToBigNumber(zapOutput: ZapOutputParam): BigNumber {
  return BigNumber.from(zapOutput.amountWeisPath[zapOutput.amountWeisPath.length - 1].toString());
}

export async function liquidateV4WithIsolationMode(
  core: CoreProtocol,
  solidAccountStruct: AccountInfoStruct,
  liquidAccountStruct: AccountInfoStruct,
  marketIdsPath: BigNumberish[],
  amountWeisPath: BigNumberish[],
  unwrapper: { address: address },
  unwrapperTradeData: string = BYTES_EMPTY,
  paraswapTraderParam: GenericTraderParamStruct | undefined = NO_PARASWAP_TRADER_PARAM,
  expiry: BigNumberish = NO_EXPIRY,
): Promise<ContractTransaction> {
  const defaultUnwrapperTraderParam: GenericTraderParamStruct = {
    traderType: GenericTraderType.IsolationModeUnwrapper,
    makerAccountIndex: 0,
    trader: unwrapper.address,
    tradeData: unwrapperTradeData,
  };

  const tradersPath = [defaultUnwrapperTraderParam];
  if (paraswapTraderParam) {
    tradersPath.push(paraswapTraderParam);
  }

  return core.liquidatorProxyV4!.connect(core.hhUser5).liquidate(
    solidAccountStruct,
    liquidAccountStruct,
    marketIdsPath,
    MAX_UINT_256_BI,
    MAX_UINT_256_BI,
    tradersPath,
    [],
    expiry,
  );
}

export async function liquidateV4WithLiquidityToken(
  core: CoreProtocol,
  solidAccountStruct: AccountInfoStruct,
  liquidAccountStruct: AccountInfoStruct,
  marketIdsPath: BigNumberish[],
  amountWeisPath: BigNumberish[],
  unwrapper: { address: address },
  unwrapperTradeData: string = BYTES_EMPTY,
  paraswapTraderParam: GenericTraderParamStruct | undefined = NO_PARASWAP_TRADER_PARAM,
  expiry: BigNumberish = NO_EXPIRY,
): Promise<ContractTransaction> {
  const defaultUnwrapperTraderParam: GenericTraderParamStruct = {
    traderType: GenericTraderType.ExternalLiquidity,
    makerAccountIndex: 0,
    trader: unwrapper.address,
    tradeData: unwrapperTradeData,
  };

  const tradersPath = [defaultUnwrapperTraderParam];
  if (paraswapTraderParam) {
    tradersPath.push(paraswapTraderParam);
  }

  return core.liquidatorProxyV4!.connect(core.hhUser5).liquidate(
    solidAccountStruct,
    liquidAccountStruct,
    marketIdsPath,
    MAX_UINT_256_BI,
    MAX_UINT_256_BI,
    tradersPath,
    [],
    expiry,
  );
}

export async function liquidateV4WithZap(
  core: CoreProtocol,
  solidAccountStruct: AccountInfoStruct,
  liquidAccountStruct: AccountInfoStruct,
  zapOutputs: ZapOutputParam[],
  expiry: BigNumberish = NO_EXPIRY,
): Promise<ContractTransaction> {
  let latestError = new Error('No zap output found');
  for (let i = 0; i < zapOutputs.length; i++) {
    const zapOutput = zapOutputs[i];
    try {
      return await core.liquidatorProxyV4!.connect(core.hhUser5).liquidate(
        solidAccountStruct,
        liquidAccountStruct,
        zapOutput.marketIdsPath.map(marketId => marketId.toString()),
        MAX_UINT_256_BI,
        MAX_UINT_256_BI,
        zapOutput.traderParams,
        zapOutput.makerAccounts,
        expiry,
      );
    } catch (e) {
      console.warn(`Failed to liquidate with zap at index ${i}. Trying next zap output...`, e);
      latestError = e as Error;
    }
  }

  return Promise.reject(latestError);
}

export async function checkForParaswapSuccess(
  contractTransactionPromise: Promise<ContractTransaction>,
): Promise<boolean> {
  try {
    const txResult = await contractTransactionPromise;
    const receipt = await txResult.wait();
    console.log('\t#liquidate gas used:', receipt.gasUsed.toString());
    return true;
  } catch (e) {
    await expectThrow(
      contractTransactionPromise,
      'ParaswapAggregatorTrader: External call failed',
    );
    console.warn(
      '\tParaswap call failed. This can happen when mixing a mainnet data with the test environment. Skipping the rest of the test',
    );
    return false;
  }
}

export enum ParaswapSwapSelector {
  Mega = '0x46c67b6d',
  Multi = '0xa94e78ef',
  Simple = '0x54e3f31b',
}

export enum ParaswapSwapType {
  Mega = 'megaSwap',
  Multi = 'multiSwap',
  Simple = 'simpleSwap',
}

export function swapTypeToSelector(swapType: ParaswapSwapType): ParaswapSwapSelector {
  switch (swapType) {
    case ParaswapSwapType.Mega:
      return ParaswapSwapSelector.Mega;
    case ParaswapSwapType.Multi:
      return ParaswapSwapSelector.Multi;
    case ParaswapSwapType.Simple:
      return ParaswapSwapSelector.Simple;
    default:
      throw new Error(`Unknown swap type ${swapType}`);
  }
}

const allSwapTypes: ParaswapSwapType[] = [
  ParaswapSwapType.Mega,
  ParaswapSwapType.Multi,
  ParaswapSwapType.Simple,
];

export async function getCalldataForParaswap(
  inputAmount: BigNumber,
  inputToken: { address: address },
  inputDecimals: number,
  minOutputAmount: BigNumber,
  outputToken: { address: address },
  outputDecimals: number,
  txOrigin: { address: address },
  receiver: { address: address },
  core: CoreProtocol,
  swapTypes: ParaswapSwapType[] = allSwapTypes,
): Promise<{ calldata: string, outputAmount: BigNumber }> {
  if (swapTypes.length === 0) {
    return Promise.reject(new Error('swapTypes is empty'));
  }
  const priceRouteResponse = await axios.get(`${API_URL}/prices`, {
    params: {
      network: core.config.network,
      srcToken: inputToken.address,
      srcDecimals: inputDecimals,
      destToken: outputToken.address,
      destDecimals: outputDecimals,
      amount: inputAmount.toString(),
      includeContractMethods: swapTypes.join(','),
    },
  })
    .then(response => response.data)
    .catch((error) => {
      console.error('Found error in prices', error);
      throw error;
    });

  const queryParams = new URLSearchParams({
    ignoreChecks: 'true',
    ignoreGasEstimate: 'true',
    onlyParams: 'false',
  }).toString();
  const result = await axios.post(`${API_URL}/transactions/${core.config.network}?${queryParams}`, {
    priceRoute: priceRouteResponse?.priceRoute,
    txOrigin: txOrigin.address,
    srcToken: inputToken.address,
    srcDecimals: inputDecimals,
    destToken: outputToken.address,
    destDecimals: outputDecimals,
    srcAmount: inputAmount.toString(),
    destAmount: minOutputAmount.toString(),
    userAddress: receiver.address,
    receiver: receiver.address,
    deadline: 9999999999,
    partnerAddress: core.governance.address,
    partnerFeeBps: '0',
    positiveSlippageToUser: false,
  })
    .then(response => response.data)
    .catch((error) => {
      console.error('Found error in transactions', error);
      throw error;
    });

  return {
    calldata: result.data,
    outputAmount: BigNumber.from(BigNumber.from(priceRouteResponse.priceRoute.destAmount)),
  };
}
