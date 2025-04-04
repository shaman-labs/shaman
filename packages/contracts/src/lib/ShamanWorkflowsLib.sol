// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Sources, Shamans, Spells, ShamanSpells, ShamanSpellEdges, ShamanSources, SourceShamanLookup } from "../codegen/index.sol";
import { JobState } from "../codegen/common.sol";

struct SpellEdge {
  bytes32 fromSpellId;
  bytes32 toSpellId;
}

library ShamanWorkflowsLib {
  function updateShamanWorkflow(
    bytes32 shamanId,
    bytes32[] memory sourceIds,
    bytes32[] memory spellIds,
    SpellEdge[] memory spellEdges
  ) internal {
    uint256 newSpellEdgeCount = spellEdges.length;
    uint256 newSourceIdsCount = sourceIds.length;
    uint256 newSpellIdsCount = spellIds.length;

    bytes32[] memory newShamanSpellEdgeIds = new bytes32[](newSpellEdgeCount);
    bytes32[] memory newShamanSourceIds = new bytes32[](newSourceIdsCount);
    bytes32[] memory newShamanSpellIds = new bytes32[](newSpellIdsCount);

    // add new shaman sources
    for (uint256 i = 0; i < newSourceIdsCount; i++) {
      bytes32 sourceId = sourceIds[i];
      bytes32 shamanSourceId = keccak256(
        abi.encodePacked(
          shamanId,
          sourceId,
          i,
          block.timestamp,
          block.prevrandao
        )
      );

      newShamanSourceIds[i] = shamanSourceId;
      ShamanSources.set(shamanSourceId, sourceId);

      // increase shaman count
      uint256 sourceShamanIndex = Sources.getShamanCount(sourceId);
      SourceShamanLookup.set(sourceId, sourceShamanIndex, shamanId);
      Sources.setShamanCount(sourceId, sourceShamanIndex + 1);
    }

    // add new shaman spells
    for (uint256 i = 0; i < newSpellIdsCount; i++) {
      bytes32 spellId = spellIds[i];
      bytes32 shamanSpellId = keccak256(
        abi.encodePacked(
          shamanId,
          spellId,
          i,
          block.timestamp,
          block.prevrandao
        )
      );

      newShamanSpellIds[i] = shamanSpellId;
      ShamanSpells.set(
        shamanSpellId,
        spellId,
        Spells.getVersion(spellId),
        JobState.Idle,
        Spells.getMetadata(spellId)
      );

      // increase shaman count
      Spells.setShamanCount(spellId, Spells.getShamanCount(spellId) + 1);
    }

    // add new shaman spell edges
    for (uint256 i = 0; i < newSpellEdgeCount; i++) {
      SpellEdge memory spellEdge = spellEdges[i];
      bytes32 shamanSpellEdgeId = keccak256(
        abi.encodePacked(
          shamanId,
          spellEdge.fromSpellId,
          spellEdge.toSpellId,
          i,
          block.timestamp,
          block.prevrandao
        )
      );
      newShamanSpellEdgeIds[i] = shamanSpellEdgeId;
      ShamanSpellEdges.set(
        shamanSpellEdgeId,
        spellEdge.fromSpellId,
        spellEdge.toSpellId
      );
    }

    // add new spells, sources and spell edges to shaman
    Shamans.setShamanSpellIds(shamanId, newShamanSpellIds);
    Shamans.setShamanSourceIds(shamanId, newShamanSourceIds);
    Shamans.setShamanSpellEdgeIds(shamanId, newShamanSpellEdgeIds);
  }
}
