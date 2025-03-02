// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Sources } from "../src/codegen/index.sol";

contract SetSources is Script {
  function run() external {
    console.log("Starting Script.");

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    address worldAddress = vm.envAddress("WORLD_ADDRESS");
    address signerAddress = vm.envAddress("SIGNER_ADDRESS");

    vm.startBroadcast(deployerPrivateKey);

    StoreSwitch.setStoreAddress(worldAddress);

    Sources.set(
      keccak256("interval-hourly"),
      signerAddress,
      block.timestamp,
      0, // shamanCount
      "interval-hourly",
      ""
    );

    Sources.set(
      keccak256("interval-daily"),
      signerAddress,
      block.timestamp,
      0, // shamanCount
      "interval-daily",
      ""
    );

    Sources.set(
      keccak256("interval-quarter-hourly"),
      signerAddress,
      block.timestamp,
      0, // shamanCount
      "interval-quarter-hourly",
      ""
    );

    console.log("Sources set");

    vm.stopBroadcast();
  }
}
