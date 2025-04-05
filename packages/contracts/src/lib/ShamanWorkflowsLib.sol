// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Sources, Shamans, Spells, ShamanSpells, ShamanSpellEdges, ShamanSources, SourceShamanLookup } from "../codegen/index.sol";
import { JobState } from "../codegen/common.sol";

struct NewSpellEdge {
  bytes32 fromSpellId;
  bytes32 toSpellId;
}
struct ShamanSpellEdge {
  bytes32 shamanSpellEdgeId;
  bytes32 fromShamanSpellId;
  bytes32 toShamanSpellId;
}

struct ShamanSpell {
  bytes32 shamanSpellId;
  bytes32 spellId;
  bytes32 shamanId;
  uint256 version;
  string metadata;
  JobState state;
}

library ShamanWorkflowsLib {
  function updateShamanWorkflow(
    bytes32 shamanId,
    bytes32[] memory sourceIds,
    bytes32[] memory spellIds,
    NewSpellEdge[] memory spellEdges
  ) internal {
    uint256 newSpellEdgeCount = spellEdges.length;
    uint256 newSourceIdsCount = sourceIds.length;
    uint256 newSpellIdsCount = spellIds.length;

    bytes32[] memory newShamanSpellEdgeIds = new bytes32[](newSpellEdgeCount);
    bytes32[] memory newShamanSourceIds = new bytes32[](newSourceIdsCount);
    bytes32[] memory newShamanSpellIds = new bytes32[](newSpellIdsCount);

    // Arrays to store the mapping between original spellIds and shamanSpellIds
    bytes32[] memory originalSpellIds = new bytes32[](newSpellIdsCount);
    bytes32[] memory createdShamanSpellIds = new bytes32[](newSpellIdsCount);

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
      ShamanSources.set(shamanSourceId, sourceId, shamanId);

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

      // store the mapping for lookup
      originalSpellIds[i] = spellId;
      createdShamanSpellIds[i] = shamanSpellId;

      ShamanSpells.set(
        shamanSpellId,
        spellId,
        shamanId,
        Spells.getVersion(spellId),
        JobState.Idle,
        Spells.getMetadata(spellId)
      );

      // increase shaman count
      Spells.setShamanCount(spellId, Spells.getShamanCount(spellId) + 1);
    }

    // add new shaman spell edges
    for (uint256 i = 0; i < newSpellEdgeCount; i++) {
      NewSpellEdge memory spellEdge = spellEdges[i];

      // look up the corresponding shamanSpellIds
      bytes32 fromShamanSpellId;
      bytes32 toShamanSpellId;

      for (uint256 j = 0; j < newSpellIdsCount; j++) {
        if (originalSpellIds[j] == spellEdge.fromSpellId) {
          fromShamanSpellId = createdShamanSpellIds[j];
        }
        if (originalSpellIds[j] == spellEdge.toSpellId) {
          toShamanSpellId = createdShamanSpellIds[j];
        }
      }

      bytes32 shamanSpellEdgeId = keccak256(
        abi.encodePacked(
          shamanId,
          fromShamanSpellId,
          toShamanSpellId,
          i,
          block.timestamp,
          block.prevrandao
        )
      );
      newShamanSpellEdgeIds[i] = shamanSpellEdgeId;

      ShamanSpellEdges.set(
        shamanSpellEdgeId,
        fromShamanSpellId,
        toShamanSpellId,
        shamanId
      );
    }

    // add new spells, sources and spell edges to shaman
    Shamans.setShamanSpellIds(shamanId, newShamanSpellIds);
    Shamans.setShamanSourceIds(shamanId, newShamanSourceIds);
    Shamans.setShamanSpellEdgeIds(shamanId, newShamanSpellEdgeIds);
  }
}
