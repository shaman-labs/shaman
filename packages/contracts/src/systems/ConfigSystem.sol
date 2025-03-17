// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";
import { ShamanConfig, Roles } from "../codegen/index.sol";
import { RoleType } from "../codegen/common.sol";

contract ConfigSystem is BaseSystem {
  function getTokenAddress() public view returns (address) {
    return address(_token());
  }

  function isMember(address member) public view returns (bool) {
    return Roles.getRole(member) == RoleType.Member;
  }

  function setMembers(address[] calldata members) public onlyAdmin {
    uint256 memberCount = members.length;
    for (uint256 i = 0; i < memberCount; ) {
      Roles.setRole(members[i], RoleType.Member);
      unchecked {
        ++i;
      }
    }
  }
}
