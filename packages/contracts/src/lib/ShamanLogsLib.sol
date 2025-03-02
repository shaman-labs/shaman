// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ShamanLogs } from "../codegen/index.sol";
import { LogType } from "../codegen/common.sol";

library ShamanLogsLib {
  function logOperation(
    bytes32 shamanId,
    uint256 amount,
    bool success,
    LogType logType,
    string memory metadata
  ) internal returns (bytes32) {
    bytes32 logId = keccak256(
      abi.encodePacked(shamanId, block.timestamp, block.prevrandao)
    );

    ShamanLogs.setShamanId(logId, shamanId);
    ShamanLogs.setCreatedAt(logId, block.timestamp);
    ShamanLogs.setLogType(logId, logType);
    ShamanLogs.setSuccess(logId, success);
    ShamanLogs.setAmount(logId, amount);
    ShamanLogs.setMetadata(logId, metadata);

    return logId;
  }
}
