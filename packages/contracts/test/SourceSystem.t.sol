// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Sources, SourceNames, Roles } from "../src/codegen/index.sol";
import { RoleType } from "../src/codegen/common.sol";

contract SourceSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmSourceTest1";
  string constant INITIAL_NAME = "Test Source";

  function testCreateSource() public {
    bytes32 sourceId = _createSource(
      creatorAlice,
      INITIAL_NAME,
      INITIAL_METADATA
    );

    assertEq(Sources.getCreator(sourceId), creatorAlice);
    assertEq(Sources.getMetadata(sourceId), INITIAL_METADATA);
    assertEq(Sources.getName(sourceId), INITIAL_NAME);
  }

  function testCreateSourceWithEmptyName() public {
    _setMember(creatorAlice);
    vm.prank(creatorAlice);
    vm.expectRevert();
    world.createSource("", INITIAL_METADATA);
    vm.stopPrank();
  }

  function testCreateSourceWithLongName() public {
    string memory longName = "ThisNameIsTooLongForASource";
    _setMember(creatorAlice);
    vm.prank(creatorAlice);
    vm.expectRevert();
    world.createSource(longName, INITIAL_METADATA);
    vm.stopPrank();
  }

  function testCreateSourceWithEmptyMetadata() public {
    _setMember(creatorAlice);
    vm.prank(creatorAlice);
    vm.expectRevert();
    world.createSource(INITIAL_NAME, "");
    vm.stopPrank();
  }

  function testCreateSourceWithDuplicateName() public {
    _createSource(creatorAlice, INITIAL_NAME, INITIAL_METADATA);

    _setMember(creatorAlice);
    vm.prank(creatorAlice);
    vm.expectRevert();
    world.createSource(INITIAL_NAME, INITIAL_METADATA);
    vm.stopPrank();
  }
}
