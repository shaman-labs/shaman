// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans } from "../src/codegen/index.sol";
import { JobState, LogType } from "../src/codegen/common.sol";

contract ShamanBalanceSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmShamanTest1";
  uint256 constant INITIAL_BALANCE = 1000;
  uint256 constant DEPOSIT_AMOUNT = 500;
  uint256 constant WITHDRAW_AMOUNT = 300;

  function _prepareTokens(address user, uint256 amount) private {
    _mintTokens(user, amount);
    _increaseAllowance(user, amount);
  }

  function _createTestShaman() private returns (bytes32 shamanId) {
    _prepareTokens(creatorAlice, 10000);

    bytes32[] memory abilityIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);

    vm.recordLogs();
    vm.prank(creatorAlice);
    world.createShaman(
      INITIAL_BALANCE,
      "TestShaman",
      abilityIds,
      sourceIds,
      INITIAL_METADATA
    );
    vm.stopPrank();

    // Get the shaman ID from the logs
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == keccak256("ShamanCreated(bytes32,address)")) {
        shamanId = bytes32(entries[i].topics[1]);
        break;
      }
    }

    require(shamanId != bytes32(0), "Shaman creation failed");
  }

  function testDepositShamanBalance() public {
    bytes32 shamanId = _createTestShaman();

    // Record initial balance
    uint256 initialBalance = world.getShamanBalance(shamanId);

    // Deposit additional tokens
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.depositShamanBalance(shamanId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Verify the balance was updated
    uint256 newBalance = world.getShamanBalance(shamanId);
    assertEq(newBalance, initialBalance + DEPOSIT_AMOUNT);
  }

  function testDepositShamanBalanceNotCreator() public {
    bytes32 shamanId = _createTestShaman();

    // Try to deposit as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.depositShamanBalance(shamanId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), INITIAL_BALANCE);
  }

  function testDepositShamanBalanceZeroAmount() public {
    bytes32 shamanId = _createTestShaman();

    // Try to deposit zero amount
    vm.prank(creatorAlice);
    vm.expectRevert("Amount must be greater than 0");
    world.depositShamanBalance(shamanId, 0);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), INITIAL_BALANCE);
  }

  function testDepositShamanBalanceInactiveShaman() public {
    bytes32 shamanId = _createTestShaman();

    // First make the shaman inactive
    vm.prank(creatorAlice);
    world.updateShamanStatus(shamanId, false);
    vm.stopPrank();

    // Try to deposit to inactive shaman
    vm.prank(creatorAlice);
    vm.expectRevert("Shaman is not active");
    world.depositShamanBalance(shamanId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), INITIAL_BALANCE);
  }

  function testWithdrawShamanBalance() public {
    bytes32 shamanId = _createTestShaman();

    // Record initial balance
    uint256 initialBalance = world.getShamanBalance(shamanId);

    // Withdraw tokens
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.withdrawShamanBalance(shamanId, WITHDRAW_AMOUNT);
    vm.stopPrank();

    // Verify the balance was updated
    uint256 newBalance = world.getShamanBalance(shamanId);
    assertEq(newBalance, initialBalance - WITHDRAW_AMOUNT);
  }

  function testWithdrawShamanBalanceNotCreator() public {
    bytes32 shamanId = _createTestShaman();

    // Try to withdraw as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.withdrawShamanBalance(shamanId, WITHDRAW_AMOUNT);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), INITIAL_BALANCE);
  }

  function testWithdrawShamanBalanceZeroAmount() public {
    bytes32 shamanId = _createTestShaman();

    // Try to withdraw zero amount
    vm.prank(creatorAlice);
    vm.expectRevert("Amount must be greater than 0");
    world.withdrawShamanBalance(shamanId, 0);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), INITIAL_BALANCE);
  }

  function testWithdrawShamanBalanceInsufficientBalance() public {
    bytes32 shamanId = _createTestShaman();

    // Try to withdraw more than the balance
    vm.prank(creatorAlice);
    vm.expectRevert("Insufficient balance");
    world.withdrawShamanBalance(shamanId, INITIAL_BALANCE + 1);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), INITIAL_BALANCE);
  }

  function testWithdrawShamanBalanceInactiveShaman() public {
    bytes32 shamanId = _createTestShaman();

    // First make the shaman inactive
    vm.prank(creatorAlice);
    world.updateShamanStatus(shamanId, false);
    vm.stopPrank();

    // Try to withdraw from inactive shaman
    vm.prank(creatorAlice);
    vm.expectRevert("Shaman is not active");
    world.withdrawShamanBalance(shamanId, WITHDRAW_AMOUNT);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), INITIAL_BALANCE);
  }

  function testWithdrawEntireShamanBalance() public {
    bytes32 shamanId = _createTestShaman();

    // Withdraw the entire balance
    vm.prank(creatorAlice);
    world.withdrawShamanBalance(shamanId, INITIAL_BALANCE);
    vm.stopPrank();

    // Verify the balance is now zero
    assertEq(world.getShamanBalance(shamanId), 0);
  }
}
