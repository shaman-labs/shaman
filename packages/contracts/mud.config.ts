import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  enums: {
    LogType: ["Queue", "Start", "Completion", "Deposit", "Withdraw", "Refund"],
    RoleType: ["None", "Operator"],
    JobState: ["Pending", "InProgress", "Completed"],
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
        active: "bool",
        balance: "uint256", // track $SHAMAN token balance
        metadata: "string", // IPFS CID containing shaman name, prompt, and script
      },
      key: ["shamanId"],
    },
    ShamanLogs: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        logId: "bytes32",
        logType: "LogType", // deposit (+) or execute (-)
        shamanId: "bytes32",
        amount: "uint256", // amount in $SHAMAN
        success: "bool",
        createdAt: "uint256",
        logMetadata: "string", // IPFS CID containing execution results
      },
      key: ["logId"],
    },
    Roles: {
      schema: {
        sender: "address",
        role: "RoleType",
      },
      key: ["sender"],
    },
    Job: {
      codegen: {
        dataStruct: false,
      },
      schema: {
        jobId: "bytes32",
        shamanId: "bytes32",
        state: "JobState",
        createdAt: "uint256",
      },
      key: ["jobId"],
    },
  },
});
