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


/**
 * @title   GmxDeposit
 * @author  Dolomite
 *
 */
library GmxDeposit {
    // @dev there is a limit on the number of fields a struct can have when being passed
    // or returned as a memory variable which can cause "Stack too deep" errors
    // use sub-structs to avoid this issue
    // @param  addresses address values
    // @param  numbers number values
    // @param  flags boolean values
    struct Props {
        Addresses addresses;
        Numbers numbers;
        Flags flags;
    }

    // @param  account the account depositing liquidity
    // @param  receiver the address to send the liquidity tokens to
    // @param  callbackContract the callback contract
    // @param  uiFeeReceiver the ui fee receiver
    // @param  market the market to deposit to
    struct Addresses {
        address account;
        address receiver;
        address callbackContract;
        address uiFeeReceiver;
        address market;
        address initialLongToken;
        address initialShortToken;
        address[] longTokenSwapPath;
        address[] shortTokenSwapPath;
    }

    // @param  initialLongTokenAmount the amount of long tokens to deposit
    // @param  initialShortTokenAmount the amount of short tokens to deposit
    // @param  minMarketTokens the minimum acceptable number of liquidity tokens
    // @param  updatedAtBlock the block that the deposit was last updated at
    //        sending funds back to the user in case the deposit gets cancelled
    // @param  executionFee the execution fee for keepers
    // @param  callbackGasLimit the gas limit for the callbackContract
    struct Numbers {
        uint256 initialLongTokenAmount;
        uint256 initialShortTokenAmount;
        uint256 minMarketTokens;
        uint256 updatedAtBlock;
        uint256 executionFee;
        uint256 callbackGasLimit;
    }

    // @param  shouldUnwrapNativeToken whether to unwrap the native token when
    struct Flags {
        bool shouldUnwrapNativeToken;
    }

    function account(Props memory props) internal pure returns (address) {
        return props.addresses.account;
    }

    function setAccount(Props memory props, address value) internal pure {
        props.addresses.account = value;
    }

    function receiver(Props memory props) internal pure returns (address) {
        return props.addresses.receiver;
    }

    function setReceiver(Props memory props, address value) internal pure {
        props.addresses.receiver = value;
    }

    function callbackContract(Props memory props) internal pure returns (address) {
        return props.addresses.callbackContract;
    }

    function setCallbackContract(Props memory props, address value) internal pure {
        props.addresses.callbackContract = value;
    }

    function uiFeeReceiver(Props memory props) internal pure returns (address) {
        return props.addresses.uiFeeReceiver;
    }

    function setUiFeeReceiver(Props memory props, address value) internal pure {
        props.addresses.uiFeeReceiver = value;
    }

    function market(Props memory props) internal pure returns (address) {
        return props.addresses.market;
    }

    function setMarket(Props memory props, address value) internal pure {
        props.addresses.market = value;
    }

    function initialLongToken(Props memory props) internal pure returns (address) {
        return props.addresses.initialLongToken;
    }

    function setInitialLongToken(Props memory props, address value) internal pure {
        props.addresses.initialLongToken = value;
    }

    function initialShortToken(Props memory props) internal pure returns (address) {
        return props.addresses.initialShortToken;
    }

    function setInitialShortToken(Props memory props, address value) internal pure {
        props.addresses.initialShortToken = value;
    }

    function longTokenSwapPath(Props memory props) internal pure returns (address[] memory) {
        return props.addresses.longTokenSwapPath;
    }

    function setLongTokenSwapPath(Props memory props, address[] memory value) internal pure {
        props.addresses.longTokenSwapPath = value;
    }

    function shortTokenSwapPath(Props memory props) internal pure returns (address[] memory) {
        return props.addresses.shortTokenSwapPath;
    }

    function setShortTokenSwapPath(Props memory props, address[] memory value) internal pure {
        props.addresses.shortTokenSwapPath = value;
    }

    function initialLongTokenAmount(Props memory props) internal pure returns (uint256) {
        return props.numbers.initialLongTokenAmount;
    }

    function setInitialLongTokenAmount(Props memory props, uint256 value) internal pure {
        props.numbers.initialLongTokenAmount = value;
    }

    function initialShortTokenAmount(Props memory props) internal pure returns (uint256) {
        return props.numbers.initialShortTokenAmount;
    }

    function setInitialShortTokenAmount(Props memory props, uint256 value) internal pure {
        props.numbers.initialShortTokenAmount = value;
    }

    function minMarketTokens(Props memory props) internal pure returns (uint256) {
        return props.numbers.minMarketTokens;
    }

    function setMinMarketTokens(Props memory props, uint256 value) internal pure {
        props.numbers.minMarketTokens = value;
    }

    function updatedAtBlock(Props memory props) internal pure returns (uint256) {
        return props.numbers.updatedAtBlock;
    }

    function setUpdatedAtBlock(Props memory props, uint256 value) internal pure {
        props.numbers.updatedAtBlock = value;
    }

    function executionFee(Props memory props) internal pure returns (uint256) {
        return props.numbers.executionFee;
    }

    function setExecutionFee(Props memory props, uint256 value) internal pure {
        props.numbers.executionFee = value;
    }

    function callbackGasLimit(Props memory props) internal pure returns (uint256) {
        return props.numbers.callbackGasLimit;
    }

    function setCallbackGasLimit(Props memory props, uint256 value) internal pure {
        props.numbers.callbackGasLimit = value;
    }

    function shouldUnwrapNativeToken(Props memory props) internal pure returns (bool) {
        return props.flags.shouldUnwrapNativeToken;
    }

    function setShouldUnwrapNativeToken(Props memory props, bool value) internal pure {
        props.flags.shouldUnwrapNativeToken = value;
    }
}
