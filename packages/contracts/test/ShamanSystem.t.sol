// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans } from "../src/codegen/index.sol";
import { LogType } from "../src/codegen/common.sol";

contract ShamanSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmTest1";
  string constant UPDATED_METADATA = "QmTest2";
}
