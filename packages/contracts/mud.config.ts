import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  enums: {
    LogType: [
      "Queue",
      "Start",
      "Completion",
      "Deposit",
      "Withdraw",
      "Refund",
      "Modification",
      "Deactivation",
      "Activation",
    ],
    RoleType: ["None", "Operator", "Member", "Admin"],
    JobState: ["Idle", "Queue", "InProgress", "Completed"],
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
    Spells: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        spellId: "bytes32",
        creator: "address",
        createdAt: "uint256",
        shamanCount: "uint256",
        version: "uint256", // latest version of the spell
        name: "string",
        metadata: "string", // latest metadata of the spell
      },
      key: ["spellId"],
    },
    // keep track of all versions of a spell
    SpellVersions: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        spellId: "bytes32",
        createdAt: "uint256",
        version: "uint256",
        metadata: "string",
      },
      key: ["spellId", "version"],
    },
    Shamans: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanId: "bytes32",
        state: "JobState",
        creator: "address",
        createdAt: "uint256",
        active: "bool",
        balance: "uint256",
        spellCount: "uint256",
        sourceCount: "uint256",
        name: "string",
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
        spellId: "bytes32",
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
        shamanCount: "uint256",
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
    ShamanSpell: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanId: "bytes32",
        spellId: "bytes32",
        createdAt: "uint256",
        version: "uint256", // version of the spell
        state: "JobState", // state of the spell
        metadata: "string", // metadata of version of the spell
      },
      key: ["shamanId", "spellId"],
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
    ShamanSpellIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanId: "bytes32",
        index: "uint256",
        spellId: "bytes32",
      },
      key: ["shamanId", "index"],
    },
    ShamanSourceIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanId: "bytes32",
        index: "uint256",
        sourceId: "bytes32",
      },
      key: ["shamanId", "index"],
    },
    SpellShamanIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        spellId: "bytes32",
        index: "uint256",
        shamanId: "bytes32",
      },
      key: ["spellId", "index"],
    },
    SourceShamanIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        sourceId: "bytes32",
        index: "uint256",
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
    SpellNames: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        name: "bytes32",
        spellId: "bytes32",
      },
      key: ["name"],
    },
    ShamanNames: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        name: "bytes32",
        shamanId: "bytes32",
      },
      key: ["name"],
    },
  },
});
