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

import {IGenericTraderProxyV1} from "./IGenericTraderProxyV1.sol";
import {IExpiry} from "./IExpiry.sol";

/**
 * @title   IDolomiteRegistry
 * @author  Dolomite
 *
 * @notice  A registry contract for storing all of the addresses that can interact with Umami's Delta Neutral vaults
 */
interface IDolomiteRegistry {
    // ========================================================
    // ======================== Events ========================
    // ========================================================

    event GenericTraderProxySet(address indexed _genericTraderProxy);
    event ExpirySet(address indexed _expiry);

    // ========================================================
    // =================== Admin Functions ====================
    // ========================================================

    function ownerSetGenericTraderProxy(address _genericTraderProxy) external;

    function ownerSetExpiry(address _expiry) external;

    // ========================================================
    // =================== Getter Functions ===================
    // ========================================================

    function genericTraderProxy() external view returns (IGenericTraderProxyV1);

    function expiry() external view returns (IExpiry);
}
