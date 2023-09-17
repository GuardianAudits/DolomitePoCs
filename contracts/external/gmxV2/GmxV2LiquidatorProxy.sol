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

import { IDolomiteStructs } from "../../protocol/interfaces/IDolomiteStructs.sol";
import { Require } from "../../protocol/lib/Require.sol";
import { BaseLiquidatorProxy } from "../general/BaseLiquidatorProxy.sol";
import { IGmxRegistryV2 } from "../interfaces/gmx/IGmxRegistryV2.sol";
import { IGmxV2IsolationModeTokenVaultV1 } from "../interfaces/gmx/IGmxV2IsolationModeTokenVaultV1.sol";
import { IGmxV2IsolationModeVaultFactory } from "../interfaces/gmx/IGmxV2IsolationModeVaultFactory.sol";


/**
 * @title   GmxV2LiquidatorProxy
 * @author  Dolomite
 *
 * @notice  Liquidator for handling the GMX V2 (GM) tokens.
 */
contract GmxV2LiquidatorProxy is BaseLiquidatorProxy {

    // ============================ Constants ============================

    bytes32 private constant _FILE = "GmxV2LiquidatorProxy";

    // ============================ Public State Variables ============================

    IGmxRegistryV2 public immutable GMX_REGISTRY_V2; // solhint-disable-line var-name-mixedcase

    // ============================ Constructor ============================

    constructor(
        address _gmxRegistryV2,
        address _dolomiteMargin,
        address _expiry,
        address _liquidatorAssetRegistry
    )
    BaseLiquidatorProxy(
        _dolomiteMargin,
        _expiry,
        _liquidatorAssetRegistry
    ) {
        GMX_REGISTRY_V2 = IGmxRegistryV2(_gmxRegistryV2);
    }

    function prepareForLiquidation(
        IDolomiteStructs.AccountInfo calldata _liquidAccount,
        uint256 _gmMarketId,
        uint256 _dGmTokenAmount,
        uint256 _outputMarketId,
        uint256 _minOutputAmount,
        uint256 _expirationTimestamp
    ) external requireIsAssetWhitelistedForLiquidation(_gmMarketId) {
        address gmToken = DOLOMITE_MARGIN.getMarketTokenAddress(_gmMarketId);
        Require.that(
            IGmxV2IsolationModeVaultFactory(gmToken).getAccountByVault(_liquidAccount.owner) != address(0),
            _FILE,
            "Invalid liquid account",
            _liquidAccount.owner
        );
        MarketInfo[] memory marketInfos = _getMarketInfos(
            /* _solidMarketIds = */ new uint256[](0),
            DOLOMITE_MARGIN.getAccountMarketsWithBalances(_liquidAccount)
        );
        _checkIsLiquidatable(
            _liquidAccount,
            marketInfos,
            _outputMarketId,
            _expirationTimestamp
        );

        address outputToken = DOLOMITE_MARGIN.getMarketTokenAddress(_outputMarketId);
        IGmxV2IsolationModeTokenVaultV1(_liquidAccount.owner).initiateUnwrappingForLiquidation(
            _liquidAccount.number,
            _dGmTokenAmount,
            outputToken,
            _minOutputAmount
        );
    }

    // ======================================================================
    // ========================= Internal Functions =========================
    // ======================================================================

    function _checkIsLiquidatable(
        IDolomiteStructs.AccountInfo calldata _liquidAccount,
        MarketInfo[] memory _marketInfos,
        uint256 _outputMarketId,
        uint256 _expirationTimestamp
    ) internal view {
        if (_expirationTimestamp != 0) {
            Require.that(
                _expirationTimestamp == uint32(_expirationTimestamp),
                _FILE,
                "Invalid expiration timestamp"
            );
            Require.that(
                _expirationTimestamp <= block.timestamp,
                _FILE,
                "Account not expired",
                _expirationTimestamp,
                block.timestamp
            );
            Require.that(
                EXPIRY.getExpiry(_liquidAccount, _outputMarketId) == uint32(_expirationTimestamp),
                _FILE,
                "Expiration mismatch"
            );
        } else {
            // Check the account is under water
            (
                IDolomiteStructs.MonetaryValue memory liquidSupplyValue,
                IDolomiteStructs.MonetaryValue memory liquidBorrowValue
            ) = _getAdjustedAccountValues(
                _marketInfos,
                _liquidAccount,
                DOLOMITE_MARGIN.getAccountMarketsWithBalances(_liquidAccount)
            );

            Require.that(
                liquidSupplyValue.value != 0,
                _FILE,
                "Liquid account no supply"
            );

            Require.that(
                DOLOMITE_MARGIN.getAccountStatus(_liquidAccount) == IDolomiteStructs.AccountStatus.Liquid ||
                !_isCollateralized(liquidSupplyValue.value, liquidBorrowValue.value, DOLOMITE_MARGIN.getMarginRatio()),
                _FILE,
                "Liquid account not liquidatable",
                liquidSupplyValue.value,
                liquidBorrowValue.value
            );
        }
    }
}
