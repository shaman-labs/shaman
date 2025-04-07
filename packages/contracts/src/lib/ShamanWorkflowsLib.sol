// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Sources, Shamans, Spells, ShamanSpells, ShamanSpellEdges, ShamanSources, SourceShamanLookup, SourceShamanCounts, SourceShamanIndexes } from "../codegen/index.sol";
import { JobState } from "../codegen/common.sol";

struct NewSpellEdge {
  uint256 fromSpellIndex;
  uint256 toSpellIndex;
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
  string chain;
  string metadata;
  JobState state;
}

library ShamanWorkflowsLib {
  function updateShamanWorkflow(
    bytes32 shamanId,
    bytes32[] memory sourceIds,
    bytes32[] memory spellIds,
    string[] memory spellChains,
    NewSpellEdge[] memory spellEdges
  ) internal {
    uint256 newSpellEdgeCount = spellEdges.length;
    uint256 newSourceIdsCount = sourceIds.length;
    uint256 newSpellIdsCount = spellIds.length;

    bytes32[] memory newShamanSpellEdgeIds = new bytes32[](newSpellEdgeCount);
    bytes32[] memory newShamanSourceIds = new bytes32[](newSourceIdsCount);
    bytes32[] memory newShamanSpellIds = new bytes32[](newSpellIdsCount);

    // update shaman source lookups
    for (uint256 i = 0; i < sourceIds.length; i++) {
      bytes32 sourceId = sourceIds[i];
      uint256 lastShamanIndex = SourceShamanCounts.getShamanCount(sourceId);
      if (lastShamanIndex == 0) {
        // no shaman installed
        break;
      }
      lastShamanIndex--;
      bytes32 lastShamanId = SourceShamanLookup.getShamanId(
        sourceId,
        lastShamanIndex
      );
      uint256 currentShamanIndex = SourceShamanIndexes.getIndex(
        sourceId,
        shamanId
      );

      // swap indexes
      SourceShamanIndexes.setIndex(sourceId, shamanId, lastShamanIndex);
      SourceShamanIndexes.setIndex(sourceId, lastShamanId, currentShamanIndex);

      // decrease shaman count
      SourceShamanCounts.setShamanCount(sourceId, lastShamanIndex);
    }

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

      uint256 sourceShamanIndex = SourceShamanCounts.getShamanCount(sourceId);
      // set shaman to last index
      SourceShamanLookup.set(sourceId, sourceShamanIndex, shamanId);
      // increase shaman count
      SourceShamanCounts.setShamanCount(sourceId, sourceShamanIndex + 1);
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
        shamanId,
        Spells.getVersion(spellId),
        JobState.Idle,
        spellChains[i],
        Spells.getMetadata(spellId)
      );
    }

    // add new shaman spell edges
    for (uint256 i = 0; i < newSpellEdgeCount; i++) {
      NewSpellEdge memory spellEdge = spellEdges[i];

      bytes32 fromShamanSpellId = newShamanSpellIds[spellEdge.fromSpellIndex];
      bytes32 toShamanSpellId = newShamanSpellIds[spellEdge.toSpellIndex];

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
        spellEdge.fromSpellIndex,
        spellEdge.toSpellIndex,
        spellIds[spellEdge.fromSpellIndex], // fromSpellId
        spellIds[spellEdge.toSpellIndex], // toSpellId
        shamanId
      );
    }

    // add new spells, sources and spell edges to shaman
    Shamans.setShamanSpellIds(shamanId, newShamanSpellIds);
    Shamans.setShamanSourceIds(shamanId, newShamanSourceIds);
    Shamans.setShamanSpellEdgeIds(shamanId, newShamanSpellEdgeIds);
  }
}
