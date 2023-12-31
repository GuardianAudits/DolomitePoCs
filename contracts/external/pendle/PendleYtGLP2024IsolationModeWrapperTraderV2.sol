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
import { Require } from "../../protocol/lib/Require.sol";
import { IGmxRegistryV1 } from "../interfaces/gmx/IGmxRegistryV1.sol";
import { IPendleGLPRegistry } from "../interfaces/pendle/IPendleGLPRegistry.sol";
import { IPendleRouter } from "../interfaces/pendle/IPendleRouter.sol";
import { IsolationModeWrapperTraderV2 } from "../proxies/abstract/IsolationModeWrapperTraderV2.sol";


/**
 * @title   PendleYtGLP2024IsolationModeWrapperTraderV2
 * @author  Dolomite
 *
 * @notice  Used for wrapping ytGLP (via swapping against the Pendle AMM then redeeming the underlying GLP to
 *          USDC).
 */
contract PendleYtGLP2024IsolationModeWrapperTraderV2 is IsolationModeWrapperTraderV2 {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    bytes32 private constant _FILE = "PendleYtGLP2024WrapperV2";

    // ============ Constructor ============

    IPendleGLPRegistry public immutable PENDLE_REGISTRY; // solhint-disable-line var-name-mixedcase
    IGmxRegistryV1 public immutable GMX_REGISTRY; // solhint-disable-line var-name-mixedcase

    // ============ Constructor ============

    constructor(
        address _pendleRegistry,
        address _gmxRegistry,
        address _dytGlp,
        address _dolomiteMargin
    )
    IsolationModeWrapperTraderV2(
        _dytGlp,
        _dolomiteMargin
    ) {
        PENDLE_REGISTRY = IPendleGLPRegistry(_pendleRegistry);
        GMX_REGISTRY = IGmxRegistryV1(_gmxRegistry);
    }

    // ============================================
    // ============= Public Functions =============
    // ============================================

    function isValidInputToken(address _inputToken) public view override returns (bool) {
        return GMX_REGISTRY.gmxVault().whitelistedTokens(_inputToken);
    }

    // ============================================
    // ============ Internal Functions ============
    // ============================================

    function _exchangeIntoUnderlyingToken(
        address,
        address,
        address,
        uint256 _minOutputAmount,
        address _inputToken,
        uint256 _inputAmount,
        bytes memory _extraOrderData
    )
        internal
        override
        returns (uint256)
    {
        (
            IPendleRouter.ApproxParams memory guessYtOut,
            IPendleRouter.TokenInput memory tokenInput
        ) = abi.decode(_extraOrderData, (IPendleRouter.ApproxParams, IPendleRouter.TokenInput));

        // approve input token and mint GLP
        IERC20(_inputToken).safeApprove(address(GMX_REGISTRY.glpManager()), _inputAmount);
        uint256 glpAmount = GMX_REGISTRY.glpRewardsRouter().mintAndStakeGlp(
            _inputToken,
            _inputAmount,
            /* _minUsdg = */ 0,
            /* _minGlp = */ 0
        );
        tokenInput.netTokenIn = glpAmount;

        uint256 ytGlpAmount;
        {
            // Create a new scope to avoid stack too deep errors
            // approve GLP and swap for ptGLP
            IPendleRouter pendleRouter = PENDLE_REGISTRY.pendleRouter();
            IERC20(GMX_REGISTRY.sGlp()).safeApprove(address(pendleRouter), glpAmount);
            (ytGlpAmount, ) = pendleRouter.swapExactTokenForYt(
                /* _receiver = */ address(this),
                address(PENDLE_REGISTRY.ptGlpMarket()),
                _minOutputAmount,
                guessYtOut,
                tokenInput
            );
        }

        return ytGlpAmount;
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
