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
import { IDolomiteMargin } from "../../protocol/interfaces/IDolomiteMargin.sol";
import { IDolomiteMarginExchangeWrapper } from "../../protocol/interfaces/IDolomiteMarginExchangeWrapper.sol";
import { Require } from "../../protocol/lib/Require.sol";
import { GLPMathLib } from "../glp/GLPMathLib.sol";
import { OnlyDolomiteMargin } from "../helpers/OnlyDolomiteMargin.sol";
import { IERC4626 } from "../interfaces/IERC4626.sol";
import { IGmxRegistryV1 } from "../interfaces/gmx/IGmxRegistryV1.sol";


/**
 * @title   MagicGLPUnwrapperTraderV2
 * @author  Dolomite
 *
 * @notice  Used for unwrapping magicGLP (via redeeming from the ERC 4626 vault then redeeming the underlying GLP to
 *          USDC).
 */
contract MagicGLPUnwrapperTraderV2 is IDolomiteMarginExchangeWrapper, OnlyDolomiteMargin {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    bytes32 private constant _FILE = "MagicGLPUnwrapperTraderV2";

    // ============ Constructor ============

    IERC4626 public immutable MAGIC_GLP; // solhint-disable-line var-name-mixedcase
    IGmxRegistryV1 public immutable GMX_REGISTRY; // solhint-disable-line var-name-mixedcase

    // ============ Constructor ============

    constructor(
        address _magicGlp,
        address _gmxRegistry,
        address _dolomiteMargin
    )
    OnlyDolomiteMargin(
        _dolomiteMargin
    ) {
        MAGIC_GLP = IERC4626(_magicGlp);
        GMX_REGISTRY = IGmxRegistryV1(_gmxRegistry);
    }

    // ============================================
    // ============= Public Functions =============
    // ============================================

    function exchange(
        address,
        address _receiver,
        address _outputToken,
        address _inputToken,
        uint256 _inputAmount,
        bytes calldata _orderData
    )
    external
    onlyDolomiteMargin(msg.sender)
    returns (uint256) {
        if (_inputToken == address(MAGIC_GLP)) { /* FOR COVERAGE TESTING */ }
        Require.that(
_inputToken == address(MAGIC_GLP),
            _FILE,
            "Invalid input token",
            _inputToken
        );
        if (GMX_REGISTRY.gmxVault().whitelistedTokens(_outputToken)) { /* FOR COVERAGE TESTING */ }
        Require.that(
GMX_REGISTRY.gmxVault().whitelistedTokens(_outputToken),
            _FILE,
            "Invalid output token",
            _outputToken
        );
        if (_inputAmount > 0) { /* FOR COVERAGE TESTING */ }
        Require.that(
_inputAmount > 0,
            _FILE,
            "Invalid input amount"
        );

        // redeems magicGLP for GLP; we don't need to approve since the `_owner` parameter is msg.sender
        uint256 glpAmount = MAGIC_GLP.redeem(
            _inputAmount,
            /* _receiver = */ address(this),
            /* _owner = */ address(this)
        );

        // redeem GLP for `_outputToken`; we don't need to approve because GLP has a handler that auto-approves for this
        (uint256 minOutputAmount) = abi.decode(_orderData, (uint256));
        uint256 amountOut = GMX_REGISTRY.glpRewardsRouter().unstakeAndRedeemGlp(
            /* _tokenOut = */ _outputToken,
            glpAmount,
            minOutputAmount,
            /* _receiver = */ address(this)
        );

        // approve the `_outputToken` to be spent by the receiver
        IERC20(_outputToken).safeApprove(_receiver, amountOut);
        return amountOut;
    }

    function getExchangeCost(
        address _inputToken,
        address _outputToken,
        uint256 _desiredInputAmount,
        bytes memory
    )
    public
    override
    view
    returns (uint256) {
        if (_inputToken == address(MAGIC_GLP)) { /* FOR COVERAGE TESTING */ }
        Require.that(
_inputToken == address(MAGIC_GLP),
            _FILE,
            "Invalid input token",
            _inputToken
        );
        if (GMX_REGISTRY.gmxVault().whitelistedTokens(_outputToken)) { /* FOR COVERAGE TESTING */ }
        Require.that(
GMX_REGISTRY.gmxVault().whitelistedTokens(_outputToken),
            _FILE,
            "Invalid output token",
            _outputToken
        );
        if (_desiredInputAmount > 0) { /* FOR COVERAGE TESTING */ }
        Require.that(
_desiredInputAmount > 0,
            _FILE,
            "Invalid desired input amount"
        );

        uint256 glpAmount = MAGIC_GLP.previewRedeem(_desiredInputAmount);
        uint256 usdgAmount = GLPMathLib.getUsdgAmountForSell(GMX_REGISTRY, glpAmount);
        return GLPMathLib.getGlpRedemptionAmount(GMX_REGISTRY.gmxVault(), _outputToken, usdgAmount);
    }
}
