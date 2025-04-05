// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { Shamans, Sources, ShamanSpells, ShamanSpellEdges, SourceShamanLookup } from "../codegen/index.sol";
import { ShamanSpell, ShamanSpellEdge } from "../lib/ShamanWorkflowsLib.sol";
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
  ) public view returns (ShamanSpellEdge[] memory) {
    bytes32[] memory shamanSpellEdgeIds = Shamans.getShamanSpellEdgeIds(
      shamanId
    );
    ShamanSpellEdge[] memory shamanSpellEdges = new ShamanSpellEdge[](
      shamanSpellEdgeIds.length
    );

    for (uint256 i = 0; i < shamanSpellEdgeIds.length; i++) {
      bytes32 shamanSpellEdgeId = shamanSpellEdgeIds[i];
      ShamanSpellEdge memory shamanSpellEdge = ShamanSpellEdge({
        shamanSpellEdgeId: shamanSpellEdgeId,
        fromShamanSpellId: ShamanSpellEdges.getFromShamanSpellId(
          shamanSpellEdgeId
        ),
        toShamanSpellId: ShamanSpellEdges.getToShamanSpellId(shamanSpellEdgeId)
      });
      shamanSpellEdges[i] = shamanSpellEdge;
    }
    return shamanSpellEdges;
  }

  function getShamanSpells(
    bytes32 shamanId
  ) public view returns (ShamanSpell[] memory) {
    bytes32[] memory shamanSpellIds = Shamans.getShamanSpellIds(shamanId);
    ShamanSpell[] memory shamanSpells = new ShamanSpell[](
      shamanSpellIds.length
    );

    for (uint256 i = 0; i < shamanSpellIds.length; i++) {
      bytes32 shamanSpellId = shamanSpellIds[i];
      ShamanSpell memory shamanSpell = ShamanSpell({
        shamanSpellId: shamanSpellId,
        spellId: ShamanSpells.getSpellId(shamanSpellId),
        shamanId: ShamanSpells.getShamanId(shamanSpellId),
        version: ShamanSpells.getVersion(shamanSpellId),
        metadata: ShamanSpells.getMetadata(shamanSpellId),
        state: ShamanSpells.getState(shamanSpellId)
      });
      shamanSpells[i] = shamanSpell;
    }
    return shamanSpells;
  }
}
