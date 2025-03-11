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
    uint256 balance,
    string memory name,
    bytes32[] memory spellIds,
    bytes32[] memory sourceIds,
    string memory metadata
  ) public {
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
      balance,
      0, // spellCount
      0, // sourceCount
      name,
      metadata
    );

    // add initial spells if provided
    for (uint256 i = 0; i < spellIds.length; i++) {
      ShamanEntitiesLib.addSpell(shamanId, spellIds[i]);
    }

    // add initial sources if provided
    for (uint256 i = 0; i < sourceIds.length; i++) {
      ShamanEntitiesLib.addSource(shamanId, sourceIds[i]);
    }

    // log initial deposit if balance provided
    if (balance > 0) {
      ShamanLogsLib.logOperation(
        shamanId,
        0,
        balance,
        true,
        LogType.Deposit,
        ""
      );

      // get funds tokens
      _token().transferFrom(_msgSender(), address(this), balance);
    }

    emit ShamanCreated(shamanId, _msgSender());
  }
}
