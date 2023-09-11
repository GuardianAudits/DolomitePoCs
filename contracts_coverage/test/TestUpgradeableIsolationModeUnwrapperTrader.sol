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

import { ICustomTestToken } from "./ICustomTestToken.sol";
import { UpgradeableIsolationModeUnwrapperTrader } from "../external/proxies/abstract/UpgradeableIsolationModeUnwrapperTrader.sol"; // solhint-disable-line max-line-length


/**
 * @title   TestIsolationModeUnwrapperTraderV2
 * @author  Dolomite
 *
 * @notice  A test contract for the IsolationModeUnwrapperTrader contract.
 */
contract TestUpgradeableIsolationModeUnwrapperTrader is UpgradeableIsolationModeUnwrapperTrader {

    // ================ Constants ================

    bytes32 private constant _OUTPUT_TOKEN_SLOT = bytes32(uint256(keccak256("eip1967.proxy.outputToken")) - 1);

    // ================ Initializer ================

    function initialize(
        address _outputToken,
        address _vaultFactory,
        address _dolomiteMargin
    )
    external
    initializer
    {
        _setAddress(_OUTPUT_TOKEN_SLOT, _outputToken);
        super._initializeUnwrapperTrader(_vaultFactory, _dolomiteMargin);
    }

    // ============ Public Functions ============

    function initializeUnwrapperTrader(address _vaultFactory, address _dolomiteMargin) external {
        super._initializeUnwrapperTrader(_vaultFactory, _dolomiteMargin);
    }

    function isValidOutputToken(
        address _outputToken
    )
    public
    override
    view
    returns (bool) {
        return _getAddress(_OUTPUT_TOKEN_SLOT) == _outputToken;
    }

    // ================ Internal Functions ================

    function _exchangeUnderlyingTokenToOutputToken(
        address,
        address,
        address _outputToken,
        uint256,
        address _inputToken,
        uint256 _inputAmount,
        bytes memory _orderData
    )
    internal
    override
    returns (uint256) {
        uint256 outputAmount;
        if (_orderData.length > 0) {
            outputAmount = abi.decode(_orderData, (uint256));
        } else {
            // 1:1 conversion for the sake of testing
            uint256 outputPrice = DOLOMITE_MARGIN().getMarketPrice(
                DOLOMITE_MARGIN().getMarketIdByTokenAddress(address(VAULT_FACTORY()))
            ).value;
            uint256 inputPrice = DOLOMITE_MARGIN().getMarketPrice(
                DOLOMITE_MARGIN().getMarketIdByTokenAddress(_inputToken)
            ).value;
            outputAmount = _inputAmount * inputPrice / outputPrice;
        }
        ICustomTestToken(_outputToken).addBalance(address(this), outputAmount);
        return outputAmount;
    }

    function _getExchangeCost(
        address,
        address,
        uint256 _desiredInputAmount,
        bytes memory
    )
    internal
    override
    pure
    returns (uint256) {
        // 1:1 conversion for the sake of testing
        return _desiredInputAmount;
    }
}
