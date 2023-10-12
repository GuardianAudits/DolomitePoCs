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

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IsolationModeVaultFactory } from "./IsolationModeVaultFactory.sol";
import { IDolomiteStructs } from "../../../protocol/interfaces/IDolomiteStructs.sol";
import { TypesLib } from "../../../protocol/lib/TypesLib.sol";
import { IFreezableIsolationModeVaultFactory } from "../../interfaces/IFreezableIsolationModeVaultFactory.sol";


/**
 * @title   FreezableIsolationModeVaultFactory
 * @author  Dolomite
 *
 * @notice  Abstract contract for allowing freezable vaults (usually for handling async requests)
 */
abstract contract FreezableIsolationModeVaultFactory is
    IFreezableIsolationModeVaultFactory,
    IsolationModeVaultFactory
{
    using EnumerableSet for EnumerableSet.UintSet;
    using TypesLib for IDolomiteStructs.Wei;

    // ============ Field Variables ============

    /// Vault ==> Set of Account Numbers
    mapping(address => EnumerableSet.UintSet) private _vaultToAccountFrozenSet;
    mapping(address => mapping(uint256 => IDolomiteStructs.Wei)) private _accountInfoToPendingAmountWeiMap;

    // ============ Functions ============

    function setIsVaultAccountFrozen(
        address _vault,
        uint256 _accountNumber,
        IDolomiteStructs.Wei memory _amountWei
    )
        external
        requireIsTokenConverterOrVault(msg.sender)
        requireIsVault(_vault)
    {
        if (_amountWei.isZero()) {
            _vaultToAccountFrozenSet[_vault].remove(_accountNumber);
        } else {
            _vaultToAccountFrozenSet[_vault].add(_accountNumber);
        }
        _accountInfoToPendingAmountWeiMap[_vault][_accountNumber] = _amountWei;

        emit VaultAccountFrozen(_vault, _accountNumber, !_amountWei.isZero());
    }

    function isVaultFrozen(
        address _vault
    ) external view returns (bool) {
        return _vaultToAccountFrozenSet[_vault].length() > 0;
    }

    function isVaultAccountFrozen(
        address _vault,
        uint256 _accountNumber
    ) external view returns (bool) {
        return _vaultToAccountFrozenSet[_vault].contains(_accountNumber);
    }

    function getPendingAmountByAccount(
        address _vault,
        uint256 _accountNumber
    ) external view returns (IDolomiteStructs.Wei memory) {
        return _accountInfoToPendingAmountWeiMap[_vault][_accountNumber];
    }
}
