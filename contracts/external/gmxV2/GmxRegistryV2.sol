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
import { BaseRegistry } from "../general/BaseRegistry.sol";
import { IGmxDataStore } from "../interfaces/gmx/IGmxDataStore.sol";
import { IGmxDepositHandler } from "../interfaces/gmx/IGmxDepositHandler.sol";
import { IGmxExchangeRouter } from "../interfaces/gmx/IGmxExchangeRouter.sol";
import { IGmxReader } from "../interfaces/gmx/IGmxReader.sol";
import { IGmxRegistryV2 } from "../interfaces/gmx/IGmxRegistryV2.sol";
import { IGmxRouter } from "../interfaces/gmx/IGmxRouter.sol";
import { IGmxV2IsolationModeUnwrapperTraderV2 } from "../interfaces/gmx/IGmxV2IsolationModeUnwrapperTraderV2.sol";
import { IGmxV2IsolationModeWrapperTraderV2 } from "../interfaces/gmx/IGmxV2IsolationModeWrapperTraderV2.sol";
import { IGmxWithdrawalHandler } from "../interfaces/gmx/IGmxWithdrawalHandler.sol";


/**
 * @title   GmxRegistryV2
 * @author  Dolomite
 *
 * @notice  Implementation for a registry that contains all of the GMX V2-related addresses. This registry is needed to
 *          offer uniform access to addresses in an effort to keep Dolomite's contracts as up-to-date as possible
 *          without having to deprecate the system and force users to migrate (losing any vesting rewards / multiplier
 *          points) when Dolomite needs to point to new contracts or functions that GMX introduces.
 */
contract GmxRegistryV2 is IGmxRegistryV2, BaseRegistry {

    // ==================== Constants ====================

    bytes32 private constant _FILE = "GmxRegistryV2";

    // solhint-disable max-line-length
    bytes32 private constant _ETH_USD_MARKET_TOKEN_SLOT = bytes32(uint256(keccak256("eip1967.proxy.ethUsdMarketToken")) - 1);
    bytes32 private constant _GMX_DATASTORE_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxDataStore")) - 1);
    bytes32 private constant _GMX_DEPOSIT_VAULT_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxDepositVault")) - 1);
    bytes32 private constant _GMX_EXCHANGE_ROUTER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxExchangeRouter")) - 1);
    bytes32 private constant _GMX_READER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxReader")) - 1);
    bytes32 private constant _GMX_ROUTER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxRouter")) - 1);
    bytes32 private constant _GMX_WITHDRAWAL_VAULT_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxWithdrawalVault")) - 1);
    bytes32 private constant _GMX_V2_UNWRAPPER_TRADER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxV2UnwrapperTrader")) - 1);
    bytes32 private constant _GMX_V2_WRAPPER_TRADER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxV2WrapperTrader")) - 1);
    bytes32 private constant _IS_WAITING_FOR_CALLBACK_SLOT = bytes32(uint256(keccak256("eip1967.proxy.isWaitingForCallback")) - 1);
    // solhint-enable max-line-length

    // ==================== Initializer ====================

    function initialize(
        address _ethUsdMarketToken,
        address _gmxDataStore,
        address _gmxDepositVault,
        address _gmxExchangeRouter,
        address _gmxReader,
        address _gmxRouter,
        address _gmxWithdrawalVault,
        address _dolomiteRegistry
    ) external initializer {
        _ownerSetEthUsdMarketToken(_ethUsdMarketToken);
        _ownerSetGmxDataStore(_gmxDataStore);
        _ownerSetGmxDepositVault(_gmxDepositVault);
        _ownerSetGmxExchangeRouter(_gmxExchangeRouter);
        _ownerSetGmxReader(_gmxReader);
        _ownerSetGmxRouter(_gmxRouter);
        _ownerSetGmxWithdrawalVault(_gmxWithdrawalVault);

        _ownerSetDolomiteRegistry(_dolomiteRegistry);
    }

    function initializeTraders(
        address _unwrapperTrader,
        address _wrapperTrader
    ) external {
        Require.that(
            address(gmxV2UnwrapperTrader()) == address(0) && address(gmxV2WrapperTrader()) == address(0),
            _FILE,
            "Already initialized"
        );
        _ownerSetGmxV2UnwrapperTrader(_unwrapperTrader);
        _ownerSetGmxV2WrapperTrader(_wrapperTrader);
    }

    // ==================== Functions ====================

    function ownerSetEthUsdMarketToken(
        address _ethUsdMarketToken
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetEthUsdMarketToken(_ethUsdMarketToken);
    }

    function ownerSetGmxDataStore(
        address _gmxDataStore
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxDataStore(_gmxDataStore);
    }

    function ownerSetGmxDepositVault(
        address _gmxDepositVault
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxDepositVault(_gmxDepositVault);
    }

    function ownerSetGmxExchangeRouter(
        address _gmxExchangeRouter
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxExchangeRouter(_gmxExchangeRouter);
    }

    function ownerSetGmxReader(
        address _gmxReader
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxReader(_gmxReader);
    }

    function ownerSetGmxRouter(
        address _gmxRouter
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxRouter(_gmxRouter);
    }

    function ownerSetGmxWithdrawalVault(
        address _gmxWithdrawalVault
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxWithdrawalVault(_gmxWithdrawalVault);
    }

    function ownerSetGmxV2UnwrapperTrader(
        address _gmxV2UnwrapperTrader
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxV2UnwrapperTrader(_gmxV2UnwrapperTrader);
    }

    function ownerSetGmxV2WrapperTrader(
        address _gmxV2WrapperTrader
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxV2WrapperTrader(_gmxV2WrapperTrader);
    }

    // ==================== Non-Admin Functions ====================

    function setIsAccountWaitingForCallback(
        address _vault,
        uint256 _accountNumber,
        bool _isWaiting
    )
    external {
        Require.that(
            msg.sender == address(gmxV2UnwrapperTrader()) || msg.sender == address(gmxV2WrapperTrader()),
            _FILE,
            "Sender must be GMX V2 trader",
            msg.sender
        );
        bytes32 slot = keccak256(abi.encodePacked(_IS_WAITING_FOR_CALLBACK_SLOT, _vault, _accountNumber));
        _setUint256(slot, _isWaiting ? 1 : 0);
        emit AccountWaitingForCallbackSet(_vault, _accountNumber, _isWaiting);
    }

    // ==================== Views ====================

    function ethUsdMarketToken() external view returns (IERC20) {
        return IERC20(_getAddress(_ETH_USD_MARKET_TOKEN_SLOT));
    }

    function gmxDataStore() external view returns (IGmxDataStore) {
        return IGmxDataStore(_getAddress(_GMX_DATASTORE_SLOT));
    }

    function gmxDepositHandler() external view returns (IGmxDepositHandler) {
        return IGmxExchangeRouter(_getAddress(_GMX_EXCHANGE_ROUTER_SLOT)).depositHandler();
    }

    function gmxDepositVault() external view returns (address) {
        return _getAddress(_GMX_DEPOSIT_VAULT_SLOT);
    }

    function gmxExchangeRouter() external view returns (IGmxExchangeRouter) {
        return IGmxExchangeRouter(_getAddress(_GMX_EXCHANGE_ROUTER_SLOT));
    }

    function gmxReader() external view returns (IGmxReader) {
        return IGmxReader(_getAddress(_GMX_READER_SLOT));
    }

    function gmxRouter() external view returns (IGmxRouter) {
        return IGmxRouter(_getAddress(_GMX_ROUTER_SLOT));
    }

    function gmxWithdrawalHandler() external view returns (IGmxWithdrawalHandler) {
        return IGmxExchangeRouter(_getAddress(_GMX_EXCHANGE_ROUTER_SLOT)).withdrawalHandler();
    }

    function gmxWithdrawalVault() external view returns (address) {
        return _getAddress(_GMX_WITHDRAWAL_VAULT_SLOT);
    }

    function isAccountWaitingForCallback(
        address _vault,
        uint256 _accountNumber
    ) external view returns (bool) {
        bytes32 slot = keccak256(abi.encodePacked(_IS_WAITING_FOR_CALLBACK_SLOT, _vault, _accountNumber));
        return _getUint256(slot) == 1;
    }

    function gmxV2UnwrapperTrader() public view returns (IGmxV2IsolationModeUnwrapperTraderV2) {
        return IGmxV2IsolationModeUnwrapperTraderV2(_getAddress(_GMX_V2_UNWRAPPER_TRADER_SLOT));
    }

    function gmxV2WrapperTrader() public view returns (IGmxV2IsolationModeWrapperTraderV2) {
        return IGmxV2IsolationModeWrapperTraderV2(_getAddress(_GMX_V2_WRAPPER_TRADER_SLOT));
    }

    // ============================================================
    // ==================== Internal Functions ====================
    // ============================================================

    function _ownerSetEthUsdMarketToken(address _ethUsdMarketToken) internal {
        Require.that(
            _ethUsdMarketToken != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_ETH_USD_MARKET_TOKEN_SLOT, _ethUsdMarketToken);
        emit EthUsdMarketTokenSet(_ethUsdMarketToken);
    }

    function _ownerSetGmxDataStore(address _gmxDataStore) internal {
        Require.that(
            _gmxDataStore != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_DATASTORE_SLOT, _gmxDataStore);
        emit GmxDataStoreSet(_gmxDataStore);
    }

    function _ownerSetGmxDepositVault(address _gmxDepositVault) internal {
        Require.that(
            _gmxDepositVault != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_DEPOSIT_VAULT_SLOT, _gmxDepositVault);
        emit GmxDepositVaultSet(_gmxDepositVault);
    }

    function _ownerSetGmxExchangeRouter(address _gmxExchangeRouter) internal {
        Require.that(
            _gmxExchangeRouter != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_EXCHANGE_ROUTER_SLOT, _gmxExchangeRouter);
        emit GmxExchangeRouterSet(_gmxExchangeRouter);
    }

    function _ownerSetGmxReader(address _gmxReader) internal {
        Require.that(
            _gmxReader != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_READER_SLOT, _gmxReader);
        emit GmxReaderSet(_gmxReader);
    }

    function _ownerSetGmxRouter(address _gmxRouter) internal {
        Require.that(
            _gmxRouter != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_ROUTER_SLOT, _gmxRouter);
        emit GmxRouterSet(_gmxRouter);
    }

    function _ownerSetGmxWithdrawalVault(address _gmxWithdrawalVault) internal {
        Require.that(
            _gmxWithdrawalVault != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_WITHDRAWAL_VAULT_SLOT, _gmxWithdrawalVault);
        emit GmxWithdrawalVaultSet(_gmxWithdrawalVault);
    }

    function _ownerSetGmxV2UnwrapperTrader(address _gmxV2UnwrapperTrader) internal {
        Require.that(
            _gmxV2UnwrapperTrader != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_V2_UNWRAPPER_TRADER_SLOT, _gmxV2UnwrapperTrader);
        emit GmxV2UnwrapperTraderSet(_gmxV2UnwrapperTrader);
    }

    function _ownerSetGmxV2WrapperTrader(address _gmxV2WrapperTrader) internal {
        Require.that(
            _gmxV2WrapperTrader != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_V2_WRAPPER_TRADER_SLOT, _gmxV2WrapperTrader);
        emit GmxV2WrapperTraderSet(_gmxV2WrapperTrader);
    }
}
