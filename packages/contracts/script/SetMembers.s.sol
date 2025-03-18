// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Sources, Roles } from "../src/codegen/index.sol";
import { RoleType } from "../src/codegen/common.sol";

contract SetMembers is Script {
  address[] private memberAddresses;

  function run() external {
    console.log("Starting Script.");

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    address worldAddress = vm.envAddress("WORLD_ADDRESS");

    vm.startBroadcast(deployerPrivateKey);

    StoreSwitch.setStoreAddress(worldAddress);

    memberAddresses.push(0x7752B2983f3B4cCA857689610287118D67626727);
    memberAddresses.push(0x06B2771f9DCda04F74FDF4cb272860e9Bcf71712);
    memberAddresses.push(0x258C0dD1504CAd7c1605295F1E6224932d9e9D1E);
    memberAddresses.push(0x2d47643ECa5C0A9d62e750c5D8B71435b74c2696);
    memberAddresses.push(0xADCd2A4fb15166b2fF87CCefAe9041DAe31EAd74);
    memberAddresses.push(0xBC38C21e2b3b04Be6e1553eB71963360cb48119b);
    memberAddresses.push(0x62eA740Bb3a6A075D139502bD4b4Fe9c0539C706);
    memberAddresses.push(0x8E5Fa8Bf983FD9aBaEeB1E1Ac6DAb586d14B72FC);
    memberAddresses.push(0x26676B35EfE76c65dd790e8461C7Cf2aFfe0dD5b);
    memberAddresses.push(0x4a8BDe15C986744af280670e9F6f03eA932f96f4);
    memberAddresses.push(0x8F1Ded37f681f20565a622A11FF7CF0c34435B63);
    memberAddresses.push(0x4EA967652E736319A14C1144C06763D30BE2cC8E);
    memberAddresses.push(0xAF810ebb5A6Dd46BD83D3B4104967FbdE1bFc4Ad);
    memberAddresses.push(0x499865475A4CDe7f018010b36bAAa672De127e2F);
    memberAddresses.push(0xB78d0f2597A90B7B6E21b72A38db141e6Bd68848);
    memberAddresses.push(0xDbFA6BBa0F7b8e989EC2cbCcE2431e461Da4D2F9);
    memberAddresses.push(0x1790511127D9ff9619325553c9e2205C3B01f491);
    memberAddresses.push(0x5F0175f155F0b3e0583fEbaE7C08F12b08cf57Fe);
    memberAddresses.push(0x7a7CFC72F3F2b4F70854FB345F71b697c30F39A4);
    memberAddresses.push(0xe41A7499EAe9c09c575aaAcE3551Eb32089e4522);
    memberAddresses.push(0x18a0d8287FB4729CcEc5db93c1Fca9d9310E3C5d);
    memberAddresses.push(0xdA2fDB7f34B0FBEbfeBa3FE07312dDc3514D88e4);
    memberAddresses.push(0xB944A28D7A52801c3f5D2F8204a459eDd86812fC);
    memberAddresses.push(0x5d50067A6380e8881c9eC0233ee0aF334917d490);
    memberAddresses.push(0xA43fcc923Dd5bB1694D0e00EF8cEB6D581F2D179);
    memberAddresses.push(0x06a43D80B255219f1d093F0b5090ffD698616CC2);
    memberAddresses.push(0xff6Fc097f28429AF5958c733946C9839CD0dFB26);
    memberAddresses.push(0x5e08bD2BeA02c6866ddad37b262cd8A2dB34464e);
    memberAddresses.push(0xDc3C9BD50dB9022709462A4a5C41f20E7C348180);
    memberAddresses.push(0x8c012d5858905B670c051520FDAce8f9dc03FAB4);
    memberAddresses.push(0x3c97F0921576c7C5e6C9b65Bd50A47F9959DA3Ff);
    memberAddresses.push(0x004863D04272a86859fE7Ca5CA47201a0f51Eafc);
    memberAddresses.push(0xc6B73da91E7c1D771E43d5A91bc1032ae6F02AE6);
    memberAddresses.push(0x2Bfa8e4971fDc2FF5296b5C06c8b3793612d7BeD);
    memberAddresses.push(0x5c040192566672F999aD4972A4890c4fFA4Eac7D);
    memberAddresses.push(0x900F240D7e2ECCAE432D85eE93228e88FE261e60);
    memberAddresses.push(0x13909d69336d766C671971F431529C60cD654c31);
    memberAddresses.push(0xd398adba3735F0466ae1630270aa306406580C86);

    for (uint256 i = 0; i < memberAddresses.length; i++) {
      Roles.setRole(memberAddresses[i], RoleType.Member);
    }

    console.log("Members set");

    vm.stopBroadcast();
  }
}
