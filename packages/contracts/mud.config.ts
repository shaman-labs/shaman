import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  enums: {
    LogType: ["Queue", "Start", "Completion", "Deposit", "Withdraw", "Refund"],
    RoleType: ["None", "Operator"],
    WorkflowState: ["Idle", "Queue", "InProgress", "Completed"],
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
        workflowCount: "uint32",
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
        balance: "uint256",
        shamanCount: "uint32",
        sourceCount: "uint32",
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
        workflowCount: "uint32",
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
    // index tables for efficient querying
    WorkflowShamanIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        workflowId: "bytes32",
        index: "uint32",
        shamanId: "bytes32",
      },
      key: ["workflowId", "index"],
    },
    WorkflowSourceIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        workflowId: "bytes32",
        index: "uint32",
        sourceId: "bytes32",
      },
      key: ["workflowId", "index"],
    },
    ShamanWorkflowIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        shamanId: "bytes32",
        index: "uint32",
        workflowId: "bytes32",
      },
      key: ["shamanId", "index"],
    },
    SourceWorkflowIndex: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        sourceId: "bytes32",
        index: "uint32",
        workflowId: "bytes32",
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
