// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { Shamans, Job, ShamanLogs, Roles } from "../codegen/index.sol";
import { JobState, LogType, RoleType } from "../codegen/common.sol";
import { ShamanLogsLib } from "../lib/ShamanLogsLib.sol";

contract JobSystem is BaseSystem {
  event JobEnqueued(bytes32 indexed jobId, bytes32 indexed shamanId);

  function enqueueJob(bytes32 shamanId, uint256 cost) public onlyOperator {
    require(Shamans.getActive(shamanId), "Shaman is not active");
    require(
      Shamans.getBalance(shamanId) >= cost,
      "Insufficient balance for execution"
    );
    require(
      _token().balanceOf(address(this)) >= cost,
      "Insufficient balance for execution"
    );

    bytes32 jobId = keccak256(
      abi.encodePacked(shamanId, block.timestamp, block.prevrandao)
    );

    Job.setShamanId(jobId, shamanId);
    Job.setState(jobId, JobState.Pending);
    Job.setCreatedAt(jobId, block.timestamp);

    ShamanLogsLib.logOperation(shamanId, cost, true, LogType.Queue, "");

    // burn ZUG tokens
    _token().burn(cost);

    emit JobEnqueued(jobId, shamanId);
  }

  function startJob(bytes32 jobId) public onlyOperator {
    bytes32 shamanId = Job.getShamanId(jobId);

    require(
      Job.getState(jobId) == JobState.Pending,
      "Job is not in pending state"
    );
    require(Shamans.getActive(shamanId), "Shaman is not active");

    ShamanLogsLib.logOperation(shamanId, 0, true, LogType.Start, "");

    Job.setState(jobId, JobState.InProgress);
  }

  function completeJob(
    bytes32 jobId,
    bool success,
    string memory logMetadata
  ) public onlyOperator {
    bytes32 shamanId = Job.getShamanId(jobId);

    require(
      Job.getState(jobId) == JobState.InProgress,
      "Job is not in progress"
    );

    Job.setState(jobId, JobState.Completed);

    ShamanLogsLib.logOperation(
      shamanId,
      0,
      success,
      LogType.Completion,
      logMetadata
    );
  }

  function getJobState(bytes32 jobId) public view returns (JobState) {
    return Job.getState(jobId);
  }

  function getJobShamanId(bytes32 jobId) public view returns (bytes32) {
    return Job.getShamanId(jobId);
  }
}
