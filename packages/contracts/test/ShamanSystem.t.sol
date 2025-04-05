// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Roles } from "../src/codegen/index.sol";
import { JobState, RoleType } from "../src/codegen/common.sol";
import { NewSpellEdge } from "../src/lib/ShamanWorkflowsLib.sol";

contract ShamanSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmShamanTest1";
  string constant UPDATED_METADATA = "QmShamanTest2";
  bytes32 constant SPELL_ID = bytes32(uint256(1));
  bytes32 constant SOURCE_ID = bytes32(uint256(2));
  uint256 constant INITIAL_BALANCE = 1000;

  function testCreateShaman() public {
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = SPELL_ID;

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = SOURCE_ID;

    NewSpellEdge[] memory spellEdges = new NewSpellEdge[](1);
    spellEdges[0] = _createSpellEdge(SPELL_ID, SOURCE_ID);

    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    vm.prank(creatorAlice);
    world.updateShamanWorkflow(shamanId, sourceIds, spellIds, spellEdges);
    vm.stopPrank();

    // Verify shaman state
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.Idle),
      "Shaman state is not idle"
    );
    assertEq(
      Shamans.getCreator(shamanId),
      creatorAlice,
      "Shaman creator is not creatorAlice"
    );
    assertEq(Shamans.getActive(shamanId), true, "Shaman is not active");
    assertEq(Shamans.getBalance(shamanId), 0, "Shaman balance is not 0");
    assertEq(
      Shamans.lengthShamanSpellIds(shamanId),
      1,
      "Shaman spellIds length is not 1"
    );
    assertEq(
      Shamans.lengthShamanSourceIds(shamanId),
      1,
      "Shaman sourceIds length is not 1"
    );
    assertEq(
      Shamans.getMetadata(shamanId),
      INITIAL_METADATA,
      "Shaman metadata is not INITIAL_METADATA"
    );
  }

  function testCreateShamanWithoutBalance() public {
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = SPELL_ID;

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = SOURCE_ID;

    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    // Verify shaman state
    assertEq(Shamans.getBalance(shamanId), 0);
  }

  function testCreateShamanWithoutSpells() public {
    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = SOURCE_ID;

    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    // Verify shaman state
    assertEq(Shamans.lengthShamanSpellIds(shamanId), 0);
  }

  function testCreateShamanWithoutSources() public {
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = SPELL_ID;

    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    // Verify shaman state
    assertEq(Shamans.lengthShamanSourceIds(shamanId), 0);
  }

  function testUpdateShamanMetadata() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
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
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
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
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
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
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
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
    bytes32 shamanId = _createShaman(
      creatorAlice,
      "TestShaman",
      INITIAL_METADATA
    );

    // Verify shaman state
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.Idle),
      "Shaman state is not idle"
    );
    assertEq(
      Shamans.getCreator(shamanId),
      creatorAlice,
      "Shaman creator is not creatorAlice"
    );
    assertEq(Shamans.getActive(shamanId), true, "Shaman is not active");
    assertEq(Shamans.getBalance(shamanId), 0, "Shaman balance is not 0");
    assertEq(
      Shamans.lengthShamanSpellIds(shamanId),
      0,
      "Shaman spellIds length is not 0"
    );
    assertEq(
      Shamans.lengthShamanSourceIds(shamanId),
      0,
      "Shaman sourceIds length is not 0"
    );
    assertEq(Shamans.getMetadata(shamanId), INITIAL_METADATA);

    // set shaman to inactive
    vm.prank(creatorAlice);
    world.updateShamanStatus(shamanId, false);
    vm.stopPrank();

    // verify shaman is inactive
    assertEq(Shamans.getActive(shamanId), false);

    // reactivate shaman
    vm.prank(creatorAlice);
    world.updateShamanStatus(shamanId, true);
    vm.stopPrank();

    // verify shaman is active
    assertEq(Shamans.getActive(shamanId), true);
  }
}
