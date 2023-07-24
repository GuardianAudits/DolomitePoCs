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

import { IPendleGLPRegistry } from "../interfaces/pendle/IPendleGLPRegistry.sol";
import { IPendleYtGLP2024IsolationModeVaultFactory } from "../interfaces/pendle/IPendleYtGLP2024IsolationModeVaultFactory.sol"; // solhint-disable-line max-line-length
import { IPendleYtToken } from "../interfaces/pendle/IPendleYtToken.sol";
import { SimpleIsolationModeVaultFactory } from "../proxies/SimpleIsolationModeVaultFactory.sol";


/**
 * @title   PendleYtGLP2024IsolationModeVaultFactory
 * @author  Dolomite
 *
 * @notice  The wrapper around the ytGLP token that is used to create user vaults and manage the entry points that a
 *          user can use to interact with DolomiteMargin from the vault.
 */
contract PendleYtGLP2024IsolationModeVaultFactory is
    IPendleYtGLP2024IsolationModeVaultFactory,
    SimpleIsolationModeVaultFactory
{
    // ============ Constants ============

    bytes32 private constant _FILE = "PendleYtGLP2024VaultFactory"; // needed to be shortened to fit into 32 bytes

    // ============ Field Variables ============

    address public immutable override WETH; // solhint-disable-line var-name-mixedcase
    uint256 public immutable override WETH_MARKET_ID; // solhint-disable-line var-name-mixedcase
    IPendleGLPRegistry public override pendleGLPRegistry;
    uint256 public override ytMaturityDate;

    // ============ Constructor ============

    constructor(
        address _weth,
        uint256 _wethMarketId,
        address _pendleGLPRegistry,
        uint256[] memory _initialAllowableDebtMarketIds,
        uint256[] memory _initialAllowableCollateralMarketIds,
        address _ytGlp, // this serves as the underlying token
        address _borrowPositionProxyV2,
        address _userVaultImplementation,
        address _dolomiteMargin
    )
    SimpleIsolationModeVaultFactory(
        _initialAllowableDebtMarketIds,
        _initialAllowableCollateralMarketIds,
        _ytGlp,
        _borrowPositionProxyV2,
        _userVaultImplementation,
        _dolomiteMargin
    ) {
        WETH = _weth;
        WETH_MARKET_ID = _wethMarketId;
        pendleGLPRegistry = IPendleGLPRegistry(_pendleGLPRegistry);
        ytMaturityDate = IPendleYtToken(UNDERLYING_TOKEN).expiry();
    }

    // ================================================
    // ============ External Functions ============
    // ================================================

    function ownerSetPendleGLPRegistry(
        address _pendleGLPRegistry
    ) 
    external 
    override 
    onlyDolomiteMarginOwner(msg.sender) {
        pendleGLPRegistry = IPendleGLPRegistry(_pendleGLPRegistry);
        emit PendleGLPRegistrySet(_pendleGLPRegistry);
    }

    function ownerSetYtMaturityDate(
        uint256 _ytMaturityDate
    ) 
    external 
    override 
    onlyDolomiteMarginOwner(msg.sender) {
        ytMaturityDate = _ytMaturityDate;
        emit YtMaturityDateSet(_ytMaturityDate);
    }

    function ownerSetAllowableDebtMarketIds(
        uint256[] memory _newAllowableDebtMarketIds
    ) 
    external 
    override 
    onlyDolomiteMarginOwner(msg.sender) {
        Require.that(
            _newAllowableDebtMarketIds.length > 0,
            _FILE,
            "invalid allowableDebtMarketIds"
        );
        _ownerSetAllowableDebtMarketIds(_newAllowableDebtMarketIds);
    }
}
