// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { ShamanEntitiesLib } from "../lib/ShamanEntitiesLib.sol";
import { Shamans, Abilities, Sources, ShamanAbilityIndex, ShamanSourceIndex, SourceShamanIndex, AbilityShamanIndex } from "../codegen/index.sol";

contract ShamanEntitiesSystem is BaseSystem {
  function addAbilityToShaman(
    bytes32 shamanId,
    bytes32 abilityId
  )
    public
    onlyShamanCreator(shamanId)
    onlyActiveShaman(shamanId)
    onlyIdleShaman(shamanId)
  {
    ShamanEntitiesLib.addAbility(shamanId, abilityId);
  }

  function removeAbilityFromShaman(
    bytes32 shamanId,
    bytes32 abilityId
  )
    public
    onlyShamanCreator(shamanId)
    onlyActiveShaman(shamanId)
    onlyIdleShaman(shamanId)
  {
    ShamanEntitiesLib.removeAbility(shamanId, abilityId);
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

  function getShamanAbilityIds(
    bytes32 shamanId
  ) public view returns (bytes32[] memory) {
    uint32 count = Shamans.getAbilityCount(shamanId);
    bytes32[] memory abilityIds = new bytes32[](count);

    for (uint32 i = 0; i < count; i++) {
      abilityIds[i] = ShamanAbilityIndex.getAbilityId(shamanId, i);
    }

    return abilityIds;
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

  function getShamanIdsByAbilityId(
    bytes32 abilityId
  ) public view returns (bytes32[] memory) {
    uint32 count = Abilities.getShamanCount(abilityId);
    bytes32[] memory shamanIds = new bytes32[](count);

    for (uint32 i = 0; i < count; i++) {
      shamanIds[i] = AbilityShamanIndex.getShamanId(abilityId, i);
    }

    return shamanIds;
  }
}
