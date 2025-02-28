// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Workflows } from "../codegen/index.sol";
import { WorkflowState, LogType } from "../codegen/common.sol";
import { WorkflowLogsLib } from "../lib/WorkflowLogsLib.sol";
import { BaseSystem } from "./BaseSystem.sol";

contract WorkflowBalanceSystem is BaseSystem {
  function depositWorkflowBalance(
    bytes32 workflowId,
    uint256 amount
  ) public onlyWorkflowCreator(workflowId) onlyActiveWorkflow(workflowId) {
    require(amount > 0, "Amount must be greater than 0");

    Workflows.setBalance(workflowId, Workflows.getBalance(workflowId) + amount);
    WorkflowLogsLib.logOperation(workflowId, amount, true, LogType.Deposit, "");

    _token().transferFrom(_msgSender(), address(this), amount);
  }

  function withdrawWorkflowBalance(
    bytes32 workflowId,
    uint256 amount
  ) public onlyWorkflowCreator(workflowId) onlyActiveWorkflow(workflowId) {
    require(amount > 0, "Amount must be greater than 0");
    require(Workflows.getBalance(workflowId) >= amount, "Insufficient balance");

    Workflows.setBalance(workflowId, Workflows.getBalance(workflowId) - amount);
    WorkflowLogsLib.logOperation(
      workflowId,
      amount,
      true,
      LogType.Withdraw,
      ""
    );

    _token().transfer(_msgSender(), amount);
  }
}
