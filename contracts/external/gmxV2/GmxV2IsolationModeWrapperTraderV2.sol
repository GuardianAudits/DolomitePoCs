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
import { GmxV2IsolationModeTraderBase } from "./GmxV2IsolationModeTraderBase.sol";
import { IDolomiteMargin } from "../../protocol/interfaces/IDolomiteMargin.sol";
import { IDolomiteStructs } from "../../protocol/interfaces/IDolomiteStructs.sol";
import { IWETH } from "../../protocol/interfaces/IWETH.sol";
import { Require } from "../../protocol/lib/Require.sol";
import { GmxDeposit } from "../interfaces/gmx/GmxDeposit.sol";
import { GmxEventUtils } from "../interfaces/gmx/GmxEventUtils.sol";
import { IGmxDepositCallbackReceiver } from "../interfaces/gmx/IGmxDepositCallbackReceiver.sol";
import { IGmxExchangeRouter } from "../interfaces/gmx/IGmxExchangeRouter.sol";
import { IGmxRegistryV2 } from "../interfaces/gmx/IGmxRegistryV2.sol";
import { IGmxV2IsolationModeVaultFactory } from "../interfaces/gmx/IGmxV2IsolationModeVaultFactory.sol";
import { IGmxV2IsolationModeWrapperTraderV2 } from "../interfaces/gmx/IGmxV2IsolationModeWrapperTraderV2.sol";
import { UpgradeableIsolationModeWrapperTrader } from "../proxies/abstract/UpgradeableIsolationModeWrapperTrader.sol";




/**
 * @title   GmxV2IsolationModeWrapperTraderV2
 * @author  Dolomite
 *
 * @notice  Used for wrapping GMX GM tokens (via depositing into GMX)
 */

contract GmxV2IsolationModeWrapperTraderV2 is
    UpgradeableIsolationModeWrapperTrader,
    GmxV2IsolationModeTraderBase,
    IGmxV2IsolationModeWrapperTraderV2,
    IGmxDepositCallbackReceiver
{
    using SafeERC20 for IERC20;
    using SafeERC20 for IWETH;

    // ============ Constants ============

    bytes32 private constant _FILE = "GmxV2IsolationModeWrapperV2";
    uint256 private constant _SLIPPAGE_BASE = 10_000;

    bytes32 private constant _GMX_REGISTRY_V2_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxRegistryV2")) - 1);
    bytes32 private constant _DEPOSIT_INFO_SLOT = bytes32(uint256(keccak256("eip1967.proxy.depositInfo")) - 1);
    bytes32 private constant _HANDLERS_SLOT = bytes32(uint256(keccak256("eip1967.proxy.handlers")) - 1);
    bytes32 private constant _CALLBACK_GAS_LIMIT_SLOT = bytes32(uint256(keccak256("eip1967.proxy.callbackGasLimit")) - 1); // solhint-disable-line max-line-length
    bytes32 private constant _SLIPPAGE_MINIMUM_SLOT = bytes32(uint256(keccak256("eip1967.proxy.slippageMinimum")) - 1);

    // ============ Initializer ============

    function initialize(address _gmxRegistryV2, address _weth, address _dGM, address _dolomiteMargin) external initializer {
        _initializeWrapperTrader(_dGM, _dolomiteMargin);
        _initializeTraderBase(_weth);
        _setAddress(_GMX_REGISTRY_V2_SLOT, _gmxRegistryV2);
    }

    // ============================================
    // ============= Public Functions =============
    // ============================================

    receive() external payable {} // solhint-disable-line no-empty-blocks

    function afterDepositExecution(
        bytes32 _key,
        GmxDeposit.Props memory _deposit,
        GmxEventUtils.EventLogData memory _eventData
    )
    external
    onlyHandler(msg.sender) {
        DepositInfo memory depositInfo = _getDepositSlot(_key);
        Require.that(
            depositInfo.vault != address(0),
            _FILE,
            "Invalid deposit key"
        );

        // @follow-up EventData is weird so we should discuss
        uint256 len = _eventData.uintItems.items.length;
        GmxEventUtils.UintKeyValue memory receivedMarketTokens = _eventData.uintItems.items[len-1];
        Require.that(
            keccak256(abi.encodePacked(receivedMarketTokens.key)) == keccak256(abi.encodePacked("receivedMarketToken")),
            _FILE,
            "Unexpected return data"
        );

        IERC20 underlyingToken = IERC20(VAULT_FACTORY().UNDERLYING_TOKEN());
        IGmxV2IsolationModeVaultFactory factory = IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY()));

        underlyingToken.safeTransfer(depositInfo.vault, _deposit.numbers.minMarketTokens);
        if (receivedMarketTokens.value > _deposit.numbers.minMarketTokens) {
            uint256 diff = receivedMarketTokens.value - _deposit.numbers.minMarketTokens;
            underlyingToken.approve(depositInfo.vault, diff);

            factory.depositIntoDolomiteMarginFromTokenConverter(
                depositInfo.vault,
                depositInfo.accountNumber,
                diff
            );
        }

        factory.setIsVaultFrozen(depositInfo.vault, false);
        _setDepositInfo(_key, DepositInfo(address(0), 0));
        emit DepositExecuted(_key);
    }

    function afterDepositCancellation(
        bytes32 _key,
        GmxDeposit.Props memory _deposit,
        GmxEventUtils.EventLogData memory /* _eventData */
    )
    external
    onlyHandler(msg.sender) {
        DepositInfo memory depositInfo = _getDepositSlot(_key);
        Require.that(
            depositInfo.vault != address(0),
            _FILE,
            "Invalid deposit key"
        );

        IGmxV2IsolationModeVaultFactory factory = IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY()));
        assert(_deposit.numbers.initialLongTokenAmount == 0 || _deposit.numbers.initialShortTokenAmount == 0);

        if (_deposit.numbers.initialLongTokenAmount > 0) {
            _depositOtherTokenIntoDolomiteMarginFromTokenConverter(
                _deposit.addresses.initialLongToken,
                _deposit.numbers.initialLongTokenAmount,
                depositInfo,
                factory
            );
        } else {
            _depositOtherTokenIntoDolomiteMarginFromTokenConverter(
                _deposit.addresses.initialShortToken,
                _deposit.numbers.initialShortTokenAmount,
                depositInfo,
                factory
            );
        }

        // Burn the GM tokens that were virtually minted to the vault, since the deposit was cancelled
        factory.setShouldSkipTransfer(depositInfo.vault, true);
        factory.withdrawFromDolomiteMarginFromTokenConverter(
            depositInfo.vault,
            depositInfo.accountNumber,
            _deposit.numbers.minMarketTokens
        );

        factory.setIsVaultFrozen(depositInfo.vault, false);
        _setDepositInfo(_key, DepositInfo(address(0), 0));
        emit DepositCancelled(_key);
    }

    function cancelDeposit(bytes32 _key) external {
        DepositInfo memory depositInfo = _getDepositSlot(_key);
        Require.that(
            msg.sender == depositInfo.vault || isHandler(msg.sender),
            _FILE,
            "Only vault or handler can cancel"
        );
        GMX_REGISTRY_V2().gmxExchangeRouter().cancelDeposit(_key);
    }

    function setCallbackGasLimit(uint256 _callbackGasLimit) external onlyDolomiteMarginOwner(msg.sender) {
        _setCallbackGasLimit(_callbackGasLimit);
    }

    function setSlippageMinimum(uint256 _slippageMinimum) external onlyDolomiteMarginOwner(msg.sender) {
        _setSlippageMinimum(_slippageMinimum);
    }

    function isValidInputToken(address _inputToken) public view override returns (bool) {
        address longToken = IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY())).longToken();
        address shortToken = IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY())).shortToken();
        return _inputToken == longToken || _inputToken == shortToken;
    }

    function slippageMinimum() public view returns (uint256) {
        return _getUint256(_SLIPPAGE_MINIMUM_SLOT);
    }

    function callbackGasLimit() public view returns (uint256) {
        return _getUint256(_CALLBACK_GAS_LIMIT_SLOT);
    }

    function GMX_REGISTRY_V2() public view returns (IGmxRegistryV2) {
        return IGmxRegistryV2(_getAddress(_GMX_REGISTRY_V2_SLOT));
    }

    // ============================================
    // ============ Internal Functions ============
    // ============================================

    function _exchangeIntoUnderlyingToken(
        address _tradeOriginator,
        address /* _receiver */,
        address _outputTokenUnderlying,
        uint256 _minOutputAmount,
        address _inputToken,
        uint256 _inputAmount,
        bytes memory _extraOrderData
    )
        internal
        override
        returns (uint256)
    {
        _checkSlippage(_inputToken, _inputAmount, _minOutputAmount);

        address tradeOriginatorForStackTooDeep = _tradeOriginator;
        (uint256 accountNumber, uint256 ethExecutionFee) = abi.decode(_extraOrderData, (uint256, uint256));
        IGmxExchangeRouter exchangeRouter = GMX_REGISTRY_V2().gmxExchangeRouter();
        WETH().safeTransferFrom(tradeOriginatorForStackTooDeep, address(this), ethExecutionFee);
        WETH().withdraw(ethExecutionFee);

        {
            address depositVault = GMX_REGISTRY_V2().gmxDepositVault();
            exchangeRouter.sendWnt{value: ethExecutionFee}(depositVault, ethExecutionFee);
            IERC20(_inputToken).safeApprove(address(GMX_REGISTRY_V2().gmxRouter()), _inputAmount);
            exchangeRouter.sendTokens(_inputToken, depositVault, _inputAmount);
        }

        {
            IGmxExchangeRouter.CreateDepositParams memory depositParamsTest = IGmxExchangeRouter.CreateDepositParams(
                /* receiver = */ address(this),
                /* callbackContract = */ address(this),
                /* uiFeeReceiver = */ address(0),
                /* market = */ _outputTokenUnderlying,
                /* initialLongToken = */ IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY())).longToken(),
                /* initialShortToken = */ IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY())).shortToken(),
                /* longTokenSwapPath = */ new address[](0),
                /* shortTokenSwapPath = */ new address[](0),
                /* minMarketTokens = */ _minOutputAmount,
                /* shouldUnwrapNativeToken = */ false,
                /* executionFee = */ ethExecutionFee,
                /* callbackGasLimit = */ _getUint256(_CALLBACK_GAS_LIMIT_SLOT)
            );

            bytes32 depositKey = exchangeRouter.createDeposit(depositParamsTest);
            _setDepositInfo(depositKey, DepositInfo(tradeOriginatorForStackTooDeep, accountNumber));
            emit DepositCreated(depositKey);
        }

        IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY())).setIsVaultFrozen(tradeOriginatorForStackTooDeep, true);
        IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY())).setShouldSkipTransfer(
            tradeOriginatorForStackTooDeep,
            true
        );
        return _minOutputAmount;
    }

    function _depositOtherTokenIntoDolomiteMarginFromTokenConverter(
        address _token,
        uint256 _amount,
        DepositInfo memory _info,
        IGmxV2IsolationModeVaultFactory factory
    ) internal {
        IERC20(_token).safeApprove(address(factory), _amount);
        factory.depositOtherTokenIntoDolomiteMarginFromTokenConverter(
            _info.vault,
            _info.accountNumber,
            DOLOMITE_MARGIN().getMarketIdByTokenAddress(_token),
            _amount
        );
    }

    function _setCallbackGasLimit(uint256 _callbackGasLimit) internal {
        _setUint256(_CALLBACK_GAS_LIMIT_SLOT, _callbackGasLimit);
    }

    function _setSlippageMinimum(uint256 _slippageMinimum) internal {
        Require.that(
            _slippageMinimum < _SLIPPAGE_BASE && _slippageMinimum > 0,
            _FILE,
            "Invalid slippageMinimum"
        );
        _setUint256(_SLIPPAGE_MINIMUM_SLOT, _slippageMinimum);
    }

    function _setDepositInfo(bytes32 _key, DepositInfo memory _info) internal {
        DepositInfo storage storageInfo = _getDepositSlot(_key);
        storageInfo.vault = _info.vault;
        storageInfo.accountNumber = _info.accountNumber;
    }

    function _approveIsolationModeTokenForTransfer(
        address _vault,
        address _receiver,
        uint256 _amount
    )
    internal
    override {
        VAULT_FACTORY().enqueueTransferIntoDolomiteMargin(_vault, _amount);
        IERC20(address(VAULT_FACTORY())).safeApprove(_receiver, _amount);
    }

    function _checkSlippage(address _inputToken, uint256 _inputAmount, uint256 _minOutputAmount) internal view {
        IDolomiteMargin dolomiteMargin = DOLOMITE_MARGIN();

        IDolomiteStructs.MonetaryPrice memory inputPrice = dolomiteMargin.getMarketPrice(
            dolomiteMargin.getMarketIdByTokenAddress(_inputToken)
        );
        IDolomiteStructs.MonetaryPrice memory outputPrice = dolomiteMargin.getMarketPrice(
            dolomiteMargin.getMarketIdByTokenAddress(address(VAULT_FACTORY()))
        );
        uint256 inputValue = _inputAmount * inputPrice.value;
        uint256 outputValue = _minOutputAmount * outputPrice.value;

        Require.that(
            outputValue > inputValue - (inputValue * slippageMinimum() / _SLIPPAGE_BASE),
            _FILE,
            "Insufficient output amount"
        );
    }

    function _getDepositSlot(bytes32 _key) internal pure returns (DepositInfo storage info) {
        bytes32 slot = keccak256(abi.encodePacked(_DEPOSIT_INFO_SLOT, _key));
        // solhint-disable-next-line no-inline-assembly
        assembly {
            info.slot := slot
        }
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
    returns (uint256)
    {
        revert(string(abi.encodePacked(Require.stringifyTruncated(_FILE), ": getExchangeCost is not implemented")));
    }

}
