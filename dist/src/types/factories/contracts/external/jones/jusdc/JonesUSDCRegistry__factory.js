"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JonesUSDCRegistry__factory = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_glpAdapter",
                type: "address",
            },
            {
                internalType: "address",
                name: "_glpVaultRouter",
                type: "address",
            },
            {
                internalType: "address",
                name: "_whitelistController",
                type: "address",
            },
            {
                internalType: "address",
                name: "_usdcReceiptToken",
                type: "address",
            },
            {
                internalType: "address",
                name: "_jUSDC",
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
                name: "_glpAdapter",
                type: "address",
            },
        ],
        name: "GlpAdapterSet",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_glpVaultRouter",
                type: "address",
            },
        ],
        name: "GlpVaultRouterSet",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_jUSDC",
                type: "address",
            },
        ],
        name: "JUSDCSet",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_unwrapperTrader",
                type: "address",
            },
        ],
        name: "UnwrapperTraderSet",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_usdcReceiptToken",
                type: "address",
            },
        ],
        name: "UsdcReceiptTokenSet",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_whitelistController",
                type: "address",
            },
        ],
        name: "WhitelistControllerSet",
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
        inputs: [],
        name: "glpAdapter",
        outputs: [
            {
                internalType: "contract IJonesGLPAdapter",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "glpVaultRouter",
        outputs: [
            {
                internalType: "contract IJonesGLPVaultRouter",
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
                name: "_unwrapperTrader",
                type: "address",
            },
        ],
        name: "initializeUnwrapperTrader",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "jUSDC",
        outputs: [
            {
                internalType: "contract IERC4626",
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
                name: "_glpAdapter",
                type: "address",
            },
        ],
        name: "ownerGlpAdapter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_glpVaultRouter",
                type: "address",
            },
        ],
        name: "ownerSetGlpVaultRouter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_jUSDC",
                type: "address",
            },
        ],
        name: "ownerSetJUSDC",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_unwrapperTrader",
                type: "address",
            },
        ],
        name: "ownerSetUnwrapperTrader",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_usdcReceiptToken",
                type: "address",
            },
        ],
        name: "ownerSetUsdcReceiptToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_whitelistController",
                type: "address",
            },
        ],
        name: "ownerSetWhitelistController",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "unwrapperTrader",
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
    {
        inputs: [],
        name: "usdcReceiptToken",
        outputs: [
            {
                internalType: "contract IERC4626",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "whitelistController",
        outputs: [
            {
                internalType: "contract IJonesWhitelistController",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
const _bytecode = "0x60a06040523480156200001157600080fd5b50604051620013a7380380620013a78339810160408190526200003491620000d6565b6001600160a01b03908116608052600080546001600160a01b031990811697831697909717905560018054871695821695909517909455600280548616938516939093179092556003805485169184169190911790556004805490931691161790556200016e565b60006001600160a01b0382165b92915050565b620000ba816200009c565b8114620000c657600080fd5b50565b8051620000a981620000af565b60008060008060008060c08789031215620000f457620000f4600080fd5b6000620001028989620000c9565b96505060206200011589828a01620000c9565b95505060406200012889828a01620000c9565b94505060606200013b89828a01620000c9565b93505060806200014e89828a01620000c9565b92505060a06200016189828a01620000c9565b9150509295509295509295565b6080516111f3620001b460003960008181610127015281816102f6015281816104e0015281816105dd015281816106da01528181610711015261080e01526111f36000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c80636766af151161008c5780637d83b40e116100665780637d83b40e14610226578063acf2993c14610239578063b07f866714610259578063f70b96fa1461026c57600080fd5b80636766af15146101e057806369d713ca146101f35780636fce26af1461021357600080fd5b80631fdb7107116100c85780631fdb710714610160578063205400c614610173578063292d6ebb146101935780636124a577146101c057600080fd5b8063098c42d2146100ef57806315c14a4a146101255780631c93fae11461014b575b600080fd5b60015461010f9073ffffffffffffffffffffffffffffffffffffffff1681565b60405161011c9190610e1e565b60405180910390f35b7f000000000000000000000000000000000000000000000000000000000000000061010f565b61015e610159366004610e69565b61027f565b005b61015e61016e366004610e69565b6102f0565b60035461010f9073ffffffffffffffffffffffffffffffffffffffff1681565b6005546101b39073ffffffffffffffffffffffffffffffffffffffff1681565b60405161011c9190610e9b565b60025461010f9073ffffffffffffffffffffffffffffffffffffffff1681565b61015e6101ee366004610e69565b6104da565b60045461010f9073ffffffffffffffffffffffffffffffffffffffff1681565b61015e610221366004610e69565b6105d7565b61015e610234366004610e69565b6106d4565b60005461010f9073ffffffffffffffffffffffffffffffffffffffff1681565b61015e610267366004610e69565b61070b565b61015e61027a366004610e69565b610808565b6005546102e49073ffffffffffffffffffffffffffffffffffffffff16157f4a6f6e65735553444352656769737472790000000000000000000000000000007f416c726561647920696e697469616c697a656400000000000000000000000000610905565b6102ed816109bb565b50565b336104097f00000000000000000000000000000000000000000000000000000000000000005b73ffffffffffffffffffffffffffffffffffffffff16638da5cb5b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561035b57600080fd5b505afa15801561036f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103939190610eb4565b73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16147f4f6e6c79446f6c6f6d6974654d617267696e00000000000000000000000000007f43616c6c6572206973206e6f74206f776e6572206f6620446f6c6f6d6974650084610a8d565b61046c73ffffffffffffffffffffffffffffffffffffffff831615157f4a6f6e65735553444352656769737472790000000000000000000000000000007f496e76616c696420676c70416461707465722061646472657373000000000000610905565b600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff8416908117825560405190917f4c23b7adadef41170e814f73cc45728f75f65d8e2890370643be67c26dd1a9c291a25050565b336105047f0000000000000000000000000000000000000000000000000000000000000000610316565b61056773ffffffffffffffffffffffffffffffffffffffff831615157f4a6f6e65735553444352656769737472790000000000000000000000000000007f496e76616c69642077686974656c697374206164647265737300000000000000610905565b600280547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff84169081179091556040517f7f71038086f20d9d4f9e8ee4a77a3a09ba5ea837318e7f23d20b24ba958f462690600090a25050565b336106017f0000000000000000000000000000000000000000000000000000000000000000610316565b61066473ffffffffffffffffffffffffffffffffffffffff831615157f4a6f6e65735553444352656769737472790000000000000000000000000000007f496e76616c6964206a5553444320616464726573730000000000000000000000610905565b600480547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff84169081179091556040517fce75d2906162a7a328a4ed4cef5437beb5297a9a321c7037b6c6def14d827e5790600090a25050565b336106fe7f0000000000000000000000000000000000000000000000000000000000000000610316565b610707826109bb565b5050565b336107357f0000000000000000000000000000000000000000000000000000000000000000610316565b61079873ffffffffffffffffffffffffffffffffffffffff831615157f4a6f6e65735553444352656769737472790000000000000000000000000000007f496e76616c696420676c705661756c74526f7574657220616464726573730000610905565b600180547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff84169081179091556040517fbce46f08de4f85067375d4ec78bfc5f143f1e1b7d817392563f00dac3f9e09dc90600090a25050565b336108327f0000000000000000000000000000000000000000000000000000000000000000610316565b61089573ffffffffffffffffffffffffffffffffffffffff831615157f4a6f6e65735553444352656769737472790000000000000000000000000000007f496e76616c6964207573646352656365697074546f6b656e2061646472657373610905565b600380547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff84169081179091556040517ffddd0ddbfe116bf9e78bbe483893b162397b9ec0df3e3d6fcd6047ebe98ade8490600090a25050565b826109b65761091382610b2b565b7f3a2000000000000000000000000000000000000000000000000000000000000061093d83610b2b565b60405160200161094f93929190610f4b565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152908290527f08c379a00000000000000000000000000000000000000000000000000000000082526109ad91600401610fcc565b60405180910390fd5b505050565b610a1e73ffffffffffffffffffffffffffffffffffffffff821615157f4a6f6e65735553444352656769737472790000000000000000000000000000007f496e76616c696420756e77726170706572547261646572206164647265737300610905565b600580547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff83169081179091556040517fb28d67709b7f9c70e17b194e3cdbce82866aa811131a0d1da3069150200c392f90600090a250565b83610b2557610a9b83610b2b565b7f3a20000000000000000000000000000000000000000000000000000000000000610ac584610b2b565b7f203c000000000000000000000000000000000000000000000000000000000000610aef85610bfc565b60405161094f9594939291907f3e000000000000000000000000000000000000000000000000000000000000009060200161100c565b50505050565b6060600082604051602001610b409190611070565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152919052905060205b8015610be15780610b83816110b4565b915050818181518110610b9857610b986110e9565b01602001517fff000000000000000000000000000000000000000000000000000000000000001615610bdc576000610bd1826001611118565b835250909392505050565b610b73565b5060408051600080825260208201909252905b509392505050565b60408051602a808252606082810190935273ffffffffffffffffffffffffffffffffffffffff841691600091602082018180368337019050509050603060f81b81600081518110610c4f57610c4f6110e9565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350607860f81b81600181518110610c9657610c966110e9565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060005b6014811015610bf4576000610cde826002611130565b9050610cec600f8516610daf565b83610cf883602961116d565b81518110610d0857610d086110e9565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600484901c9350610d4a600f8516610daf565b83610d5683602861116d565b81518110610d6657610d666110e9565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053505060049290921c9180610da781611184565b915050610cc8565b6000600a821015610dce57610dc5603083611118565b60f81b92915050565b610dc5605783611118565b600073ffffffffffffffffffffffffffffffffffffffff82165b92915050565b6000610df382610dd9565b6000610df382610df9565b610e1881610e04565b82525050565b60208101610df38284610e0f565b600073ffffffffffffffffffffffffffffffffffffffff8216610df3565b610e5381610e2c565b81146102ed57600080fd5b8035610df381610e4a565b600060208284031215610e7e57610e7e600080fd5b6000610e8a8484610e5e565b949350505050565b610e1881610e2c565b60208101610df38284610e92565b8051610df381610e4a565b600060208284031215610ec957610ec9600080fd5b6000610e8a8484610ea9565b60005b83811015610ef0578181015183820152602001610ed8565b83811115610b255750506000910152565b6000610f0b825190565b610f19818560208601610ed5565b9290920192915050565b7fffff0000000000000000000000000000000000000000000000000000000000008116610e18565b6000610f578286610f01565b9150610f638285610f23565b600282019150610f738284610f01565b95945050505050565b6000610f86825190565b808452602084019350610f9d818560208601610ed5565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920192915050565b60208082528101610fdd8184610f7c565b9392505050565b7fff000000000000000000000000000000000000000000000000000000000000008116610e18565b60006110188289610f01565b91506110248288610f23565b6002820191506110348287610f01565b91506110408286610f23565b6002820191506110508285610f01565b915061105c8284610fe4565b506001019695505050505050565b80610e18565b600061107c828461106a565b50602001919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000816110c3576110c3611085565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000821982111561112b5761112b611085565b500190565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048311821515161561116857611168611085565b500290565b60008282101561117f5761117f611085565b500390565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214156111b6576111b6611085565b506001019056fea26469706673582212205f2a24b50f5fcb67d678d4a5d35b350c445a2d49a28a34d26c4a9d5d78835cb464736f6c63430008090033";
const isSuperArgs = (xs) => xs.length > 1;
class JonesUSDCRegistry__factory extends ethers_1.ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(_glpAdapter, _glpVaultRouter, _whitelistController, _usdcReceiptToken, _jUSDC, _dolomiteMargin, overrides) {
        return super.deploy(_glpAdapter, _glpVaultRouter, _whitelistController, _usdcReceiptToken, _jUSDC, _dolomiteMargin, overrides || {});
    }
    getDeployTransaction(_glpAdapter, _glpVaultRouter, _whitelistController, _usdcReceiptToken, _jUSDC, _dolomiteMargin, overrides) {
        return super.getDeployTransaction(_glpAdapter, _glpVaultRouter, _whitelistController, _usdcReceiptToken, _jUSDC, _dolomiteMargin, overrides || {});
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
exports.JonesUSDCRegistry__factory = JonesUSDCRegistry__factory;
JonesUSDCRegistry__factory.bytecode = _bytecode;
JonesUSDCRegistry__factory.abi = _abi;
