"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlutusVaultGLPIsolationModeWrapperTraderV1__factory = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_gmxRegistry",
                type: "address",
            },
            {
                internalType: "address",
                name: "_plutusVaultRegistry",
                type: "address",
            },
            {
                internalType: "address",
                name: "_dPlvGlp",
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
        name: "GMX_REGISTRY",
        outputs: [
            {
                internalType: "contract IGmxRegistryV1",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "PLUTUS_VAULT_REGISTRY",
        outputs: [
            {
                internalType: "contract IPlutusVaultRegistry",
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
                internalType: "uint256",
                name: "_solidAccountId",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "",
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
                name: "_outputMarket",
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
        name: "createActionsForWrapping",
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
                name: "_vaultToken",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_desiredInputAmount",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "",
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
];
const _bytecode = "0x6101006040523480156200001257600080fd5b506040516200333538038062003335833981016040819052620000359162000093565b6001600160a01b0390811660805290811660a05291821660c0521660e05262000101565b60006001600160a01b0382165b92915050565b620000778162000059565b81146200008357600080fd5b50565b805162000066816200006c565b60008060008060808587031215620000ae57620000ae600080fd5b6000620000bc878762000086565b9450506020620000cf8782880162000086565b9350506040620000e28782880162000086565b9250506060620000f58782880162000086565b91505092959194509250565b60805160a05160c05160e051613171620001c46000396000818160f5015281816115e101526116f10152600081816101560152818161019f015281816103c801528181610478015281816112cd0152818161142401526114c80152600081816092015281816102f6015281816104a2015281816106380152818161071a0152818161086201528181611989015281816119f60152611aa801526000818160cc015281816105c901528181610884015281816109ab0152610a7501526131716000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80637d98ebac1161005b5780637d98ebac14610137578063b189111a1461014a578063ba1fc25e14610151578063c14e3a471461017857600080fd5b8063103f29071461008d57806315c14a4a146100ca5780632115ba3e146100f05780633a8fdd7d14610117575b600080fd5b6100b47f000000000000000000000000000000000000000000000000000000000000000081565b6040516100c19190612463565b60405180910390f35b7f00000000000000000000000000000000000000000000000000000000000000006100b4565b6100b47f000000000000000000000000000000000000000000000000000000000000000081565b61012a6101253660046125c1565b610198565b6040516100c19190612646565b61012a6101453660046126a6565b6105b9565b600161012a565b6100b47f000000000000000000000000000000000000000000000000000000000000000081565b61018b610186366004612751565b610853565b6040516100c19190612a5c565b60006102f17f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663b3b3453e6040518163ffffffff1660e01b815260040160206040518083038186803b1580156101f657600080fd5b505afa15801561020a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061022e9190612a8c565b6001600160a01b031663daf9c210876040518263ffffffff1660e01b81526004016102599190612aad565b60206040518083038186803b15801561027157600080fd5b505afa158015610285573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102a99190612ace565b7f506c757475735661756c74474c505772617070657256310000000000000000007f496e76616c696420696e70757420746f6b656e0000000000000000000000000088610b5c565b6103717f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316856001600160a01b0316147f506c757475735661756c74474c505772617070657256310000000000000000007f496e76616c6964206f757470757420746f6b656e00000000000000000000000087610b5c565b6103bf600084117f506c757475735661756c74474c505772617070657256310000000000000000007f496e76616c6964206465736972656420696e70757420616d6f756e7400000000610c43565b600061046786857f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663b3b3453e6040518163ffffffff1660e01b815260040160206040518083038186803b15801561041f57600080fd5b505afa158015610433573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104579190612a8c565b6001600160a01b03169190610c92565b9050600061049e6001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016836110bb565b90507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166329db1be66040518163ffffffff1660e01b815260040160206040518083038186803b1580156104f957600080fd5b505afa15801561050d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105319190612afa565b6001600160a01b031663ef8b30f7826040518263ffffffff1660e01b815260040161055c9190612646565b60206040518083038186803b15801561057457600080fd5b505afa158015610588573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105ac9190612b26565b925050505b949350505050565b6000336106336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001682147f4f6e6c79446f6c6f6d6974654d617267696e00000000000000000000000000007f4f6e6c7920446f6c6f6d6974652063616e2063616c6c2066756e6374696f6e0084610b5c565b6106b37f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316886001600160a01b0316147f49736f6c6174696f6e4d6f6465577261707065725472616465725631000000007f496e76616c6964206f757470757420746f6b656e0000000000000000000000008a610b5c565b610701600086117f49736f6c6174696f6e4d6f6465577261707065725472616465725631000000007f496e76616c696420696e70757420616d6f756e74000000000000000000000000610c43565b600061070f84860186612b47565b905060006107e88b8b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166329db1be66040518163ffffffff1660e01b815260040160206040518083038186803b15801561077157600080fd5b505afa158015610785573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107a99190612afa565b858c8c8c8c8080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152506112c692505050565b905061083a828210157f49736f6c6174696f6e4d6f6465577261707065725472616465725631000000007f496e73756666696369656e74206f757470757420616d6f756e74000000000000848661188e565b6108458b8b83611959565b9a9950505050505050505050565b60606109706001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000167f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663062bd3e9886040518263ffffffff1660e01b81526004016108ce9190612646565b60206040518083038186803b1580156108e657600080fd5b505afa1580156108fa573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061091e9190612afa565b6001600160a01b0316147f49736f6c6174696f6e4d6f6465577261707065725472616465725631000000007f496e76616c6964206f7574707574206d61726b6574000000000000000000000088611acf565b604080516001808252818301909252600091816020015b61098f6123a5565b8152602001906001900390816109875790505090506000610b107f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663062bd3e9886040518263ffffffff1660e01b81526004016109f59190612646565b60206040518083038186803b158015610a0d57600080fd5b505afa158015610a21573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a459190612afa565b6040517f062bd3e90000000000000000000000000000000000000000000000000000000081526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063062bd3e990610aaa908c90600401612646565b60206040518083038186803b158015610ac257600080fd5b505afa158015610ad6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610afa9190612afa565b8660405180602001604052806000815250610198565b9050610b308b878930888660405180602001604052806000815250611b31565b82600081518110610b4357610b43612b68565b6020908102919091010152509998505050505050505050565b83610c3d57610b6a83611c55565b7f3a20000000000000000000000000000000000000000000000000000000000000610b9484611c55565b7f203c000000000000000000000000000000000000000000000000000000000000610bbe85611d08565b604051610bf49594939291907f3e0000000000000000000000000000000000000000000000000000000000000090602001612c09565b60408051601f19818403018152908290527f08c379a0000000000000000000000000000000000000000000000000000000008252610c3491600401612c67565b60405180910390fd5b50505050565b82610c8d57610c5182611c55565b7f3a20000000000000000000000000000000000000000000000000000000000000610c7b83611c55565b604051602001610bf493929190612c78565b505050565b6000610ce2600083117f474c504d6174684c6962000000000000000000000000000000000000000000007f496e70757420616d6f756e74206d757374206265206774207468616e20300000610c43565b6040517f81a612d60000000000000000000000000000000000000000000000000000000081526000906001600160a01b038616906381a612d690610d2a908790600401612aad565b60206040518083038186803b158015610d4257600080fd5b505afa158015610d56573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d7a9190612b26565b90506000856001600160a01b031663f5b91b7b6040518163ffffffff1660e01b815260040160206040518083038186803b158015610db757600080fd5b505afa158015610dcb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610def9190612afa565b905060006001600160a01b03871663421528736c0c9f2c9cd04674edea40000000610e1a8689612ccf565b610e249190612d3b565b88856040518463ffffffff1660e01b8152600401610e4493929190612d4f565b60206040518083038186803b158015610e5c57600080fd5b505afa158015610e70573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e949190612b26565b90506000876001600160a01b031663c7e074c388848b6001600160a01b0316634d47b3046040518163ffffffff1660e01b815260040160206040518083038186803b158015610ee257600080fd5b505afa158015610ef6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f1a9190612b26565b8c6001600160a01b0316637a210a2b6040518163ffffffff1660e01b815260040160206040518083038186803b158015610f5357600080fd5b505afa158015610f67573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f8b9190612b26565b60016040518663ffffffff1660e01b8152600401610fad959493929190612d77565b60206040518083038186803b158015610fc557600080fd5b505afa158015610fd9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ffd9190612b26565b9050600061100b8783611eae565b90506001600160a01b03891663421528736c0c9f2c9cd04674edea400000006110348885612ccf565b61103e9190612d3b565b8a876040518463ffffffff1660e01b815260040161105e93929190612d4f565b60206040518083038186803b15801561107657600080fd5b505afa15801561108a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110ae9190612b26565b9998505050505050505050565b600080836001600160a01b031663fa6db1bc6040518163ffffffff1660e01b815260040160206040518083038186803b1580156110f757600080fd5b505afa15801561110b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061112f9190612a8c565b6001600160a01b03166368a0a3e060016040518263ffffffff1660e01b815260040161115b9190612dc3565b60206040518083038186803b15801561117357600080fd5b505afa158015611187573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111ab9190612b26565b90506000846001600160a01b03166378a207ee6040518163ffffffff1660e01b815260040160206040518083038186803b1580156111e857600080fd5b505afa1580156111fc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112209190612a8c565b6001600160a01b03166318160ddd6040518163ffffffff1660e01b815260040160206040518083038186803b15801561125857600080fd5b505afa15801561126c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112909190612b26565b905081158061129d575080155b6112bb57816112ac8286612ccf565b6112b69190612d3b565b6112bd565b835b95945050505050565b600061141f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663b3b3453e6040518163ffffffff1660e01b815260040160206040518083038186803b15801561132457600080fd5b505afa158015611338573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061135c9190612a8c565b6001600160a01b031663daf9c210866040518263ffffffff1660e01b81526004016113879190612aad565b60206040518083038186803b15801561139f57600080fd5b505afa1580156113b3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113d79190612ace565b7f506c757475735661756c74474c505772617070657256310000000000000000007f496e76616c696420696e70757420746f6b656e0000000000000000000000000087610b5c565b6114c47f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663fa6db1bc6040518163ffffffff1660e01b815260040160206040518083038186803b15801561147b57600080fd5b505afa15801561148f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114b39190612a8c565b6001600160a01b0386169085611eda565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166374899c296040518163ffffffff1660e01b815260040160206040518083038186803b15801561151f57600080fd5b505afa158015611533573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115579190612a8c565b6001600160a01b031663364e2311868660008a6040518563ffffffff1660e01b81526004016115899493929190612de6565b602060405180830381600087803b1580156115a357600080fd5b505af11580156115b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115db9190612b26565b905060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663512084cd6040518163ffffffff1660e01b815260040160206040518083038186803b15801561163857600080fd5b505afa15801561164c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116709190612a8c565b6001600160a01b031663ef8b30f7836040518263ffffffff1660e01b815260040161169b9190612646565b60206040518083038186803b1580156116b357600080fd5b505afa1580156116c7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116eb9190612b26565b905060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316638b7f9d6e6040518163ffffffff1660e01b815260040160206040518083038186803b15801561174857600080fd5b505afa15801561175c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117809190612a8c565b90506118088184836001600160a01b031663a8d774126040518163ffffffff1660e01b815260040160206040518083038186803b1580156117c057600080fd5b505afa1580156117d4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117f89190612a8c565b6001600160a01b03169190611eda565b6040517fb6b55f250000000000000000000000000000000000000000000000000000000081526001600160a01b0382169063b6b55f259061184d908690600401612646565b600060405180830381600087803b15801561186757600080fd5b505af115801561187b573d6000803e3d6000fd5b50939d9c50505050505050505050505050565b846119525761189c84611c55565b7f3a200000000000000000000000000000000000000000000000000000000000006118c685611c55565b7f203c0000000000000000000000000000000000000000000000000000000000006118f086612034565b7f2c2000000000000000000000000000000000000000000000000000000000000061191a87612034565b604051610bf497969594939291907f3e0000000000000000000000000000000000000000000000000000000000000090602001612e1b565b5050505050565b6040517f5b7490540000000000000000000000000000000000000000000000000000000081526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690635b749054906119c09086908590600401612e97565b600060405180830381600087803b1580156119da57600080fd5b505af11580156119ee573d6000803e3d6000fd5b5050505060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166329db1be66040518163ffffffff1660e01b815260040160206040518083038186803b158015611a4d57600080fd5b505afa158015611a61573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a859190612afa565b9050611a9b6001600160a01b0382168584611eda565b610c3d6001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000168484611eda565b83610c3d57611add83611c55565b7f3a20000000000000000000000000000000000000000000000000000000000000611b0784611c55565b7f203c000000000000000000000000000000000000000000000000000000000000610bbe85612034565b611b396123a5565b611b65604080516080810190915260008082526020820190815260200160008152602001600081525090565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff851415611bba5760408051608081019091526000808252602082019081526020016001815260200160008152509050611be1565b60408051608081019091526000808252602082019081526020016000815260200186905290505b60408051610100810190915280600481526020018a8152602001828152602001898152602001888152602001876001600160a01b03168152602001600081526020018585604051602001611c36929190612eb2565b60408051601f1981840301815291905290529998505050505050505050565b6060600082604051602001611c6a9190612ed2565b60408051601f19818403018152919052905060205b8015611ced5780611c8f81612ee7565b915050818181518110611ca457611ca4612b68565b01602001517fff000000000000000000000000000000000000000000000000000000000000001615611ce8576000611cdd826001612f1c565b835250909392505050565b611c7f565b5060408051600080825260208201909252905b509392505050565b60408051602a80825260608281019093526001600160a01b03841691600091602082018180368337019050509050603060f81b81600081518110611d4e57611d4e612b68565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350607860f81b81600181518110611d9557611d95612b68565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060005b6014811015611d00576000611ddd826002612ccf565b9050611deb600f8516612174565b83611df7836029612f34565b81518110611e0757611e07612b68565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600484901c9350611e49600f8516612174565b83611e55836028612f34565b81518110611e6557611e65612b68565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053505060049290921c9180611ea681612f4b565b915050611dc7565b6000612710611ebd8382612f34565b611ec79085612ccf565b611ed19190612d3b565b90505b92915050565b801580611f7b57506040517fdd62ed3e0000000000000000000000000000000000000000000000000000000081526001600160a01b0384169063dd62ed3e90611f299030908690600401612f84565b60206040518083038186803b158015611f4157600080fd5b505afa158015611f55573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f799190612b26565b155b611fb1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c3490612ffc565b610c8d8363095ea7b360e01b8484604051602401611fd0929190612e97565b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff000000000000000000000000000000000000000000000000000000009093169290921790915261219e565b60608161207457505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b811561209e578061208881612f4b565b91506120979050600a83612d3b565b9150612078565b60008167ffffffffffffffff8111156120b9576120b96124b5565b6040519080825280601f01601f1916602001820160405280156120e3576020820181803683370190505b508593509050815b801561216b57806120fb81612ee7565b915061210a9050600a8561300c565b612115906030612f1c565b60f81b82828151811061212a5761212a612b68565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350612164600a85612d3b565b93506120eb565b50949350505050565b6000600a8210156121935761218a603083612f1c565b60f81b92915050565b61218a605783612f1c565b60006121f3826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b03166122479092919063ffffffff16565b805190915015610c8d57808060200190518101906122119190612ace565b610c8d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c349061307a565b60606122568484600085612260565b90505b9392505050565b60608247101561229c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c34906130e4565b600080866001600160a01b031685876040516122b891906130f4565b60006040518083038185875af1925050503d80600081146122f5576040519150601f19603f3d011682016040523d82523d6000602084013e6122fa565b606091505b50915091506105ac878383876060831561235c578251612355576001600160a01b0385163b612355576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c3490613100565b50816105b1565b6105b183838151156123715781518083602001fd5b806040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c349190612c67565b6040805161010081018252600080825260208201529081016123e9604080516080810190915260008082526020820190815260200160008152602001600081525090565b8152602001600081526020016000815260200160006001600160a01b0316815260200160008152602001606081525090565b6000611ed46001600160a01b038316612432565b90565b6001600160a01b031690565b6000611ed48261241b565b6000611ed48261243e565b61245d81612449565b82525050565b60208101611ed48284612454565b60006001600160a01b038216611ed4565b61248b81612471565b811461249657600080fd5b50565b8035611ed481612482565b8061248b565b8035611ed4816124a4565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b601f19601f830116810181811067ffffffffffffffff8211171561250a5761250a6124b5565b6040525050565b600061251c60405190565b905061252882826124e4565b919050565b600067ffffffffffffffff821115612547576125476124b5565b601f19601f83011660200192915050565b82818337506000910152565b60006125776125728461252d565b612511565b90508281526020810184848401111561259257612592600080fd5b611d00848285612558565b600082601f8301126125b1576125b1600080fd5b81356105b1848260208601612564565b600080600080608085870312156125da576125da600080fd5b60006125e68787612499565b94505060206125f787828801612499565b9350506040612608878288016124aa565b925050606085013567ffffffffffffffff81111561262857612628600080fd5b6126348782880161259d565b91505092959194509250565b8061245d565b60208101611ed48284612640565b60008083601f84011261266957612669600080fd5b50813567ffffffffffffffff81111561268457612684600080fd5b60208301915083600182028301111561269f5761269f600080fd5b9250929050565b600080600080600080600060c0888a0312156126c4576126c4600080fd5b60006126d08a8a612499565b97505060206126e18a828b01612499565b96505060406126f28a828b01612499565b95505060606127038a828b01612499565b94505060806127148a828b016124aa565b93505060a088013567ffffffffffffffff81111561273457612734600080fd5b6127408a828b01612654565b925092505092959891949750929550565b600080600080600080600080610100898b03121561277157612771600080fd5b600061277d8b8b6124aa565b985050602061278e8b828c016124aa565b975050604061279f8b828c01612499565b96505060606127b08b828c01612499565b95505060806127c18b828c016124aa565b94505060a06127d28b828c016124aa565b93505060c06127e38b828c016124aa565b92505060e06127f48b828c016124aa565b9150509295985092959890939650565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6009811061249657612496612804565b8061252881612833565b6000611ed482612843565b61245d8161284d565b80151561245d565b6002811061249657612496612804565b8061252881612869565b6000611ed482612879565b61245d81612883565b805160808301906128a88482612861565b5060208201516128bb602085018261288e565b5060408201516128ce604085018261288e565b506060820151610c3d6060850182612640565b61245d81612471565b60005b838110156129055781810151838201526020016128ed565b83811115610c3d5750506000910152565b6000612920825190565b8084526020840193506129378185602086016128ea565b601f01601f19169290920192915050565b805160009061016084019061295d8582612858565b5060208301516129706020860182612640565b5060408301516129836040860182612897565b50606083015161299660c0860182612640565b5060808301516129a960e0860182612640565b5060a08301516129bd6101008601826128e1565b5060c08301516129d1610120860182612640565b5060e08301518482036101408601526112bd8282612916565b6000611ed18383612948565b6000612a00825190565b80845260208401935083602082028501612a1a8560200190565b8060005b85811015612a4f5784840389528151612a3785826129ea565b94506020830160209a909a0199925050600101612a1e565b5091979650505050505050565b60208082528101611ed181846129f6565b6000611ed482612471565b61248b81612a6d565b8051611ed481612a78565b600060208284031215612aa157612aa1600080fd5b60006105b18484612a81565b60208101611ed482846128e1565b80151561248b565b8051611ed481612abb565b600060208284031215612ae357612ae3600080fd5b60006105b18484612ac3565b8051611ed481612482565b600060208284031215612b0f57612b0f600080fd5b60006105b18484612aef565b8051611ed4816124a4565b600060208284031215612b3b57612b3b600080fd5b60006105b18484612b1b565b600060208284031215612b5c57612b5c600080fd5b60006105b184846124aa565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000612ba1825190565b612baf8185602086016128ea565b9290920192915050565b7fffff000000000000000000000000000000000000000000000000000000000000811661245d565b7fff00000000000000000000000000000000000000000000000000000000000000811661245d565b6000612c158289612b97565b9150612c218288612bb9565b600282019150612c318287612b97565b9150612c3d8286612bb9565b600282019150612c4d8285612b97565b9150612c598284612be1565b506001019695505050505050565b60208082528101611ed18184612916565b6000612c848286612b97565b9150612c908285612bb9565b6002820191506112bd8284612b97565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615612d0757612d07612ca0565b500290565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600082612d4a57612d4a612d0c565b500490565b60608101612d5d8286612640565b612d6a60208301856128e1565b6105b160408301846128e1565b60a08101612d8582886128e1565b612d926020830187612640565b612d9f6040830186612640565b612dac6060830185612640565b612db96080830184612861565b9695505050505050565b60208101611ed48284612861565b6000611ed461242f8381565b61245d81612dd1565b60808101612df482876128e1565b612e016020830186612640565b612e0e6040830185612ddd565b6112bd6060830184612640565b6000612e27828b612b97565b9150612e33828a612bb9565b600282019150612e438289612b97565b9150612e4f8288612bb9565b600282019150612e5f8287612b97565b9150612e6b8286612bb9565b600282019150612e7b8285612b97565b9150612e878284612be1565b5060010198975050505050505050565b60408101612ea582856128e1565b6122596020830184612640565b60408101612ec08285612640565b81810360208301526122568184612916565b6000612ede8284612640565b50602001919050565b600081612ef657612ef6612ca0565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b60008219821115612f2f57612f2f612ca0565b500190565b600082821015612f4657612f46612ca0565b500390565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415612f7d57612f7d612ca0565b5060010190565b60408101612f9282856128e1565b61225960208301846128e1565b603681526000602082017f5361666545524332303a20617070726f76652066726f6d206e6f6e2d7a65726f81527f20746f206e6f6e2d7a65726f20616c6c6f77616e636500000000000000000000602082015291505b5060400190565b60208082528101611ed481612f9f565b60008261301b5761301b612d0c565b500690565b602a81526000602082017f5361666545524332303a204552433230206f7065726174696f6e20646964206e81527f6f7420737563636565640000000000000000000000000000000000000000000060208201529150612ff5565b60208082528101611ed481613020565b602681526000602082017f416464726573733a20696e73756666696369656e742062616c616e636520666f81527f722063616c6c000000000000000000000000000000000000000000000000000060208201529150612ff5565b60208082528101611ed48161308a565b60006122598284612b97565b60208082528101611ed481601d81527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060208201526040019056fea2646970667358221220721a53c270aec0e7ca2e35491aca1c17f4d7a3aa9c18eb15c5216849e86e574564736f6c63430008090033";
const isSuperArgs = (xs) => xs.length > 1;
class PlutusVaultGLPIsolationModeWrapperTraderV1__factory extends ethers_1.ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(_gmxRegistry, _plutusVaultRegistry, _dPlvGlp, _dolomiteMargin, overrides) {
        return super.deploy(_gmxRegistry, _plutusVaultRegistry, _dPlvGlp, _dolomiteMargin, overrides || {});
    }
    getDeployTransaction(_gmxRegistry, _plutusVaultRegistry, _dPlvGlp, _dolomiteMargin, overrides) {
        return super.getDeployTransaction(_gmxRegistry, _plutusVaultRegistry, _dPlvGlp, _dolomiteMargin, overrides || {});
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
exports.PlutusVaultGLPIsolationModeWrapperTraderV1__factory = PlutusVaultGLPIsolationModeWrapperTraderV1__factory;
PlutusVaultGLPIsolationModeWrapperTraderV1__factory.bytecode = _bytecode;
PlutusVaultGLPIsolationModeWrapperTraderV1__factory.abi = _abi;
