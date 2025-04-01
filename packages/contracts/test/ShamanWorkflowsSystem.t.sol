// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Spells, Sources, Roles, ShamanSpell, ShamanSpellEdges, SourceShaman, SourceShamanLookup, SpellVersions } from "../src/codegen/index.sol";
import { JobState, RoleType } from "../src/codegen/common.sol";
import { ShamanEntitiesLib, SpellEdge } from "../src/lib/ShamanEntitiesLib.sol";

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
    bytes32[] memory sourceIds
  ) internal returns (bytes32) {
    bytes32 shamanId = _createShaman(creator, name, "TestMetadata");

    if (spellIds.length > 0 && sourceIds.length > 0) {
      SpellEdge[] memory spellEdges = new SpellEdge[](spellIds.length);
      for (uint256 i = 0; i < spellIds.length; i++) {
        spellEdges[i] = _createSpellEdge(
          spellIds[i],
          spellIds[i],
          "test metadata"
        );
      }
      _updateShamanWorkflow(creator, shamanId, spellIds, sourceIds, spellEdges);
    }

    return shamanId;
  }

  function testGetShamanSpellIds() public {
    // Create a creator
    address creator = creatorAlice;

    // Create test spells
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(creator, "Spell");

    // Create array of spell IDs
    bytes32[] memory spellIds = new bytes32[](2);
    spellIds[0] = spellId1;
    spellIds[1] = spellId2;

    // Create sources array - must have sources to avoid revert
    bytes32[] memory sourceIds = new bytes32[](2);
    (sourceIds[0], sourceIds[1]) = _createTestSources(creator, "Source");

    // Create a shaman with the spells
    bytes32 shamanId = _createTestShaman(
      creator,
      "TestShaman1",
      spellIds,
      sourceIds
    );

    // Get the shaman's spell IDs
    bytes32[] memory retrievedSpellIds = world.getShamanSpellIds(shamanId);

    // Verify the spell IDs match
    assertEq(retrievedSpellIds.length, 2, "Should have 2 spell IDs");
    assertEq(retrievedSpellIds[0], spellId1, "First spell ID should match");
    assertEq(retrievedSpellIds[1], spellId2, "Second spell ID should match");
  }

  function testGetShamanSourceIds() public {
    // Create a creator
    address creator = creatorAlice;

    // Create test sources
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creator,
      "Source"
    );

    // Create array of source IDs
    bytes32[] memory sourceIds = new bytes32[](2);
    sourceIds[0] = sourceId1;
    sourceIds[1] = sourceId2;

    // Create spells array - must have spells to avoid revert
    bytes32[] memory spellIds = new bytes32[](2);
    (spellIds[0], spellIds[1]) = _createTestSpells(creator, "Spell");

    // Create a shaman with the sources
    bytes32 shamanId = _createTestShaman(
      creator,
      "TestShaman2",
      spellIds,
      sourceIds
    );

    // Get the shaman's source IDs
    bytes32[] memory retrievedSourceIds = world.getShamanSourceIds(shamanId);

    // Verify the source IDs match
    assertEq(retrievedSourceIds.length, 2, "Should have 2 source IDs");
    assertEq(retrievedSourceIds[0], sourceId1, "First source ID should match");
    assertEq(retrievedSourceIds[1], sourceId2, "Second source ID should match");
  }

  function testGetShamanIdsBySourceId() public {
    // Create a creator
    address creator = creatorAlice;

    // Create two independent sources for this test specifically
    bytes32 sourceId1 = _createSource(creator, "SourceUnique1", "metadata1");
    bytes32 sourceId2 = _createSource(creator, "SourceUnique2", "metadata2");

    // Initialize source counts to zero to prevent any issues
    vm.startPrank(signerAddress);
    Sources.setShamanCount(sourceId1, 0);
    Sources.setShamanCount(sourceId2, 0);
    vm.stopPrank();

    // Create two independent spells
    bytes32 spellId1 = _createSpell(creator, "SpellUniqueA", "metadata");
    bytes32 spellId2 = _createSpell(creator, "SpellUniqueB", "metadata");

    // Initialize spell counts to zero
    vm.startPrank(signerAddress);
    Spells.setShamanCount(spellId1, 0);
    Spells.setShamanCount(spellId2, 0);
    vm.stopPrank();

    // Create arrays for each source-spell combination
    bytes32[] memory spellIds1 = new bytes32[](1);
    spellIds1[0] = spellId1;

    bytes32[] memory spellIds2 = new bytes32[](1);
    spellIds2[0] = spellId2;

    bytes32[] memory sourceIds1 = new bytes32[](1);
    sourceIds1[0] = sourceId1;

    bytes32[] memory sourceIds2 = new bytes32[](1);
    sourceIds2[0] = sourceId2;

    // Create spell edges for both shamans
    SpellEdge[] memory edges1 = new SpellEdge[](1);
    edges1[0] = _createSpellEdge(spellId1, spellId1, "edge1");

    SpellEdge[] memory edges2 = new SpellEdge[](1);
    edges2[0] = _createSpellEdge(spellId2, spellId2, "edge2");

    // Create shamans but DON'T use the helper function - manually do the steps
    bytes32 shamanId1 = _createShaman(creator, "TestShaman3", "TestMetadata");
    bytes32 shamanId2 = _createShaman(creator, "TestShaman4", "TestMetadata");

    // Update first shaman with sourceId1
    vm.startPrank(creator);
    world.updateShamanWorkflow(shamanId1, spellIds1, sourceIds1, edges1);
    vm.stopPrank();

    // Update second shaman with sourceId2
    vm.startPrank(creator);
    world.updateShamanWorkflow(shamanId2, spellIds2, sourceIds2, edges2);
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

  function testGetShamanSpellMetadata() public {
    // Create a creator
    address creator = creatorAlice;

    // Create test spells with unique names
    bytes32 spellId1 = _createSpell(creator, "SpellMetaTest1", "metadata1");
    bytes32 spellId2 = _createSpell(creator, "SpellMetaTest2", "metadata2");

    // Create array of spell IDs
    bytes32[] memory spellIds = new bytes32[](2);
    spellIds[0] = spellId1;
    spellIds[1] = spellId2;

    // Create sources with unique names
    bytes32 sourceId1 = _createSource(creator, "SourceMetaTest1", "metadata1");
    bytes32 sourceId2 = _createSource(creator, "SourceMetaTest2", "metadata2");

    // Create array of source IDs
    bytes32[] memory sourceIds = new bytes32[](2);
    sourceIds[0] = sourceId1;
    sourceIds[1] = sourceId2;

    // Initialize counts to 0 to prevent underflow
    vm.startPrank(signerAddress);
    Sources.setShamanCount(sourceId1, 0);
    Sources.setShamanCount(sourceId2, 0);
    Spells.setShamanCount(spellId1, 0);
    Spells.setShamanCount(spellId2, 0);
    vm.stopPrank();

    // Create a shaman
    bytes32 shamanId = _createShaman(creator, "TestShamanMeta", "TestMetadata");

    // Create spell edges
    SpellEdge[] memory spellEdges = new SpellEdge[](2);
    spellEdges[0] = _createSpellEdge(spellId1, spellId2, "edge1 metadata");
    spellEdges[1] = _createSpellEdge(spellId2, spellId1, "edge2 metadata");

    // Update shaman workflow
    vm.startPrank(creator);
    world.updateShamanWorkflow(shamanId, spellIds, sourceIds, spellEdges);
    vm.stopPrank();

    // Directly set the metadata using signerAddress
    vm.startPrank(signerAddress);
    ShamanSpell.setMetadata(shamanId, spellId1, "metadata1");
    vm.stopPrank();

    // Get the spell metadata
    string memory metadata = world.getShamanSpellMetadata(shamanId, spellId1);

    // Verify the metadata
    assertEq(metadata, "metadata1", "Spell metadata should match");
  }

  function testGetShamanSpellVersion() public {
    // Create a creator
    address creator = creatorAlice;

    // Create test spells
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creator,
      "SpellVer"
    );

    // Create array of spell IDs
    bytes32[] memory spellIds = new bytes32[](2);
    spellIds[0] = spellId1;
    spellIds[1] = spellId2;

    // Create sources array
    bytes32[] memory sourceIds = new bytes32[](2);
    (sourceIds[0], sourceIds[1]) = _createTestSources(creator, "SourceVer");

    // Create a shaman with the spells
    bytes32 shamanId = _createTestShaman(
      creator,
      "TestShaman6",
      spellIds,
      sourceIds
    );

    // Set spell version directly in ShamanSpell table
    vm.startPrank(signerAddress);
    ShamanSpell.setVersion(shamanId, spellId1, 1);
    vm.stopPrank();

    // Get the spell version
    uint256 version = world.getShamanSpellVersion(shamanId, spellId1);

    // Verify the version (should be 1 for a new spell)
    assertEq(version, 1, "Spell version should be 1");
  }

  function testGetShamanSpellState() public {
    // Create a creator
    address creator = creatorAlice;

    // Create test spells
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creator,
      "SpellState"
    );

    // Create array of spell IDs
    bytes32[] memory spellIds = new bytes32[](2);
    spellIds[0] = spellId1;
    spellIds[1] = spellId2;

    // Create sources array
    bytes32[] memory sourceIds = new bytes32[](2);
    (sourceIds[0], sourceIds[1]) = _createTestSources(creator, "SourceState");

    // Create a shaman with the spells
    bytes32 shamanId = _createTestShaman(
      creator,
      "TestShaman7",
      spellIds,
      sourceIds
    );

    // Set spell state directly in ShamanSpell table
    vm.startPrank(signerAddress);
    ShamanSpell.setState(shamanId, spellId1, JobState.Idle);
    vm.stopPrank();

    // Get the spell state
    JobState state = world.getShamanSpellState(shamanId, spellId1);

    // Verify the state (should be Idle for a new spell)
    assertEq(uint8(state), uint8(JobState.Idle), "Spell state should be Idle");
  }

  function testGetShamanSpellEdges() public {
    // Create a creator
    address creator = creatorAlice;

    // Create test spells
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creator,
      "SpellEdges"
    );

    // Create array of spell IDs
    bytes32[] memory spellIds = new bytes32[](2);
    spellIds[0] = spellId1;
    spellIds[1] = spellId2;

    // Create sources array
    bytes32[] memory sourceIds = new bytes32[](2);
    (sourceIds[0], sourceIds[1]) = _createTestSources(creator, "SourceEdges");

    // Create spell edges
    SpellEdge[] memory spellEdges = new SpellEdge[](2);
    spellEdges[0] = _createSpellEdge(spellId1, spellId2, "edge1 metadata");
    spellEdges[1] = _createSpellEdge(spellId2, spellId1, "edge2 metadata");

    // Create a shaman
    bytes32 shamanId = _createShaman(creator, "TestShaman8", "TestMetadata");

    // Update the shaman workflow with custom edges
    _updateShamanWorkflow(creator, shamanId, spellIds, sourceIds, spellEdges);

    // Get the spell edges
    SpellEdge[] memory retrievedEdges = world.getShamanSpellEdges(shamanId);

    // Verify the edges
    assertEq(retrievedEdges.length, 2, "Should have 2 spell edges");

    assertEq(
      retrievedEdges[0].fromSpellId,
      spellId1,
      "First edge fromSpellId should match"
    );
    assertEq(
      retrievedEdges[0].toSpellId,
      spellId2,
      "First edge toSpellId should match"
    );
    assertEq(
      retrievedEdges[0].metadata,
      "edge1 metadata",
      "First edge metadata should match"
    );

    assertEq(
      retrievedEdges[1].fromSpellId,
      spellId2,
      "Second edge fromSpellId should match"
    );
    assertEq(
      retrievedEdges[1].toSpellId,
      spellId1,
      "Second edge toSpellId should match"
    );
    assertEq(
      retrievedEdges[1].metadata,
      "edge2 metadata",
      "Second edge metadata should match"
    );
  }

  function testUpdateShamanWorkflow() public {
    // Create a creator
    address creator = creatorAlice;

    // Create test spells with unique names
    bytes32 spellId1 = _createSpell(creator, "SpellWFTest1", "metadata1");
    bytes32 spellId2 = _createSpell(creator, "SpellWFTest2", "metadata2");

    // Create test sources with unique names
    bytes32 sourceId1 = _createSource(creator, "SourceWFTest1", "metadata1");
    bytes32 sourceId2 = _createSource(creator, "SourceWFTest2", "metadata2");

    // Create a shaman
    bytes32 shamanId = _createShaman(creator, "TestShamanWF", "TestMetadata");

    // Initialize all source and spell counts to zero
    vm.startPrank(signerAddress);
    // Initialize source counts
    Sources.setShamanCount(sourceId1, 0);
    Sources.setShamanCount(sourceId2, 0);

    // Initialize spell counts
    Spells.setShamanCount(spellId1, 0);
    Spells.setShamanCount(spellId2, 0);

    // Initialize the shaman's source and spell counts in Spells and Sources tables
    Sources.setShamanCount(shamanId, 0);
    Spells.setShamanCount(shamanId, 0);
    vm.stopPrank();

    // Initial arrays for updating workflow
    bytes32[] memory initialSpellIds = new bytes32[](1);
    initialSpellIds[0] = spellId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    SpellEdge[] memory initialEdges = new SpellEdge[](1);
    initialEdges[0] = _createSpellEdge(spellId1, spellId1, "initial edge");

    // Update the workflow
    vm.prank(creator);
    world.updateShamanWorkflow(
      shamanId,
      initialSpellIds,
      initialSourceIds,
      initialEdges
    );

    // Verify initial state
    bytes32[] memory retrievedSpellIds = world.getShamanSpellIds(shamanId);
    bytes32[] memory retrievedSourceIds = world.getShamanSourceIds(shamanId);
    SpellEdge[] memory retrievedEdges = world.getShamanSpellEdges(shamanId);

    assertEq(retrievedSpellIds.length, 1, "Should have 1 spell ID initially");
    assertEq(retrievedSourceIds.length, 1, "Should have 1 source ID initially");
    assertEq(retrievedEdges.length, 1, "Should have 1 edge initially");

    // Create new arrays for updating workflow
    bytes32[] memory newSpellIds = new bytes32[](2);
    newSpellIds[0] = spellId1;
    newSpellIds[1] = spellId2;

    bytes32[] memory newSourceIds = new bytes32[](2);
    newSourceIds[0] = sourceId1;
    newSourceIds[1] = sourceId2;

    SpellEdge[] memory newEdges = new SpellEdge[](2);
    newEdges[0] = _createSpellEdge(spellId1, spellId2, "new edge 1");
    newEdges[1] = _createSpellEdge(spellId2, spellId1, "new edge 2");

    // Update the workflow again
    vm.prank(creator);
    world.updateShamanWorkflow(shamanId, newSpellIds, newSourceIds, newEdges);

    // Verify updated state
    bytes32[] memory updatedSpellIds = world.getShamanSpellIds(shamanId);
    bytes32[] memory updatedSourceIds = world.getShamanSourceIds(shamanId);
    SpellEdge[] memory updatedEdges = world.getShamanSpellEdges(shamanId);

    assertEq(updatedSpellIds.length, 2, "Should have 2 spell IDs after update");
    assertEq(
      updatedSourceIds.length,
      2,
      "Should have 2 source IDs after update"
    );
    assertEq(updatedEdges.length, 2, "Should have 2 edges after update");

    assertEq(updatedSpellIds[0], spellId1, "First spell ID should match");
    assertEq(updatedSpellIds[1], spellId2, "Second spell ID should match");

    assertEq(updatedSourceIds[0], sourceId1, "First source ID should match");
    assertEq(updatedSourceIds[1], sourceId2, "Second source ID should match");

    assertEq(
      updatedEdges[0].fromSpellId,
      spellId1,
      "First edge fromSpellId should match"
    );
    assertEq(
      updatedEdges[0].toSpellId,
      spellId2,
      "First edge toSpellId should match"
    );
    assertEq(
      updatedEdges[0].metadata,
      "new edge 1",
      "First edge metadata should match"
    );

    assertEq(
      updatedEdges[1].fromSpellId,
      spellId2,
      "Second edge fromSpellId should match"
    );
    assertEq(
      updatedEdges[1].toSpellId,
      spellId1,
      "Second edge toSpellId should match"
    );
    assertEq(
      updatedEdges[1].metadata,
      "new edge 2",
      "Second edge metadata should match"
    );
  }

  function testUpdateShamanWorkflowFailsForNonCreator() public {
    // Create a creator
    address creator = creatorAlice;
    address nonCreator = creatorBob;

    // Create test spells and sources
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creator,
      "SpellNC"
    );
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creator,
      "SourceNC"
    );

    // Create a shaman
    bytes32 shamanId = _createShaman(creator, "TestShaman10", "TestMetadata");

    // Prepare data for updating workflow
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = spellId1;

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    SpellEdge[] memory edges = new SpellEdge[](1);
    edges[0] = _createSpellEdge(spellId1, spellId1, "test edge");

    // Try to update as non-creator, should revert
    vm.prank(nonCreator);
    vm.expectRevert("Not shaman creator");
    world.updateShamanWorkflow(shamanId, spellIds, sourceIds, edges);
  }

  function testMultipleUpdateShamanWorkflow() public {
    // Create a creator
    address creator = creatorAlice;

    // Create test spells with unique names
    bytes32 spellId1 = _createSpell(creator, "SpellMultiT1", "metadata1");
    bytes32 spellId2 = _createSpell(creator, "SpellMultiT2", "metadata2");
    bytes32 spellId3 = _createSpell(creator, "SpellMultiT3", "metadata3");

    // Create test sources with unique names
    bytes32 sourceId1 = _createSource(creator, "SourceMultiT1", "metadata1");
    bytes32 sourceId2 = _createSource(creator, "SourceMultiT2", "metadata2");
    bytes32 sourceId3 = _createSource(creator, "SourceMultiT3", "metadata3");

    // Create a shaman
    bytes32 shamanId = _createShaman(
      creator,
      "TestShamanMulti",
      "TestMetadata"
    );

    // Initialize all counts to zero
    vm.startPrank(signerAddress);
    // Initialize source counts
    Sources.setShamanCount(sourceId1, 0);
    Sources.setShamanCount(sourceId2, 0);
    Sources.setShamanCount(sourceId3, 0);

    // Initialize spell counts
    Spells.setShamanCount(spellId1, 0);
    Spells.setShamanCount(spellId2, 0);
    Spells.setShamanCount(spellId3, 0);

    // Initialize the shaman's counts in Spells and Sources tables
    Sources.setShamanCount(shamanId, 0);
    Spells.setShamanCount(shamanId, 0);
    vm.stopPrank();

    // First update
    {
      bytes32[] memory spellIds = new bytes32[](1);
      spellIds[0] = spellId1;

      bytes32[] memory sourceIds = new bytes32[](1);
      sourceIds[0] = sourceId1;

      SpellEdge[] memory edges = new SpellEdge[](1);
      edges[0] = _createSpellEdge(spellId1, spellId1, "edge 1");

      vm.prank(creator);
      world.updateShamanWorkflow(shamanId, spellIds, sourceIds, edges);
    }

    // Second update
    {
      bytes32[] memory spellIds = new bytes32[](2);
      spellIds[0] = spellId1;
      spellIds[1] = spellId2;

      bytes32[] memory sourceIds = new bytes32[](2);
      sourceIds[0] = sourceId1;
      sourceIds[1] = sourceId2;

      SpellEdge[] memory edges = new SpellEdge[](2);
      edges[0] = _createSpellEdge(spellId1, spellId1, "edge 1-1");
      edges[1] = _createSpellEdge(spellId1, spellId2, "edge 1-2");

      vm.prank(creator);
      world.updateShamanWorkflow(shamanId, spellIds, sourceIds, edges);
    }

    // Third update
    {
      bytes32[] memory spellIds = new bytes32[](3);
      spellIds[0] = spellId1;
      spellIds[1] = spellId2;
      spellIds[2] = spellId3;

      bytes32[] memory sourceIds = new bytes32[](3);
      sourceIds[0] = sourceId1;
      sourceIds[1] = sourceId2;
      sourceIds[2] = sourceId3;

      SpellEdge[] memory edges = new SpellEdge[](3);
      edges[0] = _createSpellEdge(spellId1, spellId2, "edge 1-2");
      edges[1] = _createSpellEdge(spellId2, spellId3, "edge 2-3");
      edges[2] = _createSpellEdge(spellId3, spellId1, "edge 3-1");

      vm.prank(creator);
      world.updateShamanWorkflow(shamanId, spellIds, sourceIds, edges);
    }

    // Verify final state
    bytes32[] memory finalSpellIds = world.getShamanSpellIds(shamanId);
    bytes32[] memory finalSourceIds = world.getShamanSourceIds(shamanId);
    SpellEdge[] memory finalEdges = world.getShamanSpellEdges(shamanId);

    assertEq(finalSpellIds.length, 3, "Should have 3 spell IDs");
    assertEq(finalSourceIds.length, 3, "Should have 3 source IDs");
    assertEq(finalEdges.length, 3, "Should have 3 edges");

    // Check specific values
    assertEq(finalSpellIds[2], spellId3, "Third spell ID should match");
    assertEq(finalSourceIds[2], sourceId3, "Third source ID should match");

    // Check cycle in the edges
    assertEq(
      finalEdges[0].fromSpellId,
      spellId1,
      "Edge 1 from should be spell1"
    );
    assertEq(finalEdges[0].toSpellId, spellId2, "Edge 1 to should be spell2");

    assertEq(
      finalEdges[1].fromSpellId,
      spellId2,
      "Edge 2 from should be spell2"
    );
    assertEq(finalEdges[1].toSpellId, spellId3, "Edge 2 to should be spell3");

    assertEq(
      finalEdges[2].fromSpellId,
      spellId3,
      "Edge 3 from should be spell3"
    );
    assertEq(finalEdges[2].toSpellId, spellId1, "Edge 3 to should be spell1");
  }

  function testUpdateWorkflowRequireSpellsAndSources() public {
    // Create a creator
    address creator = creatorAlice;

    // Create a shaman
    bytes32 shamanId = _createShaman(creator, "TestShaman12", "TestMetadata");

    // Try to update with empty arrays
    bytes32[] memory emptySpellIds = new bytes32[](0);
    bytes32[] memory emptySourceIds = new bytes32[](0);
    SpellEdge[] memory emptyEdges = new SpellEdge[](0);

    vm.prank(creator);
    vm.expectRevert("Spell ids must be provided");
    world.updateShamanWorkflow(
      shamanId,
      emptySpellIds,
      emptySourceIds,
      emptyEdges
    );

    // Create a spell and try with empty sources
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creator,
      "SpellReq"
    );
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = spellId1;

    vm.prank(creator);
    vm.expectRevert("Source ids must be provided");
    world.updateShamanWorkflow(shamanId, spellIds, emptySourceIds, emptyEdges);

    // Create a source and try with empty edges
    (bytes32 sourceId1, bytes32 sourceId2) = _createTestSources(
      creator,
      "SourceReq"
    );
    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    vm.prank(creator);
    vm.expectRevert("Spell edges must be provided");
    world.updateShamanWorkflow(shamanId, spellIds, sourceIds, emptyEdges);
  }
}
