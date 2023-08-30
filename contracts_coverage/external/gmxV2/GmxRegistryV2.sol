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

import { Require } from "../../protocol/lib/Require.sol";
import { BaseRegistry } from "../general/BaseRegistry.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IGmxRegistryV2 } from "../interfaces/gmx/IGmxRegistryV2.sol";
import { IGmxExchangeRouter } from "../interfaces/gmx/IGmxExchangeRouter.sol";
import { IGmxRouter } from "../interfaces/gmx/IGmxRouter.sol";
import { IGmxV2IsolationModeWrapperTrader } from "../interfaces/gmx/IGmxV2IsolationModeWrapperTrader.sol";
import { IDepositHandler } from "../interfaces/gmx/IDepositHandler.sol";
import { IWithdrawalHandler } from "../interfaces/gmx/IWithdrawalHandler.sol";

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
    bytes32 private constant _GMX_DEPOSIT_HANDLER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxDepositHandler")) - 1);
    bytes32 private constant _GMX_DEPOSIT_VAULT_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxDepositVault")) - 1);
    bytes32 private constant _GMX_EXCHANGE_ROUTER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxExchangeRouter")) - 1);
    bytes32 private constant _GMX_ROUTER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxRouter")) - 1);
    bytes32 private constant _GMX_WITHDRAWAL_HANDLER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxWithdrawalHandler")) - 1);
    bytes32 private constant _GMX_V2_UNWRAPPER_TRADER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxV2UnwrapperTrader")) - 1);
    bytes32 private constant _GMX_V2_WRAPPER_TRADER_SLOT = bytes32(uint256(keccak256("eip1967.proxy.gmxV2WrapperTrader")) - 1);
    // solhint-enable max-line-length

    // ==================== Initializer ====================

    function initialize(
        address _gmxExchangeRouter,
        address _gmxRouter,
        address _gmxDepositHandler,
        address _gmxDepositVault,
        address _gmxWithdrawalHandler,
        address _ethUsdMarketToken,
        address _dolomiteRegistry
    ) external initializer {
        _ownerSetGmxExchangeRouter(_gmxExchangeRouter);
        _ownerSetGmxRouter(_gmxRouter);
        _ownerSetEthUsdMarketToken(_ethUsdMarketToken);
        _ownerSetGmxDepositHandler(_gmxDepositHandler);
        _ownerSetGmxDepositVault(_gmxDepositVault);
        _ownerSetGmxWithdrawalHandler(_gmxWithdrawalHandler);

        _ownerSetDolomiteRegistry(_dolomiteRegistry);
    }

    // ==================== Functions ====================

    function ownerSetGmxExchangeRouter(
        address _gmxExchangeRouter
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxExchangeRouter(_gmxExchangeRouter);
    }

    function ownerSetGmxRouter(
        address _gmxRouter
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxRouter(_gmxRouter);
    }

    function ownerSetGmxDepositHandler(
        address _gmxDepositHandler
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxDepositHandler(_gmxDepositHandler);
    }

    function ownerSetGmxDepositVault(
        address _gmxDepositVault
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxDepositVault(_gmxDepositVault);
    }

    function ownerSetGmxWithdrawalHandler(
        address _gmxWithdrawalHandler
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetGmxWithdrawalHandler(_gmxWithdrawalHandler);
    }

    function ownerSetEthUsdMarketToken(
        address _ethUsdMarketToken
    )
    external
    onlyDolomiteMarginOwner(msg.sender) {
        _ownerSetEthUsdMarketToken(_ethUsdMarketToken);
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

    // ==================== Views ====================

    function gmxExchangeRouter() external view returns (IGmxExchangeRouter) {
        return IGmxExchangeRouter(_getAddress(_GMX_EXCHANGE_ROUTER_SLOT));
    }

    function gmxRouter() external view returns (IGmxRouter) {
        return IGmxRouter(_getAddress(_GMX_ROUTER_SLOT));
    }

    function gmxDepositHandler() external view returns (IDepositHandler) {
        return IDepositHandler(_getAddress(_GMX_DEPOSIT_HANDLER_SLOT));
    }

    function gmxDepositVault() external view returns (address) {
        return _getAddress(_GMX_DEPOSIT_VAULT_SLOT);
    }

    function gmxWithdrawalHandler() external view returns (IWithdrawalHandler) {
        return IWithdrawalHandler(_getAddress(_GMX_WITHDRAWAL_HANDLER_SLOT));
    }

    function ethUsdMarketToken() external view returns (IERC20) {
        return IERC20(_getAddress(_ETH_USD_MARKET_TOKEN_SLOT));
    }

    function gmxV2UnwrapperTrader() external view returns (address) {
        return _getAddress(_GMX_V2_UNWRAPPER_TRADER_SLOT);
    }

    function gmxV2WrapperTrader() external view returns (IGmxV2IsolationModeWrapperTrader) {
        return IGmxV2IsolationModeWrapperTrader(_getAddress(_GMX_V2_WRAPPER_TRADER_SLOT));
    }

    // ============================================================
    // ==================== Internal Functions ====================
    // ============================================================

    function _ownerSetGmxExchangeRouter(address _gmxExchangeRouter) internal {
        if (_gmxExchangeRouter != address(0)) { /* FOR COVERAGE TESTING */ }
        Require.that(_gmxExchangeRouter != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_EXCHANGE_ROUTER_SLOT, _gmxExchangeRouter);
        emit GmxExchangeRouterSet(_gmxExchangeRouter);
    }

    function _ownerSetGmxRouter(address _gmxRouter) internal {
        if (_gmxRouter != address(0)) { /* FOR COVERAGE TESTING */ }
        Require.that(_gmxRouter != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_ROUTER_SLOT, _gmxRouter);
        emit GmxRouterSet(_gmxRouter);
    }

    function _ownerSetGmxDepositHandler(address _gmxDepositHandler) internal {
        if (_gmxDepositHandler != address(0)) { /* FOR COVERAGE TESTING */ }
        Require.that(_gmxDepositHandler != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_DEPOSIT_HANDLER_SLOT, _gmxDepositHandler);
        emit GmxDepositHandlerSet(_gmxDepositHandler);
    }

    function _ownerSetGmxDepositVault(address _gmxDepositVault) internal {
        if (_gmxDepositVault != address(0)) { /* FOR COVERAGE TESTING */ }
        Require.that(_gmxDepositVault != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_DEPOSIT_VAULT_SLOT, _gmxDepositVault);
        emit GmxDepositVaultSet(_gmxDepositVault);
    }

    function _ownerSetGmxWithdrawalHandler(address _gmxWithdrawalHandler) internal {
        if (_gmxWithdrawalHandler != address(0)) { /* FOR COVERAGE TESTING */ }
        Require.that(_gmxWithdrawalHandler != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_WITHDRAWAL_HANDLER_SLOT, _gmxWithdrawalHandler);
        emit GmxWithdrawalHandlerSet(_gmxWithdrawalHandler);
    }

    function _ownerSetEthUsdMarketToken(address _ethUsdMarketToken) internal {
        if (_ethUsdMarketToken != address(0)) { /* FOR COVERAGE TESTING */ }
        Require.that(_ethUsdMarketToken != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_ETH_USD_MARKET_TOKEN_SLOT, _ethUsdMarketToken);
        emit EthUsdMarketTokenSet(_ethUsdMarketToken);
    }

    function _ownerSetGmxV2UnwrapperTrader(address _gmxV2UnwrapperTrader) internal {
        if (_gmxV2UnwrapperTrader != address(0)) { /* FOR COVERAGE TESTING */ }
        Require.that(_gmxV2UnwrapperTrader != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_V2_UNWRAPPER_TRADER_SLOT, _gmxV2UnwrapperTrader);
        emit GmxV2UnwrapperTraderSet(_gmxV2UnwrapperTrader);
    }

    function _ownerSetGmxV2WrapperTrader(address _gmxV2WrapperTrader) internal {
        if (_gmxV2WrapperTrader != address(0)) { /* FOR COVERAGE TESTING */ }
        Require.that(_gmxV2WrapperTrader != address(0),
            _FILE,
            "Invalid address"
        );
        _setAddress(_GMX_V2_WRAPPER_TRADER_SLOT, _gmxV2WrapperTrader);
        emit GmxV2WrapperTraderSet(_gmxV2WrapperTrader);
    }
}