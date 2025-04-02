// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { Sources, SourceNames } from "../codegen/index.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

contract SourceSystem is BaseSystem {
  event SourceCreated(bytes32 indexed sourceId, address indexed creator);

  modifier onlyValidSourceType(uint8 sourceType) {
    // open for extension
    require(sourceType > 0 && sourceType < 3, "Invalid source type");
    _;
  }

  function createSource(
    uint8 sourceType,
    string memory name,
    string memory metadata
  ) public onlyMember onlyValidSourceType(sourceType) {
    bytes memory nameBytes = bytes(name);
    require(nameBytes.length > 0, "Source name cannot be empty");
    require(nameBytes.length <= 20, "Source name too long");
    require(bytes(metadata).length > 0, "Metadata cannot be empty");
    bytes32 encodedName = keccak256(nameBytes);
    require(
      SourceNames.get(encodedName) == bytes32(0),
      "Source name already taken"
    );

    bytes32 sourceId = keccak256(
      abi.encodePacked(_msgSender(), block.timestamp, block.prevrandao)
    );

    Sources.set(
      sourceId,
      sourceType,
      0, // nonce
      _msgSender(),
      block.timestamp,
      true,
      0, // shamanCount
      name,
      metadata
    );

    SourceNames.set(encodedName, sourceId);

    emit SourceCreated(sourceId, _msgSender());
  }

  function setSourceActive(
    bytes32 sourceId,
    bool active
  ) public onlySourceCreator(sourceId) {
    Sources.setActive(sourceId, active);
  }

  function updateSourceMetadata(
    bytes32 sourceId,
    string memory metadata
  ) public onlySourceCreator(sourceId) {
    Sources.setMetadata(sourceId, metadata);
  }

  function updateSourceName(
    bytes32 sourceId,
    string memory name
  ) public onlySourceCreator(sourceId) {
    require(bytes(name).length > 0, "Name cannot be empty");
    require(bytes(name).length <= 20, "Name too long");
    bytes32 encodedName = keccak256(bytes(name));
    require(SourceNames.get(encodedName) == bytes32(0), "Name already taken");
    Sources.setName(sourceId, name);
    SourceNames.set(encodedName, sourceId);
  }

  function rotateNonce(
    bytes32 sourceId
  ) public onlySourceCreator(sourceId) onlyActiveSource(sourceId) {
    Sources.setNonce(sourceId, Sources.getNonce(sourceId) + 1);
  }

  function validateSignatureNonce(
    bytes32 sourceId,
    bytes memory signature
  ) public view returns (bool) {
    return
      SignatureChecker.isValidSignatureNow(
        Sources.getCreator(sourceId),
        keccak256(abi.encodePacked(sourceId, Sources.getNonce(sourceId))),
        signature
      );
  }

  function getSourceName(bytes32 sourceId) public view returns (string memory) {
    return Sources.getName(sourceId);
  }

  function getSourceMetadata(
    bytes32 sourceId
  ) public view returns (string memory) {
    return Sources.getMetadata(sourceId);
  }

  function getSourceNonce(bytes32 sourceId) public view returns (uint256) {
    return Sources.getNonce(sourceId);
  }

  function getSourceCreator(bytes32 sourceId) public view returns (address) {
    return Sources.getCreator(sourceId);
  }

  function getSourceActive(bytes32 sourceId) public view returns (bool) {
    return Sources.getActive(sourceId);
  }

  function getSourceType(bytes32 sourceId) public view returns (uint8) {
    return Sources.getSourceType(sourceId);
  }
}
