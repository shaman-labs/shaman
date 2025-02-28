// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Workflows, Roles } from "../src/codegen/index.sol";
import { WorkflowState, RoleType } from "../src/codegen/common.sol";

contract WorkflowSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmWorkflowTest1";
  string constant UPDATED_METADATA = "QmWorkflowTest2";
  bytes32 constant SHAMAN_ID = bytes32(uint256(1));
  bytes32 constant SOURCE_ID = bytes32(uint256(2));
  uint256 constant INITIAL_BALANCE = 1000;

  function _setupOperator(address operator) private {
    vm.prank(signerAddress);
    Roles.setRole(operator, RoleType.Operator);
    vm.stopPrank();
  }

  function _prepareTokens(address user, uint256 amount) private {
    _mintTokens(user, amount);
    _increaseAllowance(user, amount);
  }

  function _createWorkflow(
    address creator,
    uint256 balance,
    bytes32[] memory shamanIds,
    bytes32[] memory sourceIds,
    string memory metadata
  ) private returns (bytes32 workflowId) {
    vm.recordLogs();
    vm.prank(creator);
    world.createWorkflow(balance, shamanIds, sourceIds, metadata);
    vm.stopPrank();
    
    // Get the workflow ID from the logs
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == keccak256("WorkflowCreated(bytes32,address)")) {
        workflowId = bytes32(entries[i].topics[1]);
        break;
      }
    }
    
    require(workflowId != bytes32(0), "Workflow creation failed");
  }

  function testCreateWorkflow() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](1);
    shamanIds[0] = SHAMAN_ID;
    
    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = SOURCE_ID;
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Verify workflow state
    assertEq(uint8(Workflows.getState(workflowId)), uint8(WorkflowState.Idle));
    assertEq(Workflows.getCreator(workflowId), creatorAlice);
    assertEq(Workflows.getActive(workflowId), true);
    assertEq(Workflows.getBalance(workflowId), INITIAL_BALANCE);
    assertEq(Workflows.getShamanCount(workflowId), 1);
    assertEq(Workflows.getSourceCount(workflowId), 1);
    assertEq(Workflows.getMetadata(workflowId), INITIAL_METADATA);
  }

  function testCreateWorkflowWithoutBalance() public {
    _setupOperator(creatorAlice);
    
    bytes32[] memory shamanIds = new bytes32[](1);
    shamanIds[0] = SHAMAN_ID;
    
    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = SOURCE_ID;
    
    bytes32 workflowId = _createWorkflow(creatorAlice, 0, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Verify workflow state
    assertEq(Workflows.getBalance(workflowId), 0);
  }

  function testCreateWorkflowWithoutShamans() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](0);
    
    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = SOURCE_ID;
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Verify workflow state
    assertEq(Workflows.getShamanCount(workflowId), 0);
  }

  function testCreateWorkflowWithoutSources() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](1);
    shamanIds[0] = SHAMAN_ID;
    
    bytes32[] memory sourceIds = new bytes32[](0);
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Verify workflow state
    assertEq(Workflows.getSourceCount(workflowId), 0);
  }

  function testUpdateWorkflowMetadata() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Update metadata
    vm.prank(creatorAlice);
    world.updateWorkflowMetadata(workflowId, UPDATED_METADATA);
    vm.stopPrank();
    
    // Verify metadata was updated
    assertEq(Workflows.getMetadata(workflowId), UPDATED_METADATA);
  }

  function testUpdateWorkflowMetadataNotCreator() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Try to update metadata as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not the workflow creator");
    world.updateWorkflowMetadata(workflowId, UPDATED_METADATA);
    vm.stopPrank();
    
    // Verify metadata was not updated
    assertEq(Workflows.getMetadata(workflowId), INITIAL_METADATA);
  }

  function testUpdateWorkflowMetadataEmptyMetadata() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Try to update metadata with empty string
    vm.prank(creatorAlice);
    vm.expectRevert("Metadata cannot be empty");
    world.updateWorkflowMetadata(workflowId, "");
    vm.stopPrank();
    
    // Verify metadata was not updated
    assertEq(Workflows.getMetadata(workflowId), INITIAL_METADATA);
  }

  function testUpdateWorkflowStatus() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Update status to inactive
    vm.prank(creatorAlice);
    world.updateWorkflowStatus(workflowId, false);
    vm.stopPrank();
    
    // Verify status was updated
    assertEq(Workflows.getActive(workflowId), false);
    
    // Update status back to active
    vm.prank(creatorAlice);
    world.updateWorkflowStatus(workflowId, true);
    vm.stopPrank();
    
    // Verify status was updated
    assertEq(Workflows.getActive(workflowId), true);
  }

  function testUpdateWorkflowStatusNotCreator() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Try to update status as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not the workflow creator");
    world.updateWorkflowStatus(workflowId, false);
    vm.stopPrank();
    
    // Verify status was not updated
    assertEq(Workflows.getActive(workflowId), true);
  }

  function testGetWorkflowState() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Verify state getter
    assertEq(uint8(world.getWorkflowState(workflowId)), uint8(WorkflowState.Idle));
  }

  function testGetWorkflowMetadata() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Verify metadata getter
    assertEq(world.getWorkflowMetadata(workflowId), INITIAL_METADATA);
  }

  function testGetWorkflowBalance() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Verify balance getter
    assertEq(world.getWorkflowBalance(workflowId), INITIAL_BALANCE);
  }

  function testGetWorkflowActive() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Verify active getter
    assertEq(world.getWorkflowActive(workflowId), true);
  }

  function testGetWorkflowCreator() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);
    
    bytes32[] memory shamanIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);
    
    bytes32 workflowId = _createWorkflow(creatorAlice, INITIAL_BALANCE, shamanIds, sourceIds, INITIAL_METADATA);
    
    // Verify creator getter
    assertEq(world.getWorkflowCreator(workflowId), creatorAlice);
  }
} 