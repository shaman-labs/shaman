// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Shamans, ShamanNames } from "../codegen/index.sol";
import { JobState } from "../codegen/common.sol";
import { BaseSystem } from "./BaseSystem.sol";
import { LogType } from "../codegen/common.sol";
import { ShamanLogsLib } from "../lib/ShamanLogsLib.sol";
import { ShamanEntitiesLib } from "../lib/ShamanEntitiesLib.sol";

contract ShamanCreationSystem is BaseSystem {
  event ShamanCreated(bytes32 indexed shamanId, address indexed creator);

  function createShaman(
    string memory name,
    string memory metadata
  ) public onlyMember {
    bytes memory nameBytes = bytes(name);
    require(nameBytes.length > 0, "Shaman name cannot be empty");
    require(nameBytes.length <= 20, "Shaman name too long");
    bytes32 encodedName = keccak256(nameBytes);
    require(
      ShamanNames.get(encodedName) == bytes32(0),
      "Shaman name already taken"
    );
    bytes32 shamanId = keccak256(
      abi.encodePacked(_msgSender(), block.timestamp, block.prevrandao)
    );

    ShamanNames.set(encodedName, shamanId);

    Shamans.set(
      shamanId,
      JobState.Idle,
      _msgSender(),
      block.timestamp,
      true,
      0, // balance
      new bytes32[](0), // spell ids
      new bytes32[](0), // source ids
      new bytes32[](0), // spell edges ids
      name,
      metadata
    );

    emit ShamanCreated(shamanId, _msgSender());
  }
}
