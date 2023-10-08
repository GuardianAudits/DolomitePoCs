import { BalanceCheckFlag } from '@dolomite-margin/dist/src';
import { GenericTraderType } from '@dolomite-margin/dist/src/modules/GenericTraderProxyV1';
import { ZERO_ADDRESS } from '@openzeppelin/upgrades/lib/utils/Addresses';
import { BigNumber, BigNumberish, Contract, ethers } from 'ethers';
import {
  GLPIsolationModeTokenVaultV1,
  GLPIsolationModeTokenVaultV1__factory,
  GLPIsolationModeUnwrapperTraderV1,
  GLPIsolationModeUnwrapperTraderV1__factory,
  GLPIsolationModeUnwrapperTraderV2,
  GLPIsolationModeUnwrapperTraderV2__factory,
  GLPIsolationModeVaultFactory,
  GLPIsolationModeVaultFactory__factory,
  GLPIsolationModeWrapperTraderV1,
  GLPIsolationModeWrapperTraderV1__factory,
  GLPIsolationModeWrapperTraderV2,
  GLPIsolationModeWrapperTraderV2__factory,
  GLPPriceOracleV1,
  GLPPriceOracleV1__factory,
  GmxRegistryV1,
  GmxRegistryV1__factory,
  GmxRegistryV2,
  GmxRegistryV2__factory,
  GmxV2IsolationModeTokenVaultV1,
  GmxV2IsolationModeUnwrapperTraderV2,
  GmxV2IsolationModeUnwrapperTraderV2__factory,
  GmxV2IsolationModeVaultFactory,
  GmxV2IsolationModeWrapperTraderV2,
  GmxV2IsolationModeWrapperTraderV2__factory,
  GmxV2Library,
  GmxV2Library__factory,
  GmxV2MarketTokenPriceOracle,
  GmxV2MarketTokenPriceOracle__factory,
  IGLPIsolationModeVaultFactory,
  IGLPIsolationModeVaultFactoryOld,
  IGmxMarketToken,
  IGmxRegistryV1,
  IGmxRegistryV2,
  IGmxV2IsolationModeVaultFactory,
  IsolationModeTraderProxy,
  IsolationModeTraderProxy__factory,
  RegistryProxy,
  RegistryProxy__factory,
  TestGmxV2IsolationModeTokenVaultV1,
  TestGmxV2IsolationModeVaultFactory,
  TestGmxV2IsolationModeVaultFactory__factory,
} from '../../../src/types';
import {
  getGLPIsolationModeVaultFactoryConstructorParams,
  getGLPPriceOracleV1ConstructorParams,
  getGLPUnwrapperTraderV1ConstructorParams,
  getGLPUnwrapperTraderV2ConstructorParams,
  getGLPWrapperTraderV1ConstructorParams,
  getGLPWrapperTraderV2ConstructorParams,
  getGmxRegistryConstructorParams,
  getGmxRegistryV2ConstructorParams,
  getGmxV2IsolationModeUnwrapperTraderV2ConstructorParams,
  getGmxV2IsolationModeVaultFactoryConstructorParams,
  getGmxV2IsolationModeWrapperTraderV2ConstructorParams,
  getGmxV2MarketTokenPriceOracleConstructorParams,
  GmxUserVaultImplementation,
} from '../../../src/utils/constructors/gmx';
import { createContract, createContractWithAbi, createContractWithLibrary } from '../../../src/utils/dolomite-utils';
import { CoreProtocol } from '../setup';

export async function createGLPPriceOracleV1(
  dfsGlp: IGLPIsolationModeVaultFactory | GLPIsolationModeVaultFactory,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
): Promise<GLPPriceOracleV1> {
  return createContractWithAbi<GLPPriceOracleV1>(
    GLPPriceOracleV1__factory.abi,
    GLPPriceOracleV1__factory.bytecode,
    getGLPPriceOracleV1ConstructorParams(dfsGlp, gmxRegistry),
  );
}

export async function createGLPUnwrapperTraderV1(
  core: CoreProtocol,
  dfsGlp: IGLPIsolationModeVaultFactory | GLPIsolationModeVaultFactory,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
): Promise<GLPIsolationModeUnwrapperTraderV1> {
  return createContractWithAbi<GLPIsolationModeUnwrapperTraderV1>(
    GLPIsolationModeUnwrapperTraderV1__factory.abi,
    GLPIsolationModeUnwrapperTraderV1__factory.bytecode,
    getGLPUnwrapperTraderV1ConstructorParams(core, dfsGlp, gmxRegistry),
  );
}

export async function createGLPUnwrapperTraderV2(
  core: CoreProtocol,
  dfsGlp: IGLPIsolationModeVaultFactory | GLPIsolationModeVaultFactory | IGLPIsolationModeVaultFactoryOld,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
): Promise<GLPIsolationModeUnwrapperTraderV2> {
  return createContractWithAbi<GLPIsolationModeUnwrapperTraderV2>(
    GLPIsolationModeUnwrapperTraderV2__factory.abi,
    GLPIsolationModeUnwrapperTraderV2__factory.bytecode,
    getGLPUnwrapperTraderV2ConstructorParams(core, dfsGlp, gmxRegistry),
  );
}

export async function createGLPIsolationModeTokenVaultV1(): Promise<GLPIsolationModeTokenVaultV1> {
  return createContractWithAbi<GLPIsolationModeTokenVaultV1>(
    GLPIsolationModeTokenVaultV1__factory.abi,
    GLPIsolationModeTokenVaultV1__factory.bytecode,
    [],
  );
}

export async function createGLPIsolationModeVaultFactory(
  core: CoreProtocol,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
  userVaultImplementation: GmxUserVaultImplementation,
): Promise<GLPIsolationModeVaultFactory> {
  return createContractWithAbi<GLPIsolationModeVaultFactory>(
    GLPIsolationModeVaultFactory__factory.abi,
    GLPIsolationModeVaultFactory__factory.bytecode,
    getGLPIsolationModeVaultFactoryConstructorParams(core, gmxRegistry, userVaultImplementation),
  );
}

export async function createGLPWrapperTraderV1(
  core: CoreProtocol,
  dfsGlp: IGLPIsolationModeVaultFactory | GLPIsolationModeVaultFactory,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
): Promise<GLPIsolationModeWrapperTraderV1> {
  return createContractWithAbi<GLPIsolationModeWrapperTraderV1>(
    GLPIsolationModeWrapperTraderV1__factory.abi,
    GLPIsolationModeWrapperTraderV1__factory.bytecode,
    getGLPWrapperTraderV1ConstructorParams(core, dfsGlp, gmxRegistry),
  );
}

export async function createGLPWrapperTraderV2(
  core: CoreProtocol,
  dfsGlp: IGLPIsolationModeVaultFactory | GLPIsolationModeVaultFactory | IGLPIsolationModeVaultFactoryOld,
  gmxRegistry: IGmxRegistryV1 | GmxRegistryV1,
): Promise<GLPIsolationModeWrapperTraderV2> {
  return createContractWithAbi<GLPIsolationModeWrapperTraderV2>(
    GLPIsolationModeWrapperTraderV2__factory.abi,
    GLPIsolationModeWrapperTraderV2__factory.bytecode,
    getGLPWrapperTraderV2ConstructorParams(core, dfsGlp, gmxRegistry),
  );
}

export async function createGmxRegistry(core: CoreProtocol): Promise<GmxRegistryV1> {
  const implementation = await createContractWithAbi<GmxRegistryV1>(
    GmxRegistryV1__factory.abi,
    GmxRegistryV1__factory.bytecode,
    [],
  );
  const proxy = await createContractWithAbi<RegistryProxy>(
    RegistryProxy__factory.abi,
    RegistryProxy__factory.bytecode,
    await getGmxRegistryConstructorParams(implementation, core),
  );
  return GmxRegistryV1__factory.connect(proxy.address, core.hhUser1);
}

export async function createGmxRegistryV2(core: CoreProtocol): Promise<GmxRegistryV2> {
  const implementation = await createContractWithAbi<GmxRegistryV2>(
    GmxRegistryV2__factory.abi,
    GmxRegistryV2__factory.bytecode,
    [],
  );
  const proxy = await createContractWithAbi<RegistryProxy>(
    RegistryProxy__factory.abi,
    RegistryProxy__factory.bytecode,
    await getGmxRegistryV2ConstructorParams(core, implementation),
  );
  return GmxRegistryV2__factory.connect(proxy.address, core.hhUser1);
}

export async function createGmxV2Library(): Promise<GmxV2Library> {
  return createContractWithAbi<GmxV2Library>(
    GmxV2Library__factory.abi,
    GmxV2Library__factory.bytecode,
    [],
  );
}

export async function createGmxV2IsolationModeTokenVaultV1(
  core: CoreProtocol,
  library: GmxV2Library,
): Promise<GmxV2IsolationModeTokenVaultV1> {
  return createContractWithLibrary<GmxV2IsolationModeTokenVaultV1>(
    'GmxV2IsolationModeTokenVaultV1',
    { GmxV2Library: library.address },
    [core.tokens.weth.address],
  );
}

export async function createTestGmxV2IsolationModeTokenVaultV1(
  core: CoreProtocol,
  library: GmxV2Library,
): Promise<TestGmxV2IsolationModeTokenVaultV1> {
  return createContractWithLibrary<TestGmxV2IsolationModeTokenVaultV1>(
    'TestGmxV2IsolationModeTokenVaultV1',
    { GmxV2Library: library.address },
    [core.tokens.weth.address],
  );
}

export async function createGmxV2IsolationModeVaultFactory(
  core: CoreProtocol,
  expirationLibrary: Contract,
  gmxRegistry: IGmxRegistryV2,
  debtMarketIds: BigNumberish[],
  collateralMarketIds: BigNumberish[],
  gmToken: IGmxMarketToken,
  userVaultImplementation: GmxV2IsolationModeTokenVaultV1,
): Promise<GmxV2IsolationModeVaultFactory> {
  return createContract<GmxV2IsolationModeVaultFactory>(
    'GmxV2IsolationModeVaultFactory',
    getGmxV2IsolationModeVaultFactoryConstructorParams(
      core,
      gmxRegistry,
      debtMarketIds,
      collateralMarketIds,
      gmToken,
      userVaultImplementation,
    ),
  );
}

export async function createTestGmxV2IsolationModeVaultFactory(
  core: CoreProtocol,
  gmxRegistry: IGmxRegistryV2,
  debtMarketIds: BigNumberish[],
  collateralMarketIds: BigNumberish[],
  gmToken: IGmxMarketToken,
  userVaultImplementation: GmxV2IsolationModeTokenVaultV1,
): Promise<TestGmxV2IsolationModeVaultFactory> {
  return createContractWithAbi<TestGmxV2IsolationModeVaultFactory>(
    TestGmxV2IsolationModeVaultFactory__factory.abi,
    TestGmxV2IsolationModeVaultFactory__factory.bytecode,
    getGmxV2IsolationModeVaultFactoryConstructorParams(
      core,
      gmxRegistry,
      debtMarketIds,
      collateralMarketIds,
      gmToken,
      userVaultImplementation,
    ),
  );
}

export async function createGmxV2IsolationModeUnwrapperTraderV2(
  core: CoreProtocol,
  dGM: IGmxV2IsolationModeVaultFactory | GmxV2IsolationModeVaultFactory,
  library: GmxV2Library,
  gmxRegistryV2: IGmxRegistryV2 | GmxRegistryV2,
  callbackGasLimit: BigNumberish,
): Promise<GmxV2IsolationModeUnwrapperTraderV2> {
  const implementation = await createContractWithLibrary<GmxV2IsolationModeUnwrapperTraderV2>(
    'GmxV2IsolationModeUnwrapperTraderV2',
    { GmxV2Library: library.address },
    [],
  );

  const proxy = await createContractWithAbi<IsolationModeTraderProxy>(
    IsolationModeTraderProxy__factory.abi,
    IsolationModeTraderProxy__factory.bytecode,
    await getGmxV2IsolationModeUnwrapperTraderV2ConstructorParams(
      core,
      implementation,
      dGM,
      gmxRegistryV2,
      callbackGasLimit,
    ),
  );

  return GmxV2IsolationModeUnwrapperTraderV2__factory.connect(proxy.address, core.hhUser1);
}

export async function createGmxV2IsolationModeWrapperTraderV2(
  core: CoreProtocol,
  dGM: IGmxV2IsolationModeVaultFactory | GmxV2IsolationModeVaultFactory,
  library: GmxV2Library,
  gmxRegistryV2: IGmxRegistryV2 | GmxRegistryV2,
  callbackGasLimit: BigNumberish,
): Promise<GmxV2IsolationModeWrapperTraderV2> {
  const implementation = await createContractWithLibrary<GmxV2IsolationModeWrapperTraderV2>(
    'GmxV2IsolationModeWrapperTraderV2',
    { GmxV2Library: library.address },
    [],
  );
  const proxy = await createContractWithAbi<IsolationModeTraderProxy>(
    IsolationModeTraderProxy__factory.abi,
    IsolationModeTraderProxy__factory.bytecode,
    await getGmxV2IsolationModeWrapperTraderV2ConstructorParams(
      core,
      implementation,
      dGM,
      gmxRegistryV2,
      callbackGasLimit,
    ),
  );
  return GmxV2IsolationModeWrapperTraderV2__factory.connect(proxy.address, core.hhUser1);
}

export async function createGmxV2MarketTokenPriceOracle(
  core: CoreProtocol,
  gmxRegistryV2: IGmxRegistryV2 | GmxRegistryV2,
): Promise<GmxV2MarketTokenPriceOracle> {
  return createContractWithAbi(
    GmxV2MarketTokenPriceOracle__factory.abi,
    GmxV2MarketTokenPriceOracle__factory.bytecode,
    getGmxV2MarketTokenPriceOracleConstructorParams(core, gmxRegistryV2),
  );
}

export function getInitiateWrappingParams(
  accountNumber: BigNumberish,
  marketId1: BigNumberish,
  amountIn: BigNumberish,
  marketId2: BigNumberish,
  minAmountOut: BigNumberish,
  wrapper: GmxV2IsolationModeWrapperTraderV2,
  executionFee: BigNumberish,
): any {
  return {
    amountIn,
    minAmountOut,
    marketPath: [marketId1, marketId2],
    traderParams: [
      {
        trader: wrapper.address,
        traderType: GenericTraderType.IsolationModeWrapper,
        tradeData: ethers.utils.defaultAbiCoder.encode(['uint256', 'uint256'], [accountNumber, executionFee]),
        makerAccountIndex: 0,
      },
    ],
    makerAccounts: [],
    userConfig: { deadline: '123123123123123', balanceCheckFlag: BalanceCheckFlag.None },
  };
}

export function getInitiateUnwrappingParams(
  accountNumber: BigNumberish,
  marketId1: BigNumberish,
  amountIn: BigNumberish,
  marketId2: BigNumberish,
  minAmountOut: BigNumberish,
  unwrapper: GmxV2IsolationModeUnwrapperTraderV2,
  executionFee: BigNumberish,
): any {
  return {
    amountIn,
    minAmountOut,
    marketPath: [marketId1, marketId2],
    traderParams: [
      {
        trader: unwrapper.address,
        traderType: GenericTraderType.IsolationModeUnwrapper,
        tradeData: ethers.utils.defaultAbiCoder.encode(['uint256', 'uint256'], [accountNumber, executionFee]),
        makerAccountIndex: 0,
      },
    ],
    makerAccounts: [],
    userConfig: { deadline: '123123123123123', balanceCheckFlag: BalanceCheckFlag.None },
  };
}

export function getOracleParams(token1: string, token2: string) {
  return {
    signerInfo: '1',
    tokens: [],
    compactedMinOracleBlockNumbers: [],
    compactedMaxOracleBlockNumbers: [],
    compactedOracleTimestamps: [],
    compactedDecimals: [],
    compactedMinPrices: [],
    compactedMinPricesIndexes: [],
    compactedMaxPrices: [],
    compactedMaxPricesIndexes: [],
    signatures: [],
    priceFeedTokens: [
      token1,
      token2,
    ],
  };
}

export function getWithdrawalObject(
  unwrapper: string,
  marketToken: string,
  minLongTokenAmount: BigNumber,
  minShortTokenAmount: BigNumber,
  marketTokenAmount: BigNumber,
  executionFee: BigNumber,
  outputToken: string,
  secondaryOutputToken: string,
  outputAmount: BigNumber = BigNumber.from('0'),
  secondaryOutputAmount: BigNumber = BigNumber.from('0'),
  callbackGasLimit: BigNumber = BigNumber.from('1500000'),
) {
  const withdrawal = {
    addresses: {
      account: unwrapper,
      receiver: unwrapper,
      callbackContract: unwrapper,
      uiFeeReceiver: ZERO_ADDRESS,
      market: marketToken,
      longTokenSwapPath: [],
      shortTokenSwapPath: [],
    },
    numbers: {
      marketTokenAmount,
      minLongTokenAmount,
      minShortTokenAmount,
      executionFee,
      callbackGasLimit,
      updatedAtBlock: 123123123,
    },
    flags: {
      shouldUnwrapNativeToken: false,
    },
  };

  let eventData;
  if (outputAmount.eq(0) && secondaryOutputAmount.eq(0)) {
    eventData = {
      addressItems: {
        items: [],
        arrayItems: [],
      },
      uintItems: {
        items: [],
        arrayItems: [],
      },
      intItems: {
        items: [],
        arrayItems: [],
      },
      boolItems: {
        items: [],
        arrayItems: [],
      },
      bytes32Items: {
        items: [],
        arrayItems: [],
      },
      bytesItems: {
        items: [],
        arrayItems: [],
      },
      stringItems: {
        items: [],
        arrayItems: [],
      },
    };
  } else {
    eventData = {
      addressItems: {
        items: [
          {
            key: 'outputToken',
            value: outputToken,
          },
          {
            key: 'secondaryOutputToken',
            value: secondaryOutputToken,
          },
        ],
        arrayItems: [],
      },
      uintItems: {
        items: [
          {
            key: 'outputAmount',
            value: outputAmount,
          },
          {
            key: 'secondaryOutputAmount',
            value: secondaryOutputAmount,
          },
        ],
        arrayItems: [],
      },
      intItems: {
        items: [],
        arrayItems: [],
      },
      boolItems: {
        items: [],
        arrayItems: [],
      },
      bytes32Items: {
        items: [],
        arrayItems: [],
      },
      bytesItems: {
        items: [],
        arrayItems: [],
      },
      stringItems: {
        items: [],
        arrayItems: [],
      },
    };
  }
  return { withdrawal, eventData };
}

export function getDepositObject(
  wrapper: string,
  marketToken: string,
  longToken: string,
  shortToken: string,
  longAmount: BigNumber,
  shortAmount: BigNumber,
  minMarketTokens: BigNumber,
  executionFee: BigNumber,
  receivedMarketToken: BigNumber = BigNumber.from('0'),
  callbackGasLimit: BigNumber = BigNumber.from('1500000'),
) {
  const deposit = {
    addresses: {
      account: wrapper,
      receiver: wrapper,
      callbackContract: wrapper,
      uiFeeReceiver: ZERO_ADDRESS,
      market: marketToken,
      initialLongToken: longToken,
      initialShortToken: shortToken,
      longTokenSwapPath: [],
      shortTokenSwapPath: [],
    },
    numbers: {
      minMarketTokens,
      executionFee,
      callbackGasLimit,
      initialLongTokenAmount: longAmount,
      initialShortTokenAmount: shortAmount,
      updatedAtBlock: 123123123,
    },
    flags: {
      shouldUnwrapNativeToken: false,
    },
  };

  let eventData;
  if (receivedMarketToken.eq(0)) {
    eventData = {
      addressItems: {
        items: [],
        arrayItems: [],
      },
      uintItems: {
        items: [],
        arrayItems: [],
      },
      intItems: {
        items: [],
        arrayItems: [],
      },
      boolItems: {
        items: [],
        arrayItems: [],
      },
      bytes32Items: {
        items: [],
        arrayItems: [],
      },
      bytesItems: {
        items: [],
        arrayItems: [],
      },
      stringItems: {
        items: [],
        arrayItems: [],
      },
    };
  } else {
    eventData = {
      addressItems: {
        items: [],
        arrayItems: [],
      },
      uintItems: {
        items: [
          {
            key: 'receivedMarketTokens',
            value: receivedMarketToken,
          },
        ],
        arrayItems: [],
      },
      intItems: {
        items: [],
        arrayItems: [],
      },
      boolItems: {
        items: [],
        arrayItems: [],
      },
      bytes32Items: {
        items: [],
        arrayItems: [],
      },
      bytesItems: {
        items: [],
        arrayItems: [],
      },
      stringItems: {
        items: [],
        arrayItems: [],
      },
    };
  }
  return { deposit, eventData };
}
