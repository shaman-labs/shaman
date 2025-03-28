// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Sources, Shamans, Spells, SpellVersions, ShamanSpell, ShamanSpellEdges, SourceShaman, SourceShamanLookup } from "../codegen/index.sol";

struct SpellEdge {
  bytes32 fromSpellId;
  bytes32 toSpellId;
  uint256 createdAt;
  string metadata;
}

library ShamanEntitiesLib {
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
    // index starts at 0
    uint256 lastSourceIndex = Sources.getShamanCount(shamanId);

    if (lastSourceIndex > 0) {
      lastSourceIndex--;
    }

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
      // decrement last source index
      lastSourceIndex--;
    }

    // add new source shaman lookups
    for (uint256 i = 0; i < newSourceCount; i++) {
      bytes32 sourceId = sourceIds[i];
      SourceShamanLookup.set(sourceId, lastSourceIndex, shamanId);
      SourceShaman.set(sourceId, shamanId, lastSourceIndex, block.timestamp);
      lastSourceIndex++;
    }

    // modify spell count
    Spells.setShamanCount(
      shamanId,
      Spells.getShamanCount(shamanId) + newSpellCount - prevSpellCount
    );

    // modify source count
    Sources.setShamanCount(
      shamanId,
      Sources.getShamanCount(shamanId) + newSourceCount - prevSourceCount
    );

    // finally, add new spells, souces and spell edges
    Shamans.setSpellIds(shamanId, spellIds);
    Shamans.setSourceIds(shamanId, sourceIds);
    Shamans.setSpellEdgeIds(shamanId, newSpellEdgeIds);
  }
}
