// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Vm.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Job, Roles } from "../src/codegen/index.sol";
import { JobState, RoleType } from "../src/codegen/common.sol";

contract JobSystemTest is BaseTest {
  string constant SHAMAN_METADATA = "QmTest1";
  string constant LOG_METADATA = "QmTestLog1";

  function setUp() public override {
    super.setUp();
  }

  function testEnqueueJob() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.prank(signerAddress);
    bytes32 jobId = world.enqueueJob(shamanId);

    // Verify job was created
    assertEq(Job.getShamanId(jobId), shamanId);
    assertEq(uint256(Job.getState(jobId)), uint256(JobState.Pending));
    assertEq(Job.getCreatedAt(jobId), block.timestamp);
  }

  function testClaimJob() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.prank(signerAddress);
    bytes32 jobId = world.enqueueJob(shamanId);

    // Operator claims the job
    vm.prank(signerAddress);
    bool claimed = world.claimJob(jobId);

    // Verify claim was successful
    assertTrue(claimed);
    assertEq(uint256(Job.getState(jobId)), uint256(JobState.InProgress));
  }

  function testCompleteJob() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.prank(signerAddress);
    bytes32 jobId = world.enqueueJob(shamanId);

    // Operator claims and completes the job
    vm.startPrank(signerAddress);
    world.claimJob(jobId);

    // Get balance before completion
    uint256 balanceBefore = Shamans.getBalance(shamanId);

    // Complete the job
    world.completeJob(jobId, true, LOG_METADATA);
    vm.stopPrank();

    // Verify job was completed
    assertEq(uint256(Job.getState(jobId)), uint256(JobState.Completed));

    // Verify balance was decremented
    assertEq(Shamans.getBalance(shamanId), balanceBefore - 1);
  }

  function testCompleteJobWithFailure() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.prank(signerAddress);
    bytes32 jobId = world.enqueueJob(shamanId);

    // Operator claims and completes the job with failure
    vm.startPrank(signerAddress);
    world.claimJob(jobId);

    // Get balance before completion
    uint256 balanceBefore = Shamans.getBalance(shamanId);

    // Complete the job with failure
    world.completeJob(jobId, false, LOG_METADATA);
    vm.stopPrank();

    // Verify job was completed (even though execution failed)
    assertEq(uint256(Job.getState(jobId)), uint256(JobState.Completed));

    // Verify balance was still decremented
    assertEq(Shamans.getBalance(shamanId), balanceBefore - 1);
  }

  function testOnlyOperatorCanClaimJob() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.prank(signerAddress);
    bytes32 jobId = world.enqueueJob(shamanId);

    // Non-operator tries to claim the job
    vm.prank(creatorBob);
    vm.expectRevert("Not operator");
    world.claimJob(jobId);
  }

  function testOnlyOperatorCanCompleteJob() public {
    // Setup
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);
    bytes32 shamanId = _createShaman(creatorAlice, 100, SHAMAN_METADATA);

    // Operator enqueues a job
    vm.prank(signerAddress);
    bytes32 jobId = world.enqueueJob(shamanId);

    // Operator claims the job
    vm.prank(signerAddress);
    world.claimJob(jobId);

    // Non-operator tries to complete the job
    vm.prank(creatorBob);
    vm.expectRevert("Not operator");
    world.completeJob(jobId, true, LOG_METADATA);
  }

  // Helper function to create a shaman
  function _createShaman(
    address creator,
    uint256 initialDeposit,
    string memory metadata
  ) internal override returns (bytes32) {
    vm.recordLogs();

    vm.prank(creator);
    world.createShaman(initialDeposit, metadata);
    vm.stopPrank();

    // Get logs and find the ShamanCreated event
    Vm.Log[] memory entries = vm.getRecordedLogs();
    bytes32 newShamanId;
    for (uint256 i = 0; i < entries.length; i++) {
      // Check if this is our event
      if (entries[i].topics[0] == keccak256("ShamanCreated(bytes32,address)")) {
        // For indexed parameters, they appear in topics
        // topics[0] is the event signature
        // topics[1] is the first indexed parameter (shamanId)
        newShamanId = bytes32(entries[i].topics[1]);
        break;
      }
    }
    require(newShamanId != bytes32(0), "Shaman creation failed");
    return newShamanId;
  }

  // Helper function to increase allowance
  function _increaseAllowance(address owner, uint256 amount) internal override {
    vm.prank(owner);
    token.approve(address(world), amount);
  }
}
