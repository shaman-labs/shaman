// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";

contract ConfigSystemTest is BaseTest {
  function testGetTokenAddress() public {
    // Get the token address from the ConfigSystem
    address tokenAddress = world.getTokenAddress();
    
    // Verify it matches the expected token address
    assertEq(tokenAddress, address(token));
  }
} 