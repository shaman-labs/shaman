// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Shamans } from "../codegen/index.sol";
import { ShamanState } from "../codegen/common.sol";
import { BaseSystem } from "./BaseSystem.sol";
import { LogType } from "../codegen/common.sol";
import { ShamanLogsLib } from "../lib/ShamanLogsLib.sol";
import { ShamanEntitiesLib } from "../lib/ShamanEntitiesLib.sol";

contract ShamanSystem is BaseSystem {
  event ShamanCreated(bytes32 indexed shamanId, address indexed creator);

  function createShaman(
    uint256 balance,
    bytes32[] memory abilityIds,
    bytes32[] memory sourceIds,
    string memory metadata
  ) public {
    bytes32 shamanId = keccak256(
      abi.encodePacked(_msgSender(), block.timestamp, block.prevrandao)
    );

    Shamans.set(
      shamanId,
      ShamanState.Idle,
      _msgSender(),
      block.timestamp,
      true,
      balance,
      0, // abilityCount
      0, // sourceCount
      metadata
    );

    // add initial abilities if provided
    for (uint256 i = 0; i < abilityIds.length; i++) {
      ShamanEntitiesLib.addAbility(shamanId, abilityIds[i]);
    }

    // add initial sources if provided
    for (uint256 i = 0; i < sourceIds.length; i++) {
      ShamanEntitiesLib.addSource(shamanId, sourceIds[i]);
    }

    // log initial deposit if balance provided
    if (balance > 0) {
      ShamanLogsLib.logOperation(shamanId, balance, true, LogType.Deposit, "");

      // get funds tokens
      _token().transferFrom(_msgSender(), address(this), balance);
    }

    emit ShamanCreated(shamanId, _msgSender());
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

  function getShamanState(bytes32 shamanId) public view returns (ShamanState) {
    return Shamans.getState(shamanId);
  }

  function getShamanMetadata(
    bytes32 shamanId
  ) public view returns (string memory) {
    return Shamans.getMetadata(shamanId);
  }

  function getShamanBalance(bytes32 shamanId) public view returns (uint256) {
    return Shamans.getBalance(shamanId);
  }

  function getShamanActive(bytes32 shamanId) public view returns (bool) {
    return Shamans.getActive(shamanId);
  }

  function getShamanCreator(bytes32 shamanId) public view returns (address) {
    return Shamans.getCreator(shamanId);
  }
}
