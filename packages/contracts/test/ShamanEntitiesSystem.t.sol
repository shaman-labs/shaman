// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Abilities, Sources, Roles, ShamanAbility, ShamanSource } from "../src/codegen/index.sol";
import { ShamanState, RoleType } from "../src/codegen/common.sol";

contract ShamanEntitiesSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmShamanTest1";

  uint256 constant INITIAL_BALANCE = 1000;

  function _setupOperator(address operator) private {
    vm.prank(signerAddress);
    Roles.setRole(operator, RoleType.Operator);
    vm.stopPrank();
  }

  function _prepareTokens(address user, uint256 amount) private {
    _mintTokens(user, amount);
    _increaseAllowance(user, amount);
  }

  function _createTestAbilities(
    address creator,
    string memory suffix
  ) internal returns (bytes32, bytes32) {
    vm.recordLogs();

    // Use single-character names to avoid "Ability name too long" error
    string memory name1 = string(abi.encodePacked("A", suffix));
    bytes32 abilityId1 = _createAbility(creator, name1, "QmTest1");

    // simulate sleep to avoid same abilityId
    vm.warp(block.timestamp + 5 seconds);

    string memory name2 = string(abi.encodePacked("B", suffix));
    bytes32 abilityId2 = _createAbility(creator, name2, "QmTest2");

    return (abilityId1, abilityId2);
  }

  function _createTestAbilities(
    address creator
  ) private returns (bytes32 abilityId1, bytes32 abilityId2) {
    return _createTestAbilities(creator, "");
  }

  function _createTestSources(
    address creator,
    string memory suffix
  ) internal returns (bytes32, bytes32) {
    vm.recordLogs();

    // Use single-character names to avoid "Source name too long" error
    string memory name1 = string(abi.encodePacked("X", suffix));
    bytes32 sourceId1 = _createSource(creator, name1, "QmTest1");

    // simulate sleep to avoid same sourceId
    vm.warp(block.timestamp + 5 seconds);

    string memory name2 = string(abi.encodePacked("Y", suffix));
    bytes32 sourceId2 = _createSource(creator, name2, "QmTest2");

    return (sourceId1, sourceId2);
  }

  function _createTestSources(
    address creator
  ) private returns (bytes32 sourceId1, bytes32 sourceId2) {
    return _createTestSources(creator, "");
  }

  function _createTestShaman(
    address creator,
    bytes32[] memory abilityIds,
    bytes32[] memory sourceIds
  ) private returns (bytes32 shamanId) {
    _prepareTokens(creator, INITIAL_BALANCE);

    vm.recordLogs();
    vm.prank(creator);
    world.createShaman(
      INITIAL_BALANCE,
      abilityIds,
      sourceIds,
      INITIAL_METADATA
    );
    vm.stopPrank();

    // Get the shaman ID from the logs
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == keccak256("ShamanCreated(bytes32,address)")) {
        shamanId = bytes32(entries[i].topics[1]);
        break;
      }
    }

    require(shamanId != bytes32(0), "Shaman creation failed");

    // Verify the shaman was created correctly
    assertEq(
      Shamans.getCreator(shamanId),
      creator,
      "Creator not set correctly"
    );
    assertEq(
      Shamans.getBalance(shamanId),
      INITIAL_BALANCE,
      "Balance not set correctly"
    );
    assertEq(
      Shamans.getMetadata(shamanId),
      INITIAL_METADATA,
      "Metadata not set correctly"
    );

    return shamanId;
  }

  function testAddAbility() public {
    _setupOperator(creatorAlice);
    (bytes32 abilityId1, bytes32 abilityId2) = _createTestAbilities(
      creatorAlice,
      "AddTest1"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "AddTest1");

    // Create a shaman with no abilities initially
    bytes32[] memory initialAbilityIds = new bytes32[](0);

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialAbilityIds,
      sourceIds
    );

    // Verify initial state
    assertEq(Shamans.getAbilityCount(shamanId), 0);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId1), 0);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId2), 0);

    // Add first ability to the shaman
    vm.prank(creatorAlice);
    world.addAbilityToShaman(shamanId, abilityId1);
    vm.stopPrank();

    // Verify the first ability was added
    assertEq(Shamans.getAbilityCount(shamanId), 1);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId1) > 0, true);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId2), 0);

    // Add second ability to the shaman
    vm.prank(creatorAlice);
    world.addAbilityToShaman(shamanId, abilityId2);
    vm.stopPrank();

    // Verify the second ability was added
    assertEq(Shamans.getAbilityCount(shamanId), 2);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId1) > 0, true);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId2) > 0, true);
  }

  function testAddAbilityNotCreator() public {
    _setupOperator(creatorAlice);
    (bytes32 abilityId1, bytes32 abilityId2) = _createTestAbilities(
      creatorAlice,
      "AddTest3"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "AddTest3");

    // Create a shaman with no abilities initially
    bytes32[] memory initialAbilityIds = new bytes32[](0);

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialAbilityIds,
      sourceIds
    );

    // Add first ability to the shaman
    vm.prank(creatorAlice);
    world.addAbilityToShaman(shamanId, abilityId1);
    vm.stopPrank();

    // Verify the first ability was added
    assertEq(Shamans.getAbilityCount(shamanId), 1);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId1) > 0, true);

    // Try to add an ability as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.addAbilityToShaman(shamanId, abilityId2);
    vm.stopPrank();

    // Verify the ability was not added
    assertEq(Shamans.getAbilityCount(shamanId), 1);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId2), 0);
  }

  function testAddAbilityAlreadyExists() public {
    _setupOperator(creatorAlice);
    (bytes32 abilityId1, ) = _createTestAbilities(creatorAlice, "3");
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "3");

    // Create a shaman with one ability initially
    bytes32[] memory abilityIds = new bytes32[](1);
    abilityIds[0] = abilityId1;

    bytes32[] memory initialSourceIds = new bytes32[](1);
    initialSourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      abilityIds,
      initialSourceIds
    );

    // Verify the ability was added
    assertEq(Shamans.getAbilityCount(shamanId), 1);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId1) > 0, true);

    // Try to add the same ability again
    vm.prank(creatorAlice);
    vm.expectRevert("Ability already exists in shaman");
    world.addAbilityToShaman(shamanId, abilityId1);
    vm.stopPrank();

    // Verify the ability count is still 1
    assertEq(Shamans.getAbilityCount(shamanId), 1);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId1) > 0, true);
  }

  function testRemoveAbility() public {
    _setupOperator(creatorAlice);
    (bytes32 abilityId1, bytes32 abilityId2) = _createTestAbilities(
      creatorAlice,
      "RemoveTest1"
    );
    (bytes32 sourceId1, ) = _createTestSources(creatorAlice, "RemoveTest1");

    // Create a shaman with two abilities initially
    bytes32[] memory initialAbilityIds = new bytes32[](2);
    initialAbilityIds[0] = abilityId1;
    initialAbilityIds[1] = abilityId2;

    bytes32[] memory sourceIds = new bytes32[](1);
    sourceIds[0] = sourceId1;

    bytes32 shamanId = _createTestShaman(
      creatorAlice,
      initialAbilityIds,
      sourceIds
    );

    // Verify initial state
    assertEq(Shamans.getAbilityCount(shamanId), 2);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId1) > 0, true);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId2) > 0, true);

    // Remove first ability from the shaman
    vm.prank(creatorAlice);
    world.removeAbilityFromShaman(shamanId, abilityId1);
    vm.stopPrank();

    // Verify the first ability was removed
    assertEq(Shamans.getAbilityCount(shamanId), 1);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId1), 0);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId2) > 0, true);

    // Remove second ability from the shaman
    vm.prank(creatorAlice);
    world.removeAbilityFromShaman(shamanId, abilityId2);
    vm.stopPrank();

    // Verify the second ability was removed
    assertEq(Shamans.getAbilityCount(shamanId), 0);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId1), 0);
    assertEq(ShamanAbility.getCreatedAt(shamanId, abilityId2), 0);
  }
}
