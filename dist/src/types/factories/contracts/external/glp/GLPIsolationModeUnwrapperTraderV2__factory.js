"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLPIsolationModeUnwrapperTraderV2__factory = void 0;
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
                name: "_dfsGlp",
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
                name: "_minAmountOut",
                type: "uint256",
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
        name: "createActionsForUnwrapping",
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
        inputs: [
            {
                internalType: "address",
                name: "_outputToken",
                type: "address",
            },
        ],
        name: "isValidOutputToken",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
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
const _bytecode = "0x60e06040523480156200001157600080fd5b50604051620032053803806200320583398101604081905262000034916200008c565b6001600160a01b0390811660805290811660a0521660c052620000e4565b60006001600160a01b0382165b92915050565b620000708162000052565b81146200007c57600080fd5b50565b80516200005f8162000065565b600080600060608486031215620000a657620000a6600080fd5b6000620000b486866200007f565b9350506020620000c7868287016200007f565b9250506040620000da868287016200007f565b9150509250925092565b60805160a05160c05161307b6200018a6000396000818161019a01528181610bdb01528181610e4301528181610e71015261100401526000818160c8015281816101de015281816102110152818161040201528181610550015281816106d2015281816108c9015281816112ab015261151d0152600081816101020152818161036701528181610780015281816107aa015281816108eb01526109f9015261307b6000f3fe608060405234801561001057600080fd5b50600436106100be5760003560e01c8063a8c1a94c11610076578063ba1fc25e1161005b578063ba1fc25e14610195578063f1a1f8fa146101bc578063fc0c546a146101dc57600080fd5b8063a8c1a94c1461016e578063b189111a1461018e57600080fd5b80633a8fdd7d116100a75780633a8fdd7d146101265780637d98ebac146101465780638b4187131461015957600080fd5b8063103f2907146100c357806315c14a4a14610100575b600080fd5b6100ea7f000000000000000000000000000000000000000000000000000000000000000081565b6040516100f791906122d5565b60405180910390f35b7f00000000000000000000000000000000000000000000000000000000000000006100ea565b610139610134366004612422565b61020a565b6040516100f791906124a7565b610139610154366004612507565b61035f565b61016c6101673660046125cd565b61077a565b005b61018161017c36600461263b565b6108ad565b6040516100f7919061297a565b6002610139565b6100ea7f000000000000000000000000000000000000000000000000000000000000000081565b6101cf6101ca36600461298b565b610bd7565b6040516100f791906129ac565b7f00000000000000000000000000000000000000000000000000000000000000006040516100f791906129ba565b60006102a67f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff16147f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e76616c696420696e70757420746f6b656e0000000000000000000000000088610d05565b6102fa6102b285610bd7565b7f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e76616c6964206f757470757420746f6b656e00000000000000000000000087610d05565b610348600084117f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e76616c6964206465736972656420696e70757420616d6f756e7400000000610dec565b61035485858585610e3b565b90505b949350505050565b6000336103fd7f00000000000000000000000000000000000000000000000000000000000000005b73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16147f4f6e6c79446f6c6f6d6974654d617267696e00000000000000000000000000007f4f6e6c7920446f6c6f6d6974652063616e2063616c6c2066756e6374696f6e0084610d05565b6104977f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffffffffffffffff16147f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e76616c696420696e70757420746f6b656e0000000000000000000000000089610d05565b6104eb6104a388610bd7565b7f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e76616c6964206f757470757420746f6b656e0000000000000000000000008a610d05565b610539600086117f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e76616c696420696e70757420616d6f756e74000000000000000000000000610dec565b600080610548858701876129c8565b9150915060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166329db1be66040518163ffffffff1660e01b815260040160206040518083038186803b1580156105b457600080fd5b505afa1580156105c8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105ec9190612a2b565b73ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b815260040161062491906129ba565b60206040518083038186803b15801561063c57600080fd5b505afa158015610650573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106749190612a57565b90506106c6888210157f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e73756666696369656e7420696e70757420746f6b656e0000000000000000848c610f34565b5060006106f88c8c8c867f00000000000000000000000000000000000000000000000000000000000000008d88610fff565b905061074a838210157f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e73756666696369656e74206f757470757420616d6f756e740000000000008487610f34565b61076b73ffffffffffffffffffffffffffffffffffffffff8b168c8361113d565b9b9a5050505050505050505050565b336107a47f0000000000000000000000000000000000000000000000000000000000000000610387565b846108997f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663052f72d7836040518263ffffffff1660e01b815260040161080191906129ba565b60206040518083038186803b15801561081957600080fd5b505afa15801561082d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108519190612a8b565b7f4f6e6c79446f6c6f6d6974654d617267696e00000000000000000000000000007f43616c6c6572206973206e6f74206120676c6f62616c206f70657261746f720084610d05565b6108a5868686866112a4565b505050505050565b60606109f173ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000167f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663062bd3e9896040518263ffffffff1660e01b815260040161094291906124a7565b60206040518083038186803b15801561095a57600080fd5b505afa15801561096e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109929190612a2b565b73ffffffffffffffffffffffffffffffffffffffff16147f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e76616c696420696e707574206d61726b6574000000000000000000000000896115a7565b610ae8610aa07f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663062bd3e98a6040518263ffffffff1660e01b8152600401610a5091906124a7565b60206040518083038186803b158015610a6857600080fd5b505afa158015610a7c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101ca9190612a2b565b7f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e76616c6964206f7574707574206d61726b657400000000000000000000008a6115a7565b60408051600280825260608201909252600091816020015b610b0861220f565b815260200190600190039081610b00579050509050610b478b3087604051602001610b3391906124a7565b604051602081830303815290604052611609565b81600081518110610b5a57610b5a612aac565b6020026020010181905250610baa8c888a30898b8a8a8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061169492505050565b81600181518110610bbd57610bbd612aac565b60209081029190910101529b9a5050505050505050505050565b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663b3b3453e6040518163ffffffff1660e01b815260040160206040518083038186803b158015610c3f57600080fd5b505afa158015610c53573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c779190612aef565b73ffffffffffffffffffffffffffffffffffffffff1663daf9c210836040518263ffffffff1660e01b8152600401610caf91906129ba565b60206040518083038186803b158015610cc757600080fd5b505afa158015610cdb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cff9190612a8b565b92915050565b83610de657610d13836117c5565b7f3a20000000000000000000000000000000000000000000000000000000000000610d3d846117c5565b7f203c000000000000000000000000000000000000000000000000000000000000610d6785611878565b604051610d9d9594939291907f3e0000000000000000000000000000000000000000000000000000000000000090602001612b82565b60408051601f19818403018152908290527f08c379a0000000000000000000000000000000000000000000000000000000008252610ddd91600401612be0565b60405180910390fd5b50505050565b82610e3657610dfa826117c5565b7f3a20000000000000000000000000000000000000000000000000000000000000610e24836117c5565b604051602001610d9d93929190612bf1565b505050565b600080610e687f000000000000000000000000000000000000000000000000000000000000000085611a2b565b9050610f2a85827f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663b3b3453e6040518163ffffffff1660e01b815260040160206040518083038186803b158015610ed557600080fd5b505afa158015610ee9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f0d9190612aef565b73ffffffffffffffffffffffffffffffffffffffff169190611c64565b9695505050505050565b84610ff857610f42846117c5565b7f3a20000000000000000000000000000000000000000000000000000000000000610f6c856117c5565b7f203c000000000000000000000000000000000000000000000000000000000000610f9686611e8e565b7f2c20000000000000000000000000000000000000000000000000000000000000610fc087611e8e565b604051610d9d97969594939291907f3e0000000000000000000000000000000000000000000000000000000000000090602001612c19565b5050505050565b6000807f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166374899c296040518163ffffffff1660e01b815260040160206040518083038186803b15801561106857600080fd5b505afa15801561107c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110a09190612aef565b73ffffffffffffffffffffffffffffffffffffffff16630f3aa554888689306040518563ffffffff1660e01b81526004016110de9493929190612c95565b602060405180830381600087803b1580156110f857600080fd5b505af115801561110c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111309190612a57565b9998505050505050505050565b8015806111eb57506040517fdd62ed3e00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff84169063dd62ed3e906111999030908690600401612cca565b60206040518083038186803b1580156111b157600080fd5b505afa1580156111c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111e99190612a57565b155b611221576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ddd90612d42565b610e368363095ea7b360e01b8484604051602401611240929190612d52565b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff0000000000000000000000000000000000000000000000000000000090931692909217909152611fce565b6113ca60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663bc0837326112f2602088018861298b565b6040518263ffffffff1660e01b815260040161130e91906129ba565b60206040518083038186803b15801561132657600080fd5b505afa15801561133a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061135e9190612a2b565b73ffffffffffffffffffffffffffffffffffffffff1614157f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f4163636f756e74206f776e6572206973206e6f742061207661756c74000000006113c5602088018861298b565b610d05565b60006113d882840184612d6d565b9050611428600082117f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e76616c6964207472616e7366657220616d6f756e74000000000000000000610dec565b6000611437602086018661298b565b73ffffffffffffffffffffffffffffffffffffffff16639cd7a1c46040518163ffffffff1660e01b815260040160206040518083038186803b15801561147c57600080fd5b505afa158015611490573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114b49190612a57565b9050611506828210157f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563200007f496e73756666696369656e742062616c616e63650000000000000000000000008486610f34565b73ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016635444131161154f602088018861298b565b846040518363ffffffff1660e01b815260040161156d929190612d52565b600060405180830381600087803b15801561158757600080fd5b505af115801561159b573d6000803e3d6000fd5b50505050505050505050565b83610de6576115b5836117c5565b7f3a200000000000000000000000000000000000000000000000000000000000006115df846117c5565b7f203c000000000000000000000000000000000000000000000000000000000000610d6785611e8e565b61161161220f565b604080516101008101825260088152602080820187905282516080810184526000808252929384019290918201908152602001600081526020016000815250815260200160008152602001600081526020018473ffffffffffffffffffffffffffffffffffffffff168152602001600081526020018381525090505b9392505050565b61169c61220f565b6116c8604080516080810190915260008082526020820190815260200160008152602001600081525090565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff85141561171d5760408051608081019091526000808252602082019081526020016001815260200160008152509050611744565b60408051608081019091526000808252602082019081526020016000815260200186905290505b60408051610100810190915280600481526020018a81526020018281526020018981526020018881526020018773ffffffffffffffffffffffffffffffffffffffff1681526020016000815260200185856040516020016117a6929190612d8e565b60408051601f1981840301815291905290529998505050505050505050565b60606000826040516020016117da9190612dae565b60408051601f19818403018152919052905060205b801561185d57806117ff81612df2565b91505081818151811061181457611814612aac565b01602001517fff00000000000000000000000000000000000000000000000000000000000000161561185857600061184d826001612e27565b835250909392505050565b6117ef565b5060408051600080825260208201909252905b509392505050565b60408051602a808252606082810190935273ffffffffffffffffffffffffffffffffffffffff841691600091602082018180368337019050509050603060f81b816000815181106118cb576118cb612aac565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350607860f81b8160018151811061191257611912612aac565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060005b601481101561187057600061195a826002612e3f565b9050611968600f8516612084565b83611974836029612e7c565b8151811061198457611984612aac565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600484901c93506119c6600f8516612084565b836119d2836028612e7c565b815181106119e2576119e2612aac565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053505060049290921c9180611a2381612e93565b915050611944565b6000808373ffffffffffffffffffffffffffffffffffffffff1663fa6db1bc6040518163ffffffff1660e01b815260040160206040518083038186803b158015611a7457600080fd5b505afa158015611a88573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611aac9190612aef565b73ffffffffffffffffffffffffffffffffffffffff166368a0a3e060006040518263ffffffff1660e01b8152600401611ae591906129ac565b60206040518083038186803b158015611afd57600080fd5b505afa158015611b11573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b359190612a57565b905060008473ffffffffffffffffffffffffffffffffffffffff166378a207ee6040518163ffffffff1660e01b815260040160206040518083038186803b158015611b7f57600080fd5b505afa158015611b93573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611bb79190612aef565b73ffffffffffffffffffffffffffffffffffffffff166318160ddd6040518163ffffffff1660e01b815260040160206040518083038186803b158015611bfc57600080fd5b505afa158015611c10573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611c349190612a57565b905060008111611c4657611c46612ecc565b80611c518386612e3f565b611c5b9190612f2a565b95945050505050565b6000808473ffffffffffffffffffffffffffffffffffffffff16632c668ec185856040518363ffffffff1660e01b8152600401611ca2929190612d52565b60206040518083038186803b158015611cba57600080fd5b505afa158015611cce573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611cf29190612a57565b905060008573ffffffffffffffffffffffffffffffffffffffff1663c7e074c386868973ffffffffffffffffffffffffffffffffffffffff16634d47b3046040518163ffffffff1660e01b815260040160206040518083038186803b158015611d5a57600080fd5b505afa158015611d6e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d929190612a57565b8a73ffffffffffffffffffffffffffffffffffffffff16637a210a2b6040518163ffffffff1660e01b815260040160206040518083038186803b158015611dd857600080fd5b505afa158015611dec573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e109190612a57565b60006040518663ffffffff1660e01b8152600401611e32959493929190612f3e565b60206040518083038186803b158015611e4a57600080fd5b505afa158015611e5e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e829190612a57565b9050610f2a82826120ae565b606081611ece57505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b8115611ef85780611ee281612e93565b9150611ef19050600a83612f2a565b9150611ed2565b60008167ffffffffffffffff811115611f1357611f13612316565b6040519080825280601f01601f191660200182016040528015611f3d576020820181803683370190505b508593509050815b8015611fc55780611f5581612df2565b9150611f649050600a85612f80565b611f6f906030612e27565b60f81b828281518110611f8457611f84612aac565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350611fbe600a85612f2a565b9350611f45565b50949350505050565b6000612030826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff166120d19092919063ffffffff16565b805190915015610e36578080602001905181019061204e9190612a8b565b610e36576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ddd90612fee565b6000600a8210156120a35761209a603083612e27565b60f81b92915050565b61209a605783612e27565b60006127106120bd8382612e7c565b6120c79085612e3f565b61168d9190612f2a565b60606103578484600085856000808673ffffffffffffffffffffffffffffffffffffffff1685876040516121059190612ffe565b60006040518083038185875af1925050503d8060008114612142576040519150601f19603f3d011682016040523d82523d6000602084013e612147565b606091505b509150915061215887838387612163565b979650505050505050565b606083156121c65782516121bf5773ffffffffffffffffffffffffffffffffffffffff85163b6121bf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ddd9061300a565b5081610357565b61035783838151156121db5781518083602001fd5b806040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ddd9190612be0565b604080516101008101825260008082526020820152908101612253604080516080810190915260008082526020820190815260200160008152602001600081525090565b81526020016000815260200160008152602001600073ffffffffffffffffffffffffffffffffffffffff16815260200160008152602001606081525090565b600073ffffffffffffffffffffffffffffffffffffffff8216610cff565b6000610cff82612292565b6000610cff826122b0565b6122cf816122bb565b82525050565b60208101610cff82846122c6565b6122ec81612292565b81146122f757600080fd5b50565b8035610cff816122e3565b806122ec565b8035610cff81612305565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b601f19601f830116810181811067ffffffffffffffff8211171561236b5761236b612316565b6040525050565b600061237d60405190565b90506123898282612345565b919050565b600067ffffffffffffffff8211156123a8576123a8612316565b601f19601f83011660200192915050565b82818337506000910152565b60006123d86123d38461238e565b612372565b9050828152602081018484840111156123f3576123f3600080fd5b6118708482856123b9565b600082601f83011261241257612412600080fd5b81356103578482602086016123c5565b6000806000806080858703121561243b5761243b600080fd5b600061244787876122fa565b9450506020612458878288016122fa565b93505060406124698782880161230b565b925050606085013567ffffffffffffffff81111561248957612489600080fd5b612495878288016123fe565b91505092959194509250565b806122cf565b60208101610cff82846124a1565b60008083601f8401126124ca576124ca600080fd5b50813567ffffffffffffffff8111156124e5576124e5600080fd5b60208301915083600182028301111561250057612500600080fd5b9250929050565b600080600080600080600060c0888a03121561252557612525600080fd5b60006125318a8a6122fa565b97505060206125428a828b016122fa565b96505060406125538a828b016122fa565b95505060606125648a828b016122fa565b94505060806125758a828b0161230b565b93505060a088013567ffffffffffffffff81111561259557612595600080fd5b6125a18a828b016124b5565b925092505092959891949750929550565b6000604082840312156125c7576125c7600080fd5b50919050565b600080600080608085870312156125e6576125e6600080fd5b60006125f287876122fa565b9450506020612603878288016125b2565b935050606085013567ffffffffffffffff81111561262357612623600080fd5b61262f878288016124b5565b95989497509550505050565b6000806000806000806000806000806101208b8d03121561265e5761265e600080fd5b600061266a8d8d61230b565b9a5050602061267b8d828e0161230b565b995050604061268c8d828e016122fa565b985050606061269d8d828e016122fa565b97505060806126ae8d828e0161230b565b96505060a06126bf8d828e0161230b565b95505060c06126d08d828e0161230b565b94505060e06126e18d828e0161230b565b9350506101008b013567ffffffffffffffff81111561270257612702600080fd5b61270e8d828e016124b5565b92509250509295989b9194979a5092959850565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b600981106122f7576122f7612722565b8061238981612751565b6000610cff82612761565b6122cf8161276b565b8015156122cf565b600281106122f7576122f7612722565b8061238981612787565b6000610cff82612797565b6122cf816127a1565b805160808301906127c6848261277f565b5060208201516127d960208501826127ac565b5060408201516127ec60408501826127ac565b506060820151610de660608501826124a1565b6122cf81612292565b60005b8381101561282357818101518382015260200161280b565b83811115610de65750506000910152565b600061283e825190565b808452602084019350612855818560208601612808565b601f01601f19169290920192915050565b805160009061016084019061287b8582612776565b50602083015161288e60208601826124a1565b5060408301516128a160408601826127b5565b5060608301516128b460c08601826124a1565b5060808301516128c760e08601826124a1565b5060a08301516128db6101008601826127ff565b5060c08301516128ef6101208601826124a1565b5060e0830151848203610140860152611c5b8282612834565b600061168d8383612866565b600061291e825190565b808452602084019350836020820285016129388560200190565b8060005b8581101561296d57848403895281516129558582612908565b94506020830160209a909a019992505060010161293c565b5091979650505050505050565b6020808252810161168d8184612914565b6000602082840312156129a0576129a0600080fd5b600061035784846122fa565b60208101610cff828461277f565b60208101610cff82846127ff565b600080604083850312156129de576129de600080fd5b60006129ea858561230b565b925050602083013567ffffffffffffffff811115612a0a57612a0a600080fd5b612a16858286016123fe565b9150509250929050565b8051610cff816122e3565b600060208284031215612a4057612a40600080fd5b60006103578484612a20565b8051610cff81612305565b600060208284031215612a6c57612a6c600080fd5b60006103578484612a4c565b8015156122ec565b8051610cff81612a78565b600060208284031215612aa057612aa0600080fd5b60006103578484612a80565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6122ec816122b0565b8051610cff81612adb565b600060208284031215612b0457612b04600080fd5b60006103578484612ae4565b6000612b1a825190565b612b28818560208601612808565b9290920192915050565b7fffff00000000000000000000000000000000000000000000000000000000000081166122cf565b7fff0000000000000000000000000000000000000000000000000000000000000081166122cf565b6000612b8e8289612b10565b9150612b9a8288612b32565b600282019150612baa8287612b10565b9150612bb68286612b32565b600282019150612bc68285612b10565b9150612bd28284612b5a565b506001019695505050505050565b6020808252810161168d8184612834565b6000612bfd8286612b10565b9150612c098285612b32565b600282019150611c5b8284612b10565b6000612c25828b612b10565b9150612c31828a612b32565b600282019150612c418289612b10565b9150612c4d8288612b32565b600282019150612c5d8287612b10565b9150612c698286612b32565b600282019150612c798285612b10565b9150612c858284612b5a565b5060010198975050505050505050565b60808101612ca382876127ff565b612cb060208301866124a1565b612cbd60408301856124a1565b611c5b60608301846127ff565b60408101612cd882856127ff565b61168d60208301846127ff565b603681526000602082017f5361666545524332303a20617070726f76652066726f6d206e6f6e2d7a65726f81527f20746f206e6f6e2d7a65726f20616c6c6f77616e636500000000000000000000602082015291505b5060400190565b60208082528101610cff81612ce5565b60408101612d6082856127ff565b61168d60208301846124a1565b600060208284031215612d8257612d82600080fd5b6000610357848461230b565b60408101612d9c82856124a1565b81810360208301526103578184612834565b6000612dba82846124a1565b50602001919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600081612e0157612e01612dc3565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b60008219821115612e3a57612e3a612dc3565b500190565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615612e7757612e77612dc3565b500290565b600082821015612e8e57612e8e612dc3565b500390565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415612ec557612ec5612dc3565b5060010190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052600160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600082612f3957612f39612efb565b500490565b60a08101612f4c82886127ff565b612f5960208301876124a1565b612f6660408301866124a1565b612f7360608301856124a1565b610f2a608083018461277f565b600082612f8f57612f8f612efb565b500690565b602a81526000602082017f5361666545524332303a204552433230206f7065726174696f6e20646964206e81527f6f7420737563636565640000000000000000000000000000000000000000000060208201529150612d3b565b60208082528101610cff81612f94565b600061168d8284612b10565b60208082528101610cff81601d81527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060208201526040019056fea2646970667358221220b54ce3168c16c5abe10d11a5cabd02384d071fb3e69ca999825b169febeee94064736f6c63430008090033";
const isSuperArgs = (xs) => xs.length > 1;
class GLPIsolationModeUnwrapperTraderV2__factory extends ethers_1.ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(_gmxRegistry, _dfsGlp, _dolomiteMargin, overrides) {
        return super.deploy(_gmxRegistry, _dfsGlp, _dolomiteMargin, overrides || {});
    }
    getDeployTransaction(_gmxRegistry, _dfsGlp, _dolomiteMargin, overrides) {
        return super.getDeployTransaction(_gmxRegistry, _dfsGlp, _dolomiteMargin, overrides || {});
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
exports.GLPIsolationModeUnwrapperTraderV2__factory = GLPIsolationModeUnwrapperTraderV2__factory;
GLPIsolationModeUnwrapperTraderV2__factory.bytecode = _bytecode;
GLPIsolationModeUnwrapperTraderV2__factory.abi = _abi;
