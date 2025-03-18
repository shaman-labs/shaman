// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";

contract ConfigSystemTest is BaseTest {
  uint256 constant CLAIM_AMOUNT = 1000;
  uint256 constant LARGE_AMOUNT = 1_000_000_000_000; // 1 trillion tokens

  function testGetTokenAddress() public view {
    // Get the token address from the ConfigSystem
    address tokenAddress = world.getTokenAddress();

    // Verify it matches the expected token address
    assertEq(tokenAddress, address(token));
  }

  function testClaimZug() public {
    // Set up a member
    _setMember(creatorAlice);

    // Record initial balance
    uint256 initialBalance = token.balanceOf(creatorAlice);

    // Claim tokens
    vm.prank(creatorAlice);
    world.claimZug(CLAIM_AMOUNT);
    vm.stopPrank();

    // Verify the balance was updated
    uint256 newBalance = token.balanceOf(creatorAlice);
    assertEq(newBalance, initialBalance + CLAIM_AMOUNT);
  }

  function testClaimZugNonMember() public {
    // Try to claim tokens as non-member
    vm.prank(creatorBob);
    vm.expectRevert("Not member");
    world.claimZug(CLAIM_AMOUNT);
    vm.stopPrank();

    // Verify no tokens were minted
    assertEq(token.balanceOf(creatorBob), 0);
  }

  function testClaimZugZeroAmount() public {
    // Set up a member
    _setMember(creatorAlice);

    // Try to claim zero tokens
    vm.prank(creatorAlice);
    vm.expectRevert("Amount must be greater than 0");
    world.claimZug(0);
    vm.stopPrank();

    // Verify no tokens were minted
    assertEq(token.balanceOf(creatorAlice), 0);
  }

  function testClaimZugAboveMaxSupply() public {
    // Set up a member
    _setMember(creatorAlice);

    // Try to claim more than max supply
    vm.prank(creatorAlice);
    vm.expectRevert("ZugToken: mint would exceed max supply");
    world.claimZug(LARGE_AMOUNT);
    vm.stopPrank();

    // Verify no tokens were minted
    assertEq(token.balanceOf(creatorAlice), 0);
  }
}
