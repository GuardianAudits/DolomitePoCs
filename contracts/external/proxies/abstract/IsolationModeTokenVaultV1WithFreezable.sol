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
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { IsolationModeTokenVaultV1 } from "./IsolationModeTokenVaultV1.sol";
import { IDolomiteMargin } from "../../../protocol/interfaces/IDolomiteMargin.sol";
import { IDolomiteStructs } from "../../../protocol/interfaces/IDolomiteStructs.sol";
import { IWETH } from "../../../protocol/interfaces/IWETH.sol";
import { Require } from "../../../protocol/lib/Require.sol";
import { IFreezableIsolationModeVaultFactory } from "../../interfaces/IFreezableIsolationModeVaultFactory.sol";
import { IGenericTraderProxyV1 } from "../../interfaces/IGenericTraderProxyV1.sol";
import { IHandlerRegistry } from "../../interfaces/IHandlerRegistry.sol";
import { IIsolationModeTokenVaultV1 } from "../../interfaces/IIsolationModeTokenVaultV1.sol";
import { IIsolationModeTokenVaultV1WithFreezable } from "../../interfaces/IIsolationModeTokenVaultV1WithFreezable.sol";
import { AccountBalanceLib } from "../../lib/AccountBalanceLib.sol";


/**
 * @title   IsolationModeTokenVaultV1WithFreezable
 * @author  Dolomite
 *
 * @notice  Abstract implementation of IsolationModeTokenVaultV1 that disallows user actions
 *          if vault is frozen
 */
abstract contract IsolationModeTokenVaultV1WithFreezable is
    IIsolationModeTokenVaultV1WithFreezable,
    IsolationModeTokenVaultV1
{
    using Address for address payable;
    using SafeERC20 for IERC20;

    // ===================================================
    // ==================== Constants ====================
    // ===================================================

    bytes32 private constant _FILE = "IsolationModeVaultV1Freezable"; // shortened to fit in 32 bytes
    bytes32 private constant _VIRTUAL_BALANCE_SLOT = bytes32(uint256(keccak256("eip1967.proxy.virtualBalance")) - 1);
    bytes32 private constant _IS_DEPOSIT_SOURCE_WRAPPER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.isDepositSourceWrapper")) - 1); // solhint-disable-line max-line-length
    bytes32 private constant _SHOULD_SKIP_TRANSFER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.shouldSkipTransfer")) - 1); // solhint-disable-line max-line-length
    bytes32 private constant _POSITION_TO_EXECUTION_FEE_SLOT = bytes32(uint256(keccak256("eip1967.proxy.positionToExecutionFee")) - 1); // solhint-disable-line max-line-length

    // ==================================================================
    // ====================== Immutable Variables =======================
    // ==================================================================

    IWETH public immutable override WETH; // solhint-disable-line var-name-mixedcase

    // ===================================================
    // ==================== Modifiers ====================
    // ===================================================

    modifier requireNotFrozen() {
        _requireNotFrozen();
        _;
    }

    modifier _depositIntoVaultForDolomiteMarginFreezableValidator() {
        _requireNotFrozen();
        _;
    }

    modifier _withdrawFromVaultForDolomiteMarginFreezableValidator() {
        _requireNotFrozen();
        _;
    }

    modifier _openBorrowPositionFreezableValidator() {
        _requireNotFrozen();
        _;
    }

    modifier _closeBorrowPositionWithUnderlyingVaultTokenFreezableValidator(uint256 _borrowAccountNumber) {
        _requireNotFrozen();
        _;
        _refundExecutionFeeIfNecessary(_borrowAccountNumber);
    }

    modifier _closeBorrowPositionWithOtherTokensFreezableValidator(uint256 _borrowAccountNumber) {
        _requireNotFrozen();
        _;
        _refundExecutionFeeIfNecessary(_borrowAccountNumber);
    }

    modifier _transferIntoPositionWithUnderlyingTokenFreezableValidator() {
        _requireNotFrozen();
        _;
    }

    modifier _transferIntoPositionWithOtherTokenFreezableValidator() {
        _requireNotFrozen();
        _;
    }

    modifier _transferFromPositionWithUnderlyingTokenFreezableValidator(uint256 _borrowAccountNumber) {
        _requireNotFrozen();
        _;
        _refundExecutionFeeIfNecessary(_borrowAccountNumber);
    }

    modifier _transferFromPositionWithOtherTokenFreezableValidator(uint256 _borrowAccountNumber) {
        _requireNotFrozen();
        _;
        _refundExecutionFeeIfNecessary(_borrowAccountNumber);
    }

    modifier _repayAllForBorrowPositionFreezableValidator() {
        _requireNotFrozen();
        _;
    }

    modifier _addCollateralAndSwapExactInputForOutputFreezableValidator() {
        _requireNotFrozen();
        _;
    }

    modifier _swapExactInputForOutputAndRemoveCollateralFreezableValidator(uint256 _borrowAccountNumber) {
        _requireNotFrozen();
        _;
        _refundExecutionFeeIfNecessary(_borrowAccountNumber);
    }

    modifier _swapExactInputForOutputFreezableValidator() {
        _requireNotFrozen();
        _;
    }

    modifier onlyLiquidator(address _from) {
        _validateIsLiquidator(_from);
        _;
    }

    // ==================================================================
    // --======================== Constructors ==========================
    // ==================================================================

    constructor(address _weth) {
        WETH = IWETH(_weth);
    }

    // ==================================================================
    // ======================== Public Functions ========================
    // ==================================================================

    function setIsVaultDepositSourceWrapper(
        bool _isDepositSourceWrapper
    )
    external
    onlyVaultFactory(msg.sender) {
        _setIsVaultDepositSourceWrapper(_isDepositSourceWrapper);
    }

    function setShouldVaultSkipTransfer(
        bool _shouldSkipTransfer
    )
    external
    onlyVaultFactory(msg.sender) {
        _setShouldVaultSkipTransfer(_shouldSkipTransfer);
    }

    function initiateUnwrapping(
        uint256 _tradeAccountNumber,
        uint256 _inputAmount,
        address _outputToken,
        uint256 _minOutputAmount,
        bytes calldata _extraData
    )
        external
        payable
        nonReentrant
        onlyVaultOwner(msg.sender)
        requireNotFrozen
    {
        _beforeInitiateUnwrapping(
            _tradeAccountNumber,
            _inputAmount,
            /* _isLiquidation = */ false
        );
        _initiateUnwrapping(
            _tradeAccountNumber,
            _inputAmount,
            _outputToken,
            _minOutputAmount,
            /* _isLiquidation = */ false,
            _extraData
        );
    }

    function initiateUnwrappingForLiquidation(
        uint256 _tradeAccountNumber,
        uint256 _inputAmount,
        address _outputToken,
        uint256 _minOutputAmount,
        bytes calldata _extraData
    )
        external
        payable
        nonReentrant
        onlyLiquidator(msg.sender)
    {
        _beforeInitiateUnwrapping(
            _tradeAccountNumber,
            _inputAmount,
            /* _isLiquidation = */ true
        );
        _initiateUnwrapping(
            _tradeAccountNumber,
            _inputAmount,
            _outputToken,
            _minOutputAmount,
            /* _isLiquidation = */ true,
            _extraData
        );
    }

    function executeDepositIntoVault(
        address _from,
        uint256 _amount
    )
        public
        override(IIsolationModeTokenVaultV1, IsolationModeTokenVaultV1)
        onlyVaultFactory(msg.sender)
    {
        _setVirtualBalance(virtualBalance() + _amount);

        if (!shouldSkipTransfer()) {
            if (!isDepositSourceWrapper()) {
                IERC20(UNDERLYING_TOKEN()).safeTransferFrom(_from, address(this), _amount);
            } else {
                IERC20(UNDERLYING_TOKEN()).safeTransferFrom(
                    address(handlerRegistry().getWrapperByToken(IFreezableIsolationModeVaultFactory(VAULT_FACTORY()))),
                    address(this),
                    _amount
                );
                _setIsVaultDepositSourceWrapper(/* _isDepositSourceWrapper = */ false);
            }
        } else {
            Require.that(
                isVaultFrozen(),
                _FILE,
                "Vault should be frozen"
            );
            _setShouldVaultSkipTransfer(/* _shouldSkipTransfer = */ false);
        }
    }

    function executeWithdrawalFromVault(
        address _recipient,
        uint256 _amount
    )
        public
        override(IIsolationModeTokenVaultV1, IsolationModeTokenVaultV1)
        onlyVaultFactory(msg.sender)
    {
        _setVirtualBalance(virtualBalance() - _amount);

        if (!shouldSkipTransfer()) {
            IERC20(UNDERLYING_TOKEN()).safeTransfer(_recipient, _amount);
        } else {
            Require.that(
                isVaultFrozen(),
                _FILE,
                "Vault should be frozen"
            );
            _setShouldVaultSkipTransfer(false);
        }
    }

    function isDepositSourceWrapper() public view returns (bool) {
        return _getUint256(_IS_DEPOSIT_SOURCE_WRAPPER_SLOT) == 1;
    }

    function shouldSkipTransfer() public view returns (bool) {
        return _getUint256(_SHOULD_SKIP_TRANSFER_SLOT) == 1;
    }

    function handlerRegistry() public view returns (IHandlerRegistry) {
        return IFreezableIsolationModeVaultFactory(VAULT_FACTORY()).handlerRegistry();
    }

    function getExecutionFeeForAccountNumber(uint256 _accountNumber) public view returns (uint256) {
        return _getUint256(keccak256(abi.encode(_POSITION_TO_EXECUTION_FEE_SLOT, _accountNumber)));
    }

    function isVaultFrozen() public view returns (bool) {
        return IFreezableIsolationModeVaultFactory(VAULT_FACTORY()).isVaultFrozen(address(this));
    }

    function isVaultAccountFrozen(uint256 _accountNumber) public view returns (bool) {
        return IFreezableIsolationModeVaultFactory(VAULT_FACTORY()).isVaultAccountFrozen(address(this), _accountNumber);
    }

    function getOutputTokenByVaultAccount(
        uint256 _accountNumber
    ) public view returns (address) {
        return IFreezableIsolationModeVaultFactory(VAULT_FACTORY()).getOutputTokenByAccount(
            address(this),
            _accountNumber
        );
    }

    function virtualBalance() public view returns (uint256) {
        return _getUint256(_VIRTUAL_BALANCE_SLOT);
    }

    // ==================================================================
    // ======================== Overrides ===============================
    // ==================================================================

    function _depositIntoVaultForDolomiteMargin(
        uint256 _toAccountNumber,
        uint256 _amountWei
    )
        internal
        virtual
        override
        _depositIntoVaultForDolomiteMarginFreezableValidator
    {
        super._depositIntoVaultForDolomiteMargin(_toAccountNumber, _amountWei);
    }

    function _withdrawFromVaultForDolomiteMargin(
        uint256 _fromAccountNumber,
        uint256 _amountWei
    )
        internal
        virtual
        override
        _withdrawFromVaultForDolomiteMarginFreezableValidator
    {
        super._withdrawFromVaultForDolomiteMargin(_fromAccountNumber, _amountWei);
    }

    function _openBorrowPosition(
        uint256 _fromAccountNumber,
        uint256 _toAccountNumber,
        uint256 _amountWei
    )
        internal
        virtual
        override
        _openBorrowPositionFreezableValidator
    {
        super._openBorrowPosition(_fromAccountNumber, _toAccountNumber, _amountWei);
    }

    function _closeBorrowPositionWithUnderlyingVaultToken(
        uint256 _borrowAccountNumber,
        uint256 _toAccountNumber
    )
        internal
        virtual
        override
        _closeBorrowPositionWithUnderlyingVaultTokenFreezableValidator(_borrowAccountNumber)
    {
        super._closeBorrowPositionWithUnderlyingVaultToken(_borrowAccountNumber, _toAccountNumber);
    }

    function _closeBorrowPositionWithOtherTokens(
        uint256 _borrowAccountNumber,
        uint256 _toAccountNumber,
        uint256[] calldata _collateralMarketIds
    )
        internal
        virtual
        override
        _closeBorrowPositionWithOtherTokensFreezableValidator(_borrowAccountNumber)
    {
        super._closeBorrowPositionWithOtherTokens(_borrowAccountNumber, _toAccountNumber, _collateralMarketIds);
    }

    function _transferIntoPositionWithUnderlyingToken(
        uint256 _fromAccountNumber,
        uint256 _borrowAccountNumber,
        uint256 _amountWei
    )
        internal
        virtual
        override
        _transferIntoPositionWithUnderlyingTokenFreezableValidator
    {
        super._transferIntoPositionWithUnderlyingToken(_fromAccountNumber, _borrowAccountNumber, _amountWei);
    }

    function _transferIntoPositionWithOtherToken(
        uint256 _fromAccountNumber,
        uint256 _borrowAccountNumber,
        uint256 _marketId,
        uint256 _amountWei,
        AccountBalanceLib.BalanceCheckFlag _balanceCheckFlag
    )
        internal
        virtual
        override
        _transferIntoPositionWithOtherTokenFreezableValidator
    {
        super._transferIntoPositionWithOtherToken(
            _fromAccountNumber,
            _borrowAccountNumber,
            _marketId,
            _amountWei,
            _balanceCheckFlag
        );
    }

    function _transferFromPositionWithUnderlyingToken(
        uint256 _borrowAccountNumber,
        uint256 _toAccountNumber,
        uint256 _amountWei
    )
        internal
        virtual
        override
        _transferFromPositionWithUnderlyingTokenFreezableValidator(_borrowAccountNumber)
    {
        super._transferFromPositionWithUnderlyingToken(_borrowAccountNumber, _toAccountNumber, _amountWei);
    }

    function _transferFromPositionWithOtherToken(
        uint256 _borrowAccountNumber,
        uint256 _toAccountNumber,
        uint256 _marketId,
        uint256 _amountWei,
        AccountBalanceLib.BalanceCheckFlag _balanceCheckFlag
    )
        internal
        virtual
        override
        _transferFromPositionWithOtherTokenFreezableValidator(_borrowAccountNumber)
    {
        super._transferFromPositionWithOtherToken(
            _borrowAccountNumber,
            _toAccountNumber,
            _marketId,
            _amountWei,
            _balanceCheckFlag
        );
    }

    function _repayAllForBorrowPosition(
        uint256 _fromAccountNumber,
        uint256 _borrowAccountNumber,
        uint256 _marketId,
        AccountBalanceLib.BalanceCheckFlag _balanceCheckFlag
    )
        internal
        virtual
        override
        _repayAllForBorrowPositionFreezableValidator
    {
        super._repayAllForBorrowPosition(_fromAccountNumber, _borrowAccountNumber, _marketId, _balanceCheckFlag);
    }

    function _addCollateralAndSwapExactInputForOutput(
        uint256 _fromAccountNumber,
        uint256 _borrowAccountNumber,
        uint256[] calldata _marketIdsPath,
        uint256 _inputAmountWei,
        uint256 _minOutputAmountWei,
        IGenericTraderProxyV1.TraderParam[] memory _tradersPath,
        IDolomiteMargin.AccountInfo[] memory _makerAccounts,
        IGenericTraderProxyV1.UserConfig memory _userConfig
    )
        internal
        virtual
        override
        _addCollateralAndSwapExactInputForOutputFreezableValidator
    {
        super._addCollateralAndSwapExactInputForOutput(
            _fromAccountNumber,
            _borrowAccountNumber,
            _marketIdsPath,
            _inputAmountWei,
            _minOutputAmountWei,
            _tradersPath,
            _makerAccounts,
            _userConfig
        );
    }

    function _swapExactInputForOutputAndRemoveCollateral(
        uint256 _toAccountNumber,
        uint256 _borrowAccountNumber,
        uint256[] calldata _marketIdsPath,
        uint256 _inputAmountWei,
        uint256 _minOutputAmountWei,
        IGenericTraderProxyV1.TraderParam[] memory _tradersPath,
        IDolomiteMargin.AccountInfo[] memory _makerAccounts,
        IGenericTraderProxyV1.UserConfig memory _userConfig
    )
        internal
        virtual
        override
        _swapExactInputForOutputAndRemoveCollateralFreezableValidator(_borrowAccountNumber)
    {
        super._swapExactInputForOutputAndRemoveCollateral(
            _toAccountNumber,
            _borrowAccountNumber,
            _marketIdsPath,
            _inputAmountWei,
            _minOutputAmountWei,
            _tradersPath,
            _makerAccounts,
            _userConfig
        );
    }

    function _swapExactInputForOutput(
        uint256 _tradeAccountNumber,
        uint256[] calldata _marketIdsPath,
        uint256 _inputAmountWei,
        uint256 _minOutputAmountWei,
        IGenericTraderProxyV1.TraderParam[] memory _tradersPath,
        IDolomiteMargin.AccountInfo[] memory _makerAccounts,
        IGenericTraderProxyV1.UserConfig memory _userConfig
    )
        internal
        virtual
        override
        _swapExactInputForOutputFreezableValidator
    {
        super._swapExactInputForOutput(
            _tradeAccountNumber,
            _marketIdsPath,
            _inputAmountWei,
            _minOutputAmountWei,
            _tradersPath,
            _makerAccounts,
            _userConfig
        );
    }

    // ==================================================================
    // ======================== Internal Functions ======================
    // ==================================================================

    function _setIsVaultDepositSourceWrapper(bool _isDepositSourceWrapper) internal {
        _setUint256(_IS_DEPOSIT_SOURCE_WRAPPER_SLOT, _isDepositSourceWrapper ? 1 : 0);
        emit IsDepositSourceWrapperSet(_isDepositSourceWrapper);
    }

    function _setShouldVaultSkipTransfer(bool _shouldSkipTransfer) internal {
        _setUint256(_SHOULD_SKIP_TRANSFER_SLOT, _shouldSkipTransfer ? 1 : 0);
        emit ShouldSkipTransferSet(_shouldSkipTransfer);
    }

    function _setExecutionFeeForAccountNumber(
        uint256 _accountNumber,
        uint256 _executionFee
    ) internal {
        _setUint256(keccak256(abi.encode(_POSITION_TO_EXECUTION_FEE_SLOT, _accountNumber)), _executionFee);
        emit ExecutionFeeSet(_accountNumber, _executionFee);
    }

    function _setVirtualBalance(uint256 _balance) internal {
        _setUint256(_VIRTUAL_BALANCE_SLOT, _balance);
        emit VirtualBalanceSet(_balance);
    }

    function _initiateUnwrapping(
        uint256 _tradeAccountNumber,
        uint256 _inputAmount,
        address _outputToken,
        uint256 _minOutputAmount,
        bool _isLiquidation,
        bytes calldata _extraData
    ) internal virtual;

    function _validateIsLiquidator(address _from) internal view {
        Require.that(
            dolomiteRegistry().liquidatorAssetRegistry().isAssetWhitelistedForLiquidation(
                IFreezableIsolationModeVaultFactory(VAULT_FACTORY()).marketId(),
                _from
            ),
            _FILE,
            "Only liquidator can call",
            _from
        );
    }

    // ==================================================================
    // ======================== Private Functions =======================
    // ==================================================================

    function _refundExecutionFeeIfNecessary(uint256 _borrowAccountNumber) private {
        IDolomiteStructs.AccountInfo memory borrowAccountInfo = IDolomiteStructs.AccountInfo({
            owner: address(this),
            number: _borrowAccountNumber
        });
        uint256 executionFee = getExecutionFeeForAccountNumber(_borrowAccountNumber);
        if (DOLOMITE_MARGIN().getAccountNumberOfMarketsWithBalances(borrowAccountInfo) == 0 && executionFee > 0) {
            // There's no assets left in the position. Issue a refund for the execution fee
            _setExecutionFeeForAccountNumber(_borrowAccountNumber, /* _executionFee = */ 0);
            // @audit: check for any reentrancy issues! No user-level functions on the vault should be reentered
            payable(OWNER()).sendValue(executionFee);
        }
    }

    function _beforeInitiateUnwrapping(
        uint256 _tradeAccountNumber,
        uint256 _inputAmount,
        bool _isLiquidation
    ) private view {
        // Disallow the withdrawal if we're attempting to OVER withdraw. This can happen due to a pending deposit OR if
        // the user inputs a number that's too large
        _validateWithdrawalAmountForUnwrapping(
            _tradeAccountNumber,
            _inputAmount,
            _isLiquidation
        );
    }

    function _validateWithdrawalAmountForUnwrapping(
        uint256 _accountNumber,
        uint256 _withdrawalAmount,
        bool _isLiquidation
    ) private view {
        Require.that(
            _withdrawalAmount > 0,
            _FILE,
            "Invalid withdrawal amount"
        );

        IFreezableIsolationModeVaultFactory factory = IFreezableIsolationModeVaultFactory(VAULT_FACTORY());
        address vault = address(this);
        uint256 withdrawalPendingAmount = factory.getPendingAmountByAccount(
            vault,
            _accountNumber,
            IFreezableIsolationModeVaultFactory.FreezeType.Withdrawal
        );
        uint256 depositPendingAmount = factory.getPendingAmountByAccount(
            vault,
            _accountNumber,
            IFreezableIsolationModeVaultFactory.FreezeType.Deposit
        );

        IDolomiteStructs.AccountInfo memory accountInfo = IDolomiteStructs.AccountInfo({
            owner: vault,
            number: _accountNumber
        });
        uint256 balance = factory.DOLOMITE_MARGIN().getAccountWei(accountInfo, factory.marketId()).value;

        if (!_isLiquidation) {
            // The requested withdrawal cannot be for more than the user's balance, minus any pending.
            Require.that(
                balance - (withdrawalPendingAmount + depositPendingAmount) >= _withdrawalAmount,
                _FILE,
                "Withdrawal too large",
                vault,
                _accountNumber
            );
        } else {
            // The requested withdrawal must be for the entirety of the user's balance
            Require.that(
                balance - (withdrawalPendingAmount + depositPendingAmount) > 0,
                _FILE,
                "Account is frozen",
                vault,
                _accountNumber
            );
            Require.that(
                balance - (withdrawalPendingAmount + depositPendingAmount) == _withdrawalAmount,
                _FILE,
                "Liquidation must be full balance",
                vault,
                _accountNumber
            );
        }
    }

    function _requireNotFrozen() private view {
        Require.that(
            !isVaultFrozen(),
            _FILE,
            "Vault is frozen"
        );
    }
}
