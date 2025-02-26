// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, ShamanLogs } from "../src/codegen/index.sol";
import { LogType } from "../src/codegen/common.sol";

contract ShamanSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmTest1";
  string constant UPDATED_METADATA = "QmTest2";
  string constant LOG_METADATA = "QmTestLog1";

  uint256 public constant INITIAL_MAX_SUPPLY = 1_000_000;
  uint256 public constant INITIAL_PRICE = 10;

  function testCreateShaman() public {
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);

    // Alice creates a shaman with an initial deposit of 100 $ZUG
    uint256 initialDeposit = 100;
    bytes32 shamanId = _createShaman(
      creatorAlice,
      initialDeposit,
      INITIAL_METADATA
    );

    // Verify the shaman was created
    assertEq(Shamans.getCreator(shamanId), creatorAlice);
    assertEq(Shamans.getActive(shamanId), true);
    assertEq(Shamans.getBalance(shamanId), initialDeposit);
    assertEq(Shamans.getMetadata(shamanId), INITIAL_METADATA);

    // Verify the deposit transaction was logged
    bytes32 logId = keccak256(
      abi.encodePacked(shamanId, block.timestamp, block.prevrandao)
    );
    assertEq(ShamanLogs.getShamanId(logId), shamanId);
    assertEq(uint256(ShamanLogs.getLogType(logId)), uint256(LogType.Deposit));
    assertEq(ShamanLogs.getAmount(logId), initialDeposit);
    assertEq(ShamanLogs.getSuccess(logId), true);
  }

  function testCreateShamanWithEmptyMetadata() public {
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);

    // Try to create a shaman with empty metadata
    vm.prank(creatorAlice);
    vm.expectRevert("Metadata cannot be empty");
    world.createShaman(100, "");
    vm.stopPrank();
  }

  function testUpdateShamanMetadata() public {
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);

    // Create initial shaman
    uint256 initialDeposit = 100;
    bytes32 shamanId = _createShaman(
      creatorAlice,
      initialDeposit,
      INITIAL_METADATA
    );

    // Update metadata
    vm.prank(creatorAlice);
    world.updateShamanMetadata(shamanId, UPDATED_METADATA);
    vm.stopPrank();

    // Verify metadata was updated
    assertEq(Shamans.getMetadata(shamanId), UPDATED_METADATA);
  }

  function testUpdateShamanMetadataOnlyCreator() public {
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);

    // Create initial shaman
    uint256 initialDeposit = 100;
    bytes32 shamanId = _createShaman(
      creatorAlice,
      initialDeposit,
      INITIAL_METADATA
    );

    // Try to update metadata as non-creator
    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.updateShamanMetadata(shamanId, UPDATED_METADATA);
    vm.stopPrank();

    // Verify metadata was not updated
    assertEq(Shamans.getMetadata(shamanId), INITIAL_METADATA);
  }

  function testUpdateShamanMetadataEmptyURI() public {
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);

    // Create initial shaman
    uint256 initialDeposit = 100;
    bytes32 shamanId = _createShaman(
      creatorAlice,
      initialDeposit,
      INITIAL_METADATA
    );

    // Try to update with empty metadata
    vm.prank(creatorAlice);
    vm.expectRevert("Metadata cannot be empty");
    world.updateShamanMetadata(shamanId, "");
    vm.stopPrank();

    // Verify metadata was not updated
    assertEq(Shamans.getMetadata(shamanId), INITIAL_METADATA);
  }

  function testCancelShamanByCreator() public {
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);

    // Create shaman with initial deposit
    uint256 initialDeposit = 100;
    bytes32 shamanId = _createShaman(
      creatorAlice,
      initialDeposit,
      INITIAL_METADATA
    );

    // Cancel shaman as creator
    uint256 creatorBalanceBefore = token.balanceOf(creatorAlice);

    vm.prank(creatorAlice);
    world.cancelShaman(shamanId);
    vm.stopPrank();

    // Verify shaman is inactive
    assertEq(Shamans.getActive(shamanId), false);

    // Verify balance was refunded
    assertEq(Shamans.getBalance(shamanId), 0);
    assertEq(
      token.balanceOf(creatorAlice),
      creatorBalanceBefore + initialDeposit
    );

    // Verify refund was logged
    bytes32 logId = keccak256(
      abi.encodePacked(shamanId, block.timestamp, block.prevrandao)
    );
    assertEq(ShamanLogs.getShamanId(logId), shamanId);
    assertEq(uint256(ShamanLogs.getLogType(logId)), uint256(LogType.Refund));
    assertEq(ShamanLogs.getAmount(logId), initialDeposit);
    assertEq(ShamanLogs.getSuccess(logId), true);
  }

  function testCancelShamanUnauthorized() public {
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);

    // Create shaman with initial deposit
    uint256 initialDeposit = 100;
    bytes32 shamanId = _createShaman(
      creatorAlice,
      initialDeposit,
      INITIAL_METADATA
    );

    // Try to cancel shaman as unauthorized user
    vm.prank(creatorBob);
    vm.expectRevert("Not shaman creator");
    world.cancelShaman(shamanId);
    vm.stopPrank();

    // Verify shaman is still active
    assertEq(Shamans.getActive(shamanId), true);
    assertEq(Shamans.getBalance(shamanId), initialDeposit);
  }

  function testCancelInactiveShaman() public {
    _mintTokens(creatorAlice, 10000);
    _increaseAllowance(creatorAlice, 10000);

    // Create and cancel shaman
    uint256 initialDeposit = 100;
    bytes32 shamanId = _createShaman(
      creatorAlice,
      initialDeposit,
      INITIAL_METADATA
    );

    vm.prank(creatorAlice);
    world.cancelShaman(shamanId);
    vm.stopPrank();

    // Try to cancel again
    vm.prank(creatorAlice);
    vm.expectRevert("Shaman is not active");
    world.cancelShaman(shamanId);
    vm.stopPrank();
  }
}
