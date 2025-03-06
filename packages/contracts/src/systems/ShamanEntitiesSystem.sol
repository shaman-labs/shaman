// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { ShamanEntitiesLib } from "../lib/ShamanEntitiesLib.sol";
import { Shamans, Spells, Sources, ShamanSpellIndex, ShamanSourceIndex, SourceShamanIndex, SpellShamanIndex } from "../codegen/index.sol";

contract ShamanEntitiesSystem is BaseSystem {
  function addSpellToShaman(
    bytes32 shamanId,
    bytes32 spellId
  )
    public
    onlyShamanCreator(shamanId)
    onlyActiveShaman(shamanId)
    onlyIdleShaman(shamanId)
  {
    ShamanEntitiesLib.addSpell(shamanId, spellId);
  }

  function removeSpellFromShaman(
    bytes32 shamanId,
    bytes32 spellId
  )
    public
    onlyShamanCreator(shamanId)
    onlyActiveShaman(shamanId)
    onlyIdleShaman(shamanId)
  {
    ShamanEntitiesLib.removeSpell(shamanId, spellId);
  }

  function addSourceToShaman(
    bytes32 shamanId,
    bytes32 sourceId
  )
    public
    onlyShamanCreator(shamanId)
    onlyActiveShaman(shamanId)
    onlyIdleShaman(shamanId)
  {
    ShamanEntitiesLib.addSource(shamanId, sourceId);
  }

  function removeSourceFromShaman(
    bytes32 shamanId,
    bytes32 sourceId
  )
    public
    onlyShamanCreator(shamanId)
    onlyActiveShaman(shamanId)
    onlyIdleShaman(shamanId)
  {
    ShamanEntitiesLib.removeSource(shamanId, sourceId);
  }

  function getShamanSpellIds(
    bytes32 shamanId
  ) public view returns (bytes32[] memory) {
    uint32 count = Shamans.getSpellCount(shamanId);
    bytes32[] memory spellIds = new bytes32[](count);

    for (uint32 i = 0; i < count; i++) {
      spellIds[i] = ShamanSpellIndex.getSpellId(shamanId, i);
    }

    return spellIds;
  }

  function getShamanSourceIds(
    bytes32 shamanId
  ) public view returns (bytes32[] memory) {
    uint32 count = Shamans.getSourceCount(shamanId);
    bytes32[] memory sourceIds = new bytes32[](count);

    for (uint32 i = 0; i < count; i++) {
      sourceIds[i] = ShamanSourceIndex.getSourceId(shamanId, i);
    }

    return sourceIds;
  }

  function getShamanIdsBySourceId(
    bytes32 sourceId
  ) public view returns (bytes32[] memory) {
    uint32 count = Sources.getShamanCount(sourceId);
    bytes32[] memory shamanIds = new bytes32[](count);

    for (uint32 i = 0; i < count; i++) {
      shamanIds[i] = SourceShamanIndex.getShamanId(sourceId, i);
    }

    return shamanIds;
  }

  function getShamanIdsBySpellId(
    bytes32 spellId
  ) public view returns (bytes32[] memory) {
    uint32 count = Spells.getShamanCount(spellId);
    bytes32[] memory shamanIds = new bytes32[](count);

    for (uint32 i = 0; i < count; i++) {
      shamanIds[i] = SpellShamanIndex.getShamanId(spellId, i);
    }

    return shamanIds;
  }
}
