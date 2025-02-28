// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { Shamans, ShamanNames } from "../codegen/index.sol";

contract ShamanSystem is BaseSystem {
  event ShamanCreated(bytes32 indexed shamanId, address indexed creator);

  function createShaman(string calldata name, string memory metadata) public {
    bytes memory nameBytes = bytes(name);
    require(nameBytes.length > 0, "Shaman name cannot be empty");
    require(nameBytes.length <= 20, "Shaman name too long");
    require(bytes(metadata).length > 0, "Metadata cannot be empty");
    bytes32 encodedName = keccak256(nameBytes);
    require(
      ShamanNames.get(encodedName) == bytes32(0),
      "Shaman name already taken"
    );

    bytes32 shamanId = keccak256(
      abi.encodePacked(_msgSender(), block.timestamp, block.prevrandao)
    );
    Shamans.setCreator(shamanId, _msgSender());
    Shamans.setCreatedAt(shamanId, block.timestamp);
    Shamans.setMetadata(shamanId, metadata);
    Shamans.setName(shamanId, name);

    ShamanNames.set(encodedName, shamanId);

    emit ShamanCreated(shamanId, _msgSender());
  }

  function updateShamanMetadata(
    bytes32 shamanId,
    string memory metadata
  ) public onlyShamanCreator(shamanId) {
    require(bytes(metadata).length > 0, "Metadata cannot be empty");

    Shamans.setMetadata(shamanId, metadata);
  }

  function getShamanMetadata(
    bytes32 shamanId
  ) public view returns (string memory) {
    return Shamans.getMetadata(shamanId);
  }

  function getShamanIdByName(
    string calldata name
  ) public view returns (bytes32) {
    bytes32 encodedName = keccak256(bytes(name));
    return ShamanNames.get(encodedName);
  }

  function getShamanName(bytes32 shamanId) public view returns (string memory) {
    return Shamans.getName(shamanId);
  }

  function getShamanCreator(bytes32 shamanId) public view returns (address) {
    return Shamans.getCreator(shamanId);
  }
}
