// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Workflows } from "../codegen/index.sol";
import { WorkflowState } from "../codegen/common.sol";
import { BaseSystem } from "./BaseSystem.sol";
import { LogType } from "../codegen/common.sol";
import { WorkflowLogsLib } from "../lib/WorkflowLogsLib.sol";
import { WorkflowEntitiesLib } from "../lib/WorkflowEntitiesLib.sol";

contract WorkflowSystem is BaseSystem {
  event WorkflowCreated(bytes32 indexed workflowId, address indexed creator);

  function createWorkflow(
    uint256 balance,
    bytes32[] memory shamanIds,
    bytes32[] memory sourceIds,
    string memory metadata
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
      balance,
      0, // shamanCount
      0, // sourceCount
      metadata
    );

    // add initial shamans if provided
    for (uint256 i = 0; i < shamanIds.length; i++) {
      WorkflowEntitiesLib.addShaman(workflowId, shamanIds[i]);
    }

    // add initial sources if provided
    for (uint256 i = 0; i < sourceIds.length; i++) {
      WorkflowEntitiesLib.addSource(workflowId, sourceIds[i]);
    }

    // log initial deposit if balance provided
    if (balance > 0) {
      WorkflowLogsLib.logOperation(
        workflowId,
        balance,
        true,
        LogType.Deposit,
        ""
      );

      // get funds tokens
      _token().transferFrom(_msgSender(), address(this), balance);
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
