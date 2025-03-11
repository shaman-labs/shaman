// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Roles } from "../src/codegen/index.sol";
import { JobState, RoleType, LogType } from "../src/codegen/common.sol";

contract ShamanJobsSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmShamanTest1";
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

    // Verify the shaman was created correctly
    assertEq(
      Shamans.getCreator(shamanId),
      creator,
      "Creator not set correctly"
    );
    assertEq(
      Shamans.getBalance(shamanId),
      balance,
      "Balance not set correctly"
    );
    assertEq(
      Shamans.getMetadata(shamanId),
      INITIAL_METADATA,
      "Metadata not set correctly"
    );

    return shamanId;
  }

  function testEnqueueShamanJob() public {
    _setupOperator(creatorAlice);
    bytes32 shamanId = _createTestShaman(creatorAlice, INITIAL_BALANCE);

    // Verify initial state
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.Idle),
      "Initial state should be Idle"
    );

    // Enqueue the shaman
    vm.prank(creatorAlice);
    world.enqueueShamanJob(shamanId);
    vm.stopPrank();

    // Verify the shaman was enqueued
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.Queue),
      "State should be Queue after enqueueing"
    );
  }

  function testStartShamanJob() public {
    _setupOperator(creatorAlice);
    bytes32 shamanId = _createTestShaman(creatorAlice, INITIAL_BALANCE);

    // Enqueue the shaman
    vm.prank(creatorAlice);
    world.enqueueShamanJob(shamanId);
    vm.stopPrank();

    // Start the shaman job
    vm.prank(creatorAlice);
    world.startShamanJob(shamanId);
    vm.stopPrank();

    // Verify the shaman job was started
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.InProgress),
      "State should be InProgress after starting"
    );
  }

  function testCompleteShamanJob() public {
    _setupOperator(creatorAlice);
    bytes32 shamanId = _createTestShaman(creatorAlice, INITIAL_BALANCE);

    // Enqueue the shaman
    vm.prank(creatorAlice);
    world.enqueueShamanJob(shamanId);
    vm.stopPrank();

    // Start the shaman job
    vm.prank(creatorAlice);
    world.startShamanJob(shamanId);
    vm.stopPrank();

    // Complete the shaman job
    vm.prank(creatorAlice);
    world.completeShamanJob(shamanId, true, COMPLETION_METADATA);
    vm.stopPrank();

    // Verify the shaman job was completed
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.Idle),
      "State should be Idle after completion"
    );

    // Verify the balance was updated
    assertEq(
      Shamans.getBalance(shamanId),
      INITIAL_BALANCE,
      "Balance should remain the same"
    );
  }
}
