// SPDX-License-Identifier: GPL-3.0-or-later
/*

    Copyright 2023 Dolomite

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/
pragma solidity ^0.8.9;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { UpgradeableAsyncIsolationModeUnwrapperTrader } from "../UpgradeableAsyncIsolationModeUnwrapperTrader.sol";
import { UpgradeableAsyncIsolationModeWrapperTrader } from "../UpgradeableAsyncIsolationModeWrapperTrader.sol";
import { IDolomiteMargin } from "../../../../protocol/interfaces/IDolomiteMargin.sol";
import { IDolomiteStructs } from "../../../../protocol/interfaces/IDolomiteStructs.sol";
import { Require } from "../../../../protocol/lib/Require.sol";
import { IFreezableIsolationModeVaultFactory } from "../../../interfaces/IFreezableIsolationModeVaultFactory.sol";
import { IGenericTraderBase } from "../../../interfaces/IGenericTraderBase.sol";
import { IGenericTraderProxyV1 } from "../../../interfaces/IGenericTraderProxyV1.sol";
import { IHandlerRegistry } from "../../../interfaces/IHandlerRegistry.sol";
import { IIsolationModeTokenVaultV1 } from "../../../interfaces/IIsolationModeTokenVaultV1.sol";
import { IIsolationModeTokenVaultV1WithFreezable } from "../../../interfaces/IIsolationModeTokenVaultV1WithFreezable.sol"; // solhint-disable-line max-line-length
import { IIsolationModeVaultFactory } from "../../../interfaces/IIsolationModeVaultFactory.sol";
import { IUpgradeableAsyncIsolationModeUnwrapperTrader } from "../../../interfaces/IUpgradeableAsyncIsolationModeUnwrapperTrader.sol"; // solhint-disable-line max-line-length
import { IUpgradeableAsyncIsolationModeWrapperTrader } from "../../../interfaces/IUpgradeableAsyncIsolationModeWrapperTrader.sol"; // solhint-disable-line max-line-length
import { AccountActionLib } from "../../../lib/AccountActionLib.sol";
import { AccountBalanceLib } from "../../../lib/AccountBalanceLib.sol";


/**
 * @title   AsyncIsolationModeUnwrapperTraderImpl
 * @author  Dolomite
 *
 * Reusable library for functions that save bytecode on the async unwrapper/wrapper contracts
 */
library AsyncIsolationModeUnwrapperTraderImpl {
    using SafeERC20 for IERC20;

    // ===================================================
    // ==================== Constants ====================
    // ===================================================

    bytes32 private constant _FILE = "AsyncIsolationModeUnwrapperImpl";
    uint256 private constant _ACTIONS_LENGTH_NORMAL = 4;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    // ===================================================
    // ==================== Functions ====================
    // ===================================================

    function initializeUnwrapperTrader(
        IUpgradeableAsyncIsolationModeUnwrapperTrader.State storage _state,
        address _vaultFactory,
        address _handlerRegistry
    ) external {
        setVaultFactory(_state, _vaultFactory);
        setReentrancyGuard(_state, _NOT_ENTERED);
        setActionsLength(_state, _ACTIONS_LENGTH_NORMAL);
        setHandlerRegistry(_state, _handlerRegistry);
    }


    function swapExactInputForOutputForWithdrawal(
        UpgradeableAsyncIsolationModeUnwrapperTrader _unwrapper,
        IUpgradeableAsyncIsolationModeUnwrapperTrader.WithdrawalInfo memory _withdrawalInfo
    ) external {
        _unwrapper.HANDLER_REGISTRY().dolomiteRegistry().eventEmitter().emitAsyncWithdrawalOutputAmountUpdated(
            _withdrawalInfo.key,
            address(_unwrapper.VAULT_FACTORY()),
            _withdrawalInfo.outputAmount
        );

        uint256[] memory marketIdsPath = new uint256[](2);
        marketIdsPath[0] = _unwrapper.VAULT_FACTORY().marketId();
        marketIdsPath[1] = _unwrapper.DOLOMITE_MARGIN().getMarketIdByTokenAddress(_withdrawalInfo.outputToken);

        IGenericTraderBase.TraderParam[] memory traderParams = new IGenericTraderBase.TraderParam[](1);
        traderParams[0].traderType = IGenericTraderBase.TraderType.IsolationModeUnwrapper;
        traderParams[0].makerAccountIndex = 0;
        traderParams[0].trader = address(this);

        IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType[] memory tradeTypes = new IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType[](1); // solhint-disable-line max-line-length
        tradeTypes[0] = IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType.FromWithdrawal;
        bytes32[] memory keys = new bytes32[](1);
        keys[0] = _withdrawalInfo.key;
        traderParams[0].tradeData = abi.encode(tradeTypes, keys);

        IGenericTraderProxyV1.UserConfig memory userConfig = IGenericTraderProxyV1.UserConfig({
            deadline: block.timestamp,
            balanceCheckFlag: AccountBalanceLib.BalanceCheckFlag.None
        });

        IIsolationModeTokenVaultV1(_withdrawalInfo.vault).swapExactInputForOutput(
            _withdrawalInfo.accountNumber,
            marketIdsPath,
            _withdrawalInfo.inputAmount,
            _withdrawalInfo.outputAmount,
            traderParams,
            /* _makerAccounts = */ new IDolomiteMargin.AccountInfo[](0),
            userConfig
        );
    }

    function callFunction(
        IUpgradeableAsyncIsolationModeUnwrapperTrader.State storage _state,
        address /* _sender */,
        IDolomiteStructs.AccountInfo calldata _accountInfo,
        bytes calldata _data
    ) external {
        IFreezableIsolationModeVaultFactory factory = IFreezableIsolationModeVaultFactory(address(_state.vaultFactory));
        _validateVaultExists(factory, _accountInfo.owner);

        (
            uint256 transferAmount,
            IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType[] memory tradeTypes,
            bytes32[] memory keys
        ) = abi.decode(_data, (uint256, IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType[], bytes32[]));
        assert(tradeTypes.length == keys.length && keys.length > 0);

        address vault;
        uint256 inputAmount;
        for (uint256 i; i < tradeTypes.length; ++i) {
            uint256 inputAmountForIteration;
            if (tradeTypes[i] == IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType.FromWithdrawal) {
                IUpgradeableAsyncIsolationModeUnwrapperTrader.WithdrawalInfo memory withdrawalInfo = 
                    _state.withdrawalInfo[keys[i]];
                vault = withdrawalInfo.vault;
                inputAmountForIteration = withdrawalInfo.inputAmount;
            } else {
                assert(tradeTypes[i] == IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType.FromDeposit);
                IUpgradeableAsyncIsolationModeWrapperTrader.DepositInfo memory depositInfo =
                    IHandlerRegistry(_state.handlerRegistry).getWrapperByToken(factory).getDepositInfo(keys[i]);

                vault = depositInfo.vault;
                inputAmountForIteration = depositInfo.outputAmount;
            }

            // Require that the vault is either the account owner or the input amount is 0 (meaning, it has been fully
            // spent)
            Require.that(
                (inputAmountForIteration == 0 && vault == address(0)) || vault == _accountInfo.owner,
                _FILE,
                "Invalid account owner",
                _accountInfo.owner
            );
            inputAmount += inputAmountForIteration;
        }

        uint256 underlyingVirtualBalance = IIsolationModeTokenVaultV1WithFreezable(vault).virtualBalance();
        Require.that(
            underlyingVirtualBalance >= transferAmount,
            _FILE,
            "Insufficient balance",
            underlyingVirtualBalance,
            transferAmount
        );

        Require.that(
            transferAmount > 0 && transferAmount <= inputAmount,
            _FILE,
            "Invalid transfer amount"
        );

        factory.enqueueTransferFromDolomiteMargin(_accountInfo.owner, transferAmount);
        factory.setShouldVaultSkipTransfer(vault, /* _shouldSkipTransfer = */ true);
    }

    function exchangeUnderlyingTokenToOutputToken(
        IUpgradeableAsyncIsolationModeUnwrapperTrader.State storage _state,
        address /* _tradeOriginator */,
        address /* _receiver */,
        address _outputToken,
        uint256 /* _minOutputAmount */,
        address /* _inputToken */,
        uint256 _inputAmount,
        bytes memory _extraOrderData
    ) external returns (uint256) {
        // We don't need to validate _tradeOriginator here because it is validated in _callFunction via the transfer
        // being enqueued (without it being enqueued, we'd never reach this point)

        // Fix stack too deep errors
        IUpgradeableAsyncIsolationModeUnwrapperTrader.State storage state = _state;       
        address outputToken = _outputToken;

        (IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType[] memory tradeTypes, bytes32[] memory keys) = 
            abi.decode(_extraOrderData, (IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType[], bytes32[]));
        assert(tradeTypes.length == keys.length && keys.length > 0);

        uint256 inputAmountNeeded = _inputAmount; // decays toward 0
        uint256 outputAmount;
        for (uint256 i; i < tradeTypes.length && inputAmountNeeded > 0; ++i) {
            bytes32 key = keys[i];
            if (tradeTypes[i] == IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType.FromWithdrawal) {
                IUpgradeableAsyncIsolationModeUnwrapperTrader.WithdrawalInfo memory withdrawalInfo = 
                    state.withdrawalInfo[key];
                if (withdrawalInfo.outputToken == address(0)) {
                    // If the withdrawal was spent already, skip it
                    continue;
                }
                _validateOutputTokenForExchange(withdrawalInfo.outputToken, outputToken);

                (uint256 inputAmountToCollect, uint256 outputAmountToCollect) = _getAmountsToCollect(
                    /* _structInputAmount = */ withdrawalInfo.inputAmount,
                    inputAmountNeeded,
                    /* _structOutputAmount = */ withdrawalInfo.outputAmount
                );
                withdrawalInfo.inputAmount -= inputAmountToCollect;
                withdrawalInfo.outputAmount -= outputAmountToCollect;
                state.withdrawalInfo[key] = withdrawalInfo;
                setWithdrawalInfo(state, key, withdrawalInfo);
                _updateVaultPendingAmount(
                    state.vaultFactory,
                    withdrawalInfo.vault,
                    withdrawalInfo.accountNumber,
                    inputAmountToCollect,
                    /* _isPositive = */ false,
                    withdrawalInfo.outputToken
                );

                inputAmountNeeded -= inputAmountToCollect;
                outputAmount = outputAmount + outputAmountToCollect;
            } else {
                // panic if the trade type isn't correct (somehow).
                assert(tradeTypes[i] == IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType.FromDeposit);
                IUpgradeableAsyncIsolationModeWrapperTrader wrapperTrader = 
                    IHandlerRegistry(state.handlerRegistry).getWrapperByToken(
                        IIsolationModeVaultFactory(state.vaultFactory)
                    );
                IUpgradeableAsyncIsolationModeWrapperTrader.DepositInfo memory depositInfo =
                                    wrapperTrader.getDepositInfo(key);
                if (depositInfo.inputToken == address(0)) {
                    // If the deposit was spent already, skip it
                    continue;
                }

                // The input token for a deposit is the output token in this case
                _validateOutputTokenForExchange(depositInfo.inputToken, outputToken);

                (uint256 inputAmountToCollect, uint256 outputAmountToCollect) = _getAmountsToCollect(
                    /* _structInputAmount = */ depositInfo.outputAmount,
                    inputAmountNeeded,
                    /* _structOutputAmount = */ depositInfo.inputAmount
                );

                depositInfo.outputAmount -= inputAmountToCollect;
                depositInfo.inputAmount -= outputAmountToCollect;
                wrapperTrader.setDepositInfoAndReducePendingAmountFromUnwrapper(key, inputAmountToCollect, depositInfo);

                IERC20(depositInfo.inputToken).safeTransferFrom(
                    address(wrapperTrader),
                    address(this),
                    outputAmountToCollect
                );

                inputAmountNeeded -= inputAmountToCollect;
                outputAmount += outputAmountToCollect;
            }
        }

        // Panic if the developer didn't set this up to consume enough of the structs
        assert(inputAmountNeeded == 0);

        return outputAmount;
    }

    function createActionsForUnwrapping(
        UpgradeableAsyncIsolationModeUnwrapperTrader _unwrapper,
        uint256 _solidAccountId,
        uint256 _liquidAccountId,
        uint256 _outputMarket,
        uint256 _inputMarket,
        uint256 _minAmountOut,
        uint256 _inputAmount,
        bytes calldata _orderData
    ) external view returns (IDolomiteMargin.ActionArgs[] memory) {
        {
            IDolomiteMargin dolomiteMargin = _unwrapper.DOLOMITE_MARGIN();
            Require.that(
                dolomiteMargin.getMarketTokenAddress(_inputMarket) == address(_unwrapper.VAULT_FACTORY()),
                _FILE,
                "Invalid input market",
                _inputMarket
            );
            Require.that(
                _unwrapper.isValidOutputToken(dolomiteMargin.getMarketTokenAddress(_outputMarket)),
                _FILE,
                "Invalid output market",
                _outputMarket
            );
        }

        (
            IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType[] memory tradeTypes,
            bytes32[] memory keys
        ) = abi.decode(_orderData, (IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType[], bytes32[]));
        Require.that(
            tradeTypes.length == keys.length && keys.length > 0,
            _FILE,
            "Invalid unwrapping order data"
        );

        bool[] memory isRetryableList = new bool[](tradeTypes.length);
        uint256 structInputAmount = 0;
        // Realistically this array length will only ever be 1 or 2.
        for (uint256 i; i < tradeTypes.length; ++i) {
            // The withdrawal/deposit is authenticated & validated later in `_callFunction`
            if (tradeTypes[i] == IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType.FromWithdrawal) {
                IUpgradeableAsyncIsolationModeUnwrapperTrader.WithdrawalInfo memory withdrawalInfo =
                                    _unwrapper.getWithdrawalInfo(keys[i]);
                structInputAmount += withdrawalInfo.inputAmount;
                isRetryableList[i] = withdrawalInfo.isRetryable;
            } else {
                assert(tradeTypes[i] == IUpgradeableAsyncIsolationModeUnwrapperTrader.TradeType.FromDeposit);
                UpgradeableAsyncIsolationModeUnwrapperTrader unwrapperForStackTooDeep = _unwrapper;
                IUpgradeableAsyncIsolationModeWrapperTrader.DepositInfo memory depositInfo =
                                        _getWrapperTrader(unwrapperForStackTooDeep).getDepositInfo(keys[i]);
                // The output amount for a deposit is the input amount for an unwrapping
                structInputAmount += depositInfo.outputAmount;
                isRetryableList[i] = depositInfo.isRetryable;
            }
        }
        Require.that(
            structInputAmount >= _inputAmount && _inputAmount > 0,
            _FILE,
            "Invalid input amount"
        );

        // If the input amount doesn't match, we need to add 2 actions to settle the difference
        IDolomiteMargin.ActionArgs[] memory actions = new IDolomiteMargin.ActionArgs[](_unwrapper.actionsLength());

        // Transfer the IsolationMode tokens to this contract. Do this by enqueuing a transfer via the call to
        // `enqueueTransferFromDolomiteMargin` in `callFunction` on this contract.
        actions[0] = AccountActionLib.encodeCallAction(
            _liquidAccountId,
            /* _callee */ address(this),
            /* (transferAmount, tradeTypes, keys)[encoded] = */ abi.encode(_inputAmount, tradeTypes, keys)
        );
        actions[1] = AccountActionLib.encodeExternalSellAction(
            _solidAccountId,
            _inputMarket,
            _outputMarket,
            /* _trader = */ address(this),
            /* _amountInWei = */ _inputAmount,
            /* _amountOutMinWei = */ _minAmountOut,
            _orderData
        );
        if (actions.length == _ACTIONS_LENGTH_NORMAL) {
            // We need to spend the whole withdrawal amount, so we need to add an extra sale to spend the difference.
            // This can only happen during a liquidation
            for (uint256 i; i < isRetryableList.length; ++i) {
                Require.that(
                    isRetryableList[i],
                    _FILE,
                    "All trades must be retryable"
                );
            }

            structInputAmount -= _inputAmount;
            actions[2] = AccountActionLib.encodeCallAction(
                _liquidAccountId,
                /* _callee */ address(this),
                /* (transferAmount, tradeTypes, keys)[encoded] = */ abi.encode(structInputAmount, tradeTypes, keys)
            );
            actions[3] = AccountActionLib.encodeExternalSellAction(
                _liquidAccountId,
                _inputMarket,
                _outputMarket,
                /* _trader = */ address(this),
                /* _amountInWei = */ structInputAmount,
                /* _amountOutMinWei = */ 1,
                _orderData
            );
        }

        return actions;
    }

    function setVaultFactory(
        IUpgradeableAsyncIsolationModeUnwrapperTrader.State storage _state,
        address _vaultFactory
    ) public {
        _state.vaultFactory = _vaultFactory;
    }

    function setHandlerRegistry(
        IUpgradeableAsyncIsolationModeUnwrapperTrader.State storage _state,
        address _handlerRegistry
    ) public {
        _state.handlerRegistry = _handlerRegistry;
    }

    function setActionsLength(
        IUpgradeableAsyncIsolationModeUnwrapperTrader.State storage _state,
        uint256 _actionLength
    ) public {
        _state.actionsLength = _actionLength;
    }

    function setWithdrawalInfo(
        IUpgradeableAsyncIsolationModeUnwrapperTrader.State storage _state,
        bytes32 _key,
        IUpgradeableAsyncIsolationModeUnwrapperTrader.WithdrawalInfo memory _withdrawalInfo
    ) public {
         if (_withdrawalInfo.inputAmount == 0) {
            // @follow-up This now clears out the key value in withdrawalInfo. Confirm that doesn't cause issues
            delete _state.withdrawalInfo[_key];
        } else {
            _state.withdrawalInfo[_key] = _withdrawalInfo;
        }
    }

    function setReentrancyGuard(
        IUpgradeableAsyncIsolationModeUnwrapperTrader.State storage _state,
        uint256 _reentrancyGuard
    ) public {
        _state.reentrancyGuard = _reentrancyGuard;
    }

    function validateNotReentered(
        IUpgradeableAsyncIsolationModeUnwrapperTrader.State storage _state
    ) public view {
        Require.that(
            _state.reentrancyGuard != _ENTERED,
            _FILE,
            "Reentrant call"
        );
    }

    // ===================================================
    // ================ Private Functions ================
    // ===================================================

    // solhint-disable-next-line private-vars-leading-underscore
    function _updateVaultPendingAmount(
        address _vaultFactory,
        address _vault,
        uint256 _accountNumber,
        uint256 _amountDeltaWei,
        bool _isPositive,
        address _outputToken
    ) internal {
        IFreezableIsolationModeVaultFactory(_vaultFactory).setVaultAccountPendingAmountForFrozenStatus(
            _vault,
            _accountNumber,
            IFreezableIsolationModeVaultFactory.FreezeType.Withdrawal,
            /* _amountWei = */ IDolomiteStructs.Wei({
                sign: _isPositive,
                value: _amountDeltaWei
            }),
            _outputToken
        );
    }

    // solhint-disable-next-line private-vars-leading-underscore
    function _validateVaultExists(IIsolationModeVaultFactory _factory, address _vault) internal view {
        Require.that(
            _factory.getAccountByVault(_vault) != address(0),
            _FILE,
            "Invalid vault",
            _vault
        );
    }

    // solhint-disable-next-line private-vars-leading-underscore
    function _getAmountsToCollect(
        uint256 _structInputAmount,
        uint256 _inputAmountNeeded,
        uint256 _structOutputAmount
    ) internal pure returns (uint256 _inputAmountToCollect, uint256 _outputAmountToCollect) {
        _inputAmountToCollect = _inputAmountNeeded < _structInputAmount
            ? _inputAmountNeeded
            : _structInputAmount;

        // Reduce output amount by the ratio of the collected input amount. Almost always the ratio will be
        // 100%. During liquidations, there will be a non-100% ratio because the user may not lose all
        // collateral to the liquidator.
        _outputAmountToCollect = _inputAmountNeeded < _structInputAmount
            ? _structOutputAmount * _inputAmountNeeded / _structInputAmount
            : _structOutputAmount;
    }

    function _getWrapperTrader(
        UpgradeableAsyncIsolationModeUnwrapperTrader _unwrapper
    ) private view returns (IUpgradeableAsyncIsolationModeWrapperTrader) {
        return _unwrapper.HANDLER_REGISTRY().getWrapperByToken(_unwrapper.VAULT_FACTORY());
    }

    function _validateOutputTokenForExchange(
        address _structOutputToken,
        address _outputToken
    ) private pure {
        Require.that(
            _structOutputToken == _outputToken,
            _FILE,
            "Output token mismatch"
        );
    }
}
