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
import { IGmxExchangeRouter } from "./IGmxExchangeRouter.sol";
import { IGmxRouter } from "./IGmxRouter.sol";
import { IGmxV2IsolationModeWrapperTrader } from "./IGmxV2IsolationModeWrapperTrader.sol";
import { IDepositHandler } from "./IDepositHandler.sol";
import { IWithdrawalHandler } from "./IWithdrawalHandler.sol";
import { IBaseRegistry } from "../IBaseRegistry.sol";


/**
 * @title   IGmxRegistryV2
 * @author  Dolomite
 *
 * @notice  A registry contract for storing all of the different addresses that can interact with the GMX V2 ecosystem
 */
interface IGmxRegistryV2 is IBaseRegistry {

    // ================================================
    // ==================== Events ====================
    // ================================================

    event GmxExchangeRouterSet(address _gmxExchangeRouter);
    event GmxRouterSet(address _gmxRouter);
    event GmxDepositHandlerSet(address _gmxDepositHandler);
    event GmxDepositVaultSet(address _gmxDepositVault);
    event GmxWithdrawalHandlerSet(address _gmxWithdrawalHandler);
    event EthUsdMarketTokenSet(address _ethUsdMarketToken);
    event GmxV2UnwrapperTraderSet(address _gmxV2UnwrapperTrader);
    event GmxV2WrapperTraderSet(address _gmxV2WrapperTrader);

    // ===================================================
    // ==================== Functions ====================
    // ===================================================

    function ownerSetGmxExchangeRouter(address _gmxExchangeRouter) external;

    function ownerSetGmxRouter(address _gmxRouter) external;

    function ownerSetGmxDepositHandler(address _gmxDepositHandler) external;

    function ownerSetGmxDepositVault(address _gmxDepositVault) external;

    function ownerSetGmxWithdrawalHandler(address _gmxWithdrawalHandler) external;

    function ownerSetEthUsdMarketToken(address _ethUsdMarketToken) external;

    function ownerSetGmxV2UnwrapperTrader(address _gmxV2UnwrapperTrader) external;

    function ownerSetGmxV2WrapperTrader(address _gmxV2UnwrapperTrader) external;

    function gmxExchangeRouter() external view returns (IGmxExchangeRouter);

    function gmxRouter() external view returns (IGmxRouter);

    function gmxDepositHandler() external view returns (IDepositHandler);

    function gmxDepositVault() external view returns (address);

    function gmxWithdrawalHandler() external view returns (IWithdrawalHandler);

    function ethUsdMarketToken() external view returns (IERC20);

    function gmxV2UnwrapperTrader() external view returns (address);

    function gmxV2WrapperTrader() external view returns (IGmxV2IsolationModeWrapperTrader);
}