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
        shamanSpellIds: "bytes32[]",
        shamanSourceIds: "bytes32[]",
        shamanSpellEdgeIds: "bytes32[]",
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
        sourceType: "uint8", // 0 = interval (system), 1 = trigger (external), 2 = contract event (external), .. open for extension
        nonce: "uint256", // nonce for api calls
        creator: "address",
        createdAt: "uint256",
        active: "bool",
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
        active: "bool",
        sender: "address",
        role: "RoleType",
      },
      key: ["sender", "role"],
    },
    // pivot tables
    ShamanSpells: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanSpellId: "bytes32",
        spellId: "bytes32",
        shamanId: "bytes32",
        version: "uint256", // version of the spell
        state: "JobState", // state of the spell
        chain: "string", // chain of the spell
        metadata: "string", // metadata of version of the spell
      },
      key: ["shamanSpellId"],
    },
    ShamanSpellEdges: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanSpellEdgeId: "bytes32",
        fromShamanSpellId: "bytes32",
        toShamanSpellId: "bytes32",
        fromSpellIndex: "uint256",
        toSpellIndex: "uint256",
        fromSpellId: "bytes32",
        toSpellId: "bytes32",
        shamanId: "bytes32",
      },
      key: ["shamanSpellEdgeId"],
    },
    ShamanSources: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanSourceId: "bytes32",
        sourceId: "bytes32",
        shamanId: "bytes32",
      },
      key: ["shamanSourceId"],
    },
    // lookup tables for querying shamans by source
    // lookup table for reverse lookup
    SourceShamanIndexes: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        sourceId: "bytes32",
        shamanId: "bytes32",
        index: "uint256", // index of the shaman in the source
      },
      key: ["sourceId", "shamanId"],
    },
    // shaman id lookup based on index
    SourceShamanLookup: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        sourceId: "bytes32",
        index: "uint256", // index of the shaman in the source
        shamanId: "bytes32",
      },
      key: ["sourceId", "index"],
    },
    // utility tables
    // names
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
    // counts
    SourceShamanCounts: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        sourceId: "bytes32",
        shamanCount: "uint256",
      },
      key: ["sourceId"],
    },
  },
});
