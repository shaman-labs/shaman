// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Spells, Sources, Roles, ShamanSpell, ShamanSpellEdges, SourceShaman, SourceShamanLookup, SpellVersions } from "../src/codegen/index.sol";
import { JobState, RoleType } from "../src/codegen/common.sol";
import { ShamanEntitiesLib, SpellEdge } from "../src/lib/ShamanEntitiesLib.sol";

contract ShamanEntitiesSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmShamanTest1";

  uint256 constant INITIAL_BALANCE = 1000;

  address internal nonCreatorBob = address(0xB0BB);

  function _createTestSpells(
    address creator,
    string memory name
  ) internal returns (bytes32, bytes32) {
    bytes32 spellId1 = _createSpell(creator, string.concat(name, "1"), "metadata1");
    bytes32 spellId2 = _createSpell(creator, string.concat(name, "2"), "metadata2");
    return (spellId1, spellId2);
  }

  function _createTestSources(
    address creator,
    string memory name
  ) internal returns (bytes32, bytes32) {
    bytes32 sourceId1 = _createSource(creator, string.concat(name, "1"), "metadata1");
    bytes32 sourceId2 = _createSource(creator, string.concat(name, "2"), "metadata2");
    return (sourceId1, sourceId2);
  }

  function _createTestShaman(
    address creator,
    bytes32[] memory spellIds,
    bytes32[] memory sourceIds
  ) internal returns (bytes32) {
    bytes32 shamanId = _createShaman(creator,"TestShaman", "TestMetadata");

    if (spellIds.length > 0 || sourceIds.length > 0) {
      SpellEdge[] memory spellEdges = new SpellEdge[](0);
      vm.prank(creator);
      world.updateShamanWorkflow(shamanId, spellIds, sourceIds, spellEdges);
      vm.stopPrank();
    }

    return shamanId;
  }

  function testAddSpell() public {
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creatorAlice,
      "AddTest1"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "AddTest1");

    // Create a shaman with no spells initially
    bytes32[] memory initialSpellIds = new bytes32[](0);
    bytes32[] memory initialSourceIds = new bytes32[](0);
    bytes32 shamanId = _createTestShaman(creatorAlice, initialSpellIds, initialSourceIds);

    // Verify initial state
    assertEq(Shamans.lengthSpellIds(shamanId), 0);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1), 0);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2), 0);

    // Add first spell to the shaman
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = spellId1;
    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;
    SpellEdge[] memory spellEdges = new SpellEdge[](0);

    vm.prank(creatorAlice);
    world.updateShamanWorkflow(shamanId, spellIds, sourceIds, spellEdges);
    vm.stopPrank();

    // Verify the first spell was added
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2), 0);

    // Add second spell to the shaman
    spellIds = new bytes32[](2);
    spellIds[0] = spellId1;
    spellIds[1] = spellId2;

    vm.prank(creatorAlice);
    world.updateShamanWorkflow(shamanId, spellIds, sourceIds, spellEdges);
    vm.stopPrank();

    // Verify the second spell was added
    assertEq(Shamans.lengthSpellIds(shamanId), 2);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2) > 0, true);
  }

  function testAddSpellNotCreator() public {
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creatorAlice,
      "AddTest3"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "AddTest3");

    // Create a shaman with no spells initially
    bytes32[] memory initialSpellIds = new bytes32[](0);
    bytes32[] memory initialSourceIds = new bytes32[](0);
    bytes32 shamanId = _createTestShaman(creatorAlice, initialSpellIds, initialSourceIds);

    // Add first spell to the shaman
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = spellId1;
    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;
    SpellEdge[] memory spellEdges = new SpellEdge[](0);

    vm.prank(creatorAlice);
    world.updateShamanWorkflow(shamanId, spellIds, sourceIds, spellEdges);
    vm.stopPrank();

    // Verify the first spell was added
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);

    // Try to add a spell as non-creator
    spellIds = new bytes32[](2);
    spellIds[0] = spellId1;
    spellIds[1] = spellId2;

    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.updateShamanWorkflow(shamanId, spellIds, sourceIds, spellEdges);
    vm.stopPrank();

    // Verify the spell was not added
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2), 0);
  }

  function testAddSpellAlreadyExists() public {
    (bytes32 spellId1, ) = _createTestSpells(creatorAlice, "3");
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "3");

    // Create a shaman with one spell initially
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = spellId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      spellIds,
      initialSourceIds
    );

    // Verify the spell was added
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);

    // Try to add the same spell again
    vm.prank(creatorAlice);
    vm.expectRevert("Spell already exists in shaman");
    bytes32[] memory newSpellIds = new bytes32[](1);
    newSpellIds[0] = spellId1;
    bytes32[] memory newSourceIds = new bytes32[](1);
    newSourceIds[0] = sourceId1;
    SpellEdge[] memory spellEdges = new SpellEdge[](0);
    world.updateShamanWorkflow(shamanId, newSpellIds, newSourceIds, spellEdges);
    vm.stopPrank();

    // Verify the spell count is still 1
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
  }

  function testRemoveSpell() public {
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creatorAlice,
      "RemoveTest1"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "RemoveTest1");

    // Create a shaman with two spells initially
    bytes32[] memory initialSpellIds = new bytes32[](2);
    initialSpellIds[0] = spellId1;
    initialSpellIds[1] = spellId2;

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialSpellIds,
      sourceIds
    );

    // Verify initial state
    assertEq(Shamans.lengthSpellIds(shamanId), 2);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2) > 0, true);

    // Remove first spell from the shaman
    vm.prank(creatorAlice);
    bytes32[] memory remainingSpellIds = new bytes32[](1);
    remainingSpellIds[0] = spellId2;
    SpellEdge[] memory emptySpellEdges = new SpellEdge[](0);
    world.updateShamanWorkflow(shamanId, remainingSpellIds, sourceIds, emptySpellEdges);
    vm.stopPrank();

    // Verify the first spell was removed
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1), 0);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2) > 0, true);

    // Remove second spell from the shaman
    vm.prank(creatorAlice);
    bytes32[] memory emptySpellIds = new bytes32[](0);
    world.updateShamanWorkflow(shamanId, emptySpellIds, sourceIds, emptySpellEdges);
    vm.stopPrank();

    // Verify the second spell was removed
    assertEq(Shamans.lengthSpellIds(shamanId), 0);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1), 0);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2), 0);
  }

  function testRemoveSpellNotCreator() public {
    (bytes32 spellId1, ) = _createTestSpells(creatorAlice, "RemoveTest2");
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "RemoveTest2");

    // Create a shaman with one spell initially
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = spellId1;

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      spellIds,
      sourceIds
    );

    // Verify initial state
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);

    // Try to remove spell as non-creator
    vm.prank(nonCreatorBob);
    vm.expectRevert("Only creator can remove spells");
    bytes32[] memory emptySpellIds = new bytes32[](0);
    bytes32[] memory emptySourceIds = new bytes32[](0);
    SpellEdge[] memory emptySpellEdges = new SpellEdge[](0);
    world.updateShamanWorkflow(shamanId, emptySpellIds, emptySourceIds, emptySpellEdges);
    vm.stopPrank();

    // Verify the spell is still there
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
  }

  function testUpdateShamanWorkflow() public {
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creatorAlice,
      "UpdateTest1"
    );
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creatorAlice,
      "UpdateTest1"
    );

    // Create a shaman with no spells initially
    bytes32[] memory emptyIds = new bytes32[](0);
    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      emptyIds,
      emptyIds
    );

    // Verify initial state
    assertEq(Shamans.lengthSpellIds(shamanId), 0);

    // Add spells and sources to the shaman
    bytes32[] memory newSpellIds = new bytes32[](2);
    newSpellIds[0] = spellId1;
    newSpellIds[1] = spellId2;

    bytes32[] memory newSourceIds = new bytes32[](2);
    newSourceIds[0] = sourceId1;
    newSourceIds[1] = sourceId2;

    SpellEdge[] memory spellEdges = new SpellEdge[](1);
    spellEdges[0] = SpellEdge({
      fromSpellId: spellId1,
      toSpellId: spellId2,
      createdAt: block.timestamp,
      metadata: "TestEdge"
    });

    vm.prank(creatorAlice);
    world.updateShamanWorkflow(shamanId, newSpellIds, newSourceIds, spellEdges);
    vm.stopPrank();

    // Verify spells were added
    assertEq(Shamans.lengthSpellIds(shamanId), 2);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2) > 0, true);

    // Verify sources were added
    assertEq(Shamans.lengthSourceIds(shamanId), 2);
    assertEq(SourceShaman.getCreatedAt(shamanId, sourceId1) > 0, true);
    assertEq(SourceShaman.getCreatedAt(shamanId, sourceId2) > 0, true);

    // Verify spell edge was added
    assertEq(Shamans.lengthSpellEdgeIds(shamanId), 1);
    bytes32 edgeId = Shamans.getItemSpellEdgeIds(shamanId, 0);
    assertEq(ShamanSpellEdges.getFromSpellId(edgeId), spellId1);
    assertEq(ShamanSpellEdges.getToSpellId(edgeId), spellId2);
    assertEq(ShamanSpellEdges.getMetadata(edgeId), "TestEdge");
  }

  function testUpdateShamanWorkflowNotCreator() public {
    (bytes32 spellId1, ) = _createTestSpells(creatorAlice, "UpdateTest2");
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "UpdateTest2");

    // Create a shaman with no spells initially
    bytes32[] memory emptyIds = new bytes32[](0);
    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      emptyIds,
      emptyIds
    );

    // Try to update workflow as non-creator
    bytes32[] memory newSpellIds = new bytes32[](1);
    newSpellIds[0] = spellId1;

    bytes32[] memory newSourceIds = new bytes32[](1);
    newSourceIds[0] = sourceId1;

    SpellEdge[] memory spellEdges = new SpellEdge[](0);

    vm.prank(nonCreatorBob);
    vm.expectRevert("Only creator can update workflow");
    world.updateShamanWorkflow(shamanId, newSpellIds, newSourceIds, spellEdges);
    vm.stopPrank();

    // Verify no spells were added
    assertEq(Shamans.lengthSpellIds(shamanId), 0);
  }

  function testUpdateShamanWorkflowInactiveShaman() public {
    // Create test spells and sources
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(creatorAlice, "WorkflowTest3");
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(creatorAlice, "WorkflowTest3");

    // Create a shaman with no spells or sources initially
    bytes32[] memory initialSpellIds = new bytes32[](0);
    bytes32[] memory initialSourceIds = new bytes32[](0);
    bytes32 shamanId = _createTestShaman(creatorAlice, initialSpellIds, initialSourceIds);

    // Make the shaman inactive
    vm.prank(creatorAlice);
    world.updateShamanStatus(shamanId, false);
    vm.stopPrank();

    // Create spell edges
    SpellEdge[] memory spellEdges = new SpellEdge[](1);
    spellEdges[0] = SpellEdge({
      fromSpellId: spellId1,
      toSpellId: spellId2,
      createdAt: block.timestamp,
      metadata: "TestEdge"
    });

    // Create arrays for new spells and sources
    bytes32[] memory newSpellIds = new bytes32[](2);
    newSpellIds[0] = spellId1;
    newSpellIds[1] = spellId2;

    bytes32[] memory newSourceIds = new bytes32[](2);
    newSourceIds[0] = sourceId1;
    newSourceIds[1] = sourceId2;

    // Try to update the workflow of inactive shaman
    vm.prank(creatorAlice);
    vm.expectRevert("Shaman is not active");
    world.updateShamanWorkflow(shamanId, newSpellIds, newSourceIds, spellEdges);
    vm.stopPrank();

    // Verify nothing was changed
    assertEq(Shamans.lengthSpellIds(shamanId), 0);
    assertEq(Shamans.lengthSourceIds(shamanId), 0);
    assertEq(Shamans.lengthSpellEdgeIds(shamanId), 0);
  }

  function testUpdateShamanWorkflowNonIdleShaman() public {
    // Create test spells and sources
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(creatorAlice, "WorkflowTest4");
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(creatorAlice, "WorkflowTest4");

    // Create a shaman with no spells or sources initially
    bytes32[] memory initialSpellIds = new bytes32[](0);
    bytes32[] memory initialSourceIds = new bytes32[](0);
    bytes32 shamanId = _createTestShaman(creatorAlice, initialSpellIds, initialSourceIds);

    // Set operator and enqueue shaman job to make it non-idle
    _setOperator(creatorAlice);
    vm.prank(creatorAlice);
    world.enqueueShamanJob(shamanId);
    vm.stopPrank();

    // Create spell edges
    SpellEdge[] memory spellEdges = new SpellEdge[](1);
    spellEdges[0] = SpellEdge({
      fromSpellId: spellId1,
      toSpellId: spellId2,
      createdAt: block.timestamp,
      metadata: "TestEdge"
    });

    // Create arrays for new spells and sources
    bytes32[] memory newSpellIds = new bytes32[](2);
    newSpellIds[0] = spellId1;
    newSpellIds[1] = spellId2;

    bytes32[] memory newSourceIds = new bytes32[](2);
    newSourceIds[0] = sourceId1;
    newSourceIds[1] = sourceId2;

    // Try to update the workflow of non-idle shaman
    vm.prank(creatorAlice);
    vm.expectRevert("Shaman is not idle");
    world.updateShamanWorkflow(shamanId, newSpellIds, newSourceIds, spellEdges);
    vm.stopPrank();

    // Verify nothing was changed
    assertEq(Shamans.lengthSpellIds(shamanId), 0);
    assertEq(Shamans.lengthSourceIds(shamanId), 0);
    assertEq(Shamans.lengthSpellEdgeIds(shamanId), 0);
  }
}
