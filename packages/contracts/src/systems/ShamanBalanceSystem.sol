// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { Shamans } from "../codegen/index.sol";
import { JobState, LogType } from "../codegen/common.sol";
import { ShamanLogsLib } from "../lib/ShamanLogsLib.sol";
import { BaseSystem } from "./BaseSystem.sol";

contract ShamanBalanceSystem is BaseSystem {
  function depositShamanBalance(
    bytes32 shamanId,
    uint256 amount
  ) public onlyShamanCreator(shamanId) onlyActiveShaman(shamanId) {
    require(amount > 0, "Amount must be greater than 0");

    Shamans.setBalance(shamanId, Shamans.getBalance(shamanId) + amount);
    ShamanLogsLib.logOperation(shamanId, 0, amount, true, LogType.Deposit, "");

    _token().transferFrom(_msgSender(), address(this), amount);
  }

  function withdrawShamanBalance(
    bytes32 shamanId,
    uint256 amount
  ) public onlyShamanCreator(shamanId) onlyActiveShaman(shamanId) {
    require(amount > 0, "Amount must be greater than 0");
    require(Shamans.getBalance(shamanId) >= amount, "Insufficient balance");

    Shamans.setBalance(shamanId, Shamans.getBalance(shamanId) - amount);
    ShamanLogsLib.logOperation(shamanId, 0, amount, true, LogType.Withdraw, "");

    _token().transfer(_msgSender(), amount);
  }
}
