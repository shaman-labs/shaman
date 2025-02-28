// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Sources, Workflows, Shamans, WorkflowShaman, WorkflowSource, WorkflowSourceIndex, WorkflowShamanIndex, SourceWorkflowIndex, ShamanWorkflowIndex } from "../codegen/index.sol";
import { LogType } from "../codegen/common.sol";

library WorkflowEntitiesLib {
  function addShaman(bytes32 workflowId, bytes32 shamanId) internal {
    WorkflowShaman.set(workflowId, shamanId, block.timestamp);

    uint32 workflowShamanCount = Workflows.getShamanCount(workflowId);
    WorkflowShamanIndex.set(workflowId, workflowShamanCount, shamanId);
    Workflows.setShamanCount(workflowId, workflowShamanCount + 1);

    uint32 shamanWorkflowCount = Shamans.getWorkflowCount(shamanId);
    ShamanWorkflowIndex.set(shamanId, shamanWorkflowCount, workflowId);
    Shamans.setWorkflowCount(shamanId, shamanWorkflowCount + 1);
  }

  function removeShaman(bytes32 workflowId, bytes32 shamanId) internal {
    WorkflowShaman.deleteRecord(workflowId, shamanId);

    uint32 workflowShamanCount = Workflows.getShamanCount(workflowId);
    for (uint32 i = 0; i < workflowShamanCount; i++) {
      if (WorkflowShamanIndex.getShamanId(workflowId, i) == shamanId) {
        if (i != workflowShamanCount - 1) {
          bytes32 lastShamanId = WorkflowShamanIndex.getShamanId(
            workflowId,
            workflowShamanCount - 1
          );
          WorkflowShamanIndex.set(workflowId, i, lastShamanId);
        }
        Workflows.setShamanCount(workflowId, workflowShamanCount - 1);
        break;
      }
    }

    uint32 shamanWorkflowCount = Shamans.getWorkflowCount(shamanId);
    for (uint32 i = 0; i < shamanWorkflowCount; i++) {
      if (ShamanWorkflowIndex.getWorkflowId(shamanId, i) == workflowId) {
        if (i != shamanWorkflowCount - 1) {
          bytes32 lastWorkflowId = ShamanWorkflowIndex.getWorkflowId(
            shamanId,
            shamanWorkflowCount - 1
          );
          ShamanWorkflowIndex.set(shamanId, i, lastWorkflowId);
        }
        Shamans.setWorkflowCount(shamanId, shamanWorkflowCount - 1);
        break;
      }
    }
  }

  function addSource(bytes32 workflowId, bytes32 sourceId) internal {
    WorkflowSource.set(workflowId, sourceId, block.timestamp);

    uint32 workflowSourceCount = Workflows.getSourceCount(workflowId);
    WorkflowSourceIndex.set(workflowId, workflowSourceCount, sourceId);
    Workflows.setSourceCount(workflowId, workflowSourceCount + 1);

    uint32 sourceWorkflowCount = Sources.getWorkflowCount(sourceId);
    SourceWorkflowIndex.set(sourceId, sourceWorkflowCount, workflowId);
    Sources.setWorkflowCount(sourceId, sourceWorkflowCount + 1);
  }

  function removeSource(bytes32 workflowId, bytes32 sourceId) internal {
    WorkflowSource.deleteRecord(workflowId, sourceId);

    uint32 workflowSourceCount = Workflows.getSourceCount(workflowId);
    for (uint32 i = 0; i < workflowSourceCount; i++) {
      if (WorkflowSourceIndex.getSourceId(workflowId, i) == sourceId) {
        if (i != workflowSourceCount - 1) {
          bytes32 lastSourceId = WorkflowSourceIndex.getSourceId(
            workflowId,
            workflowSourceCount - 1
          );
          WorkflowSourceIndex.set(workflowId, i, lastSourceId);
        }
        Workflows.setSourceCount(workflowId, workflowSourceCount - 1);
        break;
      }
    }

    uint32 sourceWorkflowCount = Sources.getWorkflowCount(sourceId);
    for (uint32 i = 0; i < sourceWorkflowCount; i++) {
      if (SourceWorkflowIndex.getWorkflowId(sourceId, i) == workflowId) {
        if (i != sourceWorkflowCount - 1) {
          bytes32 lastWorkflowId = SourceWorkflowIndex.getWorkflowId(
            sourceId,
            sourceWorkflowCount - 1
          );
          SourceWorkflowIndex.set(sourceId, i, lastWorkflowId);
        }
        Sources.setWorkflowCount(sourceId, sourceWorkflowCount - 1);
        break;
      }
    }
  }
}
