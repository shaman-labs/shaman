// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { Workflows, WorkflowShaman, WorkflowSource } from "../codegen/index.sol";
import { WorkflowState, LogType } from "../codegen/common.sol";
import { WorkflowLogsLib } from "../lib/WorkflowLogsLib.sol";

contract WorkflowSystem is BaseSystem {
  event WorkflowCreated(bytes32 indexed workflowId, address indexed creator);

  modifier onlyActiveWorkflow(bytes32 workflowId) {
    require(Workflows.getActive(workflowId), "Workflow is not active");
    _;
  }

  modifier onlyIdleWorkflow(bytes32 workflowId) {
    require(
      Workflows.getState(workflowId) == WorkflowState.Idle,
      "Workflow is not idle"
    );
    _;
  }

  function createWorkflow(
    uint256 initialBalance,
    string memory metadata,
    bytes32[] memory initialShamans,
    bytes32[] memory initialSources
  ) public {
    bytes32 workflowId = keccak256(
      abi.encodePacked(_msgSender(), block.timestamp, block.prevrandao)
    );

    Workflows.set(
      workflowId,
      WorkflowState.Idle,
      _msgSender(),
      block.timestamp,
      true,
      initialBalance,
      metadata
    );

    uint256 length = initialShamans.length;
    uint256 i;

    // add initial shamans if provided
    for (i = 0; i < length; ) {
      WorkflowShaman.set(workflowId, initialShamans[i], block.timestamp);
      unchecked {
        ++i;
      }
    }

    // add initial sources if provided
    length = initialSources.length;
    for (i = 0; i < length; ) {
      WorkflowSource.set(workflowId, initialSources[i], block.timestamp);
      unchecked {
        ++i;
      }
    }

    // log initial deposit if balance provided
    if (initialBalance > 0) {
      WorkflowLogsLib.logOperation(
        workflowId,
        initialBalance,
        true,
        LogType.Deposit,
        ""
      );

      // get funds tokens
      _token().transferFrom(_msgSender(), address(this), initialBalance);
    }

    emit WorkflowCreated(workflowId, _msgSender());
  }

  function updateWorkflowMetadata(
    bytes32 workflowId,
    string memory metadata
  )
    public
    onlyWorkflowCreator(workflowId)
    onlyActiveWorkflow(workflowId)
    onlyIdleWorkflow(workflowId)
  {
    require(bytes(metadata).length > 0, "Metadata cannot be empty");

    Workflows.setMetadata(workflowId, metadata);
  }

  function addShamanToWorkflow(
    bytes32 workflowId,
    bytes32 shamanId
  )
    public
    onlyWorkflowCreator(workflowId)
    onlyActiveWorkflow(workflowId)
    onlyIdleWorkflow(workflowId)
  {
    WorkflowShaman.set(workflowId, shamanId, block.timestamp);
  }

  function removeShamanFromWorkflow(
    bytes32 workflowId,
    bytes32 shamanId
  )
    public
    onlyWorkflowCreator(workflowId)
    onlyActiveWorkflow(workflowId)
    onlyIdleWorkflow(workflowId)
  {
    WorkflowShaman.deleteRecord(workflowId, shamanId);
  }

  function addSourceToWorkflow(
    bytes32 workflowId,
    bytes32 sourceId
  )
    public
    onlyWorkflowCreator(workflowId)
    onlyActiveWorkflow(workflowId)
    onlyIdleWorkflow(workflowId)
  {
    WorkflowSource.set(workflowId, sourceId, block.timestamp);
  }

  function removeSourceFromWorkflow(
    bytes32 workflowId,
    bytes32 sourceId
  )
    public
    onlyWorkflowCreator(workflowId)
    onlyActiveWorkflow(workflowId)
    onlyIdleWorkflow(workflowId)
  {
    WorkflowSource.deleteRecord(workflowId, sourceId);
  }

  // ensure not multiple jobs are enqueued at the same time for the same workflow
  function enqueueJob(
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

  function startJob(
    bytes32 workflowId
  ) public onlyOperator onlyActiveWorkflow(workflowId) {
    require(
      Workflows.getState(workflowId) == WorkflowState.Queue,
      "Workflow must be queued"
    );

    Workflows.setState(workflowId, WorkflowState.InProgress);

    WorkflowLogsLib.logOperation(workflowId, 0, true, LogType.Start, "");
  }

  // job can be retried later if balance is not enough to pay for it
  function completeJob(
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

    // burn operator's balance, so we ensure job is paid for
    _token().burn(cost);

    // update workflow balance
    Workflows.setBalance(workflowId, Workflows.getBalance(workflowId) - cost);

    Workflows.setState(workflowId, WorkflowState.Idle);

    WorkflowLogsLib.logOperation(
      workflowId,
      cost,
      success,
      LogType.Completion,
      metadata
    );
  }

  function updateWorkflowStatus(
    bytes32 workflowId,
    bool active
  )
    public
    onlyWorkflowCreator(workflowId)
    onlyActiveWorkflow(workflowId)
    onlyIdleWorkflow(workflowId)
  {
    Workflows.setActive(workflowId, active);
  }

  function getWorkflowState(
    bytes32 workflowId
  ) public view returns (WorkflowState) {
    return Workflows.getState(workflowId);
  }

  function getWorkflowMetadata(
    bytes32 workflowId
  ) public view returns (string memory) {
    return Workflows.getMetadata(workflowId);
  }

  function getWorkflowBalance(
    bytes32 workflowId
  ) public view returns (uint256) {
    return Workflows.getBalance(workflowId);
  }

  function getWorkflowActive(bytes32 workflowId) public view returns (bool) {
    return Workflows.getActive(workflowId);
  }

  function getWorkflowCreator(
    bytes32 workflowId
  ) public view returns (address) {
    return Workflows.getCreator(workflowId);
  }
}
