// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Roles } from "../src/codegen/index.sol";
import { ShamanState, RoleType } from "../src/codegen/common.sol";

contract ShamanSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmShamanTest1";
  string constant UPDATED_METADATA = "QmShamanTest2";
  bytes32 constant SPELL_ID = bytes32(uint256(1));
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

  function _createShaman(
    address creator,
    uint256 balance,
    bytes32[] memory spellIds,
    bytes32[] memory sourceIds,
    string memory metadata
  ) private returns (bytes32 shamanId) {
    vm.recordLogs();
    vm.prank(creator);
    world.createShaman(balance, "TestShaman", spellIds, sourceIds, metadata);
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
  }

  function testCreateShaman() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);

    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = SPELL_ID;

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = SOURCE_ID;

    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_BALANCE,
      spellIds,
      sourceIds,
      INITIAL_METADATA
    );

    // Verify shaman state
    assertEq(uint8(Shamans.getState(shamanId)), uint8(ShamanState.Idle));
    assertEq(Shamans.getCreator(shamanId), creatorAlice);
    assertEq(Shamans.getActive(shamanId), true);
    assertEq(Shamans.getBalance(shamanId), INITIAL_BALANCE);
    assertEq(Shamans.getSpellCount(shamanId), 1);
    assertEq(Shamans.getSourceCount(shamanId), 1);
    assertEq(Shamans.getMetadata(shamanId), INITIAL_METADATA);
  }

  function testCreateShamanWithoutBalance() public {
    _setupOperator(creatorAlice);

    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = SPELL_ID;

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = SOURCE_ID;

    bytes32 shamanId = _createShaman(
      creatorAlice,
      0,
      spellIds,
      sourceIds,
      INITIAL_METADATA
    );

    // Verify shaman state
    assertEq(Shamans.getBalance(shamanId), 0);
  }

  function testCreateShamanWithoutSpells() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);

    bytes32[] memory spellIds = new bytes32[](0);

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = SOURCE_ID;

    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_BALANCE,
      spellIds,
      sourceIds,
      INITIAL_METADATA
    );

    // Verify shaman state
    assertEq(Shamans.getSpellCount(shamanId), 0);
  }

  function testCreateShamanWithoutSources() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);

    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = SPELL_ID;

    bytes32[] memory sourceIds = new bytes32[](0);

    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_BALANCE,
      spellIds,
      sourceIds,
      INITIAL_METADATA
    );

    // Verify shaman state
    assertEq(Shamans.getSourceCount(shamanId), 0);
  }

  function testUpdateShamanMetadata() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);

    bytes32[] memory spellIds = new bytes32[](0);

    bytes32[] memory sourceIds = new bytes32[](0);

    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_BALANCE,
      spellIds,
      sourceIds,
      INITIAL_METADATA
    );

    // Update metadata
    vm.prank(creatorAlice);
    world.updateShamanMetadata(shamanId, UPDATED_METADATA);
    vm.stopPrank();

    // Verify metadata was updated
    assertEq(Shamans.getMetadata(shamanId), UPDATED_METADATA);
  }

  function testUpdateShamanMetadataNotCreator() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);

    bytes32[] memory spellIds = new bytes32[](0);

    bytes32[] memory sourceIds = new bytes32[](0);

    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_BALANCE,
      spellIds,
      sourceIds,
      INITIAL_METADATA
    );

    // Try to update metadata as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.updateShamanMetadata(shamanId, UPDATED_METADATA);
    vm.stopPrank();

    // Verify metadata was not updated
    assertEq(Shamans.getMetadata(shamanId), INITIAL_METADATA);
  }

  function testUpdateShamanMetadataEmptyMetadata() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);

    bytes32[] memory spellIds = new bytes32[](0);

    bytes32[] memory sourceIds = new bytes32[](0);

    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_BALANCE,
      spellIds,
      sourceIds,
      INITIAL_METADATA
    );

    // Try to update metadata with empty string
    vm.prank(creatorAlice);
    vm.expectRevert("Metadata cannot be empty");
    world.updateShamanMetadata(shamanId, "");
    vm.stopPrank();

    // Verify metadata was not updated
    assertEq(Shamans.getMetadata(shamanId), INITIAL_METADATA);
  }

  function testUpdateShamanStatus() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);

    bytes32[] memory abilityIds = new bytes32[](0);
    bytes32[] memory sourceIds = new bytes32[](0);

    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_BALANCE,
      abilityIds,
      sourceIds,
      INITIAL_METADATA
    );

    // Update status to inactive
    vm.prank(creatorAlice);
    world.updateShamanStatus(shamanId, false);
    vm.stopPrank();

    // Verify status was updated
    assertEq(Shamans.getActive(shamanId), false);

    // Update status back to active
    vm.prank(creatorAlice);
    world.updateShamanStatus(shamanId, true);
    vm.stopPrank();

    // Verify status was updated
    assertEq(Shamans.getActive(shamanId), true);
  }

  function testReactivateShaman() public {
    _setupOperator(creatorAlice);
    _prepareTokens(creatorAlice, INITIAL_BALANCE);

    bytes32[] memory spellIds = new bytes32[](0);

    bytes32[] memory sourceIds = new bytes32[](0);

    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_BALANCE,
      spellIds,
      sourceIds,
      INITIAL_METADATA
    );

    // Verify shaman state
    assertEq(uint8(Shamans.getState(shamanId)), uint8(ShamanState.Idle));
    assertEq(Shamans.getCreator(shamanId), creatorAlice);
    assertEq(Shamans.getActive(shamanId), true);
    assertEq(Shamans.getBalance(shamanId), INITIAL_BALANCE);
    assertEq(Shamans.getSpellCount(shamanId), 0);
    assertEq(Shamans.getSourceCount(shamanId), 0);
    assertEq(Shamans.getMetadata(shamanId), INITIAL_METADATA);
  }
}
