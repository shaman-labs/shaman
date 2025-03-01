// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { WorkflowEntitiesLib } from "../lib/WorkflowEntitiesLib.sol";
import { Workflows, Shamans, Sources, WorkflowShamanIndex, WorkflowSourceIndex, SourceWorkflowIndex, ShamanWorkflowIndex } from "../codegen/index.sol";


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

  function getWorkflowShamanIds(
    bytes32 workflowId
  ) public view returns (bytes32[] memory) {
    uint32 count = Workflows.getShamanCount(workflowId);
    bytes32[] memory shamanIds = new bytes32[](count);

    for (uint32 i = 0; i < count; i++) {
      shamanIds[i] = WorkflowShamanIndex.getShamanId(workflowId, i);
    }

    return shamanIds;
  }

  function getWorkflowSourceIds(
    bytes32 workflowId
  ) public view returns (bytes32[] memory) {
    uint32 count = Workflows.getSourceCount(workflowId);
    bytes32[] memory sourceIds = new bytes32[](count);

    for (uint32 i = 0; i < count; i++) {
      sourceIds[i] = WorkflowSourceIndex.getSourceId(workflowId, i);
    }

    return sourceIds;
  }

  function getWorkflowIdsBySourceId(
    bytes32 sourceId
  ) public view returns (bytes32[] memory) {
    uint32 count = Sources.getWorkflowCount(sourceId);
    bytes32[] memory workflowIds = new bytes32[](count);

    for (uint32 i = 0; i < count; i++) {
      workflowIds[i] = SourceWorkflowIndex.getWorkflowId(sourceId, i);
    }

    return workflowIds;
  }

  function getWorkflowIdsByShamanId(
    bytes32 shamanId
  ) public view returns (bytes32[] memory) {
    uint32 count = Shamans.getWorkflowCount(shamanId);
    bytes32[] memory workflowIds = new bytes32[](count);

    for (uint32 i = 0; i < count; i++) {
      workflowIds[i] = ShamanWorkflowIndex.getWorkflowId(shamanId, i);
    }

    return workflowIds;
  }
}
