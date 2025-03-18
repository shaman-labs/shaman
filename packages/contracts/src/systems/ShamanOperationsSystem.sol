// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Shamans, ShamanNames, ShamanSpell, SpellVersions } from "../codegen/index.sol";
import { ShamanLogsLib } from "../lib/ShamanLogsLib.sol";
import { LogType } from "../codegen/common.sol";
import { BaseSystem } from "./BaseSystem.sol";

contract ShamanOperationsSystem is BaseSystem {
  function updateShamanName(
    bytes32 shamanId,
    string memory name
  )
    public
    onlyShamanCreator(shamanId)
    onlyIdleShaman(shamanId)
    onlyActiveShaman(shamanId)
  {
    require(bytes(name).length > 0, "Name cannot be empty");
    require(bytes(name).length <= 20, "Name too long");
    bytes32 encodedName = keccak256(bytes(name));
    require(
      ShamanNames.get(encodedName) == bytes32(0),
      "Shaman name already taken"
    );

    Shamans.setName(shamanId, name);
    ShamanNames.set(encodedName, shamanId);

    ShamanLogsLib.logOperation(shamanId, 0, 0, true, LogType.Modification, "");
  }

  function updateShamanMetadata(
    bytes32 shamanId,
    string memory metadata
  )
    public
    onlyShamanCreator(shamanId)
    onlyActiveShaman(shamanId)
    onlyIdleShaman(shamanId)
  {
    require(bytes(metadata).length > 0, "Metadata cannot be empty");
    Shamans.setMetadata(shamanId, metadata);

    ShamanLogsLib.logOperation(shamanId, 0, 0, true, LogType.Modification, "");
  }

  function updateShamanStatus(
    bytes32 shamanId,
    bool active
  ) public onlyShamanCreator(shamanId) onlyIdleShaman(shamanId) {
    Shamans.setActive(shamanId, active);

    ShamanLogsLib.logOperation(
      shamanId,
      0,
      0,
      true,
      active ? LogType.Activation : LogType.Deactivation,
      ""
    );
  }

  function setShamanSpellVersion(
    bytes32 shamanId,
    bytes32 spellId,
    uint256 version
  )
    public
    onlyShamanCreator(shamanId)
    onlyActiveShaman(shamanId)
    onlyIdleShaman(shamanId)
  {
    require(version > 0, "Version must be greater than 0");
    require(
      ShamanSpell.getVersion(shamanId, spellId) > 0,
      "Spell not initialized"
    );
    require(
      ShamanSpell.getVersion(shamanId, spellId) != version,
      "Version already set"
    );

    ShamanSpell.setVersion(shamanId, spellId, version);
    ShamanSpell.setMetadata(
      shamanId,
      spellId,
      SpellVersions.getMetadata(shamanId, version)
    );

    ShamanLogsLib.logOperation(shamanId, 0, 0, true, LogType.Modification, "");
  }

  function updateShamanSpellVersion(
    bytes32 shamanId,
    bytes32 spellId
  )
    public
    onlyShamanCreator(shamanId)
    onlyActiveShaman(shamanId)
    onlyIdleShaman(shamanId)
  {
    uint256 latestVersion = ShamanSpell.getVersion(shamanId, spellId);

    require(latestVersion > 0, "Spell not initialized");

    ShamanSpell.setVersion(shamanId, spellId, latestVersion + 1);

    ShamanSpell.setMetadata(
      shamanId,
      spellId,
      SpellVersions.getMetadata(shamanId, latestVersion)
    );

    ShamanLogsLib.logOperation(shamanId, 0, 0, true, LogType.Modification, "");
  }
}
