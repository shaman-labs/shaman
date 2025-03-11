// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Shamans } from "../codegen/index.sol";
import { JobState } from "../codegen/common.sol";
import { BaseSystem } from "./BaseSystem.sol";

contract ShamanInfoSystem is BaseSystem {
  function getShamanState(bytes32 shamanId) public view returns (JobState) {
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

  function getShamanName(bytes32 shamanId) public view returns (string memory) {
    return Shamans.getName(shamanId);
  }
}
