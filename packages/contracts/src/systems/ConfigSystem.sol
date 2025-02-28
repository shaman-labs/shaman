// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { BaseSystem } from "./BaseSystem.sol";

contract ConfigSystem is BaseSystem {
  function getTokenAddress() public view returns (address) {
    return address(_token());
  }
}
