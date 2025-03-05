// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { IZugToken } from "../IZugToken.sol";
import { Spells, ShamanConfig, Roles, Shamans } from "../codegen/index.sol";
import { RoleType, ShamanState } from "../codegen/common.sol";

contract BaseSystem is System {
  modifier onlyOperator() {
    require(Roles.getRole(_msgSender()) == RoleType.Operator, "Not operator");
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

  modifier onlyActiveShaman(bytes32 shamanId) {
    require(Shamans.getActive(shamanId), "Shaman is not active");
    _;
  }

  modifier onlyIdleShaman(bytes32 shamanId) {
    require(
      Shamans.getState(shamanId) == ShamanState.Idle,
      "Shaman is not idle"
    );
    _;
  }

  function _token() internal view returns (IZugToken) {
    return IZugToken(ShamanConfig.getTokenAddress());
  }
}
