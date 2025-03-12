// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Shamans, ShamanSpell } from "../codegen/index.sol";
import { JobState, LogType, RoleType } from "../codegen/common.sol";
import { ShamanLogsLib } from "../lib/ShamanLogsLib.sol";
import { BaseSystem } from "./BaseSystem.sol";

contract SpellJobsSystem is BaseSystem {
  function enqueueSpellJob(
    bytes32 shamanId,
    bytes32 spellId,
    uint256 cost
  )
    public
    onlyOperator
    onlyActiveShaman(shamanId)
    onlyInProgressShaman(shamanId)
    onlyIdleSpell(shamanId, spellId)
  {
    require(
      Shamans.getBalance(shamanId) >= cost,
      "Shaman has insufficient balance"
    );

    require(
      _token().balanceOf(address(this)) >= cost,
      "Operator has insufficient balance"
    );

    ShamanSpell.setState(shamanId, spellId, JobState.Queue);
    ShamanLogsLib.logOperation(shamanId, spellId, 0, true, LogType.Queue, "");
  }

  function startSpellJob(
    bytes32 shamanId,
    bytes32 spellId
  )
    public
    onlyOperator
    onlyActiveShaman(shamanId)
    onlyInProgressShaman(shamanId)
  {
    require(
      ShamanSpell.getState(shamanId, spellId) == JobState.Queue,
      "Spell must be queued"
    );

    ShamanSpell.setState(shamanId, spellId, JobState.InProgress);
    ShamanLogsLib.logOperation(shamanId, spellId, 0, true, LogType.Start, "");
  }

  function completeSpellJob(
    bytes32 shamanId,
    bytes32 spellId,
    uint256 cost,
    bool success,
    string memory metadata
  )
    public
    onlyOperator
    onlyActiveShaman(shamanId)
    onlyInProgressShaman(shamanId)
  {
    require(
      ShamanSpell.getState(shamanId, spellId) == JobState.InProgress,
      "Spell must be in progress"
    );
    require(
      Shamans.getBalance(shamanId) >= cost,
      "Shaman has insufficient balance"
    );

    require(
      _token().balanceOf(address(this)) >= cost,
      "Operator has insufficient balance"
    );

    ShamanSpell.setState(shamanId, spellId, JobState.Idle);
    Shamans.setBalance(shamanId, Shamans.getBalance(shamanId) - cost);

    ShamanLogsLib.logOperation(
      shamanId,
      spellId,
      cost,
      success,
      LogType.Completion,
      metadata
    );

    _token().burn(cost);
  }
}
