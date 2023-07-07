"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestIsolationModeWrapperTraderV1__factory = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_vaultFactory",
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
        stateMutability: "pure",
        type: "function",
    },
];
const _bytecode = "0x60c06040523480156200001157600080fd5b506040516200261238038062002612833981016040819052620000349162000086565b6001600160a01b039081166080521660a052620000c9565b60006001600160a01b0382165b92915050565b6200006a816200004c565b81146200007657600080fd5b50565b805162000059816200005f565b600080604083850312156200009e576200009e600080fd5b6000620000ac858562000079565b9250506020620000bf8582860162000079565b9150509250929050565b60805160a0516124bc6200015660003960008181607c015281816101ca015281816102c6015281816104280152818161090901528181610d1001528181610d7d0152610e5601526000818160b60152818161015b0152818161044a0152818161058b0152818161066f01528181610891015281816108cd01528181610a070152610a4301526124bc6000f3fe608060405234801561001057600080fd5b50600436106100725760003560e01c80637d98ebac116100505780637d98ebac146100fa578063b189111a1461010d578063c14e3a471461011457600080fd5b8063103f29071461007757806315c14a4a146100b45780633a8fdd7d146100da575b600080fd5b61009e7f000000000000000000000000000000000000000000000000000000000000000081565b6040516100ab919061184d565b60405180910390f35b7f000000000000000000000000000000000000000000000000000000000000000061009e565b6100ed6100e83660046119b8565b610134565b6040516100ab9190611a3d565b6100ed610108366004611a9d565b61013e565b60016100ed565b610127610122366004611b48565b61040c565b6040516100ab9190611e5c565b815b949350505050565b6000336101c573ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001682147f4f6e6c79446f6c6f6d6974654d617267696e00000000000000000000000000007f4f6e6c7920446f6c6f6d6974652063616e2063616c6c2066756e6374696f6e0084610756565b61025f7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168873ffffffffffffffffffffffffffffffffffffffff16147f49736f6c6174696f6e4d6f6465577261707065725472616465725631000000007f496e76616c6964206f757470757420746f6b656e0000000000000000000000008a610756565b6102ad600086117f49736f6c6174696f6e4d6f6465577261707065725472616465725631000000007f496e76616c696420696e70757420616d6f756e7400000000000000000000000061083d565b60006102bb84860186611e6d565b905060006103a18b8b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166329db1be66040518163ffffffff1660e01b815260040160206040518083038186803b15801561032a57600080fd5b505afa15801561033e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103629190611e99565b858c8c8c8c8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061088c92505050565b90506103f3828210157f49736f6c6174696f6e4d6f6465577261707065725472616465725631000000007f496e73756666696369656e74206f757470757420616d6f756e740000000000008486610c08565b6103fe8b8b83610cd3565b9a9950505050505050505050565b606061055073ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000167f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663062bd3e9886040518263ffffffff1660e01b81526004016104a19190611a3d565b60206040518083038186803b1580156104b957600080fd5b505afa1580156104cd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104f19190611e99565b73ffffffffffffffffffffffffffffffffffffffff16147f49736f6c6174696f6e4d6f6465577261707065725472616465725631000000007f496e76616c6964206f7574707574206d61726b6574000000000000000000000088610e7d565b604080516001808252818301909252600091816020015b61056f611785565b815260200190600190039081610567579050509050600061070a7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663062bd3e9886040518263ffffffff1660e01b81526004016105e29190611a3d565b60206040518083038186803b1580156105fa57600080fd5b505afa15801561060e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106329190611e99565b6040517f062bd3e900000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000169063062bd3e9906106a4908c90600401611a3d565b60206040518083038186803b1580156106bc57600080fd5b505afa1580156106d0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106f49190611e99565b8660405180602001604052806000815250610134565b905061072a8b878930888660405180602001604052806000815250610edf565b8260008151811061073d5761073d611eba565b6020908102919091010152509998505050505050505050565b836108375761076483611010565b7f3a2000000000000000000000000000000000000000000000000000000000000061078e84611010565b7f203c0000000000000000000000000000000000000000000000000000000000006107b8856110c3565b6040516107ee9594939291907f3e0000000000000000000000000000000000000000000000000000000000000090602001611f5b565b60408051601f19818403018152908290527f08c379a000000000000000000000000000000000000000000000000000000000825261082e91600401611fb9565b60405180910390fd5b50505050565b826108875761084b82611010565b7f3a2000000000000000000000000000000000000000000000000000000000000061087583611010565b6040516020016107ee93929190611fca565b505050565b6000807f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16638928378e7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16638fae3be17f00000000000000000000000000000000000000000000000000000000000000006040518263ffffffff1660e01b81526004016109449190611ff2565b60206040518083038186803b15801561095c57600080fd5b505afa158015610970573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610994919061200b565b6040518263ffffffff1660e01b81526004016109b09190611a3d565b60206040518083038186803b1580156109c857600080fd5b505afa1580156109dc573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a009190612062565b51905060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16638928378e7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16638fae3be1896040518263ffffffff1660e01b8152600401610a9a9190611ff2565b60206040518083038186803b158015610ab257600080fd5b505afa158015610ac6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aea919061200b565b6040518263ffffffff1660e01b8152600401610b069190611a3d565b60206040518083038186803b158015610b1e57600080fd5b505afa158015610b32573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b569190612062565b519050600082610b6683886120b2565b610b70919061211e565b6040517f21e5383a00000000000000000000000000000000000000000000000000000000815290915073ffffffffffffffffffffffffffffffffffffffff8a16906321e5383a90610bc79030908590600401612132565b600060405180830381600087803b158015610be157600080fd5b505af1158015610bf5573d6000803e3d6000fd5b50929d9c50505050505050505050505050565b84610ccc57610c1684611010565b7f3a20000000000000000000000000000000000000000000000000000000000000610c4085611010565b7f203c000000000000000000000000000000000000000000000000000000000000610c6a86611276565b7f2c20000000000000000000000000000000000000000000000000000000000000610c9487611276565b6040516107ee97969594939291907f3e000000000000000000000000000000000000000000000000000000000000009060200161214d565b5050505050565b6040517f5b74905400000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690635b74905490610d479086908590600401612132565b600060405180830381600087803b158015610d6157600080fd5b505af1158015610d75573d6000803e3d6000fd5b5050505060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166329db1be66040518163ffffffff1660e01b815260040160206040518083038186803b158015610de157600080fd5b505afa158015610df5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e199190611e99565b9050610e3c73ffffffffffffffffffffffffffffffffffffffff821685846113b6565b61083773ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001684846113b6565b8361083757610e8b83611010565b7f3a20000000000000000000000000000000000000000000000000000000000000610eb584611010565b7f203c0000000000000000000000000000000000000000000000000000000000006107b885611276565b610ee7611785565b610f13604080516080810190915260008082526020820190815260200160008152602001600081525090565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff851415610f685760408051608081019091526000808252602082019081526020016001815260200160008152509050610f8f565b60408051608081019091526000808252602082019081526020016000815260200186905290505b60408051610100810190915280600481526020018a81526020018281526020018981526020018881526020018773ffffffffffffffffffffffffffffffffffffffff168152602001600081526020018585604051602001610ff19291906121c9565b60408051601f1981840301815291905290529998505050505050505050565b606060008260405160200161102591906121e9565b60408051601f19818403018152919052905060205b80156110a8578061104a816121fe565b91505081818151811061105f5761105f611eba565b01602001517fff0000000000000000000000000000000000000000000000000000000000000016156110a3576000611098826001612233565b835250909392505050565b61103a565b5060408051600080825260208201909252905b509392505050565b60408051602a808252606082810190935273ffffffffffffffffffffffffffffffffffffffff841691600091602082018180368337019050509050603060f81b8160008151811061111657611116611eba565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350607860f81b8160018151811061115d5761115d611eba565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060005b60148110156110bb5760006111a58260026120b2565b90506111b3600f851661151d565b836111bf83602961224b565b815181106111cf576111cf611eba565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600484901c9350611211600f851661151d565b8361121d83602861224b565b8151811061122d5761122d611eba565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053505060049290921c918061126e81612262565b91505061118f565b6060816112b657505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b81156112e057806112ca81612262565b91506112d99050600a8361211e565b91506112ba565b60008167ffffffffffffffff8111156112fb576112fb6118ac565b6040519080825280601f01601f191660200182016040528015611325576020820181803683370190505b508593509050815b80156113ad578061133d816121fe565b915061134c9050600a8561229b565b611357906030612233565b60f81b82828151811061136c5761136c611eba565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506113a6600a8561211e565b935061132d565b50949350505050565b80158061146457506040517fdd62ed3e00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff84169063dd62ed3e9061141290309086906004016122af565b60206040518083038186803b15801561142a57600080fd5b505afa15801561143e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611462919061200b565b155b61149a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082e90612327565b6108878363095ea7b360e01b84846040516024016114b9929190612132565b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff0000000000000000000000000000000000000000000000000000000090931692909217909152611547565b6000600a82101561153c57611533603083612233565b60f81b92915050565b611533605783612233565b60006115a9826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff166115fd9092919063ffffffff16565b80519091501561088757808060200190518101906115c7919061234a565b610887576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082e906123c5565b606061160c8484600085611616565b90505b9392505050565b606082471015611652576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082e9061242f565b6000808673ffffffffffffffffffffffffffffffffffffffff16858760405161167b919061243f565b60006040518083038185875af1925050503d80600081146116b8576040519150601f19603f3d011682016040523d82523d6000602084013e6116bd565b606091505b50915091506116ce878383876116d9565b979650505050505050565b6060831561173c5782516117355773ffffffffffffffffffffffffffffffffffffffff85163b611735576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082e9061244b565b5081610136565b61013683838151156117515781518083602001fd5b806040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082e9190611fb9565b6040805161010081018252600080825260208201529081016117c9604080516080810190915260008082526020820190815260200160008152602001600081525090565b81526020016000815260200160008152602001600073ffffffffffffffffffffffffffffffffffffffff16815260200160008152602001606081525090565b600073ffffffffffffffffffffffffffffffffffffffff82165b92915050565b600061182282611808565b600061182282611828565b61184781611833565b82525050565b60208101611822828461183e565b600073ffffffffffffffffffffffffffffffffffffffff8216611822565b6118828161185b565b811461188d57600080fd5b50565b803561182281611879565b80611882565b80356118228161189b565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b601f19601f830116810181811067ffffffffffffffff82111715611901576119016118ac565b6040525050565b600061191360405190565b905061191f82826118db565b919050565b600067ffffffffffffffff82111561193e5761193e6118ac565b601f19601f83011660200192915050565b82818337506000910152565b600061196e61196984611924565b611908565b90508281526020810184848401111561198957611989600080fd5b6110bb84828561194f565b600082601f8301126119a8576119a8600080fd5b813561013684826020860161195b565b600080600080608085870312156119d1576119d1600080fd5b60006119dd8787611890565b94505060206119ee87828801611890565b93505060406119ff878288016118a1565b925050606085013567ffffffffffffffff811115611a1f57611a1f600080fd5b611a2b87828801611994565b91505092959194509250565b80611847565b602081016118228284611a37565b60008083601f840112611a6057611a60600080fd5b50813567ffffffffffffffff811115611a7b57611a7b600080fd5b602083019150836001820283011115611a9657611a96600080fd5b9250929050565b600080600080600080600060c0888a031215611abb57611abb600080fd5b6000611ac78a8a611890565b9750506020611ad88a828b01611890565b9650506040611ae98a828b01611890565b9550506060611afa8a828b01611890565b9450506080611b0b8a828b016118a1565b93505060a088013567ffffffffffffffff811115611b2b57611b2b600080fd5b611b378a828b01611a4b565b925092505092959891949750929550565b600080600080600080600080610100898b031215611b6857611b68600080fd5b6000611b748b8b6118a1565b9850506020611b858b828c016118a1565b9750506040611b968b828c01611890565b9650506060611ba78b828c01611890565b9550506080611bb88b828c016118a1565b94505060a0611bc98b828c016118a1565b93505060c0611bda8b828c016118a1565b92505060e0611beb8b828c016118a1565b9150509295985092959890939650565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6009811061188d5761188d611bfb565b8061191f81611c2a565b600061182282611c3a565b61184781611c44565b801515611847565b6002811061188d5761188d611bfb565b8061191f81611c60565b600061182282611c70565b61184781611c7a565b80516080830190611c9f8482611c58565b506020820151611cb26020850182611c85565b506040820151611cc56040850182611c85565b5060608201516108376060850182611a37565b6118478161185b565b60005b83811015611cfc578181015183820152602001611ce4565b838111156108375750506000910152565b6000611d17825190565b808452602084019350611d2e818560208601611ce1565b601f01601f19169290920192915050565b8051600090610160840190611d548582611c4f565b506020830151611d676020860182611a37565b506040830151611d7a6040860182611c8e565b506060830151611d8d60c0860182611a37565b506080830151611da060e0860182611a37565b5060a0830151611db4610100860182611cd8565b5060c0830151611dc8610120860182611a37565b5060e0830151848203610140860152611de18282611d0d565b95945050505050565b600061160f8383611d3f565b6000611e00825190565b80845260208401935083602082028501611e1a8560200190565b8060005b85811015611e4f5784840389528151611e378582611dea565b94506020830160209a909a0199925050600101611e1e565b5091979650505050505050565b6020808252810161160f8184611df6565b600060208284031215611e8257611e82600080fd5b600061013684846118a1565b805161182281611879565b600060208284031215611eae57611eae600080fd5b60006101368484611e8e565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000611ef3825190565b611f01818560208601611ce1565b9290920192915050565b7fffff0000000000000000000000000000000000000000000000000000000000008116611847565b7fff000000000000000000000000000000000000000000000000000000000000008116611847565b6000611f678289611ee9565b9150611f738288611f0b565b600282019150611f838287611ee9565b9150611f8f8286611f0b565b600282019150611f9f8285611ee9565b9150611fab8284611f33565b506001019695505050505050565b6020808252810161160f8184611d0d565b6000611fd68286611ee9565b9150611fe28285611f0b565b600282019150611de18284611ee9565b602081016118228284611cd8565b80516118228161189b565b60006020828403121561202057612020600080fd5b60006101368484612000565b60006020828403121561204157612041600080fd5b61204b6020611908565b905060006120598484612000565b82525092915050565b60006020828403121561207757612077600080fd5b6000610136848461202c565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156120ea576120ea612083565b500290565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b60008261212d5761212d6120ef565b500490565b604081016121408285611cd8565b61160f6020830184611a37565b6000612159828b611ee9565b9150612165828a611f0b565b6002820191506121758289611ee9565b91506121818288611f0b565b6002820191506121918287611ee9565b915061219d8286611f0b565b6002820191506121ad8285611ee9565b91506121b98284611f33565b5060010198975050505050505050565b604081016121d78285611a37565b818103602083015261160c8184611d0d565b60006121f58284611a37565b50602001919050565b60008161220d5761220d612083565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b6000821982111561224657612246612083565b500190565b60008282101561225d5761225d612083565b500390565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82141561229457612294612083565b5060010190565b6000826122aa576122aa6120ef565b500690565b604081016122bd8285611cd8565b61160f6020830184611cd8565b603681526000602082017f5361666545524332303a20617070726f76652066726f6d206e6f6e2d7a65726f81527f20746f206e6f6e2d7a65726f20616c6c6f77616e636500000000000000000000602082015291505b5060400190565b60208082528101611822816122ca565b801515611882565b805161182281612337565b60006020828403121561235f5761235f600080fd5b6000610136848461233f565b602a81526000602082017f5361666545524332303a204552433230206f7065726174696f6e20646964206e81527f6f7420737563636565640000000000000000000000000000000000000000000060208201529150612320565b602080825281016118228161236b565b602681526000602082017f416464726573733a20696e73756666696369656e742062616c616e636520666f81527f722063616c6c000000000000000000000000000000000000000000000000000060208201529150612320565b60208082528101611822816123d5565b600061160f8284611ee9565b6020808252810161182281601d81527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060208201526040019056fea264697066735822122042c04fc6c0a8e62314d152187ca78f6c26600c64d89090bc7e705e021cba112a64736f6c63430008090033";
const isSuperArgs = (xs) => xs.length > 1;
class TestIsolationModeWrapperTraderV1__factory extends ethers_1.ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(_vaultFactory, _dolomiteMargin, overrides) {
        return super.deploy(_vaultFactory, _dolomiteMargin, overrides || {});
    }
    getDeployTransaction(_vaultFactory, _dolomiteMargin, overrides) {
        return super.getDeployTransaction(_vaultFactory, _dolomiteMargin, overrides || {});
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
exports.TestIsolationModeWrapperTraderV1__factory = TestIsolationModeWrapperTraderV1__factory;
TestIsolationModeWrapperTraderV1__factory.bytecode = _bytecode;
TestIsolationModeWrapperTraderV1__factory.abi = _abi;
