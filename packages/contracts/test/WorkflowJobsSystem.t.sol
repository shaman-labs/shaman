// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Workflows, WorkflowLogs, Roles } from "../src/codegen/index.sol";
import { WorkflowState, LogType, RoleType } from "../src/codegen/common.sol";

contract WorkflowJobsSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmWorkflowTest1";
  string constant COMPLETION_METADATA = "QmCompletionMetadata";
  uint256 constant INITIAL_BALANCE = 1000;
  uint256 constant JOB_COST = 500;

  function _setupOperator(address operator) private {
    vm.prank(signerAddress);
    Roles.setRole(operator, RoleType.Operator);
    vm.stopPrank();
  }

  function _prepareTokens(address user, uint256 amount) private {
    _mintTokens(user, amount);
    _increaseAllowance(user, amount);
  }

  function _createTestWorkflow() private returns (bytes32 workflowId) {
    _setupOperator(creatorAlice);
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

  function testEnqueueWorkflowJob() public {
    bytes32 workflowId = _createTestWorkflow();

    // Enqueue a job
    vm.recordLogs();
    vm.prank(creatorAlice); // creatorAlice is an operator
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    vm.stopPrank();

    // Verify the workflow state was updated
    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Queue));
  }

  function testEnqueueWorkflowJobNonOperator() public {
    bytes32 workflowId = _createTestWorkflow();

    // Try to enqueue a job as non-operator
    vm.prank(creatorBob); // creatorBob is not an operator
    vm.expectRevert("Not operator");
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    vm.stopPrank();

    // Verify the workflow state was not updated
    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Idle));
  }

  function testEnqueueWorkflowJobInactiveWorkflow() public {
    bytes32 workflowId = _createTestWorkflow();

    // First make the workflow inactive
    vm.prank(creatorAlice);
    world.updateWorkflowStatus(workflowId, false);
    vm.stopPrank();

    // Try to enqueue a job for inactive workflow
    vm.prank(creatorAlice);
    vm.expectRevert("Workflow is not active");
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    vm.stopPrank();

    // Verify the workflow state was not updated
    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Idle));
  }

  function testEnqueueWorkflowJobNonIdleWorkflow() public {
    bytes32 workflowId = _createTestWorkflow();

    // Enqueue a job
    vm.prank(creatorAlice);
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    vm.stopPrank();

    // Try to re-enqueue job
    vm.prank(creatorAlice);
    vm.expectRevert("Workflow is not idle");
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    vm.stopPrank();

    // Verify the workflow state was not updated to Queue
    assertEq(
      uint8(Workflows.getState(workflowId)),
      uint8(WorkflowState.Queue)
    );
  }

  function testEnqueueWorkflowJobInsufficientBalance() public {
    bytes32 workflowId = _createTestWorkflow();

    // Try to enqueue a job with cost higher than workflow balance
    vm.prank(creatorAlice);
    vm.expectRevert("Workflow has insufficient balance");
    world.enqueueWorkflowJob(workflowId, INITIAL_BALANCE + 1);
    vm.stopPrank();

    // Verify the workflow state was not updated
    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Idle));
  }

  function testStartWorkflowJob() public {
    bytes32 workflowId = _createTestWorkflow();

    // First enqueue a job
    vm.prank(creatorAlice);
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    vm.stopPrank();

    // Start the job
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.startWorkflowJob(workflowId);
    vm.stopPrank();

    // Verify the workflow state was updated
    assertEq(
      uint8(Workflows.getState(workflowId)),
      uint8(WorkflowState.InProgress)
    );
  }

  function testStartWorkflowJobNonOperator() public {
    bytes32 workflowId = _createTestWorkflow();

    // First enqueue a job
    vm.prank(creatorAlice);
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    vm.stopPrank();

    // Try to start the job as non-operator
    vm.prank(creatorBob); // creatorBob is not an operator
    vm.expectRevert("Not operator");
    world.startWorkflowJob(workflowId);
    vm.stopPrank();

    // Verify the workflow state was not updated
    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Queue));
  }

  function testStartWorkflowJobInactiveWorkflow() public {
    bytes32 workflowId = _createTestWorkflow();
    // Make the workflow inactive
    vm.prank(creatorAlice);
    world.updateWorkflowStatus(workflowId, false);
    vm.stopPrank();

    // Try to enqueue a job for inactive workflow
    vm.prank(creatorAlice);
    vm.expectRevert("Workflow is not active");
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    vm.stopPrank();

    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Idle));
  }

  function testStartWorkflowJobNotQueued() public {
    bytes32 workflowId = _createTestWorkflow();

    // Try to start a job that is not queued
    vm.prank(creatorAlice);
    vm.expectRevert("Workflow must be queued");
    world.startWorkflowJob(workflowId);
    vm.stopPrank();

    // Verify the workflow state was not updated
    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Idle));
  }

  function testCompleteWorkflowJob() public {
    bytes32 workflowId = _createTestWorkflow();

    // First enqueue and start a job
    vm.startPrank(creatorAlice);
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    world.startWorkflowJob(workflowId);
    vm.stopPrank();

    // Complete the job
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.completeWorkflowJob(workflowId, JOB_COST, true, COMPLETION_METADATA);
    vm.stopPrank();

    // Verify the workflow state was updated
    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Idle));

    // Verify the balance was updated
    assertEq(Workflows.getBalance(workflowId), INITIAL_BALANCE - JOB_COST);
  }

  function testCompleteWorkflowJobNonOperator() public {
    bytes32 workflowId = _createTestWorkflow();

    // First enqueue and start a job
    vm.startPrank(creatorAlice);
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    world.startWorkflowJob(workflowId);
    vm.stopPrank();

    // Try to complete the job as non-operator
    vm.prank(creatorBob); // creatorBob is not an operator
    vm.expectRevert("Not operator");
    world.completeWorkflowJob(workflowId, JOB_COST, true, COMPLETION_METADATA);
    vm.stopPrank();

    // Verify the workflow state was not updated
    assertEq(
      uint8(Workflows.getState(workflowId)),
      uint8(WorkflowState.InProgress)
    );

    // Verify the balance was not updated
    assertEq(Workflows.getBalance(workflowId), INITIAL_BALANCE);
  }

  function testCompleteWorkflowJobInactiveWorkflow() public {
    bytes32 workflowId = _createTestWorkflow();

    // Make the workflow inactive
    vm.prank(creatorAlice);
    world.updateWorkflowStatus(workflowId, false);
    vm.stopPrank();

    // Try to complete the job for inactive workflow
    vm.prank(creatorAlice);
    vm.expectRevert("Workflow is not active");
    world.completeWorkflowJob(workflowId, JOB_COST, true, COMPLETION_METADATA);
    vm.stopPrank();

    // Verify the workflow state was not updated
    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Idle));

    // Verify the balance was not updated
    assertEq(Workflows.getBalance(workflowId), INITIAL_BALANCE);
  }

  function testCompleteWorkflowJobNotInProgress() public {
    bytes32 workflowId = _createTestWorkflow();

    // Try to complete a job that is not in progress
    vm.prank(creatorAlice);
    vm.expectRevert("Workflow must be in progress");
    world.completeWorkflowJob(workflowId, JOB_COST, true, COMPLETION_METADATA);
    vm.stopPrank();

    // Verify the workflow state was not updated
    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Idle));

    // Verify the balance was not updated
    assertEq(Workflows.getBalance(workflowId), INITIAL_BALANCE);
  }

  function testCompleteWorkflowJobInsufficientBalance() public {
    bytes32 workflowId = _createTestWorkflow();

    // First enqueue and start a job
    vm.startPrank(creatorAlice);
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    world.startWorkflowJob(workflowId);
    vm.stopPrank();

    // Try to complete the job with cost higher than workflow balance
    vm.prank(creatorAlice);
    vm.expectRevert("Workflow has insufficient balance");
    world.completeWorkflowJob(
      workflowId,
      INITIAL_BALANCE + 1,
      true,
      COMPLETION_METADATA
    );
    vm.stopPrank();

    // Verify the workflow state was not updated
    assertEq(
      uint8(Workflows.getState(workflowId)),
      uint8(WorkflowState.InProgress)
    );

    // Verify the balance was not updated
    assertEq(Workflows.getBalance(workflowId), INITIAL_BALANCE);
  }

  function testCompleteWorkflowJobWithFailureStatus() public {
    bytes32 workflowId = _createTestWorkflow();

    // First enqueue and start a job
    vm.startPrank(creatorAlice);
    world.enqueueWorkflowJob(workflowId, JOB_COST);
    world.startWorkflowJob(workflowId);
    vm.stopPrank();

    // Complete the job with failure status
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.completeWorkflowJob(workflowId, JOB_COST, false, COMPLETION_METADATA);
    vm.stopPrank();

    // Verify the workflow state was updated
    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Idle));

    // Verify the balance was updated
    assertEq(Workflows.getBalance(workflowId), INITIAL_BALANCE - JOB_COST);
  }
}
