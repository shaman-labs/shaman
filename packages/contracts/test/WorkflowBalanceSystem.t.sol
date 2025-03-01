// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Workflows, WorkflowLogs } from "../src/codegen/index.sol";
import { WorkflowState, LogType } from "../src/codegen/common.sol";

contract WorkflowBalanceSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmWorkflowTest1";
  uint256 constant INITIAL_BALANCE = 1000;
  uint256 constant DEPOSIT_AMOUNT = 500;
  uint256 constant WITHDRAW_AMOUNT = 300;

  function _prepareTokens(address user, uint256 amount) private {
    _mintTokens(user, amount);
    _increaseAllowance(user, amount);
  }

  function _createTestWorkflow() private returns (bytes32 workflowId) {
    _prepareTokens(creatorAlice, 10000);

    bytes32[] memory shamanIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);

    vm.recordLogs();
    vm.prank(creatorAlice);
    world.createWorkflow(
      INITIAL_BALANCE,
      shamanIds,
      sourceIds,
      INITIAL_METADATA
    );
    vm.stopPrank();

    // Get the workflow ID from the logs
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (
        entries[i].topics[0] == keccak256("WorkflowCreated(bytes32,address)")
      ) {
        workflowId = bytes32(entries[i].topics[1]);
        break;
      }
    }

    require(workflowId != bytes32(0), "Workflow creation failed");
  }

  function testDepositWorkflowBalance() public {
    bytes32 workflowId = _createTestWorkflow();

    // Record initial balance
    uint256 initialBalance = world.getWorkflowBalance(workflowId);

    // Deposit additional tokens
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.depositWorkflowBalance(workflowId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Verify the balance was updated
    uint256 newBalance = world.getWorkflowBalance(workflowId);
    assertEq(newBalance, initialBalance + DEPOSIT_AMOUNT);
  }

  function testDepositWorkflowBalanceNotCreator() public {
    bytes32 workflowId = _createTestWorkflow();

    // Try to deposit as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not workflow creator");
    world.depositWorkflowBalance(workflowId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getWorkflowBalance(workflowId), INITIAL_BALANCE);
  }

  function testDepositWorkflowBalanceZeroAmount() public {
    bytes32 workflowId = _createTestWorkflow();

    // Try to deposit zero amount
    vm.prank(creatorAlice);
    vm.expectRevert("Amount must be greater than 0");
    world.depositWorkflowBalance(workflowId, 0);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getWorkflowBalance(workflowId), INITIAL_BALANCE);
  }

  function testDepositWorkflowBalanceInactiveWorkflow() public {
    bytes32 workflowId = _createTestWorkflow();

    // First make the workflow inactive
    vm.prank(creatorAlice);
    world.updateWorkflowStatus(workflowId, false);
    vm.stopPrank();

    // Try to deposit to inactive workflow
    vm.prank(creatorAlice);
    vm.expectRevert("Workflow is not active");
    world.depositWorkflowBalance(workflowId, DEPOSIT_AMOUNT);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getWorkflowBalance(workflowId), INITIAL_BALANCE);
  }

  function testWithdrawWorkflowBalance() public {
    bytes32 workflowId = _createTestWorkflow();

    // Record initial balance
    uint256 initialBalance = world.getWorkflowBalance(workflowId);

    // Withdraw tokens
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.withdrawWorkflowBalance(workflowId, WITHDRAW_AMOUNT);
    vm.stopPrank();

    // Verify the balance was updated
    uint256 newBalance = world.getWorkflowBalance(workflowId);
    assertEq(newBalance, initialBalance - WITHDRAW_AMOUNT);
  }

  function testWithdrawWorkflowBalanceNotCreator() public {
    bytes32 workflowId = _createTestWorkflow();

    // Try to withdraw as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not workflow creator");
    world.withdrawWorkflowBalance(workflowId, WITHDRAW_AMOUNT);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getWorkflowBalance(workflowId), INITIAL_BALANCE);
  }

  function testWithdrawWorkflowBalanceZeroAmount() public {
    bytes32 workflowId = _createTestWorkflow();

    // Try to withdraw zero amount
    vm.prank(creatorAlice);
    vm.expectRevert("Amount must be greater than 0");
    world.withdrawWorkflowBalance(workflowId, 0);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getWorkflowBalance(workflowId), INITIAL_BALANCE);
  }

  function testWithdrawWorkflowBalanceInsufficientBalance() public {
    bytes32 workflowId = _createTestWorkflow();

    // Try to withdraw more than the balance
    vm.prank(creatorAlice);
    vm.expectRevert("Insufficient balance");
    world.withdrawWorkflowBalance(workflowId, INITIAL_BALANCE + 1);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getWorkflowBalance(workflowId), INITIAL_BALANCE);
  }

  function testWithdrawWorkflowBalanceInactiveWorkflow() public {
    bytes32 workflowId = _createTestWorkflow();

    // First make the workflow inactive
    vm.prank(creatorAlice);
    world.updateWorkflowStatus(workflowId, false);
    vm.stopPrank();

    // Try to withdraw from inactive workflow
    vm.prank(creatorAlice);
    vm.expectRevert("Workflow is not active");
    world.withdrawWorkflowBalance(workflowId, WITHDRAW_AMOUNT);
    vm.stopPrank();

    // Verify the balance was not updated
    assertEq(world.getWorkflowBalance(workflowId), INITIAL_BALANCE);
  }

  function testWithdrawEntireWorkflowBalance() public {
    bytes32 workflowId = _createTestWorkflow();

    // Withdraw the entire balance
    vm.prank(creatorAlice);
    world.withdrawWorkflowBalance(workflowId, INITIAL_BALANCE);
    vm.stopPrank();

    // Verify the balance is now zero
    assertEq(world.getWorkflowBalance(workflowId), 0);
  }
}
