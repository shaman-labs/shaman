export type ShamanTriggerResponse = {
  success: boolean;
  decodedCode: string;
  result: string;
  timestamp: number;
  logMetadataHash: string;
  txHash: string;
  logs: string[];
  error?: string;
};

export enum ShamanLogType {
  Execution,
  Deposit,
  Withdraw,
  Refund,
}

export type ShamanLog = {
  shamanLogId: string;
  shamanId: string;
  logType: ShamanLogType;
  amount: number;
  createdAt: number;
};

export type ShamanLogsTableData = {
  id: string;
  logType: string;
  timestamp: string;
  logMetadata?: string;
  success?: boolean;
  type: ShamanLogType;
};
