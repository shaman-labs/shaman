// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { Shamans, Sources, ShamanSpells, ShamanSpellEdges, SourceShamanLookup } from "../codegen/index.sol";
import { SpellEdge } from "../lib/ShamanWorkflowsLib.sol";
import { JobState } from "../codegen/common.sol";

contract ShamanEntitiesSystem is BaseSystem {
  function getShamanSpellIds(
    bytes32 shamanId
  ) public view returns (bytes32[] memory) {
    return Shamans.getShamanSpellIds(shamanId);
  }

  function getShamanSourceIds(
    bytes32 shamanId
  ) public view returns (bytes32[] memory) {
    return Shamans.getShamanSourceIds(shamanId);
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
    bytes32 shamanSpellId
  ) public view returns (string memory) {
    return ShamanSpells.getMetadata(shamanSpellId);
  }

  function getShamanSpellVersion(
    bytes32 shamanSpellId
  ) public view returns (uint256) {
    return ShamanSpells.getVersion(shamanSpellId);
  }

  function getShamanSpellState(
    bytes32 shamanSpellId
  ) public view returns (JobState) {
    return ShamanSpells.getState(shamanSpellId);
  }

  function getShamanSpellEdges(
    bytes32 shamanId
  ) public view returns (SpellEdge[] memory) {
    bytes32[] memory shamanSpellEdgeIds = Shamans.getShamanSpellEdgeIds(
      shamanId
    );
    SpellEdge[] memory spellEdges = new SpellEdge[](shamanSpellEdgeIds.length);

    for (uint256 i = 0; i < shamanSpellEdgeIds.length; i++) {
      bytes32 shamanSpellEdgeId = shamanSpellEdgeIds[i];
      SpellEdge memory spellEdge = SpellEdge({
        fromSpellId: ShamanSpellEdges.getFromSpellId(shamanSpellEdgeId),
        toSpellId: ShamanSpellEdges.getToSpellId(shamanSpellEdgeId)
      });
      spellEdges[i] = spellEdge;
    }
    return spellEdges;
  }
}
