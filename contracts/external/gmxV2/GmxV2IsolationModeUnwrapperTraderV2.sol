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
import { GmxV2Library } from "./GmxV2Library.sol";
import { IDolomiteMargin } from "../../protocol/interfaces/IDolomiteMargin.sol";
import { IDolomiteStructs } from "../../protocol/interfaces/IDolomiteStructs.sol";
import { Require } from "../../protocol/lib/Require.sol";
import { IFreezableIsolationModeVaultFactory } from "../interfaces/IFreezableIsolationModeVaultFactory.sol";
import { IIsolationModeUnwrapperTrader } from "../interfaces/IIsolationModeUnwrapperTrader.sol";
import { GmxEventUtils } from "../interfaces/gmx/GmxEventUtils.sol";
import { GmxWithdrawal } from "../interfaces/gmx/GmxWithdrawal.sol";
import { IGmxV2IsolationModeUnwrapperTraderV2 } from "../interfaces/gmx/IGmxV2IsolationModeUnwrapperTraderV2.sol";
import { IGmxV2IsolationModeVaultFactory } from "../interfaces/gmx/IGmxV2IsolationModeVaultFactory.sol";
import { IGmxV2IsolationModeWrapperTraderV2 } from "../interfaces/gmx/IGmxV2IsolationModeWrapperTraderV2.sol";
import { IGmxV2Registry } from "../interfaces/gmx/IGmxV2Registry.sol";
import { IIsolationModeVaultFactory } from "../interfaces/IIsolationModeVaultFactory.sol";
import { AccountActionLib } from "../lib/AccountActionLib.sol";
import { UpgradeableAsyncIsolationModeUnwrapperTrader } from "../proxies/abstract/UpgradeableAsyncIsolationModeUnwrapperTrader.sol"; // solhint-disable-line max-line-length


/**
 * @title   GmxV2IsolationModeUnwrapperTraderV2
 * @author  Dolomite
 *
 * @notice  Used for unwrapping GMX GM (via withdrawing from GMX)
 */
contract GmxV2IsolationModeUnwrapperTraderV2 is
    IGmxV2IsolationModeUnwrapperTraderV2,
    UpgradeableAsyncIsolationModeUnwrapperTrader
{
    using SafeERC20 for IERC20;

    // ============ Constants ============

    bytes32 private constant _FILE = "GmxV2IsolationModeUnwrapperV2";

    // ============ Modifiers ============

    modifier onlyWrapperCaller(address _from) {
        _validateIsWrapper(_from);
        _;
    }

    // ============ Initializer ============

    function initialize(
        address _dGM,
        address _dolomiteMargin,
        address _gmxV2Registry,
        address _weth
    )
    external initializer {
        _initializeUnwrapperTrader(_dGM, _dolomiteMargin);
        _initializeAsyncTraderBase(_gmxV2Registry, _weth);
        _setActionsLength(_ACTIONS_LENGTH_NORMAL);
    }

    // ============================================
    // ============= Public Functions =============
    // ============================================

    function handleGmxCallbackFromWrapperBefore() external onlyWrapperCaller(msg.sender) {
        _handleGmxCallbackBefore();
    }

    function handleGmxCallbackFromWrapperAfter() external onlyWrapperCaller(msg.sender) {
        _handleGmxCallbackAfter();
    }

    function afterWithdrawalExecution(
        bytes32 _key,
        GmxWithdrawal.WithdrawalProps memory _withdrawal,
        GmxEventUtils.EventLogData memory _eventData
    )
    external
    nonReentrant
    onlyHandler(msg.sender) {
        WithdrawalInfo memory withdrawalInfo = _getWithdrawalSlot(_key);
        _validateWithdrawalExists(withdrawalInfo);
        Require.that(
            withdrawalInfo.inputAmount == _withdrawal.numbers.marketTokenAmount,
            _FILE,
            "Invalid market token amount"
        );

        GmxEventUtils.UintKeyValue memory outputTokenAmount = _eventData.uintItems.items[0];
        GmxEventUtils.UintKeyValue memory secondaryOutputTokenAmount = _eventData.uintItems.items[1];
        GmxV2Library.validateEventDataForWithdrawal(
            /* _outputTokenAddress = */ _eventData.addressItems.items[0],
            outputTokenAmount,
            /* _secondaryOutputTokenAddress = */ _eventData.addressItems.items[1],
            secondaryOutputTokenAmount,
            withdrawalInfo
        );

        // @audit:  If GMX changes the keys OR if the data sent back is malformed (causing the above requires to
        //          fail), this will fail. This will result in us receiving tokens from GMX and not knowing who they
        //          are for, nor the amount. The only solution will be to upgrade this contract and have an admin
        //          "unstuck" the funds for users by sending them to the appropriate vaults.


        // Save the output amount so we can refer to it later. This also enables it to be retried if execution fails
        withdrawalInfo.outputAmount = outputTokenAmount.value + secondaryOutputTokenAmount.value;
        withdrawalInfo.isRetryable = true;
        _setWithdrawalInfo(_key, withdrawalInfo);

        _executeWithdrawal(withdrawalInfo);
    }

    /**
     * @dev Funds will automatically be sent back to the vault by GMX
     */
    function afterWithdrawalCancellation(
        bytes32 _key,
        GmxWithdrawal.WithdrawalProps memory /* _withdrawal */,
        GmxEventUtils.EventLogData memory /* _eventData */
    )
    external
    nonReentrant
    onlyHandler(msg.sender) {
        WithdrawalInfo memory withdrawalInfo = _getWithdrawalSlot(_key);
        _validateWithdrawalExists(withdrawalInfo);

        // @audit - Is there a way for us to verify the tokens were sent back to the vault?
        _updateVaultPendingAmount(
            withdrawalInfo.vault,
            withdrawalInfo.accountNumber,
            withdrawalInfo.inputAmount,
            /* _isPositive = */ false
        );

        // Setting inputAmount to 0 will clear the withdrawal
        withdrawalInfo.inputAmount = 0;
        _setWithdrawalInfo(_key, withdrawalInfo);
        emit WithdrawalCancelled(_key);
    }

    function isValidOutputToken(
        address _outputToken
    )
    public
    view
    override(UpgradeableAsyncIsolationModeUnwrapperTrader, IIsolationModeUnwrapperTrader)
    returns (bool) {
        return GmxV2Library.isValidInputOrOutputToken(
            IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY())),
            _outputToken
        );
    }

    function getWithdrawalInfo(bytes32 _key) public pure returns (WithdrawalInfo memory) {
        return _getWithdrawalSlot(_key);
    }

    // ============================================
    // =========== Internal Functions =============
    // ============================================

    function _executeWithdrawal(WithdrawalInfo memory _withdrawalInfo) internal override {
        _handleGmxCallbackBefore();
        try GmxV2Library.swapExactInputForOutputForWithdrawal(this, _withdrawalInfo) {
            emit WithdrawalExecuted(_withdrawalInfo.key);
        } catch Error(string memory _reason) {
            emit WithdrawalFailed(_withdrawalInfo.key, _reason);
        } catch (bytes memory /* _reason */) {
            emit WithdrawalFailed(_withdrawalInfo.key, "");
        }
        _handleGmxCallbackAfter();
    }

    function _handleGmxCallbackBefore() internal {
        // For GMX callbacks, we restrict the # of actions to use less gas
        _setActionsLength(_ACTIONS_LENGTH_CALLBACK);
    }

    function _handleGmxCallbackAfter() internal {
        // For GMX callbacks, we restrict the # of actions to use less gas
        _setActionsLength(_ACTIONS_LENGTH_NORMAL);
    }

    function _validateIsBalanceSufficient(uint256 /* _inputAmount */) internal override view {
        // solhint-disable-previous-line no-empty-blocks
        // Do nothing
    }

    function _validateIsWrapper(address _from) internal view {
        Require.that(
            _from == address(_getWrapperTrader()),
            _FILE,
            "Caller can only be wrapper",
            _from
        );
    }

    function _getExchangeCost(
        address,
        address,
        uint256,
        bytes memory
    )
    internal
    override
    pure
    returns (uint256) {
        revert(string(abi.encodePacked(Require.stringifyTruncated(_FILE), ": getExchangeCost is not implemented")));
    }
}
