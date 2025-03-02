// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Sources, Shamans, Abilities, ShamanAbility, ShamanSource, ShamanSourceIndex, ShamanAbilityIndex, SourceShamanIndex, AbilityShamanIndex } from "../codegen/index.sol";
import { LogType } from "../codegen/common.sol";

library ShamanEntitiesLib {
  function addAbility(bytes32 shamanId, bytes32 abilityId) internal {
    // Check if the ability already exists in the shaman
    require(
      ShamanAbility.getCreatedAt(shamanId, abilityId) == 0,
      "Ability already exists in shaman"
    );

    ShamanAbility.set(shamanId, abilityId, block.timestamp);

    uint32 shamanAbilityCount = Shamans.getAbilityCount(shamanId);
    ShamanAbilityIndex.set(shamanId, shamanAbilityCount, abilityId);
    Shamans.setAbilityCount(shamanId, shamanAbilityCount + 1);

    uint32 abilityShamanCount = Abilities.getShamanCount(abilityId);
    AbilityShamanIndex.set(abilityId, abilityShamanCount, shamanId);
    Abilities.setShamanCount(abilityId, abilityShamanCount + 1);
  }

  function removeAbility(bytes32 shamanId, bytes32 abilityId) internal {
    // Check if the ability exists in the shaman
    require(
      ShamanAbility.getCreatedAt(shamanId, abilityId) > 0,
      "Ability does not exist in shaman"
    );

    ShamanAbility.deleteRecord(shamanId, abilityId);

    uint32 shamanAbilityCount = Shamans.getAbilityCount(shamanId);
    for (uint32 i = 0; i < shamanAbilityCount; i++) {
      if (ShamanAbilityIndex.getAbilityId(shamanId, i) == abilityId) {
        if (i != shamanAbilityCount - 1) {
          bytes32 lastAbilityId = ShamanAbilityIndex.getAbilityId(
            shamanId,
            shamanAbilityCount - 1
          );
          ShamanAbilityIndex.set(shamanId, i, lastAbilityId);
        }
        Shamans.setAbilityCount(shamanId, shamanAbilityCount - 1);
        break;
      }
    }

    uint32 abilityShamanCount = Abilities.getShamanCount(abilityId);
    for (uint32 i = 0; i < abilityShamanCount; i++) {
      if (AbilityShamanIndex.getShamanId(abilityId, i) == shamanId) {
        if (i != abilityShamanCount - 1) {
          bytes32 lastShamanId = AbilityShamanIndex.getShamanId(
            abilityId,
            abilityShamanCount - 1
          );
          AbilityShamanIndex.set(abilityId, i, lastShamanId);
        }
        Abilities.setShamanCount(abilityId, abilityShamanCount - 1);
        break;
      }
    }
  }

  function addSource(bytes32 shamanId, bytes32 sourceId) internal {
    // Check if the source already exists in the shaman
    require(
      ShamanSource.getCreatedAt(shamanId, sourceId) == 0,
      "Source already exists in shaman"
    );

    ShamanSource.set(shamanId, sourceId, block.timestamp);

    uint32 shamanSourceCount = Shamans.getSourceCount(shamanId);
    ShamanSourceIndex.set(shamanId, shamanSourceCount, sourceId);
    Shamans.setSourceCount(shamanId, shamanSourceCount + 1);

    uint32 sourceShamanCount = Sources.getShamanCount(sourceId);
    SourceShamanIndex.set(sourceId, sourceShamanCount, shamanId);
    Sources.setShamanCount(sourceId, sourceShamanCount + 1);
  }

  function removeSource(bytes32 shamanId, bytes32 sourceId) internal {
    // Check if the source exists in the shaman
    require(
      ShamanSource.getCreatedAt(shamanId, sourceId) > 0,
      "Source does not exist in shaman"
    );

    ShamanSource.deleteRecord(shamanId, sourceId);

    uint32 shamanSourceCount = Shamans.getSourceCount(shamanId);
    for (uint32 i = 0; i < shamanSourceCount; i++) {
      if (ShamanSourceIndex.getSourceId(shamanId, i) == sourceId) {
        if (i != shamanSourceCount - 1) {
          bytes32 lastSourceId = ShamanSourceIndex.getSourceId(
            shamanId,
            shamanSourceCount - 1
          );
          ShamanSourceIndex.set(shamanId, i, lastSourceId);
        }
        Shamans.setSourceCount(shamanId, shamanSourceCount - 1);
        break;
      }
    }

    uint32 sourceShamanCount = Sources.getShamanCount(sourceId);
    for (uint32 i = 0; i < sourceShamanCount; i++) {
      if (SourceShamanIndex.getShamanId(sourceId, i) == shamanId) {
        if (i != sourceShamanCount - 1) {
          bytes32 lastShamanId = SourceShamanIndex.getShamanId(
            sourceId,
            sourceShamanCount - 1
          );
          SourceShamanIndex.set(sourceId, i, lastShamanId);
        }
        Sources.setShamanCount(sourceId, sourceShamanCount - 1);
        break;
      }
    }
  }
}
