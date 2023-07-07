"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsolationModeUnwrapperTraderV1__factory = void 0;
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [],
        name: "DOLOMITE_MARGIN",
        outputs: [
            {
                internalType: "contract IDolomiteMargin",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "VAULT_FACTORY",
        outputs: [
            {
                internalType: "contract IIsolationModeVaultFactory",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "actionsLength",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_sender",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "owner",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "number",
                        type: "uint256",
                    },
                ],
                internalType: "struct IDolomiteStructs.AccountInfo",
                name: "_accountInfo",
                type: "tuple",
            },
            {
                internalType: "bytes",
                name: "_data",
                type: "bytes",
            },
        ],
        name: "callFunction",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_solidAccountId",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_liquidAccountId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_inputMarket",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_inputAmount",
                type: "uint256",
            },
        ],
        name: "createActionsForUnwrappingForLiquidation",
        outputs: [
            {
                components: [
                    {
                        internalType: "enum IDolomiteStructs.ActionType",
                        name: "actionType",
                        type: "uint8",
                    },
                    {
                        internalType: "uint256",
                        name: "accountId",
                        type: "uint256",
                    },
                    {
                        components: [
                            {
                                internalType: "bool",
                                name: "sign",
                                type: "bool",
                            },
                            {
                                internalType: "enum IDolomiteStructs.AssetDenomination",
                                name: "denomination",
                                type: "uint8",
                            },
                            {
                                internalType: "enum IDolomiteStructs.AssetReference",
                                name: "ref",
                                type: "uint8",
                            },
                            {
                                internalType: "uint256",
                                name: "value",
                                type: "uint256",
                            },
                        ],
                        internalType: "struct IDolomiteStructs.AssetAmount",
                        name: "amount",
                        type: "tuple",
                    },
                    {
                        internalType: "uint256",
                        name: "primaryMarketId",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "secondaryMarketId",
                        type: "uint256",
                    },
                    {
                        internalType: "address",
                        name: "otherAddress",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "otherAccountId",
                        type: "uint256",
                    },
                    {
                        internalType: "bytes",
                        name: "data",
                        type: "bytes",
                    },
                ],
                internalType: "struct IDolomiteStructs.ActionArgs[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_tradeOriginator",
                type: "address",
            },
            {
                internalType: "address",
                name: "_receiver",
                type: "address",
            },
            {
                internalType: "address",
                name: "_outputToken",
                type: "address",
            },
            {
                internalType: "address",
                name: "_inputToken",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_inputAmount",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "_orderData",
                type: "bytes",
            },
        ],
        name: "exchange",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_inputToken",
                type: "address",
            },
            {
                internalType: "address",
                name: "_outputToken",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_desiredInputAmount",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "_orderData",
                type: "bytes",
            },
        ],
        name: "getExchangeCost",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "outputMarketId",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "token",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
class IsolationModeUnwrapperTraderV1__factory {
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.IsolationModeUnwrapperTraderV1__factory = IsolationModeUnwrapperTraderV1__factory;
IsolationModeUnwrapperTraderV1__factory.abi = _abi;
