// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { Shamans, Sources, ShamanSpell, ShamanSpellEdges, SourceShaman, SourceShamanLookup } from "../codegen/index.sol";
import { SpellEdge } from "../lib/ShamanWorkflowsLib.sol";
import { JobState } from "../codegen/common.sol";

contract ShamanEntitiesSystem is BaseSystem {
  function getShamanSpellIds(
    bytes32 shamanId
  ) public view returns (bytes32[] memory) {
    return Shamans.getSpellIds(shamanId);
  }

  function getShamanSourceIds(
    bytes32 shamanId
  ) public view returns (bytes32[] memory) {
    return Shamans.getSourceIds(shamanId);
  }

  function getShamanIdsBySourceId(
    bytes32 sourceId
  ) public view returns (bytes32[] memory) {
    uint256 count = Sources.getShamanCount(sourceId);
    bytes32[] memory shamanIds = new bytes32[](count);

    for (uint256 i = 0; i < count; i++) {
      shamanIds[i] = SourceShamanLookup.getShamanId(sourceId, i);
    }

    return shamanIds;
  }

  function getShamanSpellMetadata(
    bytes32 shamanId,
    bytes32 spellId
  ) public view returns (string memory) {
    return ShamanSpell.getMetadata(shamanId, spellId);
  }

  function getShamanSpellVersion(
    bytes32 shamanId,
    bytes32 spellId
  ) public view returns (uint256) {
    return ShamanSpell.getVersion(shamanId, spellId);
  }

  function getShamanSpellState(
    bytes32 shamanId,
    bytes32 spellId
  ) public view returns (JobState) {
    return ShamanSpell.getState(shamanId, spellId);
  }

  function getShamanSpellEdges(
    bytes32 shamanId
  ) public view returns (SpellEdge[] memory) {
    bytes32[] memory spellEdgeIds = Shamans.getSpellEdgeIds(shamanId);
    SpellEdge[] memory spellEdges = new SpellEdge[](spellEdgeIds.length);

    for (uint256 i = 0; i < spellEdgeIds.length; i++) {
      bytes32 spellEdgeId = spellEdgeIds[i];
      SpellEdge memory spellEdge = SpellEdge({
        fromSpellId: ShamanSpellEdges.getFromSpellId(spellEdgeId),
        toSpellId: ShamanSpellEdges.getToSpellId(spellEdgeId),
        createdAt: ShamanSpellEdges.getCreatedAt(spellEdgeId),
        metadata: ShamanSpellEdges.getMetadata(spellEdgeId)
      });
      spellEdges[i] = spellEdge;
    }
    return spellEdges;
  }
}
