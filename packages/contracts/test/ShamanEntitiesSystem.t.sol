// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.t.sol";
import { Shamans, Spells, Sources, Roles, ShamanSpell, ShamanSpellEdges, SourceShaman, SourceShamanLookup, SpellVersions } from "../src/codegen/index.sol";
import { JobState, RoleType } from "../src/codegen/common.sol";
import { ShamanEntitiesLib, SpellEdge } from "../src/lib/ShamanEntitiesLib.sol";

contract ShamanEntitiesSystemTest is BaseTest {
  string constant INITIAL_METADATA = "QmShamanTest1";

  uint256 constant INITIAL_BALANCE = 1000;

  address internal nonCreatorBob = address(0xB0BB);

  function _createTestSpells(
    address creator,
    string memory name
  ) internal returns (bytes32, bytes32) {
    bytes32 spellId1 = _createSpell(
      creator,
      string.concat(name, "1"),
      "metadata1"
    );
    bytes32 spellId2 = _createSpell(
      creator,
      string.concat(name, "2"),
      "metadata2"
    );
    return (spellId1, spellId2);
  }

  function _createTestSources(
    address creator,
    string memory name
  ) internal returns (bytes32, bytes32) {
    bytes32 sourceId1 = _createSource(
      creator,
      string.concat(name, "1"),
      "metadata1"
    );
    bytes32 sourceId2 = _createSource(
      creator,
      string.concat(name, "2"),
      "metadata2"
    );
    return (sourceId1, sourceId2);
  }

  function _createTestShaman(
    address creator,
    bytes32[] memory spellIds,
    bytes32[] memory sourceIds
  ) internal returns (bytes32) {
    bytes32 shamanId = _createShaman(creator, "TestShaman", "TestMetadata");

    if (spellIds.length > 0 || sourceIds.length > 0) {
      SpellEdge[] memory spellEdges = new SpellEdge[](spellIds.length);
      for (uint256 i = 0; i < spellIds.length; i++) {
        spellEdges[i] = _createSpellEdge(
          spellIds[i],
          spellIds[i],
          "test metadata"
        );
      }
      _updateShamanWorkflow(creator, shamanId, spellIds, sourceIds, spellEdges);
    }

    return shamanId;
  }
}
