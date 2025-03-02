// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Shamans } from "../codegen/index.sol";
import { ShamanState, LogType, RoleType } from "../codegen/common.sol";
import { ShamanLogsLib } from "../lib/ShamanLogsLib.sol";
import { BaseSystem } from "./BaseSystem.sol";

contract ShamanJobsSystem is BaseSystem {
  function enqueueShamanJob(
    bytes32 shamanId,
    uint256 cost
  ) public onlyOperator onlyActiveShaman(shamanId) onlyIdleShaman(shamanId) {
    require(
      Shamans.getBalance(shamanId) >= cost,
      "Shaman has insufficient balance"
    );

    require(
      _token().balanceOf(address(this)) >= cost,
      "Operator has insufficient balance"
    );

    Shamans.setState(shamanId, ShamanState.Queue);
    ShamanLogsLib.logOperation(shamanId, 0, true, LogType.Queue, "");
  }

  function startShamanJob(
    bytes32 shamanId
  ) public onlyOperator onlyActiveShaman(shamanId) {
    require(
      Shamans.getState(shamanId) == ShamanState.Queue,
      "Shaman must be queued"
    );

    Shamans.setState(shamanId, ShamanState.InProgress);
    ShamanLogsLib.logOperation(shamanId, 0, true, LogType.Start, "");
  }

  function completeShamanJob(
    bytes32 shamanId,
    uint256 cost,
    bool success,
    string memory metadata
  ) public onlyOperator onlyActiveShaman(shamanId) {
    require(
      Shamans.getState(shamanId) == ShamanState.InProgress,
      "Shaman must be in progress"
    );
    require(
      Shamans.getBalance(shamanId) >= cost,
      "Shaman has insufficient balance"
    );

    require(
      _token().balanceOf(address(this)) >= cost,
      "Operator has insufficient balance"
    );

    Shamans.setState(shamanId, ShamanState.Idle);
    Shamans.setBalance(shamanId, Shamans.getBalance(shamanId) - cost);

    ShamanLogsLib.logOperation(
      shamanId,
      cost,
      success,
      LogType.Completion,
      metadata
    );

    _token().burn(cost);
  }
}
