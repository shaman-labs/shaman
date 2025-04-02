// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Shamans } from "../codegen/index.sol";
import { JobState, LogType, RoleType } from "../codegen/common.sol";
import { ShamanLogsLib } from "../lib/ShamanLogsLib.sol";
import { BaseSystem } from "./BaseSystem.sol";

contract ShamanJobsSystem is BaseSystem {
  function enqueueShamanJob(
    bytes32 shamanId
  ) public onlyOperator onlyActiveShaman(shamanId) onlyIdleShaman(shamanId) {
    Shamans.setState(shamanId, JobState.Queue);
    ShamanLogsLib.logOperation(shamanId, 0, 0, true, LogType.Queue, "");
  }

  function cancelShamanJob(
    bytes32 shamanId
  ) public onlyOperator onlyActiveShaman(shamanId) {
    Shamans.setState(shamanId, JobState.Idle);
  }

  function startShamanJob(
    bytes32 shamanId
  ) public onlyOperator onlyActiveShaman(shamanId) {
    require(
      Shamans.getState(shamanId) == JobState.Queue,
      "Shaman must be queued"
    );

    Shamans.setState(shamanId, JobState.InProgress);
    ShamanLogsLib.logOperation(shamanId, 0, 0, true, LogType.Start, "");
  }

  function completeShamanJob(
    bytes32 shamanId,
    bool success,
    string memory metadata
  ) public onlyOperator onlyActiveShaman(shamanId) {
    require(
      Shamans.getState(shamanId) == JobState.InProgress,
      "Shaman must be in progress"
    );

    Shamans.setState(shamanId, JobState.Idle);

    ShamanLogsLib.logOperation(
      shamanId,
      0,
      0,
      success,
      LogType.Completion,
      metadata
    );
  }
}
