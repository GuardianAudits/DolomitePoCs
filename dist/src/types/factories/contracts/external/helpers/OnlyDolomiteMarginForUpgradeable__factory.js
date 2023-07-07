"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlyDolomiteMarginForUpgradeable__factory = void 0;
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
];
class OnlyDolomiteMarginForUpgradeable__factory {
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.OnlyDolomiteMarginForUpgradeable__factory = OnlyDolomiteMarginForUpgradeable__factory;
OnlyDolomiteMarginForUpgradeable__factory.abi = _abi;
