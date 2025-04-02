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

  function _createTestShaman(
    address creator,
    uint256 balance
  ) private returns (bytes32 shamanId) {
    shamanId = _createShaman(creator, "TestShaman", INITIAL_METADATA);

    _prepareTokens(creator, balance);

    // deposit tokens
    vm.prank(creator);
    world.depositShamanBalance(shamanId, balance);
    vm.stopPrank();

    return shamanId;
  }

  function testEnqueueShamanJob() public {
    bytes32 shamanId = _createTestShaman(creatorAlice, INITIAL_BALANCE);

    // Verify initial state
    assertEq(
      uint8(Shamans.getState(shamanId)),
      uint8(JobState.Idle),
      "Initial state should be Idle"
    );

    _setOperator(creatorAlice);
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
    bytes32 shamanId = _createTestShaman(creatorAlice, INITIAL_BALANCE);

    _setOperator(creatorAlice);
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
    bytes32 shamanId = _createTestShaman(creatorAlice, INITIAL_BALANCE);

    _setOperator(creatorAlice);
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
