"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlutusVaultGLPIsolationModeUnwrapperTraderV1__factory = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_usdc",
                type: "address",
            },
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
        name: "USDC",
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
        name: "USDC_MARKET_ID",
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
const _bytecode = "0x6101406040523480156200001257600080fd5b50604051620033cb380380620033cb83398101604081905262000035916200011f565b6001600160a01b03808216608081905281841660a05286821660c0528582166101005290841661012052604051638fae3be160e01b8152638fae3be19062000082908890600401620001b4565b60206040518083038186803b1580156200009b57600080fd5b505afa158015620000b0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620000d69190620001d8565b60e05250620002059350505050565b60006001600160a01b0382165b92915050565b6200010381620000e5565b81146200010f57600080fd5b50565b8051620000f281620000f8565b600080600080600060a086880312156200013c576200013c600080fd5b60006200014a888862000112565b95505060206200015d8882890162000112565b9450506040620001708882890162000112565b9350506060620001838882890162000112565b9250506080620001968882890162000112565b9150509295509295909350565b620001ae81620000e5565b82525050565b60208101620000f28284620001a3565b8062000103565b8051620000f281620001c4565b600060208284031215620001ef57620001ef600080fd5b6000620001fd8484620001cb565b949350505050565b60805160a05160c05160e05161010051610120516130dd620002ee6000396000818161016c0152818161066301528181611803015261191a0152600081816102630152818161077a015281816107a80152611aa40152600081816101b00152818161023c01526103310152600081816101ec01528181610596015261178401526000818160e90152818161028701528181610516015281816108dd015281816109ba01528181610b2201528181610d0b0152610f490152600081816101230152818161035c015281816104260152818161085c01528181610bf80152610c2201526130dd6000f3fe608060405234801561001057600080fd5b50600436106100df5760003560e01c80637d98ebac1161008c578063b189111a11610066578063b189111a14610230578063b5bc101714610237578063ba1fc25e1461025e578063fc0c546a1461028557600080fd5b80637d98ebac146101d457806389a30271146101e75780638b4187131461021b57600080fd5b80632115ba3e116100bd5780632115ba3e146101675780633a8fdd7d1461018e5780635e93205d146101ae57600080fd5b8063103f2907146100e457806315c14a4a1461012157806317753c6314610147575b600080fd5b61010b7f000000000000000000000000000000000000000000000000000000000000000081565b6040516101189190612377565b60405180910390f35b7f000000000000000000000000000000000000000000000000000000000000000061010b565b61015a6101553660046123b4565b6102ab565b60405161011891906126ca565b61010b7f000000000000000000000000000000000000000000000000000000000000000081565b6101a161019c3660046127e2565b61050f565b6040516101189190612861565b7f00000000000000000000000000000000000000000000000000000000000000006101a1565b6101a16101e23660046128c1565b610854565b61020e7f000000000000000000000000000000000000000000000000000000000000000081565b604051610118919061296c565b61022e610229366004612995565b610bf2565b005b60026101a1565b6101a17f000000000000000000000000000000000000000000000000000000000000000081565b61010b7f000000000000000000000000000000000000000000000000000000000000000081565b7f000000000000000000000000000000000000000000000000000000000000000061020e565b604080516002808252606082810190935260009190816020015b6102cd6122cb565b8152602001906001900390816102c557905050905061030c8930856040516020016102f89190612861565b604051602081830303815290604052610fd5565b8160008151811061031f5761031f612a03565b602002602001018190525060006103537f000000000000000000000000000000000000000000000000000000000000000090565b905060006104c17f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663062bd3e9896040518263ffffffff1660e01b81526004016103a69190612861565b60206040518083038186803b1580156103be57600080fd5b505afa1580156103d2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103f69190612a3d565b6040517f062bd3e90000000000000000000000000000000000000000000000000000000081526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063062bd3e99061045b908790600401612861565b60206040518083038186803b15801561047357600080fd5b505afa158015610487573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104ab9190612a3d565b876040518060200160405280600081525061050f565b90506104e18c888430898660405180602001604052806000815250611053565b836001815181106104f4576104f4612a03565b602090810291909101015250909a9950505050505050505050565b60006105917f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316866001600160a01b0316147f506c757475735661756c74474c50556e777261707065725631000000000000007f496e76616c696420696e70757420746f6b656e0000000000000000000000000088611177565b6106117f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316856001600160a01b0316147f506c757475735661756c74474c50556e777261707065725631000000000000007f496e76616c6964206f757470757420746f6b656e00000000000000000000000087611177565b61065f600084117f506c757475735661756c74474c50556e777261707065725631000000000000007f496e76616c6964206465736972656420696e70757420616d6f756e740000000061125e565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316638b7f9d6e6040518163ffffffff1660e01b815260040160206040518083038186803b1580156106ba57600080fd5b505afa1580156106ce573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106f29190612a72565b6001600160a01b031663cbe52ae330866040518363ffffffff1660e01b815260040161071f929190612a93565b60606040518083038186803b15801561073757600080fd5b505afa15801561074b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061076f9190612ab9565b92505050600061079f7f0000000000000000000000000000000000000000000000000000000000000000836112ad565b905061084786827f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663b3b3453e6040518163ffffffff1660e01b815260040160206040518083038186803b1580156107ff57600080fd5b505afa158015610813573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108379190612a72565b6001600160a01b031691906114b2565b925050505b949350505050565b6000336108d87f00000000000000000000000000000000000000000000000000000000000000005b6001600160a01b0316826001600160a01b0316147f4f6e6c79446f6c6f6d6974654d617267696e00000000000000000000000000007f4f6e6c7920446f6c6f6d6974652063616e2063616c6c2066756e6374696f6e0084611177565b6109587f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316876001600160a01b0316147f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563100007f496e76616c696420696e70757420746f6b656e0000000000000000000000000089611177565b6109a6600086117f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563100007f496e76616c696420696e70757420616d6f756e7400000000000000000000000061125e565b60006109b484860186612b09565b905060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166329db1be66040518163ffffffff1660e01b815260040160206040518083038186803b158015610a1157600080fd5b505afa158015610a25573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a499190612a3d565b6001600160a01b03166370a08231306040518263ffffffff1660e01b8152600401610a74919061296c565b60206040518083038186803b158015610a8c57600080fd5b505afa158015610aa0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ac49190612b2a565b9050610b16878210157f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563100007f496e73756666696369656e7420696e70757420746f6b656e0000000000000000848b6116b2565b506000610b7e8b8b8b857f00000000000000000000000000000000000000000000000000000000000000008c8c8c8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061177d92505050565b9050610bd0828210157f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563100007f496e73756666696369656e74206f757470757420616d6f756e7400000000000084866116b2565b610be46001600160a01b038a168b83611bc5565b9a9950505050505050505050565b33610c1c7f000000000000000000000000000000000000000000000000000000000000000061087c565b84610d047f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663052f72d7836040518263ffffffff1660e01b8152600401610c6c919061296c565b60206040518083038186803b158015610c8457600080fd5b505afa158015610c98573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cbc9190612b5e565b7f4f6e6c79446f6c6f6d6974654d617267696e00000000000000000000000000007f43616c6c6572206973206e6f74206120676c6f62616c206f70657261746f720084611177565b610e1060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663bc083732610d4560208a018a612b7f565b6040518263ffffffff1660e01b8152600401610d61919061296c565b60206040518083038186803b158015610d7957600080fd5b505afa158015610d8d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610db19190612a3d565b6001600160a01b031614157f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563100007f4163636f756e74206f776e6572206973206e6f742061207661756c7400000000610e0b60208a018a612b7f565b611177565b6000610e1e84860186612b09565b9050610e6e600082117f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563100007f496e76616c6964207472616e7366657220616d6f756e7400000000000000000061125e565b6000610e7d6020880188612b7f565b6001600160a01b0316639cd7a1c46040518163ffffffff1660e01b815260040160206040518083038186803b158015610eb557600080fd5b505afa158015610ec9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610eed9190612b2a565b9050610f3f828210157f49736f6c6174696f6e4d6f6465556e77726170706572547261646572563100007f496e73756666696369656e742062616c616e636500000000000000000000000084866116b2565b6001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000166354441311610f7b60208a018a612b7f565b846040518363ffffffff1660e01b8152600401610f99929190612a93565b600060405180830381600087803b158015610fb357600080fd5b505af1158015610fc7573d6000803e3d6000fd5b505050505050505050505050565b610fdd6122cb565b60408051610100810182526008815260208082018790528251608081018452600080825292938401929091820190815260200160008152602001600081525081526020016000815260200160008152602001846001600160a01b03168152602001600081526020018381525090505b9392505050565b61105b6122cb565b611087604080516080810190915260008082526020820190815260200160008152602001600081525090565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8514156110dc5760408051608081019091526000808252602082019081526020016001815260200160008152509050611103565b60408051608081019091526000808252602082019081526020016000815260200186905290505b60408051610100810190915280600481526020018a8152602001828152602001898152602001888152602001876001600160a01b03168152602001600081526020018585604051602001611158929190612ba0565b60408051601f1981840301815291905290529998505050505050505050565b836112585761118583611d1f565b7f3a200000000000000000000000000000000000000000000000000000000000006111af84611d1f565b7f203c0000000000000000000000000000000000000000000000000000000000006111d985611dd2565b60405161120f9594939291907f3e0000000000000000000000000000000000000000000000000000000000000090602001612c32565b60408051601f19818403018152908290527f08c379a000000000000000000000000000000000000000000000000000000000825261124f91600401612c90565b60405180910390fd5b50505050565b826112a85761126c82611d1f565b7f3a2000000000000000000000000000000000000000000000000000000000000061129683611d1f565b60405160200161120f93929190612ca1565b505050565b600080836001600160a01b031663fa6db1bc6040518163ffffffff1660e01b815260040160206040518083038186803b1580156112e957600080fd5b505afa1580156112fd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113219190612a72565b6001600160a01b03166368a0a3e060006040518263ffffffff1660e01b815260040161134d9190612cc9565b60206040518083038186803b15801561136557600080fd5b505afa158015611379573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061139d9190612b2a565b90506000846001600160a01b03166378a207ee6040518163ffffffff1660e01b815260040160206040518083038186803b1580156113da57600080fd5b505afa1580156113ee573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114129190612a72565b6001600160a01b03166318160ddd6040518163ffffffff1660e01b815260040160206040518083038186803b15801561144a57600080fd5b505afa15801561145e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114829190612b2a565b90506000811161149457611494612cd7565b8061149f8386612d35565b6114a99190612da1565b95945050505050565b600080846001600160a01b0316632c668ec185856040518363ffffffff1660e01b81526004016114e3929190612a93565b60206040518083038186803b1580156114fb57600080fd5b505afa15801561150f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115339190612b2a565b90506000856001600160a01b031663c7e074c38686896001600160a01b0316634d47b3046040518163ffffffff1660e01b815260040160206040518083038186803b15801561158157600080fd5b505afa158015611595573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115b99190612b2a565b8a6001600160a01b0316637a210a2b6040518163ffffffff1660e01b815260040160206040518083038186803b1580156115f257600080fd5b505afa158015611606573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061162a9190612b2a565b60006040518663ffffffff1660e01b815260040161164c959493929190612db5565b60206040518083038186803b15801561166457600080fd5b505afa158015611678573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061169c9190612b2a565b90506116a88282611f78565b9695505050505050565b84611776576116c084611d1f565b7f3a200000000000000000000000000000000000000000000000000000000000006116ea85611d1f565b7f203c00000000000000000000000000000000000000000000000000000000000061171486611fa4565b7f2c2000000000000000000000000000000000000000000000000000000000000061173e87611fa4565b60405161120f97969594939291907f3e0000000000000000000000000000000000000000000000000000000000000090602001612df7565b5050505050565b60006117ff7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316876001600160a01b0316147f506c757475735661756c74474c50556e777261707065725631000000000000007f496e76616c6964206f757470757420746f6b656e00000000000000000000000089611177565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316638b7f9d6e6040518163ffffffff1660e01b815260040160206040518083038186803b15801561185a57600080fd5b505afa15801561186e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118929190612a72565b90506000816001600160a01b031663cbe52ae330876040518363ffffffff1660e01b81526004016118c4929190612a93565b60606040518083038186803b1580156118dc57600080fd5b505afa1580156118f0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119149190612ab9565b925050507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663512084cd6040518163ffffffff1660e01b815260040160206040518083038186803b15801561197157600080fd5b505afa158015611985573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119a99190612a72565b6001600160a01b031663095ea7b383876040518363ffffffff1660e01b81526004016119d6929190612a93565b602060405180830381600087803b1580156119f057600080fd5b505af1158015611a04573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a289190612b5e565b506040517fdb006a750000000000000000000000000000000000000000000000000000000081526001600160a01b0383169063db006a7590611a6e908890600401612861565b600060405180830381600087803b158015611a8857600080fd5b505af1158015611a9c573d6000803e3d6000fd5b5050505060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166374899c296040518163ffffffff1660e01b815260040160206040518083038186803b158015611afb57600080fd5b505afa158015611b0f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b339190612a72565b6001600160a01b0316630f3aa5548a848b306040518563ffffffff1660e01b8152600401611b649493929190612e73565b602060405180830381600087803b158015611b7e57600080fd5b505af1158015611b92573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611bb69190612b2a565b9b9a5050505050505050505050565b801580611c6657506040517fdd62ed3e0000000000000000000000000000000000000000000000000000000081526001600160a01b0384169063dd62ed3e90611c149030908690600401612ea8565b60206040518083038186803b158015611c2c57600080fd5b505afa158015611c40573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611c649190612b2a565b155b611c9c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161124f90612f20565b6112a88363095ea7b360e01b8484604051602401611cbb929190612a93565b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff00000000000000000000000000000000000000000000000000000000909316929092179091526120e4565b6060600082604051602001611d349190612f30565b60408051601f19818403018152919052905060205b8015611db75780611d5981612f45565b915050818181518110611d6e57611d6e612a03565b01602001517fff000000000000000000000000000000000000000000000000000000000000001615611db2576000611da7826001612f7a565b835250909392505050565b611d49565b5060408051600080825260208201909252905b509392505050565b60408051602a80825260608281019093526001600160a01b03841691600091602082018180368337019050509050603060f81b81600081518110611e1857611e18612a03565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350607860f81b81600181518110611e5f57611e5f612a03565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060005b6014811015611dca576000611ea7826002612d35565b9050611eb5600f851661218d565b83611ec1836029612f92565b81518110611ed157611ed1612a03565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600484901c9350611f13600f851661218d565b83611f1f836028612f92565b81518110611f2f57611f2f612a03565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053505060049290921c9180611f7081612fa9565b915050611e91565b6000612710611f878382612f92565b611f919085612d35565b611f9b9190612da1565b90505b92915050565b606081611fe457505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b811561200e5780611ff881612fa9565b91506120079050600a83612da1565b9150611fe8565b60008167ffffffffffffffff811115612029576120296126db565b6040519080825280601f01601f191660200182016040528015612053576020820181803683370190505b508593509050815b80156120db578061206b81612f45565b915061207a9050600a85612fe2565b612085906030612f7a565b60f81b82828151811061209a5761209a612a03565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506120d4600a85612da1565b935061205b565b50949350505050565b6000612139826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b03166121b79092919063ffffffff16565b8051909150156112a857808060200190518101906121579190612b5e565b6112a8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161124f90613050565b6000600a8210156121ac576121a3603083612f7a565b60f81b92915050565b6121a3605783612f7a565b606061084c848460008585600080866001600160a01b031685876040516121de9190613060565b60006040518083038185875af1925050503d806000811461221b576040519150601f19603f3d011682016040523d82523d6000602084013e612220565b606091505b5091509150610847878383876060831561228257825161227b576001600160a01b0385163b61227b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161124f9061306c565b508161084c565b61084c83838151156122975781518083602001fd5b806040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161124f9190612c90565b60408051610100810182526000808252602082015290810161230f604080516080810190915260008082526020820190815260200160008152602001600081525090565b8152602001600081526020016000815260200160006001600160a01b0316815260200160008152602001606081525090565b60006001600160a01b038216611f9e565b6000611f9e82612341565b6000611f9e82612352565b6123718161235d565b82525050565b60208101611f9e8284612368565b805b811461239257600080fd5b50565b8035611f9e81612385565b61238781612341565b8035611f9e816123a0565b600080600080600080600080610100898b0312156123d4576123d4600080fd5b60006123e08b8b612395565b98505060206123f18b828c01612395565b97505060406124028b828c016123a9565b96505060606124138b828c016123a9565b95505060806124248b828c01612395565b94505060a06124358b828c01612395565b93505060c06124468b828c01612395565b92505060e06124578b828c01612395565b9150509295985092959890939650565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6009811061239257612392612467565b806124b081612496565b919050565b6000611f9e826124a6565b612371816124b5565b80612371565b801515612371565b6002811061239257612392612467565b806124b0816124d7565b6000611f9e826124e7565b612371816124f1565b8051608083019061251684826124cf565b50602082015161252960208501826124fc565b50604082015161253c60408501826124fc565b50606082015161125860608501826124c9565b61237181612341565b60005b8381101561257357818101518382015260200161255b565b838111156112585750506000910152565b600061258e825190565b8084526020840193506125a5818560208601612558565b601f01601f19169290920192915050565b80516000906101608401906125cb85826124c0565b5060208301516125de60208601826124c9565b5060408301516125f16040860182612505565b50606083015161260460c08601826124c9565b50608083015161261760e08601826124c9565b5060a083015161262b61010086018261254f565b5060c083015161263f6101208601826124c9565b5060e08301518482036101408601526114a98282612584565b6000611f9b83836125b6565b600061266e825190565b808452602084019350836020820285016126888560200190565b8060005b858110156126bd57848403895281516126a58582612658565b94506020830160209a909a019992505060010161268c565b5091979650505050505050565b60208082528101611f9b8184612664565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b601f19601f830116810181811067ffffffffffffffff82111715612730576127306126db565b6040525050565b600061274260405190565b90506124b0828261270a565b600067ffffffffffffffff821115612768576127686126db565b601f19601f83011660200192915050565b82818337506000910152565b60006127986127938461274e565b612737565b9050828152602081018484840111156127b3576127b3600080fd5b611dca848285612779565b600082601f8301126127d2576127d2600080fd5b813561084c848260208601612785565b600080600080608085870312156127fb576127fb600080fd5b600061280787876123a9565b9450506020612818878288016123a9565b935050604061282987828801612395565b925050606085013567ffffffffffffffff81111561284957612849600080fd5b612855878288016127be565b91505092959194509250565b60208101611f9e82846124c9565b60008083601f84011261288457612884600080fd5b50813567ffffffffffffffff81111561289f5761289f600080fd5b6020830191508360018202830111156128ba576128ba600080fd5b9250929050565b600080600080600080600060c0888a0312156128df576128df600080fd5b60006128eb8a8a6123a9565b97505060206128fc8a828b016123a9565b965050604061290d8a828b016123a9565b955050606061291e8a828b016123a9565b945050608061292f8a828b01612395565b93505060a088013567ffffffffffffffff81111561294f5761294f600080fd5b61295b8a828b0161286f565b925092505092959891949750929550565b60208101611f9e828461254f565b60006040828403121561298f5761298f600080fd5b50919050565b600080600080608085870312156129ae576129ae600080fd5b60006129ba87876123a9565b94505060206129cb8782880161297a565b935050606085013567ffffffffffffffff8111156129eb576129eb600080fd5b6129f78782880161286f565b95989497509550505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b8051611f9e816123a0565b600060208284031215612a5257612a52600080fd5b600061084c8484612a32565b61238781612352565b8051611f9e81612a5e565b600060208284031215612a8757612a87600080fd5b600061084c8484612a67565b60408101612aa1828561254f565b61104c60208301846124c9565b8051611f9e81612385565b600080600060608486031215612ad157612ad1600080fd5b6000612add8686612aae565b9350506020612aee86828701612aae565b9250506040612aff86828701612aae565b9150509250925092565b600060208284031215612b1e57612b1e600080fd5b600061084c8484612395565b600060208284031215612b3f57612b3f600080fd5b600061084c8484612aae565b801515612387565b8051611f9e81612b4b565b600060208284031215612b7357612b73600080fd5b600061084c8484612b53565b600060208284031215612b9457612b94600080fd5b600061084c84846123a9565b60408101612bae82856124c9565b818103602083015261084c8184612584565b6000612bca825190565b612bd8818560208601612558565b9290920192915050565b7fffff0000000000000000000000000000000000000000000000000000000000008116612371565b7fff000000000000000000000000000000000000000000000000000000000000008116612371565b6000612c3e8289612bc0565b9150612c4a8288612be2565b600282019150612c5a8287612bc0565b9150612c668286612be2565b600282019150612c768285612bc0565b9150612c828284612c0a565b506001019695505050505050565b60208082528101611f9b8184612584565b6000612cad8286612bc0565b9150612cb98285612be2565b6002820191506114a98284612bc0565b60208101611f9e82846124cf565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052600160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615612d6d57612d6d612d06565b500290565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600082612db057612db0612d72565b500490565b60a08101612dc3828861254f565b612dd060208301876124c9565b612ddd60408301866124c9565b612dea60608301856124c9565b6116a860808301846124cf565b6000612e03828b612bc0565b9150612e0f828a612be2565b600282019150612e1f8289612bc0565b9150612e2b8288612be2565b600282019150612e3b8287612bc0565b9150612e478286612be2565b600282019150612e578285612bc0565b9150612e638284612c0a565b5060010198975050505050505050565b60808101612e81828761254f565b612e8e60208301866124c9565b612e9b60408301856124c9565b6114a9606083018461254f565b60408101612eb6828561254f565b61104c602083018461254f565b603681526000602082017f5361666545524332303a20617070726f76652066726f6d206e6f6e2d7a65726f81527f20746f206e6f6e2d7a65726f20616c6c6f77616e636500000000000000000000602082015291505b5060400190565b60208082528101611f9e81612ec3565b6000612f3c82846124c9565b50602001919050565b600081612f5457612f54612d06565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b60008219821115612f8d57612f8d612d06565b500190565b600082821015612fa457612fa4612d06565b500390565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415612fdb57612fdb612d06565b5060010190565b600082612ff157612ff1612d72565b500690565b602a81526000602082017f5361666545524332303a204552433230206f7065726174696f6e20646964206e81527f6f7420737563636565640000000000000000000000000000000000000000000060208201529150612f19565b60208082528101611f9e81612ff6565b600061104c8284612bc0565b60208082528101611f9e81601d81527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060208201526040019056fea2646970667358221220f631d3dd28d00554f8332ac7e54224084403e8ef5a3b077da43ff96f4de9ff0564736f6c63430008090033";
const isSuperArgs = (xs) => xs.length > 1;
class PlutusVaultGLPIsolationModeUnwrapperTraderV1__factory extends ethers_1.ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(_usdc, _gmxRegistry, _plutusVaultRegistry, _dPlvGlp, _dolomiteMargin, overrides) {
        return super.deploy(_usdc, _gmxRegistry, _plutusVaultRegistry, _dPlvGlp, _dolomiteMargin, overrides || {});
    }
    getDeployTransaction(_usdc, _gmxRegistry, _plutusVaultRegistry, _dPlvGlp, _dolomiteMargin, overrides) {
        return super.getDeployTransaction(_usdc, _gmxRegistry, _plutusVaultRegistry, _dPlvGlp, _dolomiteMargin, overrides || {});
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
exports.PlutusVaultGLPIsolationModeUnwrapperTraderV1__factory = PlutusVaultGLPIsolationModeUnwrapperTraderV1__factory;
PlutusVaultGLPIsolationModeUnwrapperTraderV1__factory.bytecode = _bytecode;
PlutusVaultGLPIsolationModeUnwrapperTraderV1__factory.abi = _abi;
