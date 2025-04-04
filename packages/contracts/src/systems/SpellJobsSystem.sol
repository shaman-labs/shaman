// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Shamans, ShamanSpells } from "../codegen/index.sol";
import { JobState, LogType, RoleType } from "../codegen/common.sol";
import { ShamanLogsLib } from "../lib/ShamanLogsLib.sol";
import { BaseSystem } from "./BaseSystem.sol";

contract SpellJobsSystem is BaseSystem {
  function enqueueSpellJob(
    bytes32 shamanId,
    bytes32 shamanSpellId,
    uint256 cost
  )
    public
    onlyOperator
    onlyActiveShaman(shamanId)
    onlyInProgressShaman(shamanId)
    onlyIdleSpell(shamanSpellId)
  {
    require(
      Shamans.getBalance(shamanId) >= cost,
      "Shaman has insufficient balance"
    );

    require(
      _token().balanceOf(address(this)) >= cost,
      "Operator has insufficient balance"
    );

    ShamanSpells.setState(shamanSpellId, JobState.Queue);
    ShamanLogsLib.logOperation(
      shamanId,
      shamanSpellId,
      0,
      true,
      LogType.Queue,
      ""
    );
  }

  function startSpellJob(
    bytes32 shamanId,
    bytes32 shamanSpellId
  )
    public
    onlyOperator
    onlyActiveShaman(shamanId)
    onlyInProgressShaman(shamanId)
  {
    require(
      ShamanSpells.getState(shamanSpellId) == JobState.Queue,
      "Spell must be queued"
    );

    ShamanSpells.setState(shamanSpellId, JobState.InProgress);
    ShamanLogsLib.logOperation(
      shamanId,
      shamanSpellId,
      0,
      true,
      LogType.Start,
      ""
    );
  }

  function completeSpellJob(
    bytes32 shamanId,
    bytes32 shamanSpellId,
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
      ShamanSpells.getState(shamanSpellId) == JobState.InProgress,
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

    ShamanSpells.setState(shamanSpellId, JobState.Idle);
    Shamans.setBalance(shamanId, Shamans.getBalance(shamanId) - cost);

    ShamanLogsLib.logOperation(
      shamanId,
      shamanSpellId,
      cost,
      success,
      LogType.Completion,
      metadata
    );

    _token().burn(cost);
  }
}
