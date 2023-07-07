"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JonesUSDCPriceOracle__factory = void 0;
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
                name: "_jonesUSDCRegistry",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_usdcMarketId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "djUSDC",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "DJUSDC",
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
        name: "JONES_USDC_REGISTRY",
        outputs: [
            {
                internalType: "contract IJonesUSDCRegistry",
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
const _bytecode = "0x6101006040523480156200001257600080fd5b50604051620016f6380380620016f68339810160408190526200003591620000a4565b6001600160a01b0393841660805291831660a05260c0521660e05262000112565b60006001600160a01b0382165b92915050565b620000748162000056565b81146200008057600080fd5b50565b8051620000638162000069565b8062000074565b8051620000638162000090565b60008060008060808587031215620000bf57620000bf600080fd5b6000620000cd878762000083565b9450506020620000e08782880162000083565b9350506040620000f38782880162000097565b9250506060620001068782880162000083565b91505092959194509250565b60805160a05160c05160e0516115836200017360003960008181610129015261016c01526000818160f5015261056a01526000818160ae015281816105f301526107bf015260008181607101528181610242015261053d01526115836000f3fe608060405234801561001057600080fd5b50600436106100675760003560e01c806341976e091161005057806341976e09146100d0578063b5bc1017146100f0578063e7fd93101461012457600080fd5b806315c14a4a1461006c5780633b3b377a146100a9575b600080fd5b6100937f000000000000000000000000000000000000000000000000000000000000000081565b6040516100a09190610dda565b60405180910390f35b6100937f000000000000000000000000000000000000000000000000000000000000000081565b6100e36100de366004610e28565b610158565b6040516100a09190610e68565b6101177f000000000000000000000000000000000000000000000000000000000000000081565b6040516100a09190610e76565b61014b7f000000000000000000000000000000000000000000000000000000000000000081565b6040516100a09190610e8d565b6040805160208101909152600081526102017f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16147f4a6f6e65735553444350726963654f7261636c650000000000000000000000007f496e76616c696420746f6b656e000000000000000000000000000000000000008561039d565b6040517f8fae3be10000000000000000000000000000000000000000000000000000000081526103829073ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690635ac7d17c908290638fae3be19061027f908890600401610e8d565b60206040518083038186803b15801561029757600080fd5b505afa1580156102ab573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102cf9190610eac565b6040518263ffffffff1660e01b81526004016102eb9190610e76565b60206040518083038186803b15801561030357600080fd5b505afa158015610317573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061033b9190610ee0565b7f4a6f6e65735553444350726963654f7261636c650000000000000000000000007f6a555344432063616e6e6f7420626520626f72726f7761626c650000000000006104a2565b60405180602001604052806103956104f1565b905292915050565b8361049c576103ab83610828565b7f3a200000000000000000000000000000000000000000000000000000000000006103d584610828565b7f203c0000000000000000000000000000000000000000000000000000000000006103ff856108f9565b6040516104359594939291907f3e0000000000000000000000000000000000000000000000000000000000000090602001610f9f565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152908290527f08c379a00000000000000000000000000000000000000000000000000000000082526104939160040161104d565b60405180910390fd5b50505050565b826104ec576104b082610828565b7f3a200000000000000000000000000000000000000000000000000000000000006104da83610828565b60405160200161043593929190611065565b505050565b600080610500600c600a6111d3565b6040517f8928378e00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690638928378e90610592907f000000000000000000000000000000000000000000000000000000000000000090600401610e76565b60206040518083038186803b1580156105aa57600080fd5b505afa1580156105be573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105e291906112cc565b516105ed919061131c565b905060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166369d713ca6040518163ffffffff1660e01b815260040160206040518083038186803b15801561065757600080fd5b505afa15801561066b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061068f919061134f565b905060008173ffffffffffffffffffffffffffffffffffffffff166318160ddd6040518163ffffffff1660e01b815260040160206040518083038186803b1580156106d957600080fd5b505afa1580156106ed573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107119190610eac565b9050600081156107b357818373ffffffffffffffffffffffffffffffffffffffff166301e1d1146040518163ffffffff1660e01b815260040160206040518083038186803b15801561076257600080fd5b505afa158015610776573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061079a9190610eac565b6107a49086611370565b6107ae919061131c565b6107b5565b835b90506000806107f97f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16610aac565b9092509050806108098385611370565b610813919061131c565b61081d90846113ad565b965050505050505090565b606060008260405160200161083d91906113c4565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152919052905060205b80156108de5780610880816113d9565b9150508181815181106108955761089561140e565b01602001517fff0000000000000000000000000000000000000000000000000000000000000016156108d95760006108ce82600161143d565b835250909392505050565b610870565b5060408051600080825260208201909252905b509392505050565b60408051602a808252606082810190935273ffffffffffffffffffffffffffffffffffffffff841691600091602082018180368337019050509050603060f81b8160008151811061094c5761094c61140e565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350607860f81b816001815181106109935761099361140e565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060005b60148110156108f15760006109db826002611370565b90506109e9600f8516610d6b565b836109f58360296113ad565b81518110610a0557610a0561140e565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600484901c9350610a47600f8516610d6b565b83610a538360286113ad565b81518110610a6357610a6361140e565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053505060049290921c9180610aa481611455565b9150506109c5565b60008060008373ffffffffffffffffffffffffffffffffffffffff16636124a5776040518163ffffffff1660e01b815260040160206040518083038186803b158015610af757600080fd5b505afa158015610b0b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b2f919061134f565b905060008173ffffffffffffffffffffffffffffffffffffffff1663278208518673ffffffffffffffffffffffffffffffffffffffff1663292d6ebb6040518163ffffffff1660e01b815260040160206040518083038186803b158015610b9557600080fd5b505afa158015610ba9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bcd9190611499565b6040518263ffffffff1660e01b8152600401610be99190610e8d565b60206040518083038186803b158015610c0157600080fd5b505afa158015610c15573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c399190610eac565b6040517fbe409a1100000000000000000000000000000000000000000000000000000000815290915073ffffffffffffffffffffffffffffffffffffffff83169063be409a1190610c8e908490600401610e76565b60806040518083038186803b158015610ca657600080fd5b505afa158015610cba573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cde919061152c565b6060015193508173ffffffffffffffffffffffffffffffffffffffff1663e1f1c4a76040518163ffffffff1660e01b815260040160206040518083038186803b158015610d2a57600080fd5b505afa158015610d3e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d629190610eac565b92505050915091565b6000600a821015610d8a57610d8160308361143d565b60f81b92915050565b610d8160578361143d565b600073ffffffffffffffffffffffffffffffffffffffff82165b92915050565b6000610daf82610d95565b6000610daf82610db5565b610dd481610dc0565b82525050565b60208101610daf8284610dcb565b600073ffffffffffffffffffffffffffffffffffffffff8216610daf565b610e0f81610de8565b8114610e1a57600080fd5b50565b8035610daf81610e06565b600060208284031215610e3d57610e3d600080fd5b6000610e498484610e1d565b949350505050565b80610dd4565b8051602083019061049c8482610e51565b60208101610daf8284610e57565b60208101610daf8284610e51565b610dd481610de8565b60208101610daf8284610e84565b80610e0f565b8051610daf81610e9b565b600060208284031215610ec157610ec1600080fd5b6000610e498484610ea1565b801515610e0f565b8051610daf81610ecd565b600060208284031215610ef557610ef5600080fd5b6000610e498484610ed5565b60005b83811015610f1c578181015183820152602001610f04565b8381111561049c5750506000910152565b6000610f37825190565b610f45818560208601610f01565b9290920192915050565b7fffff0000000000000000000000000000000000000000000000000000000000008116610dd4565b7fff000000000000000000000000000000000000000000000000000000000000008116610dd4565b6000610fab8289610f2d565b9150610fb78288610f4f565b600282019150610fc78287610f2d565b9150610fd38286610f4f565b600282019150610fe38285610f2d565b9150610fef8284610f77565b506001019695505050505050565b6000611007825190565b80845260208401935061101e818560208601610f01565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920192915050565b6020808252810161105e8184610ffd565b9392505050565b60006110718286610f2d565b915061107d8285610f4f565b60028201915061108d8284610f2d565b95945050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b80825b6001851115611104578086048111156110e3576110e3611096565b60018516156110f157908102905b80026110fd8560011c90565b94506110c8565b94509492505050565b60008261111c5750600161105e565b816111295750600061105e565b816001811461113f576002811461114957611176565b600191505061105e565b60ff84111561115a5761115a611096565b8360020a91508482111561117057611170611096565b5061105e565b5060208310610133831016604e8410600b84101617156111a9575081810a838111156111a4576111a4611096565b61105e565b6111b684848460016110c5565b925090508184048111156111cc576111cc611096565b0292915050565b600061105e7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff848461110d565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f830116810181811067ffffffffffffffff8211171561127357611273611200565b6040525050565b600061128560405190565b9050611291828261122f565b919050565b6000602082840312156112ab576112ab600080fd5b6112b5602061127a565b905060006112c38484610ea1565b82525092915050565b6000602082840312156112e1576112e1600080fd5b6000610e498484611296565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b60008261132b5761132b6112ed565b500490565b6000610daf82610de8565b610e0f81611330565b8051610daf8161133b565b60006020828403121561136457611364600080fd5b6000610e498484611344565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156113a8576113a8611096565b500290565b6000828210156113bf576113bf611096565b500390565b60006113d08284610e51565b50602001919050565b6000816113e8576113e8611096565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000821982111561145057611450611096565b500190565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82141561148757611487611096565b5060010190565b8051610daf81610e06565b6000602082840312156114ae576114ae600080fd5b6000610e49848461148e565b6000608082840312156114cf576114cf600080fd5b6114d9608061127a565b905060006114e78484610ed5565b82525060206114f884848301610ed5565b602083015250604061150c84828501610ea1565b604083015250606061152084828501610ea1565b60608301525092915050565b60006080828403121561154157611541600080fd5b6000610e4984846114ba56fea264697066735822122019d260a64118823f673f0d56a09fcb7e8b7e205d0080f58b2e5b32a85bf6264a64736f6c63430008090033";
const isSuperArgs = (xs) => xs.length > 1;
class JonesUSDCPriceOracle__factory extends ethers_1.ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(_dolomiteMargin, _jonesUSDCRegistry, _usdcMarketId, djUSDC, overrides) {
        return super.deploy(_dolomiteMargin, _jonesUSDCRegistry, _usdcMarketId, djUSDC, overrides || {});
    }
    getDeployTransaction(_dolomiteMargin, _jonesUSDCRegistry, _usdcMarketId, djUSDC, overrides) {
        return super.getDeployTransaction(_dolomiteMargin, _jonesUSDCRegistry, _usdcMarketId, djUSDC, overrides || {});
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
exports.JonesUSDCPriceOracle__factory = JonesUSDCPriceOracle__factory;
JonesUSDCPriceOracle__factory.bytecode = _bytecode;
JonesUSDCPriceOracle__factory.abi = _abi;
