// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import { Upgrades } from "@openzeppelin/foundry-upgrades/src/Upgrades.sol";
import { ZugToken } from "../src/ZugToken.sol";

contract ZugTokenTest is Test {
  ZugToken public token;
  address public admin;
  address public treasury;
  address public alice;
  address public bob;

  uint256 public constant INITIAL_MAX_SUPPLY = 1_000_000_000; // 1B tokens
  uint256 public constant INITIAL_MAX_SALE_SUPPLY = 10_000_000; // 10M tokens
  uint256 public constant INITIAL_PRICE = 10;

  function setUp() public {
    admin = makeAddr("admin");
    treasury = makeAddr("treasury");
    alice = makeAddr("alice");
    bob = makeAddr("bob");

    vm.startPrank(admin);
    // Deploy proxy using the OpenZeppelin Upgrades library
    address proxyAddress = Upgrades.deployTransparentProxy(
      "ZugToken.sol",
      admin, // proxy admin owner
      abi.encodeCall(
        ZugToken.initialize,
        (INITIAL_MAX_SUPPLY, INITIAL_MAX_SALE_SUPPLY)
      )
    );
    token = ZugToken(proxyAddress);
    token.setTreasury(treasury);
    token.setPrice(INITIAL_PRICE);
    token.grantRole(token.MINTER_ROLE(), admin);
    vm.stopPrank();
  }

  function testInitialState() public view {
    assertEq(token.name(), "Zug");
    assertEq(token.symbol(), "ZUG");
    assertEq(token.maxSupply(), INITIAL_MAX_SUPPLY);
    assertEq(token.maxSaleSupply(), INITIAL_MAX_SALE_SUPPLY);
    assertEq(token.totalSaleSupply(), 0);
    assertEq(token.price(), INITIAL_PRICE);
    assertEq(token.treasury(), treasury);
    assertEq(token.saleActive(), false);
    assertEq(token.totalSupply(), 0);
    assertEq(token.decimals(), 0);
  }

  function testTokenDecimals() public {
    // Test that token has 0 decimals
    assertEq(token.decimals(), 0);

    // Test minting and transferring with whole numbers
    vm.startPrank(admin);
    token.mint(alice, 100); // Mint 100 tokens (no decimals)
    vm.stopPrank();

    assertEq(token.balanceOf(alice), 100);

    // Test transfer with whole numbers
    vm.startPrank(alice);
    token.transfer(bob, 50); // Transfer 50 tokens
    vm.stopPrank();

    assertEq(token.balanceOf(alice), 50);
    assertEq(token.balanceOf(bob), 50);
  }

  function testBuyingWithZeroDecimals() public {
    vm.startPrank(admin);
    token.setSaleActive(true);
    token.setPrice(1); // Set price to 1 wei per token
    vm.stopPrank();

    uint256 amount = 5; // Buy 5 whole tokens
    uint256 cost = amount * 1;

    vm.deal(alice, cost);

    vm.startPrank(alice);
    token.buy{ value: cost }(alice, amount);
    vm.stopPrank();

    assertEq(token.balanceOf(alice), 5); // Should have exactly 5 tokens
    assertEq(address(token).balance, cost);
  }

  function testMintingByMinter() public {
    vm.startPrank(admin);
    token.mint(alice, 1_000_000); // Mint 1M tokens
    vm.stopPrank();

    assertEq(token.balanceOf(alice), 1_000_000);
    assertEq(token.totalSupply(), 1_000_000);
  }

  function testMintingByUnauthorized() public {
    vm.startPrank(alice);
    bytes32 role = keccak256("MINTER_ROLE");
    vm.expectRevert(
      abi.encodeWithSignature(
        "AccessControlUnauthorizedAccount(address,bytes32)",
        alice,
        role
      )
    );
    token.mint(alice, 100);
    vm.stopPrank();
  }

  function testMintingAboveMaxSupply() public {
    vm.startPrank(admin);
    vm.expectRevert("ZugToken: mint would exceed max supply");
    token.mint(alice, INITIAL_MAX_SUPPLY + 1);
    vm.stopPrank();
  }

  function testBuyingTokens() public {
    vm.startPrank(admin);
    token.setSaleActive(true);
    vm.stopPrank();

    uint256 amount = 1_000; // Buy 1000 tokens
    uint256 cost = amount * INITIAL_PRICE;

    vm.deal(alice, cost);

    vm.startPrank(alice);
    token.buy{ value: cost }(alice, amount);
    vm.stopPrank();

    assertEq(token.balanceOf(alice), amount);
    assertEq(address(token).balance, cost);
  }

  function testBuyingWithInsufficientPayment() public {
    vm.startPrank(admin);
    token.setSaleActive(true);
    vm.stopPrank();

    uint256 amount = 1_000;
    uint256 cost = amount * INITIAL_PRICE;

    vm.deal(alice, cost);

    vm.startPrank(alice);
    vm.expectRevert("ZugToken: insufficient payment");
    token.buy{ value: cost - 1 }(alice, amount);
    vm.stopPrank();
  }

  function testBuyingWhenSaleInactive() public {
    uint256 amount = 1_000;
    uint256 cost = amount * INITIAL_PRICE;

    vm.deal(alice, cost);

    vm.startPrank(alice);
    vm.expectRevert("ZugToken: sale is not active");
    token.buy{ value: cost }(alice, amount);
    vm.stopPrank();
  }

  function testBuyingWithoutTreasury() public {
    vm.startPrank(admin);
    token.setSaleActive(true);
    vm.expectRevert("ZugToken: treasury address cannot be zero");
    token.setTreasury(address(0));
    vm.stopPrank();
  }

  function testBurning() public {
    vm.startPrank(admin);
    token.mint(alice, 1_000);
    vm.stopPrank();

    vm.startPrank(alice);
    token.burn(500);
    vm.stopPrank();

    assertEq(token.balanceOf(alice), 500);
    assertEq(token.totalSupply(), 500);
  }

  function testSettingNewPrice() public {
    uint256 newPrice = 20;

    vm.startPrank(admin);
    token.setPrice(newPrice);
    vm.stopPrank();

    assertEq(token.price(), newPrice);
  }

  function testSettingInvalidPrice() public {
    vm.startPrank(admin);
    vm.expectRevert("ZugToken: price must be greater than 0");
    token.setPrice(0);
    vm.stopPrank();
  }

  function testSettingNewMaxSupply() public {
    uint256 newMaxSupply = 2_000_000_000; // 2B tokens

    vm.startPrank(admin);
    token.setMaxSupply(newMaxSupply);
    vm.stopPrank();

    assertEq(token.maxSupply(), newMaxSupply);
  }

  function testSettingInvalidMaxSupply() public {
    vm.startPrank(admin);
    token.mint(alice, 1_000_000);
    vm.expectRevert("ZugToken: new max supply below current supply");
    token.setMaxSupply(500_000);
    vm.stopPrank();
  }

  function testSettingNewTreasury() public {
    address newTreasury = makeAddr("newTreasury");

    vm.startPrank(admin);
    token.setTreasury(newTreasury);
    vm.stopPrank();

    assertEq(token.treasury(), newTreasury);
  }

  function testSettingInvalidTreasury() public {
    vm.startPrank(admin);
    vm.expectRevert("ZugToken: treasury address cannot be zero");
    token.setTreasury(address(0));
    vm.stopPrank();
  }

  function testWithdrawWithoutTreasury() public {
    vm.startPrank(admin);
    vm.expectRevert("ZugToken: treasury address cannot be zero");
    token.setTreasury(address(0));
    vm.stopPrank();
  }

  function testBuyingAboveMaxSaleSupply() public {
    vm.startPrank(admin);
    token.setSaleActive(true);
    vm.stopPrank();

    uint256 amount = INITIAL_MAX_SALE_SUPPLY + 1;
    uint256 cost = amount * INITIAL_PRICE;

    vm.deal(alice, cost);

    vm.startPrank(alice);
    vm.expectRevert("ZugToken: purchase would exceed max sale supply");
    token.buy{ value: cost }(alice, amount);
    vm.stopPrank();
  }

  function testSettingMaxSaleSupply() public {
    uint256 newMaxSaleSupply = 20_000_000; // 20M tokens

    vm.startPrank(admin);
    token.setMaxSaleSupply(newMaxSaleSupply);
    vm.stopPrank();

    assertEq(token.maxSaleSupply(), newMaxSaleSupply);
  }

  function testSettingInvalidMaxSaleSupply() public {
    vm.startPrank(admin);
    token.setSaleActive(true);

    // Buy some tokens first
    uint256 buyAmount = 1_000_000;
    uint256 cost = buyAmount * INITIAL_PRICE;
    vm.deal(alice, cost);
    vm.stopPrank();

    vm.startPrank(alice);
    token.buy{ value: cost }(alice, buyAmount);
    vm.stopPrank();

    // Try to set max sale supply below current sale supply
    vm.startPrank(admin);
    vm.expectRevert("ZugToken: new max sale supply below current sale supply");
    token.setMaxSaleSupply(500_000);
    vm.stopPrank();
  }

  function testSettingMaxSaleSupplyAboveMaxSupply() public {
    vm.startPrank(admin);
    vm.expectRevert("ZugToken: max sale supply cannot exceed max supply");
    token.setMaxSaleSupply(INITIAL_MAX_SUPPLY + 1);
    vm.stopPrank();
  }

  function testMintingDoesNotAffectSaleSupply() public {
    vm.startPrank(admin);
    uint256 mintAmount = 5_000_000;
    token.mint(alice, mintAmount);
    vm.stopPrank();

    assertEq(token.totalSupply(), mintAmount);
    assertEq(token.totalSaleSupply(), 0); // Sale supply should remain 0
  }
}
