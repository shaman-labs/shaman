import {
  Account,
  Chain,
  Hex,
  WalletClient,
  PublicClient,
  decodeEventLog,
} from 'viem';

import { GetContractsResult } from '@/mud/getContracts';
import { MUDStateResult } from '@/mud/getMUDState';

const shamanCreatedEventAbi = [
  {
    type: 'event',
    name: 'ShamanCreated',
    inputs: [
      { type: 'bytes32', name: 'shamanId', indexed: true },
      { type: 'address', name: 'creator', indexed: true },
    ],
  },
] as const;
export type SystemCalls = ReturnType<typeof getSystemCalls>;

export function getSystemCalls({
  worldContract,
  tokenContract,
  networkConfig,
  waitForTransaction,
  client: { wallet: walletClient = {} as WalletClient, public: publicClient },
}: GetContractsResult & MUDStateResult) {
  const chain = networkConfig.chain as Chain;
  const account = walletClient.account as Account;
  const client = publicClient as PublicClient;

  // shaman functions
  const createShaman = async (name: string, metadata: string): Promise<Hex> => {
    await worldContract.simulate.createShaman([name, metadata], {
      account: account.address,
    });

    const hash = await worldContract.write.createShaman([name, metadata], {
      chain,
      account,
    });

    const receipt = await client.getTransactionReceipt({
      hash: hash,
    });

    // Find and decode the ShamanCreated event log
    const decodedLogs = receipt.logs.map((log) => {
      try {
        return decodeEventLog({
          abi: shamanCreatedEventAbi,
          data: log.data,
          topics: log.topics,
        });
      } catch {
        return null;
      }
    });

    const shamanCreatedLog = decodedLogs.find(
      (log) => log?.eventName === 'ShamanCreated'
    );

    if (!shamanCreatedLog) {
      throw new Error('ShamanCreated event not found in transaction logs');
    }

    return shamanCreatedLog.args.shamanId;
  };

  const updateShamanMetadata = async (shamanId: Hex, metadata: string) => {
    await worldContract.simulate.updateShamanMetadata([shamanId, metadata], {
      account: account.address,
    });

    const hash = await worldContract.write.updateShamanMetadata(
      [shamanId, metadata],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  // Workflow functions
  const createWorkflow = async (
    balance: bigint,
    shamanIds: Hex[],
    sourceIds: Hex[],
    metadata: string
  ) => {
    if (balance > 0n) {
      await tokenContract.simulate.approve([worldContract.address, balance], {
        chain,
        account: account.address,
      });

      const approveTx = await tokenContract.write.approve(
        [worldContract.address, balance],
        {
          chain,
          account: account.address,
        }
      );

      await waitForTransaction(approveTx);
    }

    await worldContract.simulate.createWorkflow(
      [balance, shamanIds, sourceIds, metadata],
      {
        account: account.address,
      }
    );

    const hash = await worldContract.write.createWorkflow(
      [balance, shamanIds, sourceIds, metadata],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  const depositWorkflowBalance = async (workflowId: Hex, amount: bigint) => {
    await tokenContract.simulate.approve([worldContract.address, amount], {
      chain,
      account: account.address,
    });

    const approveTx = await tokenContract.write.approve(
      [worldContract.address, amount],
      {
        chain,
        account: account.address,
      }
    );

    await waitForTransaction(approveTx);

    await worldContract.simulate.depositWorkflowBalance([workflowId, amount], {
      account: account.address,
    });

    const hash = await worldContract.write.depositWorkflowBalance(
      [workflowId, amount],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  const withdrawWorkflowBalance = async (workflowId: Hex, amount: bigint) => {
    await worldContract.simulate.withdrawWorkflowBalance([workflowId, amount], {
      account: account.address,
    });

    const hash = await worldContract.write.withdrawWorkflowBalance(
      [workflowId, amount],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  const updateWorkflowStatus = async (workflowId: Hex, active: boolean) => {
    await worldContract.simulate.updateWorkflowStatus([workflowId, active], {
      account: account.address,
    });

    const hash = await worldContract.write.updateWorkflowStatus(
      [workflowId, active],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  // Shaman workflow management functions
  const addShamanToWorkflow = async (workflowId: Hex, shamanId: Hex) => {
    await worldContract.simulate.addShamanToWorkflow([workflowId, shamanId], {
      account: account.address,
    });

    const hash = await worldContract.write.addShamanToWorkflow(
      [workflowId, shamanId],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  const removeShamanFromWorkflow = async (workflowId: Hex, shamanId: Hex) => {
    await worldContract.simulate.removeShamanFromWorkflow(
      [workflowId, shamanId],
      {
        account: account.address,
      }
    );

    const hash = await worldContract.write.removeShamanFromWorkflow(
      [workflowId, shamanId],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  const purchase = async (quantity: bigint) => {
    const price = await getPrice(quantity);

    await tokenContract.simulate.buy([account.address, quantity], {
      chain,
      account: account.address,
      value: price,
    });

    const hash = await tokenContract.write.buy([account.address, quantity], {
      chain,
      account,
      value: price,
    });

    return waitForTransaction(hash);
  };

  const transferAsset = async (
    contractAddress: Hex,
    address: Hex,
    amount: bigint
  ) => {
    const isNativeToken =
      contractAddress === '0x0000000000000000000000000000000000000000';

    if (isNativeToken) {
      const hash = await walletClient.sendTransaction({
        to: address,
        value: amount,
        chain,
        account: account.address,
      });
      return waitForTransaction(hash);
    } else {
      const erc20Contract = {
        abi: [
          {
            name: 'transfer',
            type: 'function',
            inputs: [{ type: 'address' }, { type: 'uint256' }],
            outputs: [{ type: 'bool' }],
          },
        ],
        address: contractAddress,
      };

      await publicClient.simulateContract({
        ...erc20Contract,
        functionName: 'transfer',
        args: [address, amount],
        account: account.address,
      });

      const transferHash = await walletClient.writeContract({
        ...erc20Contract,
        functionName: 'transfer',
        args: [address, amount],
        chain,
        account: account.address,
      });
      return waitForTransaction(transferHash);
    }
  };

  const getPrice = async (amount: bigint): Promise<bigint> => {
    return (await tokenContract.read.getPrice([amount])) as bigint;
  };

  const getTokenSupply = async (): Promise<bigint> => {
    return (await tokenContract.read.totalSupply()) as bigint;
  };

  const getMaxSaleSupply = async (): Promise<bigint> => {
    return (await tokenContract.read.maxSaleSupply()) as bigint;
  };

  const getTotalSaleSupply = async (): Promise<bigint> => {
    return (await tokenContract.read.totalSaleSupply()) as bigint;
  };

  const getBalanceOf = async (address: Hex): Promise<bigint> => {
    return (await tokenContract.read.balanceOf([address])) as bigint;
  };

  const getTokenAddress = async (): Promise<Hex> => {
    return (await worldContract.read.getTokenAddress()) as Hex;
  };

  // Getter functions for shaman and workflow
  const getShamanMetadata = async (shamanId: Hex): Promise<string> => {
    return (await worldContract.read.getShamanMetadata([shamanId])) as string;
  };

  const getShamanName = async (shamanId: Hex): Promise<string> => {
    return (await worldContract.read.getShamanName([shamanId])) as string;
  };

  const getShamanCreator = async (shamanId: Hex): Promise<Hex> => {
    return (await worldContract.read.getShamanCreator([shamanId])) as Hex;
  };

  const getWorkflowBalance = async (workflowId: Hex): Promise<bigint> => {
    return (await worldContract.read.getWorkflowBalance([
      workflowId,
    ])) as bigint;
  };

  const getWorkflowActive = async (workflowId: Hex): Promise<boolean> => {
    return (await worldContract.read.getWorkflowActive([
      workflowId,
    ])) as boolean;
  };

  const getWorkflowCreator = async (workflowId: Hex): Promise<Hex> => {
    return (await worldContract.read.getWorkflowCreator([workflowId])) as Hex;
  };

  return {
    createShaman,
    updateShamanMetadata,
    createWorkflow,
    depositWorkflowBalance,
    withdrawWorkflowBalance,
    updateWorkflowStatus,
    addShamanToWorkflow,
    removeShamanFromWorkflow,
    purchase,
    getBalanceOf,
    getPrice,
    getTokenAddress,
    getTokenSupply,
    getMaxSaleSupply,
    getTotalSaleSupply,
    transferAsset,
    getShamanMetadata,
    getShamanName,
    getShamanCreator,
    getWorkflowBalance,
    getWorkflowActive,
    getWorkflowCreator,
  };
}
