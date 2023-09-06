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
import { Require } from "../../protocol/lib/Require.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { IDolomiteStructs } from "../../protocol/interfaces/IDolomiteStructs.sol";
import { IGmxV2IsolationModeVaultFactory } from "../interfaces/gmx/IGmxV2IsolationModeVaultFactory.sol";
import { IGmxV2IsolationModeWrapperTraderV2 } from "../interfaces/gmx/IGmxV2IsolationModeWrapperTraderV2.sol";
import { IGmxV2IsolationModeTokenVault } from "../interfaces/gmx/IGmxV2IsolationModeTokenVault.sol";
import { IsolationModeWrapperTraderV2 } from "../proxies/abstract/IsolationModeWrapperTraderV2.sol";
import { IWETH } from "../../protocol/interfaces/IWETH.sol";

import { GmxDeposit } from "../interfaces/gmx/GmxDeposit.sol";
import { GmxEventUtils } from "../interfaces/gmx/GmxEventUtils.sol";
import { GmxWithdrawal } from "../interfaces/gmx/GmxWithdrawal.sol";
import { IGmxExchangeRouter } from "../interfaces/gmx/IGmxExchangeRouter.sol";
import { IGmxDepositCallbackReceiver } from "../interfaces/gmx/IGmxDepositCallbackReceiver.sol";
import { IGmxRegistryV2 } from "../interfaces/gmx/IGmxRegistryV2.sol";

import "hardhat/console.sol";

/**
 * @title   GmxV2IsolationModeWrapperTraderV2
 * @author  Dolomite
 *
 * @notice  Used for wrapping GMX GM tokens (via depositing into GMX)
 */

contract GmxV2IsolationModeWrapperTraderV2 is 
    IsolationModeWrapperTraderV2,
    IGmxV2IsolationModeWrapperTraderV2,
    IGmxDepositCallbackReceiver
{
    using SafeERC20 for IERC20;
    using SafeERC20 for IWETH;

    // ============ Constants ============

    bytes32 private constant _FILE = "GmxV2IsolationModeWrapperV2";

    IGmxRegistryV2 public immutable GMX_REGISTRY_V2; // solhint-disable-line var-name-mixedcase
    bytes32 private constant _DEPOSIT_INFO_SLOT = bytes32(uint256(keccak256("eip1967.proxy.depositInfo")) - 1);
    bytes32 private constant _HANDLERS_SLOT = bytes32(uint256(keccak256("eip1967.proxy.handlers")) - 1);
    bytes32 private constant _CALLBACK_GAS_LIMIT_SLOT = bytes32(uint256(keccak256("eip1967.proxy.callbackGasLimit")) - 1);
    bytes32 private constant _SLIPPAGE_MINIMUM_SLOT = bytes32(uint256(keccak256("eip1967.proxy.slippageMinimum")) - 1);

    IWETH public immutable weth;

    // ===================================================
    // ==================== Modifiers ====================
    // ===================================================

    modifier onlyHandler(address _from) {
        Require.that(
            isHandler(_from),
            _FILE,
            "Only handler can call",
            _from
        );
        _;
    }

    // ============ Constructor ============

    constructor(
        address _gmxRegistryV2,
        address _weth,
        address _dGM,
        address _dolomiteMargin
    ) IsolationModeWrapperTraderV2(_dGM, _dolomiteMargin) {
        GMX_REGISTRY_V2 = IGmxRegistryV2(_gmxRegistryV2);
        weth = IWETH(_weth);
    }

    // ============================================
    // ============= Public Functions =============
    // ============================================

    receive() external payable {}

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

        IERC20 underlyingToken = IERC20(VAULT_FACTORY.UNDERLYING_TOKEN());
        IGmxV2IsolationModeVaultFactory factory = IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY));

        underlyingToken.safeTransfer(depositInfo.vault, _deposit.numbers.minMarketTokens);
        if (receivedMarketTokens.value > _deposit.numbers.minMarketTokens) {
            uint256 diff = receivedMarketTokens.value - _deposit.numbers.minMarketTokens;
            // @follow-up Check allowance math. Approve is already called in exchange call
            underlyingToken.safeIncreaseAllowance(depositInfo.vault, diff - _deposit.numbers.minMarketTokens);

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

        IGmxV2IsolationModeVaultFactory factory = IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY));
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
        GMX_REGISTRY_V2.gmxExchangeRouter().cancelDeposit(_key);
    }

    function setIsHandler(address _address, bool _status) external onlyDolomiteMarginOwner(msg.sender) {
        _setIsHandler(_address, _status);
    }

    function setCallbackGasLimit(uint256 _callbackGasLimit) external onlyDolomiteMarginOwner(msg.sender) {
        _setCallbackGasLimit(_callbackGasLimit);
    }

    function setSlippageMinimum(uint256 _slippageMinimum) external onlyDolomiteMarginOwner(msg.sender) {
        _setSlippageMinimum(_slippageMinimum);
    }

    function ownerWithdrawETH(address _receiver) external onlyDolomiteMarginOwner(msg.sender) {
        uint256 bal = address(this).balance;
        weth.deposit{value: bal}();
        weth.safeTransfer(_receiver, bal);
    }

    function isValidInputToken(address _inputToken) public view override returns (bool) {
        address longToken = IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY)).longToken();
        address shortToken = IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY)).shortToken();
        return _inputToken == longToken || _inputToken == shortToken;
    }

    function isHandler(address _address) public view returns (bool) {
        bytes32 slot = keccak256(abi.encodePacked(_HANDLERS_SLOT, _address));
        return _getUint256(slot) == 1;
    }

    function slippageMinimum() public view returns (uint256) {
        return _getUint256(_SLIPPAGE_MINIMUM_SLOT);
    }

    function callbackGasLimit() public view returns (uint256) {
        return _getUint256(_CALLBACK_GAS_LIMIT_SLOT);
    }

    // ============================================
    // ============ Internal Functions ============
    // ============================================

    function _exchangeIntoUnderlyingToken(
        address _tradeOriginator,
        address, /* _receiver */
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
        (, uint256 tempParam) = abi.decode(_extraOrderData, (uint256, uint256));
        IGmxExchangeRouter exchangeRouter = GMX_REGISTRY_V2.gmxExchangeRouter();
        weth.safeTransferFrom(_tradeOriginator, address(this), tempParam);
        weth.withdraw(tempParam);

        {
            address depositVault = GMX_REGISTRY_V2.gmxDepositVault();
            exchangeRouter.sendWnt{value: tempParam}(depositVault, tempParam);
            IERC20(_inputToken).safeApprove(address(GMX_REGISTRY_V2.gmxRouter()), _inputAmount);
            exchangeRouter.sendTokens(_inputToken, depositVault, _inputAmount);
        }

        {
            IGmxExchangeRouter.CreateDepositParams memory depositParamsTest = IGmxExchangeRouter.CreateDepositParams(
                address(this), /* receiver */
                address(this), /* callbackContract */
                address(0), /* uiFeeReceiver */
                _outputTokenUnderlying, /* market */
                IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY)).longToken(), /* initialLongToken */
                IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY)).shortToken(), /* initialShortToken */
                new address[](0), /* longTokenSwapPath */
                new address[](0), /* shortTokenSwapPath */
                _minOutputAmount,
                false, /* shouldUnwrapNativeToken */
                tempParam, /* executionFee */
                _getUint256(_CALLBACK_GAS_LIMIT_SLOT) /* callbackGasLimit */
            );

            // @follow-up Using tempParam as a work around. Need to revisit
            (tempParam,) = abi.decode(_extraOrderData, (uint256, uint256));
            bytes32 depositKey = exchangeRouter.createDeposit(depositParamsTest);
            _setDepositInfo(depositKey, DepositInfo(_tradeOriginator, tempParam));
            emit DepositCreated(depositKey);
        }

        IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY)).setIsVaultFrozen(_tradeOriginator, true);
        IGmxV2IsolationModeVaultFactory(address(VAULT_FACTORY)).setShouldSkipTransfer(_tradeOriginator, true);
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

    function _setIsHandler(address _address, bool _status) internal {
        bytes32 slot =  keccak256(abi.encodePacked(_HANDLERS_SLOT, _address));
        _setUint256(slot, _status ? 1 : 0);
    }

    function _setCallbackGasLimit(uint256 _callbackGasLimit) internal {
        _setUint256(_CALLBACK_GAS_LIMIT_SLOT, _callbackGasLimit);
    }

    function _setSlippageMinimum(uint256 _slippageMinimum) internal {
        _setUint256(_SLIPPAGE_MINIMUM_SLOT, _slippageMinimum);
    }

    function _setDepositInfo(bytes32 _key, DepositInfo memory _info) internal {
        DepositInfo storage storageInfo = _getDepositSlot(_key);
        storageInfo.vault = _info.vault;
        storageInfo.accountNumber = _info.accountNumber;
    }

    function _getDepositSlot(bytes32 _key) internal pure returns (DepositInfo storage info) {
        bytes32 slot = keccak256(abi.encodePacked(_DEPOSIT_INFO_SLOT, _key));
        // solhint-disable-next-line no-inline-assembly
        assembly {
            info.slot := slot
        }
    }

    function _checkSlippage(address _inputToken, uint256 _inputAmount, uint256 _minOutputAmount) internal view {
        // @follow-up GM price is 30 decimals but token is 18 decimals
        IDolomiteStructs.MonetaryPrice memory inputPrice = DOLOMITE_MARGIN().getMarketPrice(DOLOMITE_MARGIN().getMarketIdByTokenAddress(_inputToken));
        IDolomiteStructs.MonetaryPrice memory outputPrice = DOLOMITE_MARGIN().getMarketPrice(DOLOMITE_MARGIN().getMarketIdByTokenAddress(address(VAULT_FACTORY)));
        uint256 inputValue = _inputAmount * inputPrice.value;
        uint256 outputValue = _minOutputAmount * outputPrice.value;
        console.log(inputPrice.value);
        console.log(outputPrice.value);
        console.log('');
        console.log(_inputAmount);
        console.log(_minOutputAmount);
        console.log('');
        console.log(inputValue);
        console.log(outputValue);
        console.log('Done');
        Require.that(
            outputValue > inputValue * (100 - slippageMinimum()) / 100,
            _FILE,
            "Insufficient output amount"
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
    returns (uint256)
    {
        revert(string(abi.encodePacked(Require.stringifyTruncated(_FILE), ": getExchangeCost is not implemented")));
    }

}