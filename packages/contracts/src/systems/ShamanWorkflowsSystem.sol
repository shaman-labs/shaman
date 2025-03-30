// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { ShamanEntitiesLib, SpellEdge } from "../lib/ShamanEntitiesLib.sol";
import { BaseSystem } from "./BaseSystem.sol";

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
    require(spellEdges.length > 0, "Spell edges must be provided");

    ShamanEntitiesLib.updateShamanWorkflow(
      shamanId,
      spellIds,
      sourceIds,
      spellEdges
    );
  }
}
