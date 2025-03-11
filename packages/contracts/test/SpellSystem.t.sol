// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Spells, SpellVersions } from "../src/codegen/index.sol";
import { RoleType } from "../src/codegen/common.sol";

contract SpellSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmSpellTest1";
  string constant UPDATED_METADATA = "QmSpellTest2";

  function testCreateSpell() public {
    string memory spellName = "TestSpell";
    
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.createSpell(spellName, INITIAL_METADATA);
    vm.stopPrank();

    // Get the spell ID from the logs
    bytes32 spellId;
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == keccak256("SpellCreated(bytes32,address)")) {
        spellId = bytes32(entries[i].topics[1]);
        break;
      }
    }

    require(spellId != bytes32(0), "Spell creation failed");

    // Verify the spell was created correctly
    assertEq(Spells.getCreator(spellId), creatorAlice, "Creator not set correctly");
    assertEq(Spells.getName(spellId), spellName, "Name not set correctly");
    assertEq(Spells.getMetadata(spellId), INITIAL_METADATA, "Metadata not set correctly");
    assertEq(Spells.getVersion(spellId), 1, "Version should be 1");
    
    // Verify the version was recorded
    assertEq(SpellVersions.getMetadata(spellId, 1), INITIAL_METADATA, "Version metadata not set correctly");
  }

  function testUpdateSpell() public {
    string memory spellName = "TestSpell";
    
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.createSpell(spellName, INITIAL_METADATA);
    vm.stopPrank();

    // Get the spell ID from the logs
    bytes32 spellId;
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == keccak256("SpellCreated(bytes32,address)")) {
        spellId = bytes32(entries[i].topics[1]);
        break;
      }
    }

    require(spellId != bytes32(0), "Spell creation failed");
    
    // Update the spell
    vm.prank(creatorAlice);
    world.updateSpellMetadata(spellId, UPDATED_METADATA);
    vm.stopPrank();
    
    // Verify the update
    assertEq(Spells.getMetadata(spellId), UPDATED_METADATA, "Metadata should be updated");
    assertEq(Spells.getVersion(spellId), 2, "Version should be 2");
    
    // Verify both versions are stored
    assertEq(SpellVersions.getMetadata(spellId, 1), INITIAL_METADATA, "Version 1 metadata not correct");
    assertEq(SpellVersions.getMetadata(spellId, 2), UPDATED_METADATA, "Version 2 metadata not correct");
  }

  function testUpdateSpellNotCreator() public {
    string memory spellName = "TestSpell";
    
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.createSpell(spellName, INITIAL_METADATA);
    vm.stopPrank();

    // Get the spell ID from the logs
    bytes32 spellId;
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == keccak256("SpellCreated(bytes32,address)")) {
        spellId = bytes32(entries[i].topics[1]);
        break;
      }
    }

    require(spellId != bytes32(0), "Spell creation failed");
    
    // Try to update the spell as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not spell creator");
    world.updateSpellMetadata(spellId, UPDATED_METADATA);
    vm.stopPrank();
    
    // Verify the metadata and version didn't change
    assertEq(Spells.getMetadata(spellId), INITIAL_METADATA, "Metadata should not be updated");
    assertEq(Spells.getVersion(spellId), 1, "Version should still be 1");
  }

  function testGetSpellVersion() public {
    string memory spellName = "TestSpell";
    
    vm.recordLogs();
    vm.prank(creatorAlice);
    world.createSpell(spellName, INITIAL_METADATA);
    vm.stopPrank();

    // Get the spell ID from the logs
    bytes32 spellId;
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == keccak256("SpellCreated(bytes32,address)")) {
        spellId = bytes32(entries[i].topics[1]);
        break;
      }
    }

    require(spellId != bytes32(0), "Spell creation failed");
    
    // Update the spell to create version 2
    vm.prank(creatorAlice);
    world.updateSpellMetadata(spellId, UPDATED_METADATA);
    vm.stopPrank();
    
    // Check the metadata for each version
    string memory v1Metadata = world.getSpellVersionMetadata(spellId, 1);
    string memory v2Metadata = world.getSpellVersionMetadata(spellId, 2);
    
    assertEq(v1Metadata, INITIAL_METADATA, "Version 1 metadata not retrieved correctly");
    assertEq(v2Metadata, UPDATED_METADATA, "Version 2 metadata not retrieved correctly");
  }
}