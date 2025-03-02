// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Shamans, ShamanNames } from "../codegen/index.sol";
import { ShamanState } from "../codegen/common.sol";
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
  }

  function updateShamanStatus(
    bytes32 shamanId,
    bool active
  ) public onlyShamanCreator(shamanId) onlyIdleShaman(shamanId) {
    Shamans.setActive(shamanId, active);
  }
}
