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
      SpellEdge[] memory spellEdges = new SpellEdge[](spellIds.length);
      for (uint256 i = 0; i < spellIds.length; i++) {
        spellEdges[i] = _createSpellEdge(spellIds[i], spellIds[i], "test metadata");
      }
      _updateShamanWorkflow(creator, shamanId, spellIds, sourceIds, spellEdges);
    }

    return shamanId;
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
