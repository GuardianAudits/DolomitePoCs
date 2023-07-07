"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendlePtGLP2024Registry__factory = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_pendleRouter",
                type: "address",
            },
            {
                internalType: "address",
                name: "_ptGlpMarket",
                type: "address",
            },
            {
                internalType: "address",
                name: "_ptGlpToken",
                type: "address",
            },
            {
                internalType: "address",
                name: "_ptOracle",
                type: "address",
            },
            {
                internalType: "address",
                name: "_syGlpToken",
                type: "address",
            },
            {
                internalType: "address",
                name: "_dolomiteMargin",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_pendleRouter",
                type: "address",
            },
        ],
        name: "PendleRouterSet",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_ptGlpMarket",
                type: "address",
            },
        ],
        name: "PtGlpMarketSet",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_ptGlpToken",
                type: "address",
            },
        ],
        name: "PtGlpTokenSet",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_ptOracle",
                type: "address",
            },
        ],
        name: "PtOracleSet",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_syGlpToken",
                type: "address",
            },
        ],
        name: "SyGlpTokenSet",
        type: "event",
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
        inputs: [
            {
                internalType: "address",
                name: "_pendleRouter",
                type: "address",
            },
        ],
        name: "ownerSetPendleRouter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_ptGlpMarket",
                type: "address",
            },
        ],
        name: "ownerSetPtGlpMarket",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_ptGlpToken",
                type: "address",
            },
        ],
        name: "ownerSetPtGlpToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_ptOracle",
                type: "address",
            },
        ],
        name: "ownerSetPtOracle",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_syGlpToken",
                type: "address",
            },
        ],
        name: "ownerSetSyGlpToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "pendleRouter",
        outputs: [
            {
                internalType: "contract IPendleRouter",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "ptGlpMarket",
        outputs: [
            {
                internalType: "contract IPendlePtMarket",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "ptGlpToken",
        outputs: [
            {
                internalType: "contract IPendlePtToken",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "ptOracle",
        outputs: [
            {
                internalType: "contract IPendlePtOracle",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "syGlpToken",
        outputs: [
            {
                internalType: "contract IPendleSyToken",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
const _bytecode = "0x60a06040523480156200001157600080fd5b506040516200119e3803806200119e8339810160408190526200003491620000d6565b6001600160a01b03908116608052600080546001600160a01b031990811697831697909717905560018054871695821695909517909455600280548616938516939093179092556003805485169184169190911790556004805490931691161790556200016e565b60006001600160a01b0382165b92915050565b620000ba816200009c565b8114620000c657600080fd5b50565b8051620000a981620000af565b60008060008060008060c08789031215620000f457620000f4600080fd5b6000620001028989620000c9565b96505060206200011589828a01620000c9565b95505060406200012889828a01620000c9565b94505060606200013b89828a01620000c9565b93505060806200014e89828a01620000c9565b92505060a06200016189828a01620000c9565b9150509295509295509295565b608051610ff1620001ad6000396000818161010601528181610211015281816103fb015281816104f8015281816105f501526106f20152610ff16000f3fe608060405234801561001057600080fd5b50600436106100c95760003560e01c806353bbf7b211610081578063858a52821161005b578063858a5282146101c5578063946ac112146101d8578063e3383359146101eb57600080fd5b806353bbf7b2146101725780635ac672d5146101925780636b1cd10d146101a557600080fd5b8063206aeab3116100b2578063206aeab31461012a578063284069d11461014a578063482b39581461015f57600080fd5b806305d7b9a2146100ce57806315c14a4a14610104575b600080fd5b6003546100ee9073ffffffffffffffffffffffffffffffffffffffff1681565b6040516100fb9190610c30565b60405180910390f35b7f00000000000000000000000000000000000000000000000000000000000000006100ee565b6000546100ee9073ffffffffffffffffffffffffffffffffffffffff1681565b61015d610158366004610c7e565b61020b565b005b61015d61016d366004610c7e565b6103f5565b6004546100ee9073ffffffffffffffffffffffffffffffffffffffff1681565b61015d6101a0366004610c7e565b6104f2565b6002546100ee9073ffffffffffffffffffffffffffffffffffffffff1681565b61015d6101d3366004610c7e565b6105ef565b61015d6101e6366004610c7e565b6106ec565b6001546100ee9073ffffffffffffffffffffffffffffffffffffffff1681565b336103247f00000000000000000000000000000000000000000000000000000000000000005b73ffffffffffffffffffffffffffffffffffffffff16638da5cb5b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561027657600080fd5b505afa15801561028a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102ae9190610cb2565b73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16147f4f6e6c79446f6c6f6d6974654d617267696e00000000000000000000000000007f43616c6c6572206973206e6f74206f776e6572206f6620446f6c6f6d69746500846107e9565b61038773ffffffffffffffffffffffffffffffffffffffff831615157f50656e646c655074474c503230323452656769737472790000000000000000007f496e76616c69642070656e646c65526f757465722061646472657373000000006108ee565b600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff8416908117825560405190917f798bff728a8604b46861325532762713653e616ef7c9020c3e1464e6491e96d391a25050565b3361041f7f0000000000000000000000000000000000000000000000000000000000000000610231565b61048273ffffffffffffffffffffffffffffffffffffffff831615157f50656e646c655074474c503230323452656769737472790000000000000000007f496e76616c6964207074476c70546f6b656e20616464726573730000000000006108ee565b600280547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff84169081179091556040517f18d41d783728093aa71ad1a0236e403fa4cd0b0197ab7353737a2653e8f8502490600090a25050565b3361051c7f0000000000000000000000000000000000000000000000000000000000000000610231565b61057f73ffffffffffffffffffffffffffffffffffffffff831615157f50656e646c655074474c503230323452656769737472790000000000000000007f496e76616c6964207379476c70546f6b656e20616464726573730000000000006108ee565b600480547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff84169081179091556040517fd7b132de958e9f84527df7c5f6157c7056b5c918641811a2e26898b6886c009890600090a25050565b336106197f0000000000000000000000000000000000000000000000000000000000000000610231565b61067c73ffffffffffffffffffffffffffffffffffffffff831615157f50656e646c655074474c503230323452656769737472790000000000000000007f496e76616c6964207074476c704d61726b6574206164647265737300000000006108ee565b600180547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff84169081179091556040517f8fdeadd2ce4d22bd818a122626863a50d86a0014e7fdb29aad2be570f3fed1d890600090a25050565b336107167f0000000000000000000000000000000000000000000000000000000000000000610231565b61077973ffffffffffffffffffffffffffffffffffffffff831615157f50656e646c655074474c503230323452656769737472790000000000000000007f496e76616c69642070744f7261636c65206164647265737300000000000000006108ee565b600380547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff84169081179091556040517fb947142a0a0af0722317bc4713e88ccade91e862bd34eef98cc821ab55cef3e290600090a25050565b836108e8576107f78361093d565b7f3a200000000000000000000000000000000000000000000000000000000000006108218461093d565b7f203c00000000000000000000000000000000000000000000000000000000000061084b85610a0e565b6040516108819594939291907f3e0000000000000000000000000000000000000000000000000000000000000090602001610d71565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152908290527f08c379a00000000000000000000000000000000000000000000000000000000082526108df91600401610e1f565b60405180910390fd5b50505050565b82610938576108fc8261093d565b7f3a200000000000000000000000000000000000000000000000000000000000006109268361093d565b60405160200161088193929190610e37565b505050565b60606000826040516020016109529190610e6e565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152919052905060205b80156109f3578061099581610eb2565b9150508181815181106109aa576109aa610ee7565b01602001517fff0000000000000000000000000000000000000000000000000000000000000016156109ee5760006109e3826001610f16565b835250909392505050565b610985565b5060408051600080825260208201909252905b509392505050565b60408051602a808252606082810190935273ffffffffffffffffffffffffffffffffffffffff841691600091602082018180368337019050509050603060f81b81600081518110610a6157610a61610ee7565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350607860f81b81600181518110610aa857610aa8610ee7565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060005b6014811015610a06576000610af0826002610f2e565b9050610afe600f8516610bc1565b83610b0a836029610f6b565b81518110610b1a57610b1a610ee7565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600484901c9350610b5c600f8516610bc1565b83610b68836028610f6b565b81518110610b7857610b78610ee7565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053505060049290921c9180610bb981610f82565b915050610ada565b6000600a821015610be057610bd7603083610f16565b60f81b92915050565b610bd7605783610f16565b600073ffffffffffffffffffffffffffffffffffffffff82165b92915050565b6000610c0582610beb565b6000610c0582610c0b565b610c2a81610c16565b82525050565b60208101610c058284610c21565b600073ffffffffffffffffffffffffffffffffffffffff8216610c05565b610c6581610c3e565b8114610c7057600080fd5b50565b8035610c0581610c5c565b600060208284031215610c9357610c93600080fd5b6000610c9f8484610c73565b949350505050565b8051610c0581610c5c565b600060208284031215610cc757610cc7600080fd5b6000610c9f8484610ca7565b60005b83811015610cee578181015183820152602001610cd6565b838111156108e85750506000910152565b6000610d09825190565b610d17818560208601610cd3565b9290920192915050565b7fffff0000000000000000000000000000000000000000000000000000000000008116610c2a565b7fff000000000000000000000000000000000000000000000000000000000000008116610c2a565b6000610d7d8289610cff565b9150610d898288610d21565b600282019150610d998287610cff565b9150610da58286610d21565b600282019150610db58285610cff565b9150610dc18284610d49565b506001019695505050505050565b6000610dd9825190565b808452602084019350610df0818560208601610cd3565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920192915050565b60208082528101610e308184610dcf565b9392505050565b6000610e438286610cff565b9150610e4f8285610d21565b600282019150610e5f8284610cff565b95945050505050565b80610c2a565b6000610e7a8284610e68565b50602001919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600081610ec157610ec1610e83565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60008219821115610f2957610f29610e83565b500190565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615610f6657610f66610e83565b500290565b600082821015610f7d57610f7d610e83565b500390565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415610fb457610fb4610e83565b506001019056fea2646970667358221220ec2abc6bc3371d88423cae9977230c0d747893b7ff1949de1657f4e35062552164736f6c63430008090033";
const isSuperArgs = (xs) => xs.length > 1;
class PendlePtGLP2024Registry__factory extends ethers_1.ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(_pendleRouter, _ptGlpMarket, _ptGlpToken, _ptOracle, _syGlpToken, _dolomiteMargin, overrides) {
        return super.deploy(_pendleRouter, _ptGlpMarket, _ptGlpToken, _ptOracle, _syGlpToken, _dolomiteMargin, overrides || {});
    }
    getDeployTransaction(_pendleRouter, _ptGlpMarket, _ptGlpToken, _ptOracle, _syGlpToken, _dolomiteMargin, overrides) {
        return super.getDeployTransaction(_pendleRouter, _ptGlpMarket, _ptGlpToken, _ptOracle, _syGlpToken, _dolomiteMargin, overrides || {});
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
exports.PendlePtGLP2024Registry__factory = PendlePtGLP2024Registry__factory;
PendlePtGLP2024Registry__factory.bytecode = _bytecode;
PendlePtGLP2024Registry__factory.abi = _abi;
