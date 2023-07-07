"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDolomiteMarginAdmin__factory = void 0;
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "contract IDolomitePriceOracle",
                name: "priceOracle",
                type: "address",
            },
            {
                internalType: "contract IDolomiteInterestSetter",
                name: "interestSetter",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "value",
                        type: "uint256",
                    },
                ],
                internalType: "struct IDolomiteStructs.Decimal",
                name: "marginPremium",
                type: "tuple",
            },
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "value",
                        type: "uint256",
                    },
                ],
                internalType: "struct IDolomiteStructs.Decimal",
                name: "spreadPremium",
                type: "tuple",
            },
            {
                internalType: "uint256",
                name: "maxWei",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "isClosing",
                type: "bool",
            },
            {
                internalType: "bool",
                name: "isRecyclable",
                type: "bool",
            },
        ],
        name: "ownerAddMarket",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256[]",
                name: "marketIds",
                type: "uint256[]",
            },
            {
                internalType: "address",
                name: "salvager",
                type: "address",
            },
        ],
        name: "ownerRemoveMarkets",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "accountMaxNumberOfMarketsWithBalances",
                type: "uint256",
            },
        ],
        name: "ownerSetAccountMaxNumberOfMarketsWithBalances",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "autoTrader",
                type: "address",
            },
            {
                internalType: "bool",
                name: "special",
                type: "bool",
            },
        ],
        name: "ownerSetAutoTraderSpecial",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "value",
                        type: "uint256",
                    },
                ],
                internalType: "struct IDolomiteStructs.Decimal",
                name: "earningsRate",
                type: "tuple",
            },
        ],
        name: "ownerSetEarningsRate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                internalType: "bool",
                name: "approved",
                type: "bool",
            },
        ],
        name: "ownerSetGlobalOperator",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "marketId",
                type: "uint256",
            },
            {
                internalType: "contract IDolomiteInterestSetter",
                name: "interestSetter",
                type: "address",
            },
        ],
        name: "ownerSetInterestSetter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "marketId",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "isClosing",
                type: "bool",
            },
        ],
        name: "ownerSetIsClosing",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "value",
                        type: "uint256",
                    },
                ],
                internalType: "struct IDolomiteStructs.Decimal",
                name: "spread",
                type: "tuple",
            },
        ],
        name: "ownerSetLiquidationSpread",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "marketId",
                type: "uint256",
            },
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "value",
                        type: "uint256",
                    },
                ],
                internalType: "struct IDolomiteStructs.Decimal",
                name: "marginPremium",
                type: "tuple",
            },
        ],
        name: "ownerSetMarginPremium",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "value",
                        type: "uint256",
                    },
                ],
                internalType: "struct IDolomiteStructs.Decimal",
                name: "ratio",
                type: "tuple",
            },
        ],
        name: "ownerSetMarginRatio",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "marketId",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "maxWei",
                type: "uint256",
            },
        ],
        name: "ownerSetMaxWei",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "value",
                        type: "uint256",
                    },
                ],
                internalType: "struct IDolomiteStructs.MonetaryValue",
                name: "minBorrowedValue",
                type: "tuple",
            },
        ],
        name: "ownerSetMinBorrowedValue",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "marketId",
                type: "uint256",
            },
            {
                internalType: "contract IDolomitePriceOracle",
                name: "priceOracle",
                type: "address",
            },
        ],
        name: "ownerSetPriceOracle",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "marketId",
                type: "uint256",
            },
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "value",
                        type: "uint256",
                    },
                ],
                internalType: "struct IDolomiteStructs.Decimal",
                name: "spreadPremium",
                type: "tuple",
            },
        ],
        name: "ownerSetSpreadPremium",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "marketId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
        ],
        name: "ownerWithdrawExcessTokens",
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
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
        ],
        name: "ownerWithdrawUnsupportedTokens",
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
];
class IDolomiteMarginAdmin__factory {
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.IDolomiteMarginAdmin__factory = IDolomiteMarginAdmin__factory;
IDolomiteMarginAdmin__factory.abi = _abi;
