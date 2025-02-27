// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { WorkflowLogs } from "../codegen/index.sol";
import { LogType } from "../codegen/common.sol";
import { IZugToken } from "../IZugToken.sol";

library WorkflowLogsLib {
  function logOperation(
    bytes32 workflowId,
    uint256 amount,
    bool success,
    LogType logType,
    string memory metadata
  ) internal returns (bytes32) {
    bytes32 logId = keccak256(
      abi.encodePacked(workflowId, block.timestamp, block.prevrandao)
    );

    WorkflowLogs.setWorkflowId(logId, workflowId);
    WorkflowLogs.setCreatedAt(logId, block.timestamp);
    WorkflowLogs.setLogType(logId, logType);
    WorkflowLogs.setSuccess(logId, success);
    WorkflowLogs.setAmount(logId, amount);
    WorkflowLogs.setMetadata(logId, metadata);

    return logId;
  }
}
