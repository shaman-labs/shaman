// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { IZugToken } from "./IZugToken.sol";

contract ZugToken is IZugToken, ERC20Upgradeable, AccessControlUpgradeable {
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  address public treasury;
  uint256 private _maxSupply;
  uint256 private _maxSaleSupply;
  uint256 public totalSaleSupply;
  uint256 public price;
  bool public saleActive;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    uint256 maxSupply_,
    uint256 maxSaleSupply_
  ) public initializer {
    __ERC20_init("Zug", "ZUG");
    __ERC20Permit_init("Zug");
    __AccessControl_init();

    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());

    _maxSupply = maxSupply_;
    _maxSaleSupply = maxSaleSupply_;
    saleActive = false;
  }

  function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
    require(
      totalSupply() + amount <= _maxSupply,
      "ZugToken: mint would exceed max supply"
    );
    _mint(to, amount);
  }

  function buy(address to, uint256 amount) public payable {
    require(saleActive, "ZugToken: sale is not active");
    require(amount > 0, "ZugToken: quantity must be greater than 0");
    uint256 totalCost = amount * price;
    require(msg.value >= totalCost, "ZugToken: insufficient payment");
    require(
      totalSaleSupply + amount <= _maxSaleSupply,
      "ZugToken: purchase would exceed max sale supply"
    );
    require(
      totalSupply() + amount <= _maxSupply,
      "ZugToken: purchase would exceed max supply"
    );
    require(treasury != address(0), "ZugToken: treasury not set");

    totalSaleSupply += amount;
    _mint(to, amount);
  }

  function burn(uint256 amount) public {
    _burn(_msgSender(), amount);
  }

  function setPrice(uint256 _price) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(_price > 0, "ZugToken: price must be greater than 0");
    price = _price;
  }

  function setMaxSupply(
    uint256 maxSupply_
  ) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(
      maxSupply_ >= totalSupply(),
      "ZugToken: new max supply below current supply"
    );
    _maxSupply = maxSupply_;
  }

  function setMaxSaleSupply(
    uint256 maxSaleSupply_
  ) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(
      maxSaleSupply_ >= totalSaleSupply,
      "ZugToken: new max sale supply below current sale supply"
    );
    require(
      maxSaleSupply_ <= _maxSupply,
      "ZugToken: max sale supply cannot exceed max supply"
    );
    _maxSaleSupply = maxSaleSupply_;
  }

  function setSaleActive(bool _saleActive) public onlyRole(DEFAULT_ADMIN_ROLE) {
    saleActive = _saleActive;
  }

  function setTreasury(address _treasury) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(
      _treasury != address(0),
      "ZugToken: treasury address cannot be zero"
    );
    treasury = _treasury;
  }

  function withdraw() public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(address(this).balance > 0, "ZugToken: insufficient balance");
    require(treasury != address(0), "ZugToken: treasury not set");
    payable(treasury).transfer(address(this).balance);
  }

  function decimals() public pure virtual override returns (uint8) {
    return 0;
  }

  function getPrice(uint256 amount) public view returns (uint256) {
    return amount * price;
  }

  function maxSupply() public view returns (uint256) {
    return _maxSupply;
  }

  function maxSaleSupply() public view returns (uint256) {
    return _maxSaleSupply;
  }
}
