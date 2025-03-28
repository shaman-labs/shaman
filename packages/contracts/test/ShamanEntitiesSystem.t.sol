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
    bytes32 spellId1 = _createSpell(
      creator,
      string.concat(name, "1"),
      "metadata1"
    );
    bytes32 spellId2 = _createSpell(
      creator,
      string.concat(name, "2"),
      "metadata2"
    );
    return (spellId1, spellId2);
  }

  function _createTestSources(
    address creator,
    string memory name
  ) internal returns (bytes32, bytes32) {
    bytes32 sourceId1 = _createSource(
      creator,
      string.concat(name, "1"),
      "metadata1"
    );
    bytes32 sourceId2 = _createSource(
      creator,
      string.concat(name, "2"),
      "metadata2"
    );
    return (sourceId1, sourceId2);
  }

  function _createTestShaman(
    address creator,
    bytes32[] memory spellIds,
    bytes32[] memory sourceIds
  ) internal returns (bytes32) {
    bytes32 shamanId = _createShaman(creator, "TestShaman", "TestMetadata");

    if (spellIds.length > 0 || sourceIds.length > 0) {
      SpellEdge[] memory spellEdges = new SpellEdge[](0);
      _updateShamanWorkflow(creator, shamanId, spellIds, sourceIds, spellEdges);
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
    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialSpellIds,
      initialSourceIds
    );

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

    _updateShamanWorkflow(
      creatorAlice,
      shamanId,
      spellIds,
      sourceIds,
      spellEdges
    );

    // Verify the first spell was added
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2), 0);

    // Add second spell to the shaman
    spellIds = new bytes32[](2);
    spellIds[0] = spellId1;
    spellIds[1] = spellId2;

    _updateShamanWorkflow(
      creatorAlice,
      shamanId,
      spellIds,
      sourceIds,
      spellEdges
    );

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
    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialSpellIds,
      initialSourceIds
    );

    // Add first spell to the shaman
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = spellId1;
    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;
    SpellEdge[] memory spellEdges = new SpellEdge[](0);

    _updateShamanWorkflow(
      creatorAlice,
      shamanId,
      spellIds,
      sourceIds,
      spellEdges
    );

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
    bytes32[] memory remainingSpellIds = new bytes32[](1);
    remainingSpellIds[0] = spellId2;
    SpellEdge[] memory emptySpellEdges = new SpellEdge[](0);
    _updateShamanWorkflow(
      creatorAlice,
      shamanId,
      remainingSpellIds,
      sourceIds,
      emptySpellEdges
    );

    // Verify the first spell was removed
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1), 0);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2) > 0, true);

    // Remove second spell from the shaman
    bytes32[] memory emptySpellIds = new bytes32[](0);
    _updateShamanWorkflow(
      creatorAlice,
      shamanId,
      emptySpellIds,
      sourceIds,
      emptySpellEdges
    );

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

    bytes32 shamanId = _createTestShaman(creatorAlice, spellIds, sourceIds);

    // Verify initial state
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);

    // Try to remove the spell as non-creator
    bytes32[] memory emptySpellIds = new bytes32[](0);
    SpellEdge[] memory emptySpellEdges = new SpellEdge[](0);

    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.updateShamanWorkflow(
      shamanId,
      emptySpellIds,
      sourceIds,
      emptySpellEdges
    );
    vm.stopPrank();

    // Verify the spell was not removed
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
  }

  function testUpdateShamanWorkflow() public {
    // Define initial setup
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creatorAlice,
      "UpdateTest1"
    );
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creatorAlice,
      "UpdateTest1"
    );

    bytes32[] memory initialSpellIds = new bytes32[](1);
    initialSpellIds[0] = spellId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialSpellIds,
      initialSourceIds
    );

    // Verify initial state
    assertEq(Shamans.lengthSpellIds(shamanId), 1);
    assertEq(Shamans.lengthSourceIds(shamanId), 1);
    assertEq(Shamans.lengthSpellEdgeIds(shamanId), 0);
    assertEq(Shamans.getItemSpellIds(shamanId, 0), spellId1);
    assertEq(Shamans.getItemSourceIds(shamanId, 0), sourceId1);

    // Update the shaman with new workflow
    bytes32[] memory newSpellIds = new bytes32[](2);
    newSpellIds[0] = spellId1;
    newSpellIds[1] = spellId2;

    bytes32[] memory newSourceIds = new bytes32[](2);
    newSourceIds[0] = sourceId1;
    newSourceIds[1] = sourceId2;

    SpellEdge[] memory spellEdges = new SpellEdge[](1);
    spellEdges[0] = _createSpellEdge(spellId1, spellId2, "test metadata");

    _updateShamanWorkflow(
      creatorAlice,
      shamanId,
      newSpellIds,
      newSourceIds,
      spellEdges
    );

    // Verify updated state
    assertEq(Shamans.lengthSpellIds(shamanId), 2);
    assertEq(Shamans.lengthSourceIds(shamanId), 2);
    assertEq(Shamans.lengthSpellEdgeIds(shamanId), 1);
    assertEq(Shamans.getItemSpellIds(shamanId, 0), spellId1);
    assertEq(Shamans.getItemSpellIds(shamanId, 1), spellId2);
    assertEq(Shamans.getItemSourceIds(shamanId, 0), sourceId1);
    assertEq(Shamans.getItemSourceIds(shamanId, 1), sourceId2);
  }

  function testUpdateShamanWorkflowNotCreator() public {
    // Define initial setup
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creatorAlice,
      "UpdateTest2"
    );
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creatorAlice,
      "UpdateTest2"
    );

    bytes32[] memory initialSpellIds = new bytes32[](1);
    initialSpellIds[0] = spellId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialSpellIds,
      initialSourceIds
    );

    // Try to update workflow as non-creator
    bytes32[] memory newSpellIds = new bytes32[](2);
    newSpellIds[0] = spellId1;
    newSpellIds[1] = spellId2;

    bytes32[] memory newSourceIds = new bytes32[](2);
    newSourceIds[0] = sourceId1;
    newSourceIds[1] = sourceId2;

    SpellEdge[] memory spellEdges = new SpellEdge[](1);
    spellEdges[0] = _createSpellEdge(spellId1, spellId2, "test metadata");

    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.updateShamanWorkflow(shamanId, newSpellIds, newSourceIds, spellEdges);
    vm.stopPrank();
  }

  function testUpdateShamanWorkflowInactiveShaman() public {
    // Define initial setup
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creatorAlice,
      "UpdateTest3"
    );
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creatorAlice,
      "UpdateTest3"
    );

    bytes32[] memory initialSpellIds = new bytes32[](1);
    initialSpellIds[0] = spellId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialSpellIds,
      initialSourceIds
    );

    // Deactivate the shaman
    vm.prank(signerAddress);
    world.updateShamanStatus(shamanId, false);
    vm.stopPrank();

    // Try to update workflow on inactive shaman
    bytes32[] memory newSpellIds = new bytes32[](2);
    newSpellIds[0] = spellId1;
    newSpellIds[1] = spellId2;

    bytes32[] memory newSourceIds = new bytes32[](2);
    newSourceIds[0] = sourceId1;
    newSourceIds[1] = sourceId2;

    SpellEdge[] memory spellEdges = new SpellEdge[](1);
    spellEdges[0] = _createSpellEdge(spellId1, spellId2, "test metadata");

    vm.prank(creatorAlice);
    vm.expectRevert("Shaman must be active");
    world.updateShamanWorkflow(shamanId, newSpellIds, newSourceIds, spellEdges);
    vm.stopPrank();
  }

  function testUpdateShamanWorkflowNonIdleShaman() public {
    // Define initial setup
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creatorAlice,
      "UpdateTest4"
    );
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creatorAlice,
      "UpdateTest4"
    );

    bytes32[] memory initialSpellIds = new bytes32[](1);
    initialSpellIds[0] = spellId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialSpellIds,
      initialSourceIds
    );

    // Start the shaman (change state from Idle)
    vm.prank(creatorAlice);
    world.enqueueShamanJob(shamanId);

    vm.prank(creatorAlice);
    world.startShamanJob(shamanId);
    vm.stopPrank();

    // Try to update workflow on non-idle shaman
    bytes32[] memory newSpellIds = new bytes32[](2);
    newSpellIds[0] = spellId1;
    newSpellIds[1] = spellId2;

    bytes32[] memory newSourceIds = new bytes32[](2);
    newSourceIds[0] = sourceId1;
    newSourceIds[1] = sourceId2;

    SpellEdge[] memory spellEdges = new SpellEdge[](1);
    spellEdges[0] = _createSpellEdge(spellId1, spellId2, "test metadata");

    vm.prank(creatorAlice);
    vm.expectRevert("Shaman must be idle");
    world.updateShamanWorkflow(shamanId, newSpellIds, newSourceIds, spellEdges);
    vm.stopPrank();
  }
}
