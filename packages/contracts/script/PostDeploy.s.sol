// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Upgrades } from "@openzeppelin/foundry-upgrades/Upgrades.sol";

import { ShamanConfig, Roles } from "../src/codegen/index.sol";
import { ZugToken } from "../src/ZugToken.sol";
import { RoleType } from "../src/codegen/common.sol";

contract PostDeploy is Script {
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  function run(address worldAddress) external {
    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    // Load the deployer address
    address deployerAddress = vm.addr(deployerPrivateKey);
    // Load the signer address
    address signerAddress = vm.envAddress("SIGNER_ADDRESS");
    // Load the treasury address
    address treasuryAddress = vm.envAddress("TREASURY_ADDRESS");

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    // Deploy the ZugToken contract
    uint256 maxSupply = 1_000_000_000; // 1B tokens
    uint256 maxSaleSupply = 10_000_000; // 10M tokens
    uint256 price = 0.00001 ether; // Example price per token
    // Deploy proxy using the OpenZeppelin Upgrades library
    address proxyAddress = Upgrades.deployTransparentProxy(
      "ZugToken.sol",
      deployerAddress, // proxy admin owner
      abi.encodeCall(ZugToken.initialize, (maxSupply, maxSaleSupply))
    );
    ZugToken zugToken = ZugToken(proxyAddress);

    console.log("ZugToken proxy deployed at:", address(proxyAddress));
    console.log(
      "ZugToken implementation deployed at:",
      Upgrades.getImplementationAddress(address(proxyAddress))
    );
    console.log(
      "ZugToken proxy admin deployed at:",
      Upgrades.getAdminAddress(address(proxyAddress))
    );
    console.log("ZugToken max supply:", maxSupply);
    console.log("ZugToken max sale supply:", maxSaleSupply);

    // Initialize ZugToken settings
    zugToken.setTreasury(treasuryAddress);
    zugToken.setPrice(price);
    zugToken.grantRole(MINTER_ROLE, signerAddress);

    console.log("ZugToken treasury set to:", treasuryAddress);
    console.log("ZugToken price set to:", price);
    console.log("Minter Role granted to signer address:", signerAddress);

    // Set the store address to the world address
    StoreSwitch.setStoreAddress(worldAddress);

    console.log("Store address set to:", worldAddress);

    // Configure ShamanConfig
    ShamanConfig.setTokenAddress(address(zugToken));

    console.log("ShamanConfig token address set to:", address(zugToken));

    // Grant operator role to signer address
    console.log("Operator role granted to: %s", signerAddress);
    Roles.setRole(signerAddress, RoleType.Operator);

    vm.stopBroadcast();
  }
}
