// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Workflows } from "../codegen/index.sol";
import { WorkflowState, LogType, RoleType } from "../codegen/common.sol";
import { WorkflowLogsLib } from "../lib/WorkflowLogsLib.sol";
import { BaseSystem } from "./BaseSystem.sol";

contract WorkflowJobsSystem is BaseSystem {
  function enqueueWorkflowJob(
    bytes32 workflowId,
    uint256 cost
  )
    public
    onlyOperator
    onlyActiveWorkflow(workflowId)
    onlyIdleWorkflow(workflowId)
  {
    require(
      Workflows.getBalance(workflowId) >= cost,
      "Workflow has insufficient balance"
    );

    require(
      _token().balanceOf(address(this)) >= cost,
      "Operator has insufficient balance"
    );

    Workflows.setState(workflowId, WorkflowState.Queue);
    WorkflowLogsLib.logOperation(workflowId, 0, true, LogType.Queue, "");
  }

  function startWorkflowJob(
    bytes32 workflowId
  ) public onlyOperator onlyActiveWorkflow(workflowId) {
    require(
      Workflows.getState(workflowId) == WorkflowState.Queue,
      "Workflow must be queued"
    );

    Workflows.setState(workflowId, WorkflowState.InProgress);
    WorkflowLogsLib.logOperation(workflowId, 0, true, LogType.Start, "");
  }

  function completeWorkflowJob(
    bytes32 workflowId,
    uint256 cost,
    bool success,
    string memory metadata
  ) public onlyOperator onlyActiveWorkflow(workflowId) {
    require(
      Workflows.getState(workflowId) == WorkflowState.InProgress,
      "Workflow must be in progress"
    );
    require(
      Workflows.getBalance(workflowId) >= cost,
      "Workflow has insufficient balance"
    );

    require(
      _token().balanceOf(address(this)) >= cost,
      "Operator has insufficient balance"
    );

    Workflows.setState(workflowId, WorkflowState.Idle);
    Workflows.setBalance(workflowId, Workflows.getBalance(workflowId) - cost);

    WorkflowLogsLib.logOperation(
      workflowId,
      cost,
      success,
      LogType.Completion,
      metadata
    );

    _token().burn(cost);
  }
}
