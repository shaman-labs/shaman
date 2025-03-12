import { Hex } from 'viem';

export enum ShamanStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}

export enum ShamanLogType {
  QUEUE = 0,
  START = 1,
  COMPLETION = 2,
  DEPOSIT = 3,
  WITHDRAW = 4,
  REFUND = 5,
}

export enum ShamanState {
  IDLE = 0,
  QUEUE = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
}

/**
 * Represents the metadata for a shaman
 */
export interface ShamanMetadata {
  name: string;
  description: string;
  imageUrl?: string;
  // Add any additional metadata fields needed
  [key: string]: any;
}

/**
 * Represents a workflow entity
 */
export interface Shaman {
  // Core properties
  id: Hex;
  creator: Hex;
  balance: bigint;
  active: boolean;

  // Relationships
  shamanIds: Hex[];
  sourceIds: Hex[];

  // Metadata (parsed from the contract's metadata string)
  metadata: ShamanMetadata;

  // Timestamps
  createdAt?: number; // If available from contracts or events
  updatedAt?: number; // If available from contracts or events
}

/**
 * Parameters for creating a new workflow
 */
export interface CreateShamanParams {
  balance: bigint;
  shamanIds: Hex[];
  sourceIds: Hex[];
  metadata: ShamanMetadata;
}

/**
 * Parameters for modifying a workflow
 */
export interface UpdateShamanParams {
  shamanId: Hex;
  active?: boolean;
  metadata?: ShamanMetadata;
}

/**
 * Parameters for workflow balance operations
 */
export interface ShamanBalanceParams {
  shamanId: Hex;
  amount: bigint;
}

/**
 * Parameters for adding/removing a shaman to/from a workflow
 */
export interface ShamanWorkflowParams {
  shamanId: Hex;
  workflowId: Hex;
}

/**
 * Response from a workflow query
 */
export interface ShamanResponse {
  shaman: Shaman;
  error?: string;
}

/**
 * Response from a workflow list query
 */
export interface ShamanListResponse {
  shamans: Shaman[];
  totalCount?: number;
  error?: string;
}

/**
 * Function to parse shaman metadata from string
 */
export function parseShamanMetadata(metadataString: string): ShamanMetadata {
  try {
    return JSON.parse(metadataString);
  } catch (e) {
    console.error('Failed to parse shaman metadata:', e);
    return { name: 'Unknown Shaman', description: 'Metadata parsing error' };
  }
}

/**
 * Function to stringify shaman metadata to string
 */
export function stringifyShamanMetadata(metadata: ShamanMetadata): string {
  return JSON.stringify(metadata);
}

export type ShamanLogMetadata = {
  success: boolean;
  results: Record<string, string | number>[];
  timestamp: number;
};

export type ShamanLogsTableData = {
  id: string;
  logType: ShamanLogType;
  shamanId: string;
  amount: bigint;
  success: boolean;
  timestamp: string;
  metadata: string;
  spellId: string;
};

export type ShamanTriggerResponse = {
  success: boolean;
  error?: string;
  results: {
    decodedCode: string;
    result: any;
    timestamp: number;
    metadataHash: string;
    txHash: string;
    logs: string[];
    spellId: string;
  }[];
};
