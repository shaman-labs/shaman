// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { Abilities, AbilityNames } from "../codegen/index.sol";

contract AbilitySystem is BaseSystem {
  event AbilityCreated(bytes32 indexed abilityId, address indexed creator);

  function createAbility(
    string memory name,
    string memory metadata
  ) public onlyOperator {
    bytes memory nameBytes = bytes(name);
    require(nameBytes.length > 0, "Ability name cannot be empty");
    require(nameBytes.length <= 20, "Ability name too long");
    require(bytes(metadata).length > 0, "Metadata cannot be empty");
    bytes32 encodedName = keccak256(nameBytes);
    require(
      AbilityNames.get(encodedName) == bytes32(0),
      "Ability name already taken"
    );

    bytes32 abilityId = keccak256(
      abi.encodePacked(_msgSender(), block.timestamp, block.prevrandao)
    );

    Abilities.set(
      abilityId,
      _msgSender(),
      block.timestamp,
      0, // shamanCount
      name,
      metadata
    );

    AbilityNames.set(encodedName, abilityId);

    emit AbilityCreated(abilityId, _msgSender());
  }

  function updateAbilityMetadata(
    bytes32 abilityId,
    string memory metadata
  ) public onlyAbilityCreator(abilityId) {
    require(bytes(metadata).length > 0, "Metadata cannot be empty");
    Abilities.setMetadata(abilityId, metadata);
  }

  function updateAbilityName(
    bytes32 abilityId,
    string memory name
  ) public onlyAbilityCreator(abilityId) {
    require(bytes(name).length > 0, "Name cannot be empty");
    require(bytes(name).length <= 20, "Name too long");
    bytes32 encodedName = keccak256(bytes(name));
    require(AbilityNames.get(encodedName) == bytes32(0), "Name already taken");
    Abilities.setName(abilityId, name);
    AbilityNames.set(encodedName, abilityId);
  }

  function getAbilityName(
    bytes32 abilityId
  ) public view returns (string memory) {
    return Abilities.getName(abilityId);
  }

  function getAbilityMetadata(
    bytes32 abilityId
  ) public view returns (string memory) {
    return Abilities.getMetadata(abilityId);
  }

  function getAbilityCreator(bytes32 abilityId) public view returns (address) {
    return Abilities.getCreator(abilityId);
  }
}
