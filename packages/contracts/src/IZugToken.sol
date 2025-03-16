// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

interface IZugToken is IERC20Upgradeable {
  function mint(address account, uint256 amount) external;

  function burn(uint256 amount) external;
}
