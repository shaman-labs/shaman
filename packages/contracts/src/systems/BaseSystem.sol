// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { IZugToken } from "../IZugToken.sol";
import { Shamans, ShamanConfig, Roles, Workflows } from "../codegen/index.sol";
import { RoleType, WorkflowState } from "../codegen/common.sol";

contract BaseSystem is System {
  modifier onlyOperator() {
    require(Roles.getRole(_msgSender()) == RoleType.Operator, "Not operator");
    _;
  }

  modifier onlyShamanCreator(bytes32 shamanId) {
    require(Shamans.getCreator(shamanId) == _msgSender(), "Not shaman creator");
    _;
  }

  modifier onlyWorkflowCreator(bytes32 workflowId) {
    require(
      Workflows.getCreator(workflowId) == _msgSender(),
      "Not workflow creator"
    );
    _;
  }

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

  function _token() internal view returns (IZugToken) {
    return IZugToken(ShamanConfig.getTokenAddress());
  }
}
