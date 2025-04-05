// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { ShamanWorkflowsLib, NewSpellEdge } from "../lib/ShamanWorkflowsLib.sol";
import { ShamanLogsLib } from "../lib/ShamanLogsLib.sol";
import { BaseSystem } from "./BaseSystem.sol";
import { LogType } from "../codegen/common.sol";

contract ShamanWorkflowsSystem is BaseSystem {
  function updateShamanWorkflow(
    bytes32 shamanId,
    bytes32[] memory sourceIds,
    bytes32[] memory spellIds,
    string[] memory spellChains,
    NewSpellEdge[] memory spellEdges
  )
    public
    onlyShamanCreator(shamanId)
    onlyActiveShaman(shamanId)
    onlyIdleShaman(shamanId)
  {
    require(spellIds.length > 0, "Spell ids must be provided");
    require(sourceIds.length > 0, "Source ids must be provided");
    require(spellChains.length > 0, "Spell chains must be provided");
    require(
      spellIds.length == spellChains.length,
      "Spell ids and spell chains must be the same length"
    );

    ShamanWorkflowsLib.updateShamanWorkflow(
      shamanId,
      sourceIds,
      spellIds,
      spellChains,
      spellEdges
    );

    ShamanLogsLib.logOperation(shamanId, 0, 0, true, LogType.Modification, "");
  }
}
