// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { ShamanWorkflowsLib, SpellEdge } from "../lib/ShamanWorkflowsLib.sol";
import { ShamanLogsLib } from "../lib/ShamanLogsLib.sol";
import { BaseSystem } from "./BaseSystem.sol";
import { LogType } from "../codegen/common.sol";

contract ShamanWorkflowsSystem is BaseSystem {
  function updateShamanWorkflow(
    bytes32 shamanId,
    bytes32[] memory spellIds,
    bytes32[] memory sourceIds,
    SpellEdge[] memory spellEdges
  )
    public
    onlyShamanCreator(shamanId)
    onlyActiveShaman(shamanId)
    onlyIdleShaman(shamanId)
  {
    require(spellIds.length > 0, "Spell ids must be provided");
    require(sourceIds.length > 0, "Source ids must be provided");

    ShamanWorkflowsLib.updateShamanWorkflow(
      shamanId,
      spellIds,
      sourceIds,
      spellEdges
    );

    ShamanLogsLib.logOperation(shamanId, 0, 0, true, LogType.Modification, "");
  }
}
