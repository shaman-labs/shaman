// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Spells, Sources, Roles, ShamanSpells, ShamanSpellEdges, ShamanSources, SourceShamanLookup, SpellVersions } from "../src/codegen/index.sol";
import { JobState, RoleType } from "../src/codegen/common.sol";
import { NewSpellEdge, ShamanSpellEdge } from "../src/lib/ShamanWorkflowsLib.sol";

contract ShamanWorkflowsSystemTest is BaseTest {
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
    string memory name,
    bytes32[] memory spellIds,
    string[] memory spellChains,
    bytes32[] memory sourceIds
  ) internal returns (bytes32) {
    bytes32 shamanId = _createShaman(creator, name, "TestMetadata");

    if (spellIds.length > 0 && sourceIds.length > 0) {
      NewSpellEdge[] memory spellEdges = new NewSpellEdge[](spellIds.length);
      for (uint256 i = 0; i < spellIds.length; i++) {
        spellEdges[i] = _createSpellEdge(i, i);
      }
      _updateShamanWorkflow(
        creator,
        shamanId,
        sourceIds,
        spellIds,
        spellChains,
        spellEdges
      );
    }

    return shamanId;
  }

  function testGetShamanIdsBySourceId() public {
    // Create two independent sources for this test specifically
    bytes32 sourceId1 = _createSource(
      creatorAlice,
      "SourceUnique1",
      "metadata1"
    );
    bytes32 sourceId2 = _createSource(
      creatorAlice,
      "SourceUnique2",
      "metadata2"
    );

    // Create two independent spells
    bytes32 spellId1 = _createSpell(creatorAlice, "SpellUniqueA", "metadata");
    bytes32 spellId2 = _createSpell(creatorAlice, "SpellUniqueB", "metadata");

    // Create arrays for each source-spell combination
    bytes32[] memory spellIds1 = new bytes32[](1);
    spellIds1[0] = spellId1;

    bytes32[] memory spellIds2 = new bytes32[](1);
    spellIds2[0] = spellId2;

    bytes32[] memory sourceIds1 = new bytes32[](1);
    sourceIds1[0] = sourceId1;

    bytes32[] memory sourceIds2 = new bytes32[](1);
    sourceIds2[0] = sourceId2;

    string[] memory spellChains1 = new string[](1);
    spellChains1[0] = "base";

    string[] memory spellChains2 = new string[](1);
    spellChains2[0] = "base";

    // Create spell edges for both shamans
    NewSpellEdge[] memory edges1 = new NewSpellEdge[](1);
    edges1[0] = _createSpellEdge(0, 0);

    NewSpellEdge[] memory edges2 = new NewSpellEdge[](1);
    edges2[0] = _createSpellEdge(0, 0);

    // Create shamans but DON'T use the helper function - manually do the steps
    bytes32 shamanId1 = _createShaman(
      creatorAlice,
      "TestShaman3",
      "TestMetadata"
    );
    bytes32 shamanId2 = _createShaman(
      creatorAlice,
      "TestShaman4",
      "TestMetadata"
    );

    // Update first shaman with sourceId1
    vm.startPrank(creatorAlice);
    world.updateShamanWorkflow(
      shamanId1,
      sourceIds1,
      spellIds1,
      spellChains1,
      edges1
    );
    vm.stopPrank();

    // Update second shaman with sourceId2
    vm.startPrank(creatorAlice);
    world.updateShamanWorkflow(
      shamanId2,
      sourceIds2,
      spellIds2,
      spellChains2,
      edges2
    );
    vm.stopPrank();

    // Get shamans by source ID
    bytes32[] memory shamansForSource1 = world.getShamanIdsBySourceId(
      sourceId1
    );
    bytes32[] memory shamansForSource2 = world.getShamanIdsBySourceId(
      sourceId2
    );

    // Verify each source has only one shaman
    assertEq(shamansForSource1.length, 1, "Source1 should have 1 shaman");
    assertEq(
      shamansForSource1[0],
      shamanId1,
      "Shaman ID should match for source1"
    );

    assertEq(shamansForSource2.length, 1, "Source2 should have 1 shaman");
    assertEq(
      shamansForSource2[0],
      shamanId2,
      "Shaman ID should match for source2"
    );
  }

  function testGetShamanSpellEdges() public {
    // Create test spells
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creatorAlice,
      "SpellEdges"
    );

    // Create array of spell IDs
    bytes32[] memory spellIds = new bytes32[](2);
    spellIds[0] = spellId1;
    spellIds[1] = spellId2;

    // Create sources array
    bytes32[] memory sourceIds = new bytes32[](2);
    (sourceIds[0], sourceIds[1]) = _createTestSources(
      creatorAlice,
      "SourceEdges"
    );

    string[] memory spellChains = new string[](2);
    spellChains[0] = "base";
    spellChains[1] = "base";

    // Create spell edges
    NewSpellEdge[] memory spellEdges = new NewSpellEdge[](2);
    spellEdges[0] = _createSpellEdge(0, 1);
    spellEdges[1] = _createSpellEdge(1, 0);

    // Create a shaman
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman8",
      "TestMetadata"
    );

    // Update the shaman workflow with custom edges
    _updateShamanWorkflow(
      creatorAlice,
      shamanId,
      sourceIds,
      spellIds,
      spellChains,
      spellEdges
    );

    // Get the spell edges
    ShamanSpellEdge[] memory retrievedEdges = world.getShamanSpellEdges(
      shamanId
    );

    // Verify the edges
    assertEq(retrievedEdges.length, 2, "Should have 2 spell edges");
  }

  function testUpdateShamanWorkflowFailsForNonCreator() public {
    // Create test spells and sources
    (bytes32 spellId1, ) = _createTestSpells(creatorAlice, "SpellNC");
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "SourceNC");

    // Create a shaman
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman10",
      "TestMetadata"
    );

    // Prepare data for updating workflow
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = spellId1;

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    NewSpellEdge[] memory edges = new NewSpellEdge[](1);
    edges[0] = _createSpellEdge(0, 0);

    string[] memory spellChains = new string[](1);
    spellChains[0] = "base";

    // Try to update as non-creator, should revert
    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.updateShamanWorkflow(
      shamanId,
      sourceIds,
      spellIds,
      spellChains,
      edges
    );
  }

  function testUpdateWorkflowRequireSpellsAndSources() public {
    // Create a shaman
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman12",
      "TestMetadata"
    );

    // Try to update with empty arrays
    bytes32[] memory emptySpellIds = new bytes32[](0);
    bytes32[] memory emptySourceIds = new bytes32[](0);
    NewSpellEdge[] memory emptyEdges = new NewSpellEdge[](0);

    string[] memory emptySpellChains = new string[](0);

    vm.prank(creatorAlice);
    vm.expectRevert("Spell ids must be provided");
    world.updateShamanWorkflow(
      shamanId,
      emptySourceIds,
      emptySpellIds,
      emptySpellChains,
      emptyEdges
    );

    // Create a spell and try with empty sources
    (bytes32 spellId1, ) = _createTestSpells(creatorAlice, "SpellReq");
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = spellId1;

    vm.prank(creatorAlice);
    vm.expectRevert("Source ids must be provided");
    world.updateShamanWorkflow(
      shamanId,
      emptySourceIds,
      spellIds,
      emptySpellChains,
      emptyEdges
    );
  }
}
