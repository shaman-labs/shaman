// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Sources, Shamans, Spells, SpellVersions, ShamanSpell, ShamanSource, ShamanSourceIndex, ShamanSpellIndex, SourceShamanIndex, SpellShamanIndex } from "../codegen/index.sol";
import { LogType, JobState } from "../codegen/common.sol";

library ShamanEntitiesLib {
  function addSpell(bytes32 shamanId, bytes32 spellId) internal {
    // Check if the spell already exists in the shaman
    require(
      ShamanSpell.getCreatedAt(shamanId, spellId) == 0,
      "Spell already exists in shaman"
    );

    // Store the spell with latest version and metadata
    ShamanSpell.set(
      shamanId,
      spellId,
      block.timestamp,
      Spells.getVersion(spellId),
      JobState.Idle,
      Spells.getMetadata(spellId)
    );

    uint256 shamanSpellCount = Shamans.getSpellCount(shamanId);
    ShamanSpellIndex.set(shamanId, shamanSpellCount, spellId);
    Shamans.setSpellCount(shamanId, shamanSpellCount + 1);

    uint256 spellShamanCount = Spells.getShamanCount(spellId);
    SpellShamanIndex.set(spellId, spellShamanCount, shamanId);
    Spells.setShamanCount(spellId, spellShamanCount + 1);
  }

  function removeSpell(bytes32 shamanId, bytes32 spellId) internal {
    // Check if the spell exists in the shaman
    require(
      ShamanSpell.getCreatedAt(shamanId, spellId) > 0,
      "Spell does not exist in shaman"
    );

    ShamanSpell.deleteRecord(shamanId, spellId);

    uint256 shamanSpellCount = Shamans.getSpellCount(shamanId);
    for (uint256 i = 0; i < shamanSpellCount; i++) {
      if (ShamanSpellIndex.getSpellId(shamanId, i) == spellId) {
        if (i != shamanSpellCount - 1) {
          bytes32 lastSpellId = ShamanSpellIndex.getSpellId(
            shamanId,
            shamanSpellCount - 1
          );
          ShamanSpellIndex.set(shamanId, i, lastSpellId);
        }
        Shamans.setSpellCount(shamanId, shamanSpellCount - 1);
        break;
      }
    }

    uint256 spellShamanCount = Spells.getShamanCount(spellId);
    for (uint256 i = 0; i < spellShamanCount; i++) {
      if (SpellShamanIndex.getShamanId(spellId, i) == shamanId) {
        if (i != spellShamanCount - 1) {
          bytes32 lastShamanId = SpellShamanIndex.getShamanId(
            spellId,
            spellShamanCount - 1
          );
          SpellShamanIndex.set(spellId, i, lastShamanId);
        }
        Spells.setShamanCount(spellId, spellShamanCount - 1);
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

    uint256 shamanSourceCount = Shamans.getSourceCount(shamanId);
    ShamanSourceIndex.set(shamanId, shamanSourceCount, sourceId);
    Shamans.setSourceCount(shamanId, shamanSourceCount + 1);

    uint256 sourceShamanCount = Sources.getShamanCount(sourceId);
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

    uint256 shamanSourceCount = Shamans.getSourceCount(shamanId);
    for (uint256 i = 0; i < shamanSourceCount; i++) {
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

    uint256 sourceShamanCount = Sources.getShamanCount(sourceId);
    for (uint256 i = 0; i < sourceShamanCount; i++) {
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
