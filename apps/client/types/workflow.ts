import { Hex } from 'viem';

/**
 * Status of a workflow
 */
export enum WorkflowStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}

/**
 * Represents the metadata for a workflow
 */
export interface WorkflowMetadata {
  name: string;
  description: string;
  imageUrl?: string;
  // Add any additional metadata fields needed
  [key: string]: any;
}

/**
 * Represents a workflow entity
 */
export interface Workflow {
  // Core properties
  id: Hex;
  creator: Hex;
  balance: bigint;
  active: boolean;

  // Relationships
  shamanIds: Hex[];
  sourceIds: Hex[];

  // Metadata (parsed from the contract's metadata string)
  metadata: WorkflowMetadata;

  // Timestamps
  createdAt?: number; // If available from contracts or events
  updatedAt?: number; // If available from contracts or events
}

/**
 * Parameters for creating a new workflow
 */
export interface CreateWorkflowParams {
  balance: bigint;
  shamanIds: Hex[];
  sourceIds: Hex[];
  metadata: WorkflowMetadata;
}

/**
 * Parameters for modifying a workflow
 */
export interface UpdateWorkflowParams {
  workflowId: Hex;
  active?: boolean;
  metadata?: WorkflowMetadata;
}

/**
 * Parameters for workflow balance operations
 */
export interface WorkflowBalanceParams {
  workflowId: Hex;
  amount: bigint;
}

/**
 * Parameters for adding/removing a shaman to/from a workflow
 */
export interface WorkflowShamanParams {
  workflowId: Hex;
  shamanId: Hex;
}

/**
 * Response from a workflow query
 */
export interface WorkflowResponse {
  workflow: Workflow;
  error?: string;
}

/**
 * Response from a workflow list query
 */
export interface WorkflowListResponse {
  workflows: Workflow[];
  totalCount?: number;
  error?: string;
}

/**
 * Function to parse workflow metadata from string
 */
export function parseWorkflowMetadata(
  metadataString: string
): WorkflowMetadata {
  try {
    return JSON.parse(metadataString);
  } catch (e) {
    console.error('Failed to parse workflow metadata:', e);
    return { name: 'Unknown Workflow', description: 'Metadata parsing error' };
  }
}

/**
 * Function to stringify workflow metadata to string
 */
export function stringifyWorkflowMetadata(metadata: WorkflowMetadata): string {
  return JSON.stringify(metadata);
}

export type WorkflowLogMetadata = {
  success: boolean;
  result: Record<string, string | number>;
  timestamp: number;
  shamanMetadata: {
    shamanId: string;
    prompt: string;
    shamanCreator: string;
    shamanCreatedAt: string;
  };
};
