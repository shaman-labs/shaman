import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  enums: {
    LogType: ["Queue", "Start", "Completion", "Deposit", "Withdraw", "Refund"],
    RoleType: ["None", "Operator"],
    ShamanState: ["Idle", "Queue", "InProgress", "Completed"],
  },
  tables: {
    ShamanConfig: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        tokenAddress: "address",
      },
      key: [],
    },
    Abilities: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        abilityId: "bytes32",
        creator: "address",
        createdAt: "uint256",
        shamanCount: "uint32",
        name: "string",
        metadata: "string",
      },
      key: ["abilityId"],
    },
    Shamans: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanId: "bytes32",
        state: "ShamanState",
        creator: "address",
        createdAt: "uint256",
        active: "bool",
        balance: "uint256",
        abilityCount: "uint32",
        sourceCount: "uint32",
        metadata: "string",
      },
      key: ["shamanId"],
    },
    ShamanLogs: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        logId: "bytes32",
        logType: "LogType",
        shamanId: "bytes32",
        abilityId: "bytes32",
        amount: "uint256",
        success: "bool",
        createdAt: "uint256",
        metadata: "string",
      },
      key: ["logId"],
    },
    Sources: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        sourceId: "bytes32",
        creator: "address",
        createdAt: "uint256",
        shamanCount: "uint32",
        name: "string",
        metadata: "string",
      },
      key: ["sourceId"],
    },
    Roles: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        sender: "address",
        role: "RoleType",
      },
      key: ["sender"],
    },
    // pivot tables
    ShamanAbility: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanId: "bytes32",
        abilityId: "bytes32",
        createdAt: "uint256",
      },
      key: ["shamanId", "abilityId"],
    },
    ShamanSource: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanId: "bytes32",
        sourceId: "bytes32",
        createdAt: "uint256",
      },
      key: ["shamanId", "sourceId"],
    },
    // index tables for efficient querying
    ShamanAbilityIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanId: "bytes32",
        index: "uint32",
        abilityId: "bytes32",
      },
      key: ["shamanId", "index"],
    },
    ShamanSourceIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanId: "bytes32",
        index: "uint32",
        sourceId: "bytes32",
      },
      key: ["shamanId", "index"],
    },
    AbilityShamanIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        abilityId: "bytes32",
        index: "uint32",
        shamanId: "bytes32",
      },
      key: ["abilityId", "index"],
    },
    SourceShamanIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        sourceId: "bytes32",
        index: "uint32",
        shamanId: "bytes32",
      },
      key: ["sourceId", "index"],
    },
    // utility tables
    SourceNames: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        name: "bytes32",
        sourceId: "bytes32",
      },
      key: ["name"],
    },
    AbilityNames: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        name: "bytes32",
        abilityId: "bytes32",
      },
      key: ["name"],
    },
  },
});
