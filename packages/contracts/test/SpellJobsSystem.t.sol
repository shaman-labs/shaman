// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Spells, ShamanSpell, Roles } from "../src/codegen/index.sol";
import { JobState, RoleType, LogType } from "../src/codegen/common.sol";

contract SpellJobsSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmShamanTest1";
  string constant SPELL_METADATA = "QmSpellTest1";
  string constant COMPLETION_METADATA = "QmCompletionMetadata";

  uint256 constant INITIAL_BALANCE = 1000;
  uint256 constant JOB_COST = 500;

  function _setupOperator(address operator) private {
    vm.prank(signerAddress);
    Roles.setRole(operator, RoleType.Operator);
    vm.stopPrank();
  }

  function _prepareTokens(address user, uint256 amount) private {
    _mintTokens(user, amount);
    _increaseAllowance(user, amount);
  }

  function _createTestShaman(
    address creator,
    uint256 balance
  ) private returns (bytes32 shamanId) {
    _prepareTokens(creator, balance);

    vm.recordLogs();
    vm.prank(creator);
    world.createShaman(
      balance,
      "TestShaman",
      new bytes32[](0),
      new bytes32[](0),
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

    return shamanId;
  }

  function _createTestSpell(
    address creator
  ) private returns (bytes32 spellId) {
    vm.recordLogs();
    vm.prank(creator);
    world.createSpell("TestSpell", SPELL_METADATA);
    vm.stopPrank();

    // Get the spell ID from the logs
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == keccak256("SpellCreated(bytes32,address)")) {
        spellId = bytes32(entries[i].topics[1]);
        break;
      }
    }

    require(spellId != bytes32(0), "Spell creation failed");

    // Verify the spell was created correctly
    assertEq(
      Spells.getCreator(spellId),
      creator,
      "Creator not set correctly"
    );
    assertEq(
      Spells.getMetadata(spellId),
      SPELL_METADATA,
      "Metadata not set correctly"
    );

    return spellId;
  }

  function _createTestShamanWithSpell(
    address creator,
    uint256 balance
  ) private returns (bytes32 shamanId, bytes32 spellId) {
    spellId = _createTestSpell(creator);
    
    bytes32[] memory spellIds = new bytes32[](1);
    spellIds[0] = spellId;
    
    _prepareTokens(creator, balance);

    vm.recordLogs();
    vm.prank(creator);
    world.createShaman(
      balance,
      "TestShaman",
      spellIds,
      new bytes32[](0),
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

    return (shamanId, spellId);
  }

  function testEnqueueSpellJob() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId, bytes32 spellId) = _createTestShamanWithSpell(creatorAlice, INITIAL_BALANCE);

    // Verify initial state
    assertEq(
      uint8(ShamanSpell.getState(shamanId, spellId)),
      uint8(JobState.Idle),
      "Initial spell state should be Idle"
    );

    // First, enqueue the shaman job
    vm.prank(creatorAlice);
    world.enqueueShamanJob(shamanId);
    vm.stopPrank();

    // Start the shaman job to put it into InProgress state
    vm.prank(creatorAlice);
    world.startShamanJob(shamanId);
    vm.stopPrank();

    // Verify the shaman is now in InProgress state
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.InProgress),
      "Shaman should be in InProgress state"
    );

    // Now we can enqueue the spell
    vm.prank(creatorAlice);
    world.enqueueSpellJob(shamanId, spellId, JOB_COST);
    vm.stopPrank();

    // Verify the spell was enqueued
    assertEq(
      uint8(ShamanSpell.getState(shamanId, spellId)),
      uint8(JobState.Queue),
      "Spell state should be Queue after enqueueing"
    );
  }

  function testStartSpellJob() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId, bytes32 spellId) = _createTestShamanWithSpell(creatorAlice, INITIAL_BALANCE);

    // First, enqueue the shaman job
    vm.prank(creatorAlice);
    world.enqueueShamanJob(shamanId);
    vm.stopPrank();

    // Start the shaman job to put it into InProgress state
    vm.prank(creatorAlice);
    world.startShamanJob(shamanId);
    vm.stopPrank();

    // Verify the shaman is now in InProgress state
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.InProgress),
      "Shaman should be in InProgress state"
    );

    // Enqueue the spell
    vm.prank(creatorAlice);
    world.enqueueSpellJob(shamanId, spellId, JOB_COST);
    vm.stopPrank();

    // Start the spell job
    vm.prank(creatorAlice);
    world.startSpellJob(shamanId, spellId);
    vm.stopPrank();

    // Verify the spell job was started
    assertEq(
      uint8(ShamanSpell.getState(shamanId, spellId)),
      uint8(JobState.InProgress),
      "Spell state should be InProgress after starting"
    );
  }

  function testCompleteSpellJob() public {
    _setupOperator(creatorAlice);
    (bytes32 shamanId, bytes32 spellId) = _createTestShamanWithSpell(creatorAlice, INITIAL_BALANCE);

    // 1. Enqueue shaman job first
    vm.prank(creatorAlice);
    world.enqueueShamanJob(shamanId);
    vm.stopPrank();

    // Verify the shaman is in Queue state
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.Queue),
      "Shaman should be in Queue state"
    );

    // 2. Start shaman job
    vm.prank(creatorAlice);
    world.startShamanJob(shamanId);
    vm.stopPrank();

    // Verify the shaman is now in InProgress state
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.InProgress),
      "Shaman should be in InProgress state"
    );

    // 3. Enqueue the spell job
    vm.prank(creatorAlice);
    world.enqueueSpellJob(shamanId, spellId, JOB_COST);
    vm.stopPrank();
    
    // Verify the spell is in Queue state
    assertEq(
      uint8(ShamanSpell.getState(shamanId, spellId)),
      uint8(JobState.Queue),
      "Spell should be in Queue state"
    );

    // 4. Start the spell job
    vm.prank(creatorAlice);
    world.startSpellJob(shamanId, spellId);
    vm.stopPrank();

    // Verify the spell is now in InProgress state
    assertEq(
      uint8(ShamanSpell.getState(shamanId, spellId)),
      uint8(JobState.InProgress),
      "Spell should be in InProgress state"
    );

    // 5. Complete the spell job
    vm.prank(creatorAlice);
    world.completeSpellJob(shamanId, spellId, JOB_COST, true, COMPLETION_METADATA);
    vm.stopPrank();

    // Verify the spell job was completed
    assertEq(
      uint8(ShamanSpell.getState(shamanId, spellId)),
      uint8(JobState.Completed),
      "Spell state should be Completed after completion"
    );

    // Verify the balance was updated
    assertEq(
      Shamans.getBalance(shamanId),
      INITIAL_BALANCE - JOB_COST,
      "Balance should be reduced by job cost"
    );

    // 6. Finally, complete the shaman job
    vm.prank(creatorAlice);
    world.completeShamanJob(shamanId, true, "Shaman job completed");
    vm.stopPrank();

    // Verify the shaman job was completed
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.Idle),
      "Shaman state should be Idle after completion"
    );
  }
} 