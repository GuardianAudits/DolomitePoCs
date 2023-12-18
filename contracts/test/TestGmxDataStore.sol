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

import { IGmxDataStore } from "../external/interfaces/gmx/IGmxDataStore.sol";
import { IGmxRoleStore } from "../external/interfaces/gmx/IGmxRoleStore.sol";


/**
 * @title   TestGmxDataStore
 * @author  Dolomite
 *
 * @notice  Test implementation for exposing areas for coverage testing
 */
contract TestGmxDataStore is IGmxDataStore {

    bytes32 private constant _FILE = "TestGmxDataStore";

    mapping(bytes32 => bool) public boolValues;
    mapping(bytes32 => uint256) public uintValues;

    function setUint(bytes32 _key, uint256 _value) external returns (uint256) {
        uintValues[_key] = _value;
        return _value;
    }

    function setBool(bytes32 _key, bool _value) external {
        boolValues[_key] = _value;
    }

    function getBool(bytes32 _key) external view returns (bool) {
        return boolValues[_key];
    }

    function getUint(bytes32 _key) external view returns (uint256) {
        return uintValues[_key];
    }

    function roleStore() external pure returns (IGmxRoleStore) {
        return IGmxRoleStore(address(0));
    }
}