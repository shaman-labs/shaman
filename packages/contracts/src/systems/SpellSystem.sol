// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { Spells, SpellNames } from "../codegen/index.sol";

contract SpellSystem is BaseSystem {
  event SpellCreated(bytes32 indexed spellId, address indexed creator);

  function createSpell(string memory name, string memory metadata) public {
    bytes memory nameBytes = bytes(name);
    require(nameBytes.length > 0, "Spell name cannot be empty");
    require(nameBytes.length <= 20, "Spell name too long");
    require(bytes(metadata).length > 0, "Metadata cannot be empty");
    bytes32 encodedName = keccak256(nameBytes);
    require(
      SpellNames.get(encodedName) == bytes32(0),
      "Spell name already taken"
    );

    bytes32 spellId = keccak256(
      abi.encodePacked(_msgSender(), block.timestamp, block.prevrandao)
    );

    Spells.set(
      spellId,
      _msgSender(),
      block.timestamp,
      0, // shamanCount
      name,
      metadata
    );

    SpellNames.set(encodedName, spellId);

    emit SpellCreated(spellId, _msgSender());
  }

  function updateSpellMetadata(
    bytes32 spellId,
    string memory metadata
  ) public onlySpellCreator(spellId) {
    require(bytes(metadata).length > 0, "Metadata cannot be empty");
    Spells.setMetadata(spellId, metadata);
  }

  function updateSpellName(
    bytes32 spellId,
    string memory name
  ) public onlySpellCreator(spellId) {
    require(bytes(name).length > 0, "Name cannot be empty");
    require(bytes(name).length <= 20, "Name too long");
    bytes32 encodedName = keccak256(bytes(name));
    require(SpellNames.get(encodedName) == bytes32(0), "Name already taken");
    Spells.setName(spellId, name);
    SpellNames.set(encodedName, spellId);
  }

  function getSpellName(bytes32 spellId) public view returns (string memory) {
    return Spells.getName(spellId);
  }

  function getSpellMetadata(
    bytes32 spellId
  ) public view returns (string memory) {
    return Spells.getMetadata(spellId);
  }

  function getSpellCreator(bytes32 spellId) public view returns (address) {
    return Spells.getCreator(spellId);
  }
}
