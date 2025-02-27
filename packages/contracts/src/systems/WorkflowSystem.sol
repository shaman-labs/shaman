// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { Workflows, WorkflowShaman, WorkflowShamanIndex, WorkflowSourceIndex, SourceWorkflowIndex, ShamanWorkflowIndex, WorkflowSource, Shamans, Sources } from "../codegen/index.sol";
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
      0, // shamanCount
      0, // sourceCount
      metadata
    );

    // add initial shamans if provided
    for (uint256 i = 0; i < initialShamans.length; i++) {
      _addShamanToWorkflow(workflowId, initialShamans[i]);
    }

    // add initial sources if provided
    for (uint256 i = 0; i < initialSources.length; i++) {
      _addSourceToWorkflow(workflowId, initialSources[i]);
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
    _addShamanToWorkflow(workflowId, shamanId);
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

    // remove from workflow->shaman index by finding and swapping with last element
    uint32 workflowShamanCount = Workflows.getShamanCount(workflowId);
    for (uint32 i = 0; i < workflowShamanCount; i++) {
      if (WorkflowShamanIndex.getShamanId(workflowId, i) == shamanId) {
        // move last element to this position if not already last
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

    // remove from shaman->workflow index by finding and swapping with last element
    uint32 shamanWorkflowCount = Shamans.getWorkflowCount(shamanId);
    for (uint32 i = 0; i < shamanWorkflowCount; i++) {
      if (ShamanWorkflowIndex.getWorkflowId(shamanId, i) == workflowId) {
        // move last element to this position if not already last
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

  function addSourceToWorkflow(
    bytes32 workflowId,
    bytes32 sourceId
  )
    public
    onlyWorkflowCreator(workflowId)
    onlyActiveWorkflow(workflowId)
    onlyIdleWorkflow(workflowId)
  {
    _addSourceToWorkflow(workflowId, sourceId);
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

    // remove from workflow->source index by finding and swapping with last element
    uint32 workflowSourceCount = Workflows.getSourceCount(workflowId);
    for (uint32 i = 0; i < workflowSourceCount; i++) {
      if (WorkflowSourceIndex.getSourceId(workflowId, i) == sourceId) {
        // move last element to this position if not already last
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

    // remove from source->workflow index by finding and swapping with last element
    uint32 sourceWorkflowCount = Sources.getWorkflowCount(sourceId);
    for (uint32 i = 0; i < sourceWorkflowCount; i++) {
      if (SourceWorkflowIndex.getWorkflowId(sourceId, i) == workflowId) {
        // move last element to this position if not already last
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

  function _addShamanToWorkflow(bytes32 workflowId, bytes32 shamanId) internal {
    WorkflowShaman.set(workflowId, shamanId, block.timestamp);

    // update workflow->shaman index
    uint32 workflowShamanCount = Workflows.getShamanCount(workflowId);
    WorkflowShamanIndex.set(workflowId, workflowShamanCount, shamanId);
    Workflows.setShamanCount(workflowId, workflowShamanCount + 1);

    // update shaman->workflow index
    uint32 shamanWorkflowCount = Shamans.getWorkflowCount(shamanId);
    ShamanWorkflowIndex.set(shamanId, shamanWorkflowCount, workflowId);
    Shamans.setWorkflowCount(shamanId, shamanWorkflowCount + 1);
  }

  function _addSourceToWorkflow(bytes32 workflowId, bytes32 sourceId) internal {
    WorkflowSource.set(workflowId, sourceId, block.timestamp);

    // update workflow->source index
    uint32 workflowSourceCount = Workflows.getSourceCount(workflowId);
    WorkflowSourceIndex.set(workflowId, workflowSourceCount, sourceId);
    Workflows.setSourceCount(workflowId, workflowSourceCount + 1);

    // update source->workflow index
    uint32 sourceWorkflowCount = Sources.getWorkflowCount(sourceId);
    SourceWorkflowIndex.set(sourceId, sourceWorkflowCount, workflowId);
    Sources.setWorkflowCount(sourceId, sourceWorkflowCount + 1);
  }
}
