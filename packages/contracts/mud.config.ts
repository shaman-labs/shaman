import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  enums: {
    LogType: ["Queue", "Start", "Completion", "Deposit", "Withdraw", "Refund"],
    RoleType: ["None", "Operator"],
    WorkflowState: ["Pending", "InProgress", "Completed"],
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
    Shamans: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanId: "bytes32",
        creator: "address",
        createdAt: "uint256",
        name: "string",
        metadata: "string",
      },
      key: ["shamanId"],
    },
    Workflows: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        workflowId: "bytes32",
        state: "WorkflowState",
        creator: "address",
        createdAt: "uint256",
        active: "bool",
        balance: "uint256", // track $ZUG token balance
        metadata: "string",
      },
      key: ["workflowId"],
    },
    WorkflowLogs: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        logId: "bytes32",
        logType: "LogType",
        workflowId: "bytes32",
        shamanId: "bytes32",
        amount: "uint256", // amount in $ZUG
        success: "bool",
        createdAt: "uint256",
        metadata: "string", // IPFS CID containing execution results
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
    WorkflowShaman: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        workflowId: "bytes32",
        shamanId: "bytes32",
        createdAt: "uint256",
      },
      key: ["workflowId", "shamanId"],
    },
    WorkflowSource: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        workflowId: "bytes32",
        sourceId: "bytes32",
        createdAt: "uint256",
      },
      key: ["workflowId", "sourceId"],
    },
    // utility tables
    SourceNames: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        name: "bytes32", // encoded name
        sourceId: "bytes32", // sourceId
      },
      key: ["name"],
    },
    ShamanNames: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        name: "bytes32", // encoded name
        shamanId: "bytes32", // shamanId
      },
      key: ["name"],
    },
  },
});
