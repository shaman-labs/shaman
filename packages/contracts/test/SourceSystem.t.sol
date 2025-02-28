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

  function _setupOperator(address operator) private {
    vm.prank(signerAddress);
    Roles.setRole(operator, RoleType.Operator);
    vm.stopPrank();
  }

  function _createSource(
    address creator,
    string memory name,
    string memory metadata
  ) internal returns (bytes32 sourceId) {
    // Make sure creator is an operator
    _setupOperator(creator);

    vm.recordLogs();

    vm.prank(creator);
    world.createSource(name, metadata);
    vm.stopPrank();

    // Get logs and find the SourceCreated event
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      // Check if this is our event
      if (entries[i].topics[0] == keccak256("SourceCreated(bytes32,address)")) {
        // For indexed parameters, they appear in topics
        // topics[0] is the event signature
        // topics[1] is the first indexed parameter (sourceId)
        sourceId = bytes32(entries[i].topics[1]);
        break;
      }
    }
    require(sourceId != bytes32(0), "Source creation failed");

    // Optional: Add debug logging
    console.log("Created source with ID:", uint256(sourceId));
  }

  function testCreateSource() public {
    bytes32 sourceId = _createSource(
      creatorAlice,
      INITIAL_NAME,
      INITIAL_METADATA
    );

    // Verify the source was created
    assertEq(Sources.getCreator(sourceId), creatorAlice);
    assertEq(Sources.getMetadata(sourceId), INITIAL_METADATA);
    assertEq(Sources.getName(sourceId), INITIAL_NAME);
  }

  function testCreateSourceNonOperator() public {
    vm.prank(creatorBob);
    vm.expectRevert("Not operator");
    world.createSource(INITIAL_NAME, INITIAL_METADATA);
    vm.stopPrank();
  }

  function testCreateSourceWithEmptyName() public {
    _setupOperator(creatorAlice);

    vm.prank(creatorAlice);
    vm.expectRevert("Source name cannot be empty");
    world.createSource("", INITIAL_METADATA);
    vm.stopPrank();
  }

  function testCreateSourceWithLongName() public {
    _setupOperator(creatorAlice);

    string memory longName = "ThisNameIsTooLongForASource";

    vm.prank(creatorAlice);
    vm.expectRevert("Source name too long");
    world.createSource(longName, INITIAL_METADATA);
    vm.stopPrank();
  }

  function testCreateSourceWithEmptyMetadata() public {
    _setupOperator(creatorAlice);

    vm.prank(creatorAlice);
    vm.expectRevert("Metadata cannot be empty");
    world.createSource(INITIAL_NAME, "");
    vm.stopPrank();
  }

  function testCreateSourceWithDuplicateName() public {
    // Create first source
    _createSource(creatorAlice, INITIAL_NAME, INITIAL_METADATA);

    // Try to create another source with the same name
    vm.prank(creatorAlice);
    vm.expectRevert("Source name already taken");
    world.createSource(INITIAL_NAME, INITIAL_METADATA);
    vm.stopPrank();
  }
}
