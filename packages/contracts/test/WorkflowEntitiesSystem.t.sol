// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Workflows, Shamans, Sources, Roles, WorkflowShaman, WorkflowSource } from "../src/codegen/index.sol";
import { WorkflowState, RoleType } from "../src/codegen/common.sol";

contract WorkflowEntitiesSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmWorkflowTest1";

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

  function _createTestShamans(
    address creator,
    string memory suffix
  ) internal returns (bytes32, bytes32) {
    vm.recordLogs();

    // Use single-character names to avoid "Shaman name too long" error
    string memory name1 = string(abi.encodePacked("A", suffix));
    bytes32 shamanId1 = _createShaman(creator, name1, "QmTest1");

    // simulate sleep to avoid same shamanId
    vm.warp(block.timestamp + 5 seconds);

    string memory name2 = string(abi.encodePacked("B", suffix));
    bytes32 shamanId2 = _createShaman(creator, name2, "QmTest2");

    return (shamanId1, shamanId2);
  }

  function _createTestShamans(
    address creator
  ) private returns (bytes32 shamanId1, bytes32 shamanId2) {
    return _createTestShamans(creator, "");
  }

  function _createTestSources(
    address creator,
    string memory suffix
  ) internal returns (bytes32, bytes32) {
    vm.recordLogs();

    // Use single-character names to avoid "Source name too long" error
    string memory name1 = string(abi.encodePacked("X", suffix));
    bytes32 sourceId1 = _createSource(creator, name1, "QmTest1");

    // simulate sleep to avoid same sourceId
    vm.warp(block.timestamp + 5 seconds);

    string memory name2 = string(abi.encodePacked("Y", suffix));
    bytes32 sourceId2 = _createSource(creator, name2, "QmTest2");

    return (sourceId1, sourceId2);
  }

  function _createTestSources(
    address creator
  ) private returns (bytes32 sourceId1, bytes32 sourceId2) {
    return _createTestSources(creator, "");
  }

  function _createTestWorkflow(
    address creator,
    bytes32[] memory shamanIds,
    bytes32[] memory sourceIds
  ) private returns (bytes32 workflowId) {
    _prepareTokens(creator, INITIAL_BALANCE);

    vm.recordLogs();
    vm.prank(creator);
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

    // Verify the workflow was created correctly
    assertEq(
      Workflows.getCreator(workflowId),
      creator,
      "Creator not set correctly"
    );
    assertEq(
      Workflows.getBalance(workflowId),
      INITIAL_BALANCE,
      "Balance not set correctly"
    );
    assertEq(
      Workflows.getMetadata(workflowId),
      INITIAL_METADATA,
      "Metadata not set correctly"
    );

    return workflowId;
  }

  function testAddShaman() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, bytes32 shamanId2) = _createTestShamans(
      creatorAlice,
      "AddTest1"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "AddTest1");

    // Create a workflow with no shamans initially
    bytes32[] memory initialShamanIds = new bytes32[](0);

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      initialShamanIds,
      sourceIds
    );

    // Verify initial state
    assertEq(Workflows.getShamanCount(workflowId), 0);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1), 0);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId2), 0);

    // Add first shaman to the workflow
    vm.prank(creatorAlice);
    world.addShamanToWorkflow(workflowId, shamanId1);
    vm.stopPrank();

    // Verify the first shaman was added
    assertEq(Workflows.getShamanCount(workflowId), 1);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1) > 0, true);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId2), 0);

    // Add second shaman to the workflow
    vm.prank(creatorAlice);
    world.addShamanToWorkflow(workflowId, shamanId2);
    vm.stopPrank();

    // Verify the second shaman was added
    assertEq(Workflows.getShamanCount(workflowId), 2);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1) > 0, true);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId2) > 0, true);
  }

  function testAddShamanNotCreator() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, bytes32 shamanId2) = _createTestShamans(
      creatorAlice,
      "AddTest3"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "AddTest3");

    // Create a workflow with no shamans initially
    bytes32[] memory initialShamanIds = new bytes32[](0);

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      initialShamanIds,
      sourceIds
    );

    // Add first shaman to the workflow
    vm.prank(creatorAlice);
    world.addShamanToWorkflow(workflowId, shamanId1);
    vm.stopPrank();

    // Verify the first shaman was added
    assertEq(Workflows.getShamanCount(workflowId), 1);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1) > 0, true);

    // Try to add a shaman as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not workflow creator");
    world.addShamanToWorkflow(workflowId, shamanId2);
    vm.stopPrank();

    // Verify the shaman was not added
    assertEq(Workflows.getShamanCount(workflowId), 1);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId2), 0);
  }

  function testAddShamanAlreadyExists() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, ) = _createTestShamans(creatorAlice, "3");
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "3");

    // Create a workflow with one shaman initially
    bytes32[] memory shamanIds = new bytes32[](1);
    shamanIds[0] = shamanId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      shamanIds,
      initialSourceIds
    );

    // Verify the shaman was added
    assertEq(Workflows.getShamanCount(workflowId), 1);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1) > 0, true);

    // Try to add the same shaman again
    vm.prank(creatorAlice);
    vm.expectRevert("Shaman already exists in workflow");
    world.addShamanToWorkflow(workflowId, shamanId1);
    vm.stopPrank();

    // Verify the shaman count is still 1
    assertEq(Workflows.getShamanCount(workflowId), 1);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1) > 0, true);
  }

  function testRemoveShaman() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, bytes32 shamanId2) = _createTestShamans(
      creatorAlice,
      "RemoveTest1"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "RemoveTest1");

    // Create a workflow with two shamans initially
    bytes32[] memory initialShamanIds = new bytes32[](2);
    initialShamanIds[0] = shamanId1;
    initialShamanIds[1] = shamanId2;

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      initialShamanIds,
      sourceIds
    );

    // Verify both shamans were added
    assertEq(Workflows.getShamanCount(workflowId), 2);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1) > 0, true);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId2) > 0, true);

    // Remove the first shaman
    vm.prank(creatorAlice);
    world.removeShamanFromWorkflow(workflowId, shamanId1);
    vm.stopPrank();

    // Verify the first shaman was removed
    assertEq(Workflows.getShamanCount(workflowId), 1);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1), 0);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId2) > 0, true);

    // Remove the second shaman
    vm.prank(creatorAlice);
    world.removeShamanFromWorkflow(workflowId, shamanId2);
    vm.stopPrank();

    // Verify the second shaman was removed
    assertEq(Workflows.getShamanCount(workflowId), 0);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1), 0);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId2), 0);
  }

  function testRemoveShamanNotCreator() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, ) = _createTestShamans(creatorAlice, "5");
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "5");

    // Create a workflow with one shaman initially
    bytes32[] memory shamanIds = new bytes32[](1);
    shamanIds[0] = shamanId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      shamanIds,
      initialSourceIds
    );

    // Verify the shaman was added
    assertEq(Workflows.getShamanCount(workflowId), 1);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1) > 0, true);

    // Try to remove the shaman as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not workflow creator");
    world.removeShamanFromWorkflow(workflowId, shamanId1);
    vm.stopPrank();

    // Verify the shaman was not removed
    assertEq(Workflows.getShamanCount(workflowId), 1);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1) > 0, true);
  }

  function testRemoveShamanNotExists() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, bytes32 shamanId2) = _createTestShamans(
      creatorAlice,
      "NotExists1"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "NotExists1");

    // Create a workflow with one shaman
    bytes32[] memory initialShamanIds = new bytes32[](1);
    initialShamanIds[0] = shamanId1;

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    // Create the workflow using the helper function
    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      initialShamanIds,
      sourceIds
    );

    // Verify initial state
    assertEq(Workflows.getShamanCount(workflowId), 1);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1) > 0, true);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId2), 0);

    // Try to remove a shaman that doesn't exist in the workflow - should fail
    vm.prank(creatorAlice);
    vm.expectRevert("Shaman does not exist in workflow");
    world.removeShamanFromWorkflow(workflowId, shamanId2);
    vm.stopPrank();

    // Verify the workflow state didn't change
    assertEq(Workflows.getShamanCount(workflowId), 1);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId1) > 0, true);
    assertEq(WorkflowShaman.getCreatedAt(workflowId, shamanId2), 0);
  }

  function testAddSource() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, ) = _createTestShamans(creatorAlice, "AddTest2");
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creatorAlice,
      "AddTest2"
    );

    // Create a workflow with no sources initially
    bytes32[] memory shamanIds = new bytes32[](1);
    shamanIds[0] = shamanId1;

    bytes32[] memory initialSourceIds = new bytes32[](0);

    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      shamanIds,
      initialSourceIds
    );

    // Verify initial state
    assertEq(Workflows.getSourceCount(workflowId), 0);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1), 0);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId2), 0);

    // Add first source to the workflow
    vm.prank(creatorAlice);
    world.addSourceToWorkflow(workflowId, sourceId1);
    vm.stopPrank();

    // Verify the first source was added
    assertEq(Workflows.getSourceCount(workflowId), 1);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1) > 0, true);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId2), 0);

    // Add second source to the workflow
    vm.prank(creatorAlice);
    world.addSourceToWorkflow(workflowId, sourceId2);
    vm.stopPrank();

    // Verify the second source was added
    assertEq(Workflows.getSourceCount(workflowId), 2);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1) > 0, true);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId2) > 0, true);
  }

  function testAddSourceNotCreator() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, ) = _createTestShamans(creatorAlice, "AddTest4");
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creatorAlice,
      "AddTest4"
    );

    // Create a workflow with no sources initially
    bytes32[] memory shamanIds = new bytes32[](1);
    shamanIds[0] = shamanId1;

    bytes32[] memory initialSourceIds = new bytes32[](0);

    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      shamanIds,
      initialSourceIds
    );

    // Add first source to the workflow
    vm.prank(creatorAlice);
    world.addSourceToWorkflow(workflowId, sourceId1);
    vm.stopPrank();

    // Verify the first source was added
    assertEq(Workflows.getSourceCount(workflowId), 1);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1) > 0, true);

    // Try to add a source as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not workflow creator");
    world.addSourceToWorkflow(workflowId, sourceId2);
    vm.stopPrank();

    // Verify the source was not added
    assertEq(Workflows.getSourceCount(workflowId), 1);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId2), 0);
  }

  function testAddSourceAlreadyExists() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, ) = _createTestShamans(creatorAlice, "8");
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "8");

    // Create a workflow with one source initially
    bytes32[] memory shamanIds = new bytes32[](1);
    shamanIds[0] = shamanId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      shamanIds,
      initialSourceIds
    );

    // Verify the source was added
    assertEq(Workflows.getSourceCount(workflowId), 1);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1) > 0, true);

    // Try to add the same source again
    vm.prank(creatorAlice);
    vm.expectRevert("Source already exists in workflow");
    world.addSourceToWorkflow(workflowId, sourceId1);
    vm.stopPrank();

    // Verify the source count is still 1
    assertEq(Workflows.getSourceCount(workflowId), 1);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1) > 0, true);
  }

  function testRemoveSource() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, ) = _createTestShamans(creatorAlice, "RemoveTest2");
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creatorAlice,
      "RemoveTest2"
    );

    // Create a workflow with two sources initially
    bytes32[] memory shamanIds = new bytes32[](1);
    shamanIds[0] = shamanId1;

    bytes32[] memory initialSourceIds = new bytes32[](2);
    initialSourceIds[0] = sourceId1;
    initialSourceIds[1] = sourceId2;

    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      shamanIds,
      initialSourceIds
    );

    // Verify both sources were added
    assertEq(Workflows.getSourceCount(workflowId), 2);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1) > 0, true);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId2) > 0, true);

    // Remove the first source
    vm.prank(creatorAlice);
    world.removeSourceFromWorkflow(workflowId, sourceId1);
    vm.stopPrank();

    // Verify the first source was removed
    assertEq(Workflows.getSourceCount(workflowId), 1);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1), 0);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId2) > 0, true);

    // Remove the second source
    vm.prank(creatorAlice);
    world.removeSourceFromWorkflow(workflowId, sourceId2);
    vm.stopPrank();

    // Verify the second source was removed
    assertEq(Workflows.getSourceCount(workflowId), 0);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1), 0);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId2), 0);
  }

  function testRemoveSourceNotCreator() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, ) = _createTestShamans(creatorAlice, "0");
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "0");

    // Create a workflow with one source initially
    bytes32[] memory shamanIds = new bytes32[](1);
    shamanIds[0] = shamanId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      shamanIds,
      initialSourceIds
    );

    // Verify the source was added
    assertEq(Workflows.getSourceCount(workflowId), 1);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1) > 0, true);

    // Try to remove the source as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not workflow creator");
    world.removeSourceFromWorkflow(workflowId, sourceId1);
    vm.stopPrank();

    // Verify the source was not removed
    assertEq(Workflows.getSourceCount(workflowId), 1);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1) > 0, true);
  }

  function testRemoveSourceNotExists() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId1, ) = _createTestShamans(creatorAlice, "NotExists2");
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creatorAlice,
      "NotExists2"
    );

    // Create a workflow with one source
    bytes32[] memory shamanIds = new bytes32[](1);
    shamanIds[0] = shamanId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    // Create the workflow using the helper function
    bytes32 workflowId = _createTestWorkflow(
      creatorAlice,
      shamanIds,
      initialSourceIds
    );

    // Verify initial state
    assertEq(Workflows.getSourceCount(workflowId), 1);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1) > 0, true);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId2), 0);

    // Try to remove a source that doesn't exist in the workflow - should fail
    vm.prank(creatorAlice);
    vm.expectRevert("Source does not exist in workflow");
    world.removeSourceFromWorkflow(workflowId, sourceId2);
    vm.stopPrank();

    // Verify the workflow state didn't change
    assertEq(Workflows.getSourceCount(workflowId), 1);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId1) > 0, true);
    assertEq(WorkflowSource.getCreatedAt(workflowId, sourceId2), 0);
  }
}
