// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, ShamanNames } from "../src/codegen/index.sol";

contract ShamanSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmTest1";
  string constant UPDATED_METADATA = "QmTest2";
  string constant INITIAL_NAME = "Test Shaman";

  function testCreateShaman() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_NAME,
      INITIAL_METADATA
    );

    // Verify the shaman was created
    assertEq(Shamans.getCreator(shamanId), creatorAlice);
    assertEq(Shamans.getMetadata(shamanId), INITIAL_METADATA);
  }

  function testCreateShamanWithEmptyName() public {
    vm.prank(creatorAlice);
    vm.expectRevert("Shaman name cannot be empty");
    world.createShaman("", INITIAL_METADATA);
    vm.stopPrank();
  }

  function testCreateShamanWithLongName() public {
    string memory longName = "ThisNameIsTooLongForAShaman";

    vm.prank(creatorAlice);
    vm.expectRevert("Shaman name too long");
    world.createShaman(longName, INITIAL_METADATA);
    vm.stopPrank();
  }

  function testCreateShamanWithEmptyMetadata() public {
    vm.prank(creatorAlice);
    vm.expectRevert("Metadata cannot be empty");
    world.createShaman(INITIAL_NAME, "");
    vm.stopPrank();
  }

  function testCreateShamanWithDuplicateName() public {
    // Create first shaman
    _createShaman(creatorAlice, INITIAL_NAME, INITIAL_METADATA);

    // Try to create another shaman with the same name
    vm.prank(creatorBob);
    vm.expectRevert("Shaman name already taken");
    world.createShaman(INITIAL_NAME, INITIAL_METADATA);
    vm.stopPrank();
  }

  function testUpdateShamanMetadata() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_NAME,
      INITIAL_METADATA
    );

    vm.prank(creatorAlice);
    world.updateShamanMetadata(shamanId, UPDATED_METADATA);
    vm.stopPrank();

    assertEq(Shamans.getMetadata(shamanId), UPDATED_METADATA);
  }

  function testUpdateShamanMetadataNotCreator() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_NAME,
      INITIAL_METADATA
    );

    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.updateShamanMetadata(shamanId, UPDATED_METADATA);
    vm.stopPrank();

    // Metadata should remain unchanged
    assertEq(Shamans.getMetadata(shamanId), INITIAL_METADATA);
  }

  function testUpdateShamanMetadataEmptyMetadata() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_NAME,
      INITIAL_METADATA
    );

    vm.prank(creatorAlice);
    vm.expectRevert("Metadata cannot be empty");
    world.updateShamanMetadata(shamanId, "");
    vm.stopPrank();

    // Metadata should remain unchanged
    assertEq(Shamans.getMetadata(shamanId), INITIAL_METADATA);
  }

  function testGetShamanMetadata() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_NAME,
      INITIAL_METADATA
    );

    string memory metadata = world.getShamanMetadata(shamanId);
    assertEq(metadata, INITIAL_METADATA);
  }

  function testGetShamanIdByName() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_NAME,
      INITIAL_METADATA
    );

    bytes32 retrievedId = world.getShamanIdByName(INITIAL_NAME);
    assertEq(retrievedId, shamanId);
  }

  function testGetShamanIdByNameNonExistent() public {
    bytes32 retrievedId = world.getShamanIdByName("NonExistentName");
    assertEq(retrievedId, bytes32(0));
  }

  function testGetShamanName() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_NAME,
      INITIAL_METADATA
    );

    string memory name = world.getShamanName(shamanId);
    assertEq(name, INITIAL_NAME);
  }

  function testGetShamanCreator() public {
    bytes32 shamanId = _createShaman(
      creatorAlice,
      INITIAL_NAME,
      INITIAL_METADATA
    );

    address creator = world.getShamanCreator(shamanId);
    assertEq(creator, creatorAlice);
  }
}
