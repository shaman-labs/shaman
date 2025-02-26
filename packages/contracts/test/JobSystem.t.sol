// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Vm.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Job, Roles, ShamanLogs } from "../src/codegen/index.sol";
import { JobState, RoleType, LogType } from "../src/codegen/common.sol";

contract JobSystemTest is BaseTest {
  string constant SHAMAN_METADATA = "QmTest1";
  string constant LOG_METADATA = "QmTestLog1";
  uint256 constant JOB_COST = 10;

  function testEnqueueJob() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);

    // Get the job ID from the emitted event
    bytes32 jobId = _getLastJobId();
    vm.stopPrank();

    // Verify job was created
    assertEq(Job.getShamanId(jobId), shamanId);
    assertEq(uint256(Job.getState(jobId)), uint256(JobState.Pending));
    assertEq(Job.getCreatedAt(jobId), block.timestamp);
  }

  function testEnqueueJobInactiveShaman() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Deactivate the shaman
    vm.prank(creatorAlice);
    world.cancelShaman(shamanId);

    // Try to enqueue a job for inactive shaman
    vm.prank(signerAddress);
    vm.expectRevert("Shaman is not active");
    world.enqueueJob(shamanId, JOB_COST);
  }

  function testEnqueueJobInsufficientBalance() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 5, SHAMAN_METADATA); // Only 5 tokens

    // Try to enqueue a job with cost higher than balance
    vm.prank(signerAddress);
    vm.expectRevert("Insufficient balance for execution");
    world.enqueueJob(shamanId, 10); // Cost is 10
  }

  function testOnlyOperatorCanEnqueueJob() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Non-operator tries to enqueue a job
    vm.prank(creatorBob);
    vm.expectRevert("Not operator");
    world.enqueueJob(shamanId, JOB_COST);
  }

  function testStartJob() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);
    bytes32 jobId = _getLastJobId();

    // Operator starts the job
    world.startJob(jobId);
    vm.stopPrank();

    // Verify job state was updated
    assertEq(uint256(Job.getState(jobId)), uint256(JobState.InProgress));
  }

  function testStartJobNotPending() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);
    bytes32 jobId = _getLastJobId();

    // Start the job
    world.startJob(jobId);

    // Try to start the job again
    vm.expectRevert("Job is not in pending state");
    world.startJob(jobId);
    vm.stopPrank();
  }

  function testStartJobInactiveShaman() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);
    bytes32 jobId = _getLastJobId();
    vm.stopPrank();

    // Deactivate the shaman
    vm.prank(creatorAlice);
    world.cancelShaman(shamanId);

    // Try to start the job
    vm.prank(signerAddress);
    vm.expectRevert("Shaman is not active");
    world.startJob(jobId);
  }

  function testOnlyOperatorCanStartJob() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);
    bytes32 jobId = _getLastJobId();
    vm.stopPrank();

    // Non-operator tries to start the job
    vm.prank(creatorBob);
    vm.expectRevert("Not operator");
    world.startJob(jobId);
  }

  function testCompleteJob() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues and starts a job
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);
    bytes32 jobId = _getLastJobId();
    world.startJob(jobId);

    // Complete the job
    world.completeJob(jobId, true, LOG_METADATA);
    vm.stopPrank();

    // Verify job was completed
    assertEq(uint256(Job.getState(jobId)), uint256(JobState.Completed));

    // Verify the operation was logged
    bytes32 logId = keccak256(
      abi.encodePacked(shamanId, block.timestamp, block.prevrandao)
    );
    assertEq(ShamanLogs.getShamanId(logId), shamanId);
    assertEq(
      uint256(ShamanLogs.getLogType(logId)),
      uint256(LogType.Completion)
    );
    assertEq(ShamanLogs.getAmount(logId), 0);
    assertEq(ShamanLogs.getSuccess(logId), true);
    assertEq(ShamanLogs.getLogMetadata(logId), LOG_METADATA);
  }

  function testCompleteJobWithFailure() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues and starts a job
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);
    bytes32 jobId = _getLastJobId();
    world.startJob(jobId);

    // Complete the job with failure
    world.completeJob(jobId, false, LOG_METADATA);
    vm.stopPrank();

    // Verify job was completed (even though execution failed)
    assertEq(uint256(Job.getState(jobId)), uint256(JobState.Completed));

    // Verify the operation was logged with failure
    bytes32 logId = keccak256(
      abi.encodePacked(shamanId, block.timestamp, block.prevrandao)
    );
    assertEq(ShamanLogs.getShamanId(logId), shamanId);
    assertEq(
      uint256(ShamanLogs.getLogType(logId)),
      uint256(LogType.Completion)
    );
    assertEq(ShamanLogs.getAmount(logId), 0);
    assertEq(ShamanLogs.getSuccess(logId), false);
    assertEq(ShamanLogs.getLogMetadata(logId), LOG_METADATA);
  }

  function testCompleteJobNotInProgress() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job but doesn't start it
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);
    bytes32 jobId = _getLastJobId();
    vm.stopPrank();

    // Try to complete the job
    vm.prank(signerAddress);
    vm.expectRevert("Job is not in progress");
    world.completeJob(jobId, true, LOG_METADATA);
  }

  function testCompleteJobWithEmptyMetadata() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues and starts a job
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);
    bytes32 jobId = _getLastJobId();
    world.startJob(jobId);

    // Try to complete the job with empty metadata
    vm.expectRevert("Log metadata cannot be empty");
    world.completeJob(jobId, true, "");
    vm.stopPrank();
  }

  function testOnlyOperatorCanCompleteJob() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues and starts a job
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);
    bytes32 jobId = _getLastJobId();
    world.startJob(jobId);
    vm.stopPrank();

    // Non-operator tries to complete the job
    vm.prank(creatorBob);
    vm.expectRevert("Not operator");
    world.completeJob(jobId, true, LOG_METADATA);
  }

  function testGetJobState() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);
    bytes32 jobId = _getLastJobId();

    // Check initial state
    assertEq(uint256(world.getJobState(jobId)), uint256(JobState.Pending));

    // Start the job
    world.startJob(jobId);

    // Check updated state
    assertEq(uint256(world.getJobState(jobId)), uint256(JobState.InProgress));

    // Complete the job
    world.completeJob(jobId, true, LOG_METADATA);

    // Check final state
    assertEq(uint256(world.getJobState(jobId)), uint256(JobState.Completed));
    vm.stopPrank();
  }

  function testGetJobShamanId() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.startPrank(signerAddress);
    world.enqueueJob(shamanId, JOB_COST);
    bytes32 jobId = _getLastJobId();
    vm.stopPrank();

    // Check that the job is associated with the correct shaman
    assertEq(world.getJobShamanId(jobId), shamanId);
  }

  // Helper function to get the last job ID from emitted events
  function _getLastJobId() internal returns (bytes32) {
    Vm.Log[] memory entries = vm.getRecordedLogs();
    bytes32 jobId;

    // Look for the JobEnqueued event
    bytes32 eventSignature = keccak256("JobEnqueued(bytes32,bytes32)");

    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == eventSignature) {
        // The first indexed parameter (jobId) is in topics[1]
        jobId = bytes32(entries[i].topics[1]);
        break;
      }
    }

    // Make sure we found a valid jobId
    require(jobId != bytes32(0), "Job creation failed");
    return jobId;
  }
}
