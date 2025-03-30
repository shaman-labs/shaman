// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { ShamanConfig, Shamans, Roles } from "../src/codegen/index.sol";
import { RoleType } from "../src/codegen/common.sol";
import { IZugToken } from "../src/IZugToken.sol";
import { SpellEdge } from "../src/lib/ShamanEntitiesLib.sol";

contract BaseTest is MudTest, GasReporter {
  // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
  uint256 internal deployerPrivateKey = vm.envUint("PRIVATE_KEY");
  // Load the signer address
  address internal signerAddress = vm.envAddress("SIGNER_ADDRESS");
  // Load the treasury address
  address internal treasury = vm.envAddress("TREASURY_ADDRESS");

  IWorld world;

  // Contracts
  IZugToken token;

  // Creators
  address creatorAlice;
  address creatorBob;
  address creatorCharlie;

  // Mock contract for calldata execution
  address mockContract;

  function setUp() public override {
    super.setUp();
    world = IWorld(worldAddress);

    // Fetch contract addresses from the world
    token = IZugToken(ShamanConfig.getTokenAddress());

    // Initialize test accounts
    creatorAlice = makeAddr("alice");
    creatorBob = makeAddr("bob");
    creatorCharlie = makeAddr("charlie");

    console.log("Creator Alice:", creatorAlice);
    console.log("Creator Bob:", creatorBob);
    console.log("Creator Charlie:", creatorCharlie);
  }

  function _setMember(address member) internal virtual {
    vm.prank(signerAddress);
    Roles.setActive(member, RoleType.Member, true);
    vm.stopPrank();
  }

  function _setOperator(address operator) internal virtual {
    vm.prank(signerAddress);
    Roles.setActive(operator, RoleType.Operator, true);
    vm.stopPrank();
  }

  function _setAdmin(address admin) internal virtual {
    vm.prank(signerAddress);
    Roles.setActive(admin, RoleType.Admin, true);
    vm.stopPrank();
  }

  function _mintTokens(address to, uint256 amount) internal virtual {
    vm.prank(signerAddress);
    token.mint(to, amount);
    vm.stopPrank();
  }

  function _increaseAllowance(
    address creator,
    uint256 amount
  ) internal virtual {
    vm.prank(creator);
    token.approve(worldAddress, amount);
    vm.stopPrank();
  }

  function _prepareTokens(address user, uint256 amount) internal virtual {
    _mintTokens(user, amount);
    _increaseAllowance(user, amount);
  }

  function _createShaman(
    address creator,
    string memory name,
    string memory metadata
  ) internal virtual returns (bytes32 shamanId) {
    vm.recordLogs();

    _setMember(creator);

    vm.prank(creator);
    world.createShaman(name, metadata);
    vm.stopPrank();

    // Get logs and find the ShamanCreated event
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      // Check if this is our event
      if (entries[i].topics[0] == keccak256("ShamanCreated(bytes32,address)")) {
        // For indexed parameters, they appear in topics
        // topics[0] is the event signature
        // topics[1] is the first indexed parameter (shamanId)
        shamanId = bytes32(entries[i].topics[1]);
        break;
      }
    }
  }

  function _createSpell(
    address creator,
    string memory name,
    string memory metadata
  ) internal virtual returns (bytes32 spellId) {
    vm.recordLogs();

    _setMember(creator);

    vm.prank(creator);
    world.createSpell(name, metadata);
    vm.stopPrank();

    // Get the spell ID from the logs
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == keccak256("SpellCreated(bytes32,address)")) {
        spellId = bytes32(entries[i].topics[1]);
        break;
      }
    }
  }

  function _createSource(
    address creator,
    string memory name,
    string memory metadata
  ) internal virtual returns (bytes32 sourceId) {
    vm.recordLogs();

    _setMember(creator);

    vm.prank(creator);
    world.createSource(name, metadata);
    vm.stopPrank();

    // Get the source ID from the logs
    Vm.Log[] memory entries = vm.getRecordedLogs();
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].topics[0] == keccak256("SourceCreated(bytes32,address)")) {
        sourceId = bytes32(entries[i].topics[1]);
        break;
      }
    }
  }

  function _createSpellEdge(
    bytes32 fromSpellId,
    bytes32 toSpellId,
    string memory metadata
  ) internal virtual returns (SpellEdge memory) {
    return
      SpellEdge({
        fromSpellId: fromSpellId,
        toSpellId: toSpellId,
        createdAt: block.timestamp,
        metadata: metadata
      });
  }

  function _updateShamanWorkflow(
    address creator,
    bytes32 shamanId,
    bytes32[] memory spellIds,
    bytes32[] memory sourceIds,
    SpellEdge[] memory spellEdges
  ) internal virtual {
    vm.prank(creator);
    world.updateShamanWorkflow(shamanId, spellIds, sourceIds, spellEdges);
    vm.stopPrank();
  }
}
