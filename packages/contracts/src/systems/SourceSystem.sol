// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { Sources, SourceNames } from "../codegen/index.sol";

contract SourceSystem is BaseSystem {
  event SourceCreated(bytes32 indexed sourceId, address indexed creator);

  function createSource(
    string memory name,
    string memory metadata
  ) public onlyOperator {
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
      _msgSender(),
      block.timestamp,
      0, // workflowCount
      name,
      metadata
    );

    SourceNames.set(encodedName, sourceId);

    emit SourceCreated(sourceId, _msgSender());
  }
}
