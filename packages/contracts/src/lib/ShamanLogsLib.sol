// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ShamanLogs } from "../codegen/index.sol";
import { LogType } from "../codegen/common.sol";

library ShamanLogsLib {
  function logOperation(
    bytes32 shamanId,
    bytes32 shamanSpellId,
    uint256 amount,
    bool success,
    LogType logType,
    string memory metadata
  ) internal {
    bytes32 logId = keccak256(
      abi.encodePacked(
        shamanId,
        shamanSpellId,
        block.timestamp,
        block.prevrandao
      )
    );

    ShamanLogs.set(
      logId,
      logType,
      shamanId,
      shamanSpellId,
      amount,
      success,
      block.timestamp,
      metadata
    );
  }
}
