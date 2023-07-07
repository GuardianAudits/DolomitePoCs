"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UmamiAssetVaultPriceOracle__factory = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_dolomiteMargin",
                type: "address",
            },
            {
                internalType: "address",
                name: "_umamiAssetVaultRegistry",
                type: "address",
            },
            {
                internalType: "address",
                name: "_isolationModeVaultToken",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
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
        name: "FEE_PRECISION",
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
        name: "ISOLATION_MODE_TOKEN",
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
        name: "UMAMI_ASSET_VAULT_REGISTRY",
        outputs: [
            {
                internalType: "contract IUmamiAssetVaultRegistry",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "UNDERLYING_MARKET_ID",
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
        inputs: [
            {
                internalType: "address",
                name: "_token",
                type: "address",
            },
        ],
        name: "getPrice",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "value",
                        type: "uint256",
                    },
                ],
                internalType: "struct IDolomiteStructs.MonetaryPrice",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
const _bytecode = "0x6101006040523480156200001257600080fd5b5060405162001578380380620015788339810160408190526200003591620001f8565b6001600160a01b03808416608081905283821660a05290821660c0819052604080516314ed8df360e11b81529051638fae3be192916329db1be6916004808301926020929190829003018186803b1580156200009057600080fd5b505afa158015620000a5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620000cb919062000250565b6001600160a01b03166338d52e0f6040518163ffffffff1660e01b815260040160206040518083038186803b1580156200010457600080fd5b505afa15801562000119573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200013f919062000250565b6040518263ffffffff1660e01b81526004016200015d91906200028e565b60206040518083038186803b1580156200017657600080fd5b505afa1580156200018b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620001b19190620002b2565b60e05250620002d7915050565b60006001600160a01b0382165b92915050565b620001dc81620001be565b8114620001e857600080fd5b50565b8051620001cb81620001d1565b600080600060608486031215620002125762000212600080fd5b6000620002208686620001eb565b93505060206200023386828701620001eb565b92505060406200024686828701620001eb565b9150509250925092565b600060208284031215620002675762000267600080fd5b6000620002758484620001eb565b949350505050565b6200028881620001be565b82525050565b60208101620001cb82846200027d565b80620001dc565b8051620001cb816200029e565b600060208284031215620002c957620002c9600080fd5b6000620002758484620002a5565b60805160a05160c05160e0516112406200033860003960008181607c01526105e201526000818160ed0152818161017a0152610504015260008181610134015261079d01526000818160b90152818161025001526105a601526112406000f3fe608060405234801561001057600080fd5b50600436106100725760003560e01c806341976e091161005057806341976e091461010f57806368f059831461012f578063e63a391f1461015657600080fd5b80630ca5bee21461007757806315c14a4a146100b45780631befc0d8146100e8575b600080fd5b61009e7f000000000000000000000000000000000000000000000000000000000000000081565b6040516100ab9190610ba4565b60405180910390f35b6100db7f000000000000000000000000000000000000000000000000000000000000000081565b6040516100ab9190610bf5565b6100db7f000000000000000000000000000000000000000000000000000000000000000081565b61012261011d366004610c25565b610166565b6040516100ab9190610c5f565b6100db7f000000000000000000000000000000000000000000000000000000000000000081565b61009e68056bc75e2d6310000081565b60408051602081019091526000815261020f7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16147f556d616d6941737365745661756c7450726963654f7261636c650000000000007f496e76616c696420746f6b656e00000000000000000000000000000000000000856103ab565b6040517f8fae3be10000000000000000000000000000000000000000000000000000000081526103909073ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690635ac7d17c908290638fae3be19061028d908890600401610c76565b60206040518083038186803b1580156102a557600080fd5b505afa1580156102b9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102dd9190610c95565b6040518263ffffffff1660e01b81526004016102f99190610ba4565b60206040518083038186803b15801561031157600080fd5b505afa158015610325573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103499190610cc9565b7f556d616d6941737365745661756c7450726963654f7261636c650000000000007f556d616d692041737365742063616e6e6f7420626520626f72726f7761626c656104b0565b60405180602001604052806103a36104ff565b905292915050565b836104aa576103b9836108ee565b7f3a200000000000000000000000000000000000000000000000000000000000006103e3846108ee565b7f203c00000000000000000000000000000000000000000000000000000000000061040d856109bf565b6040516104439594939291907f3e0000000000000000000000000000000000000000000000000000000000000090602001610d88565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152908290527f08c379a00000000000000000000000000000000000000000000000000000000082526104a191600401610e36565b60405180910390fd5b50505050565b826104fa576104be826108ee565b7f3a200000000000000000000000000000000000000000000000000000000000006104e8836108ee565b60405160200161044393929190610e4e565b505050565b6000807f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166329db1be66040518163ffffffff1660e01b815260040160206040518083038186803b15801561056857600080fd5b505afa15801561057c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105a09190610e8a565b905060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16638928378e7f00000000000000000000000000000000000000000000000000000000000000006040518263ffffffff1660e01b815260040161061d9190610ba4565b60206040518083038186803b15801561063557600080fd5b505afa158015610649573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061066d9190610f77565b60000151905060008273ffffffffffffffffffffffffffffffffffffffff166318160ddd6040518163ffffffff1660e01b815260040160206040518083038186803b1580156106bb57600080fd5b505afa1580156106cf573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106f39190610c95565b90506000811561079557818473ffffffffffffffffffffffffffffffffffffffff166301e1d1146040518163ffffffff1660e01b815260040160206040518083038186803b15801561074457600080fd5b505afa158015610758573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061077c9190610c95565b6107869085610fc7565b6107909190611033565b610797565b825b905060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663fda89d6d6040518163ffffffff1660e01b815260040160206040518083038186803b15801561080157600080fd5b505afa158015610815573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610839919061105b565b73ffffffffffffffffffffffffffffffffffffffff166313ee9df46040518163ffffffff1660e01b815260040160a06040518083038186803b15801561087e57600080fd5b505afa158015610892573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108b69190611102565b60400151905068056bc75e2d631000006108d08284610fc7565b6108da9190611033565b6108e49083611123565b9550505050505090565b60606000826040516020016109039190611140565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152919052905060205b80156109a4578061094681611155565b91505081818151811061095b5761095b61118a565b01602001517fff00000000000000000000000000000000000000000000000000000000000000161561099f5760006109948260016111b9565b835250909392505050565b610936565b5060408051600080825260208201909252905b509392505050565b60408051602a808252606082810190935273ffffffffffffffffffffffffffffffffffffffff841691600091602082018180368337019050509050603060f81b81600081518110610a1257610a1261118a565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350607860f81b81600181518110610a5957610a5961118a565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060005b60148110156109b7576000610aa1826002610fc7565b9050610aaf600f8516610b72565b83610abb836029611123565b81518110610acb57610acb61118a565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600484901c9350610b0d600f8516610b72565b83610b19836028611123565b81518110610b2957610b2961118a565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053505060049290921c9180610b6a816111d1565b915050610a8b565b6000600a821015610b9157610b886030836111b9565b60f81b92915050565b610b886057836111b9565b805b82525050565b60208101610bb28284610b9c565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff8216610bb2565b6000610bb282610bb8565b6000610bb282610bd6565b610b9e81610be1565b60208101610bb28284610bec565b610c0c81610bb8565b8114610c1757600080fd5b50565b8035610bb281610c03565b600060208284031215610c3a57610c3a600080fd5b6000610c468484610c1a565b949350505050565b805160208301906104aa8482610b9c565b60208101610bb28284610c4e565b610b9e81610bb8565b60208101610bb28284610c6d565b80610c0c565b8051610bb281610c84565b600060208284031215610caa57610caa600080fd5b6000610c468484610c8a565b801515610c0c565b8051610bb281610cb6565b600060208284031215610cde57610cde600080fd5b6000610c468484610cbe565b60005b83811015610d05578181015183820152602001610ced565b838111156104aa5750506000910152565b6000610d20825190565b610d2e818560208601610cea565b9290920192915050565b7fffff0000000000000000000000000000000000000000000000000000000000008116610b9e565b7fff000000000000000000000000000000000000000000000000000000000000008116610b9e565b6000610d948289610d16565b9150610da08288610d38565b600282019150610db08287610d16565b9150610dbc8286610d38565b600282019150610dcc8285610d16565b9150610dd88284610d60565b506001019695505050505050565b6000610df0825190565b808452602084019350610e07818560208601610cea565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920192915050565b60208082528101610e478184610de6565b9392505050565b6000610e5a8286610d16565b9150610e668285610d38565b600282019150610e768284610d16565b95945050505050565b8051610bb281610c03565b600060208284031215610e9f57610e9f600080fd5b6000610c468484610e7f565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f830116810181811067ffffffffffffffff82111715610f1e57610f1e610eab565b6040525050565b6000610f3060405190565b9050610f3c8282610eda565b919050565b600060208284031215610f5657610f56600080fd5b610f606020610f25565b90506000610f6e8484610c8a565b82525092915050565b600060208284031215610f8c57610f8c600080fd5b6000610c468484610f41565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615610fff57610fff610f98565b500290565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b60008261104257611042611004565b500490565b610c0c81610bd6565b8051610bb281611047565b60006020828403121561107057611070600080fd5b6000610c468484611050565b600060a0828403121561109157611091600080fd5b61109b60a0610f25565b905060006110a98484610c8a565b82525060206110ba84848301610c8a565b60208301525060406110ce84828501610c8a565b60408301525060606110e284828501610c8a565b60608301525060806110f684828501610c8a565b60808301525092915050565b600060a0828403121561111757611117600080fd5b6000610c46848461107c565b60008282101561113557611135610f98565b500390565b80610b9e565b600061114c828461113a565b50602001919050565b60008161116457611164610f98565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600082198211156111cc576111cc610f98565b500190565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82141561120357611203610f98565b506001019056fea2646970667358221220d5c18a5b4057bceb4194d8e3a4b09173a5b0eb0e39e025375d5cf70b3e71926964736f6c63430008090033";
const isSuperArgs = (xs) => xs.length > 1;
class UmamiAssetVaultPriceOracle__factory extends ethers_1.ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(_dolomiteMargin, _umamiAssetVaultRegistry, _isolationModeVaultToken, overrides) {
        return super.deploy(_dolomiteMargin, _umamiAssetVaultRegistry, _isolationModeVaultToken, overrides || {});
    }
    getDeployTransaction(_dolomiteMargin, _umamiAssetVaultRegistry, _isolationModeVaultToken, overrides) {
        return super.getDeployTransaction(_dolomiteMargin, _umamiAssetVaultRegistry, _isolationModeVaultToken, overrides || {});
    }
    attach(address) {
        return super.attach(address);
    }
    connect(signer) {
        return super.connect(signer);
    }
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.UmamiAssetVaultPriceOracle__factory = UmamiAssetVaultPriceOracle__factory;
UmamiAssetVaultPriceOracle__factory.bytecode = _bytecode;
UmamiAssetVaultPriceOracle__factory.abi = _abi;
