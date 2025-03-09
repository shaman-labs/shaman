// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Spells, Sources, Roles, ShamanSpell, ShamanSource, SpellVersions } from "../src/codegen/index.sol";
import { ShamanState, RoleType } from "../src/codegen/common.sol";

contract ShamanEntitiesSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmShamanTest1";

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

  function _createTestSpells(
    address creator,
    string memory suffix
  ) internal returns (bytes32, bytes32) {
    vm.recordLogs();

    // Use single-character names to avoid "Spell name too long" error
    string memory name1 = string(abi.encodePacked("A", suffix));
    bytes32 spellId1 = _createSpell(creator, name1, "QmTest1");

    // simulate sleep to avoid same spellId
    vm.warp(block.timestamp + 5 seconds);

    string memory name2 = string(abi.encodePacked("B", suffix));
    bytes32 spellId2 = _createSpell(creator, name2, "QmTest2");

    return (spellId1, spellId2);
  }

  function _createTestSpells(
    address creator
  ) private returns (bytes32 spellId1, bytes32 spellId2) {
    return _createTestSpells(creator, "");
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

  function _createTestShaman(
    address creator,
    bytes32[] memory spellIds,
    bytes32[] memory sourceIds
  ) private returns (bytes32 shamanId) {
    _prepareTokens(creator, INITIAL_BALANCE);

    vm.recordLogs();
    vm.prank(creator);
    world.createShaman(
      INITIAL_BALANCE,
      "TestShaman",
      spellIds,
      sourceIds,
      INITIAL_METADATA
    );
    vm.stopPrank();

    // Get the shaman ID from the logs
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == keccak256("ShamanCreated(bytes32,address)")) {
        shamanId = bytes32(entries[i].topics[1]);
        break;
      }
    }

    require(shamanId != bytes32(0), "Shaman creation failed");

    // Verify the shaman was created correctly
    assertEq(
      Shamans.getCreator(shamanId),
      creator,
      "Creator not set correctly"
    );
    assertEq(
      Shamans.getBalance(shamanId),
      INITIAL_BALANCE,
      "Balance not set correctly"
    );
    assertEq(
      Shamans.getMetadata(shamanId),
      INITIAL_METADATA,
      "Metadata not set correctly"
    );

    return shamanId;
  }

  function testAddSpell() public {
    _setupOperator(creatorAlice);
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creatorAlice,
      "AddTest1"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "AddTest1");

    // Create a shaman with no spells initially
    bytes32[] memory initialSpellIds = new bytes32[](0);

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialSpellIds,
      sourceIds
    );

    // Verify initial state
    assertEq(Shamans.getSpellCount(shamanId), 0);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1), 0);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2), 0);

    // Add first spell to the shaman
    vm.prank(creatorAlice);
    world.addSpellToShaman(shamanId, spellId1);
    vm.stopPrank();

    // Verify the first spell was added
    assertEq(Shamans.getSpellCount(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2), 0);

    // Add second spell to the shaman
    vm.prank(creatorAlice);
    world.addSpellToShaman(shamanId, spellId2);
    vm.stopPrank();

    // Verify the second spell was added
    assertEq(Shamans.getSpellCount(shamanId), 2);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2) > 0, true);
  }

  function testAddSpellNotCreator() public {
    _setupOperator(creatorAlice);
    (bytes32 spellId1, bytes32 spellId2) = _createTestSpells(
      creatorAlice,
      "AddTest3"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "AddTest3");

    // Create a shaman with no spells initially
    bytes32[] memory initialSpellIds = new bytes32[](0);

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialSpellIds,
      sourceIds
    );

    // Add first spell to the shaman
    vm.prank(creatorAlice);
    world.addSpellToShaman(shamanId, spellId1);
    vm.stopPrank();

    // Verify the first spell was added
    assertEq(Shamans.getSpellCount(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);

    // Try to add a spell as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.addSpellToShaman(shamanId, spellId2);
    vm.stopPrank();

    // Verify the spell was not added
    assertEq(Shamans.getSpellCount(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2), 0);
  }

  function testAddSpellAlreadyExists() public {
    _setupOperator(creatorAlice);
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
    assertEq(Shamans.getSpellCount(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);

    // Try to add the same spell again
    vm.prank(creatorAlice);
    vm.expectRevert("Spell already exists in shaman");
    world.addSpellToShaman(shamanId, spellId1);
    vm.stopPrank();

    // Verify the spell count is still 1
    assertEq(Shamans.getSpellCount(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
  }

  function testRemoveSpell() public {
    _setupOperator(creatorAlice);
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
    assertEq(Shamans.getSpellCount(shamanId), 2);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1) > 0, true);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2) > 0, true);

    // Remove first spell from the shaman
    vm.prank(creatorAlice);
    world.removeSpellFromShaman(shamanId, spellId1);
    vm.stopPrank();

    // Verify the first spell was removed
    assertEq(Shamans.getSpellCount(shamanId), 1);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1), 0);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2) > 0, true);

    // Remove second spell from the shaman
    vm.prank(creatorAlice);
    world.removeSpellFromShaman(shamanId, spellId2);
    vm.stopPrank();

    // Verify the second spell was removed
    assertEq(Shamans.getSpellCount(shamanId), 0);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId1), 0);
    assertEq(ShamanSpell.getCreatedAt(shamanId, spellId2), 0);
  }
}
