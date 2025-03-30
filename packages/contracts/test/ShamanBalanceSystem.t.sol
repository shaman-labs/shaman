// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans } from "../src/codegen/index.sol";
import { JobState, LogType } from "../src/codegen/common.sol";

contract ShamanBalanceSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmShamanTest1";
  uint256 constant DEPOSIT_AMOUNT = 500;
  uint256 constant WITHDRAW_AMOUNT = 300;

  function testDepositShamanBalance() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    _prepareTokens(creatorAlice, DEPOSIT_AMOUNT);

    // Deposit tokens
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.depositShamanBalance(shamanId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Verify the balance was updated
    uint256 newBalance = world.getShamanBalance(shamanId);
    assertEq(newBalance, DEPOSIT_AMOUNT);
  }

  function testDepositShamanBalanceNotCreator() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    _prepareTokens(creatorAlice, DEPOSIT_AMOUNT);

    // Try to deposit as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.depositShamanBalance(shamanId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), 0);
  }

  function testDepositShamanBalanceZeroAmount() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    _prepareTokens(creatorAlice, DEPOSIT_AMOUNT);

    // Try to deposit zero amount
    vm.prank(creatorAlice);
    vm.expectRevert("Amount must be greater than 0");
    world.depositShamanBalance(shamanId, 0);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), 0);
  }

  function testDepositShamanBalanceInactiveShaman() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    _prepareTokens(creatorAlice, DEPOSIT_AMOUNT);

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
    assertEq(world.getShamanBalance(shamanId), 0);
  }

  function testWithdrawShamanBalance() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    _prepareTokens(creatorAlice, DEPOSIT_AMOUNT);

    // deposit tokens
    vm.prank(creatorAlice);
    world.depositShamanBalance(shamanId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Withdraw tokens
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.withdrawShamanBalance(shamanId, WITHDRAW_AMOUNT);
    vm.stopPrank();

    // Verify the balance was updated
    assertEq(
      world.getShamanBalance(shamanId),
      DEPOSIT_AMOUNT - WITHDRAW_AMOUNT
    );
  }

  function testWithdrawShamanBalanceNotCreator() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    _prepareTokens(creatorAlice, DEPOSIT_AMOUNT);

    // Try to withdraw as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.withdrawShamanBalance(shamanId, WITHDRAW_AMOUNT);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), 0);
  }

  function testWithdrawShamanBalanceZeroAmount() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    _prepareTokens(creatorAlice, DEPOSIT_AMOUNT);

    // Try to withdraw zero amount
    vm.prank(creatorAlice);
    vm.expectRevert("Amount must be greater than 0");
    world.withdrawShamanBalance(shamanId, 0);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), 0);
  }

  function testWithdrawShamanBalanceInsufficientBalance() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    _prepareTokens(creatorAlice, DEPOSIT_AMOUNT);

    // deposit tokens
    vm.prank(creatorAlice);
    world.depositShamanBalance(shamanId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Try to withdraw more than the balance
    vm.prank(creatorAlice);
    vm.expectRevert("Insufficient balance");
    world.withdrawShamanBalance(shamanId, DEPOSIT_AMOUNT + 1);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getShamanBalance(shamanId), DEPOSIT_AMOUNT);
  }

  function testWithdrawEntireShamanBalance() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    _prepareTokens(creatorAlice, DEPOSIT_AMOUNT);

    // deposit tokens
    vm.prank(creatorAlice);
    world.depositShamanBalance(shamanId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Withdraw the entire balance
    vm.prank(creatorAlice);
    world.withdrawShamanBalance(shamanId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Verify the balance is now zero
    assertEq(world.getShamanBalance(shamanId), 0);
  }
}
