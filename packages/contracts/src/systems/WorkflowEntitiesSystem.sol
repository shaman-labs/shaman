// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { WorkflowEntitiesLib } from "../lib/WorkflowEntitiesLib.sol";

contract WorkflowEntitiesSystem is BaseSystem {
  function addShamanToWorkflow(
    bytes32 workflowId,
    bytes32 shamanId
  )
    public
    onlyWorkflowCreator(workflowId)
    onlyActiveWorkflow(workflowId)
    onlyIdleWorkflow(workflowId)
  {
    WorkflowEntitiesLib.addShaman(workflowId, shamanId);
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
    WorkflowEntitiesLib.removeShaman(workflowId, shamanId);
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
    WorkflowEntitiesLib.addSource(workflowId, sourceId);
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
    WorkflowEntitiesLib.removeSource(workflowId, sourceId);
  }
}
