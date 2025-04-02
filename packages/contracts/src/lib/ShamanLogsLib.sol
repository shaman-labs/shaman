// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ShamanLogs } from "../codegen/index.sol";
import { LogType } from "../codegen/common.sol";

library ShamanLogsLib {
  function logOperation(
    bytes32 shamanId,
    bytes32 spellId,
    uint256 amount,
    bool success,
    LogType logType,
    string memory metadata
  ) internal {
    bytes32 logId = keccak256(
      abi.encodePacked(shamanId, spellId, block.timestamp, block.prevrandao)
    );

    ShamanLogs.set(
      logId,
      logType,
      shamanId,
      spellId,
      amount,
      success,
      block.timestamp,
      metadata
    );
  }
}
