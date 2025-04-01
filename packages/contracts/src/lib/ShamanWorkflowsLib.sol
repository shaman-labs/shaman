// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Sources, Shamans, Spells, SpellVersions, ShamanSpell, ShamanSpellEdges, SourceShaman, SourceShamanLookup } from "../codegen/index.sol";

struct SpellEdge {
  bytes32 fromSpellId;
  bytes32 toSpellId;
  uint256 createdAt;
  string metadata;
}

library ShamanWorkflowsLib {
  function updateShamanWorkflow(
    bytes32 shamanId,
    bytes32[] memory spellIds,
    bytes32[] memory sourceIds,
    SpellEdge[] memory spellEdges
  ) internal {
    uint256 newSpellEdgeCount = spellEdges.length;
    uint256 prevSpellEdgeCount = Shamans.lengthSpellEdgeIds(shamanId);

    uint256 newSpellCount = spellIds.length;
    uint256 prevSpellCount = Shamans.lengthSpellIds(shamanId);

    uint256 newSourceCount = sourceIds.length;
    uint256 prevSourceCount = Shamans.lengthSourceIds(shamanId);

    bytes32[] memory newSpellEdgeIds = new bytes32[](newSpellEdgeCount);

    // remove previous spell edges
    for (uint256 i = 0; i < prevSpellEdgeCount; i++) {
      ShamanSpellEdges.deleteRecord(Shamans.getItemSpellEdgeIds(shamanId, i));
    }

    // add new spell edges
    for (uint256 i = 0; i < newSpellEdgeCount; i++) {
      SpellEdge memory spellEdge = spellEdges[i];
      bytes32 edgeId = keccak256(
        abi.encodePacked(
          shamanId,
          spellEdge.fromSpellId,
          spellEdge.toSpellId,
          i
        )
      );
      newSpellEdgeIds[i] = edgeId;
      ShamanSpellEdges.set(
        edgeId,
        shamanId,
        spellEdge.fromSpellId,
        spellEdge.toSpellId,
        spellEdge.createdAt,
        spellEdge.metadata
      );
    }

    // remove previous source shaman lookups
    for (uint256 i = 0; i < prevSourceCount; i++) {
      bytes32 sourceId = Shamans.getItemSourceIds(shamanId, i);
      // get last source index
      uint256 lastSourceIndex = Sources.getShamanCount(sourceId);

      // index starts at 0
      if (lastSourceIndex > 0) {
        lastSourceIndex--;
      }

      // swap with last shaman
      bytes32 lastShamanId = SourceShamanLookup.getShamanId(
        sourceId,
        lastSourceIndex
      );
      uint256 prevIndex = SourceShaman.getIndex(sourceId, shamanId);
      SourceShamanLookup.set(sourceId, prevIndex, lastShamanId);
      SourceShaman.setIndex(sourceId, lastShamanId, prevIndex);

      // delete record
      SourceShaman.deleteRecord(sourceId, shamanId);
      // delete last shaman lookup
      SourceShamanLookup.deleteRecord(sourceId, lastSourceIndex);

      // update source shaman count (decrement)
      Sources.setShamanCount(sourceId, lastSourceIndex);
    }

    // add new source shaman lookups
    for (uint256 i = 0; i < newSourceCount; i++) {
      bytes32 sourceId = sourceIds[i];
      // get last source index
      uint256 lastSourceIndex = Sources.getShamanCount(sourceId);

      SourceShamanLookup.set(sourceId, lastSourceIndex, shamanId);
      SourceShaman.set(sourceId, shamanId, lastSourceIndex, block.timestamp);

      // update source shaman count (increment)
      Sources.setShamanCount(sourceId, lastSourceIndex + 1);
    }

    // update spells shaman count

    // prev spells will decrement shaman count
    for (uint256 i = 0; i < prevSpellCount; i++) {
      bytes32 spellId = Shamans.getItemSpellIds(shamanId, i);
      uint256 lastSpellIndex = Spells.getShamanCount(spellId);
      // assuming prevSpellCount is always greater than 0
      Spells.setShamanCount(spellId, lastSpellIndex - 1);
    }

    // new spells will increment shaman count
    for (uint256 i = 0; i < newSpellCount; i++) {
      bytes32 spellId = spellIds[i];
      uint256 lastSpellIndex = Spells.getShamanCount(spellId);
      Spells.setShamanCount(spellId, lastSpellIndex + 1);
    }

    // finally, add new spells, sources and spell edges
    Shamans.setSpellIds(shamanId, spellIds);
    Shamans.setSourceIds(shamanId, sourceIds);
    Shamans.setSpellEdgeIds(shamanId, newSpellEdgeIds);
  }
}
