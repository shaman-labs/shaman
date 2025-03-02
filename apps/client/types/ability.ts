export type AbilityTriggerResponse = {
  success: boolean;
  decodedCode: string;
  result: string;
  timestamp: number;
  logMetadataHash: string;
  txHash: string;
  logs: string[];
  error?: string;
};

export enum AbilityLogType {
  Execution,
  Deposit,
  Withdraw,
  Refund,
}

export type AbilityLog = {
  abilityLogId: string;
  abilityId: string;
  logType: AbilityLogType;
  amount: number;
  createdAt: number;
};

export type AbilityLogsTableData = {
  id: string;
  logType: string;
  timestamp: string;
  logMetadata?: string;
  success?: boolean;
  type: AbilityLogType;
};
