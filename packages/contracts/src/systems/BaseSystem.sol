// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { IZugToken } from "../IZugToken.sol";
import { Spells, ShamanConfig, Roles, Shamans, ShamanSpells, Sources } from "../codegen/index.sol";
import { RoleType, JobState } from "../codegen/common.sol";

contract BaseSystem is System {
  modifier onlyOperator() {
    require(Roles.getActive(_msgSender(), RoleType.Operator), "Not operator");
    _;
  }

  modifier onlyAdmin() {
    require(Roles.getActive(_msgSender(), RoleType.Admin), "Not admin");
    _;
  }

  modifier onlyMember() {
    require(Roles.getActive(_msgSender(), RoleType.Member), "Not member");
    _;
  }

  modifier onlySpellCreator(bytes32 spellId) {
    require(Spells.getCreator(spellId) == _msgSender(), "Not spell creator");
    _;
  }

  modifier onlyShamanCreator(bytes32 shamanId) {
    require(Shamans.getCreator(shamanId) == _msgSender(), "Not shaman creator");
    _;
  }

  modifier onlySourceCreator(bytes32 sourceId) {
    require(Sources.getCreator(sourceId) == _msgSender(), "Not source creator");
    _;
  }

  modifier onlyActiveSource(bytes32 sourceId) {
    require(Sources.getActive(sourceId), "Source is not active");
    _;
  }

  modifier onlyActiveShaman(bytes32 shamanId) {
    require(Shamans.getActive(shamanId), "Shaman is not active");
    _;
  }

  modifier onlyIdleShaman(bytes32 shamanId) {
    require(Shamans.getState(shamanId) == JobState.Idle, "Shaman is not idle");
    _;
  }
  
  modifier onlyIdleSpell(bytes32 shamanSpellId) {
    require(
      ShamanSpells.getState(shamanSpellId) == JobState.Idle,
      "Spell is not idle"
    );
    _;
  }

  function _token() internal view returns (IZugToken) {
    return IZugToken(ShamanConfig.getTokenAddress());
  }
}
