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
  const createShaman = async (
    initialDeposit: bigint,
    metadata: string
  ): Promise<Hex> => {
    await tokenContract.simulate.approve(
      [worldContract.address, initialDeposit],
      {
        chain,
        account: account.address,
      }
    );

    const approveTx = await tokenContract.write.approve(
      [worldContract.address, initialDeposit],
      {
        chain,
        account: account.address,
      }
    );

    await waitForTransaction(approveTx);

    await worldContract.simulate.createShaman([initialDeposit, metadata], {
      account: account.address,
    });

    const hash = await worldContract.write.createShaman(
      [initialDeposit, metadata],
      {
        chain,
        account,
      }
    );

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

  const addBalance = async (shamanId: Hex, amount: bigint) => {
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

    await worldContract.simulate.depositShaman([shamanId, amount], {
      chain,
      account: account.address,
    });

    const hash = await worldContract.write.depositShaman([shamanId, amount], {
      chain,
      account,
    });

    return waitForTransaction(hash);
  };

  const withdrawBalance = async (shamanId: Hex, amount: bigint) => {
    await worldContract.simulate.withdrawShaman([shamanId, amount], {
      chain,
      account: account.address,
    });

    const hash = await worldContract.write.withdrawShaman([shamanId, amount], {
      chain,
      account,
    });

    return waitForTransaction(hash);
  };

  const deleteShaman = async (shamanId: Hex) => {
    await worldContract.simulate.cancelShaman([shamanId], {
      chain,
      account: account.address,
    });

    const hash = await worldContract.write.cancelShaman([shamanId], {
      chain,
      account,
    });

    return waitForTransaction(hash);
  };

  const cancelShaman = async (shamanId: Hex) => {
    await worldContract.simulate.cancelShaman([shamanId], {
      account: account.address,
    });

    const hash = await worldContract.write.cancelShaman([shamanId], {
      chain,
      account,
    });

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

  return {
    createShaman,
    updateShamanMetadata,
    cancelShaman,
    purchase,
    getBalanceOf,
    getPrice,
    getTokenAddress,
    getTokenSupply,
    addBalance,
    withdrawBalance,
    deleteShaman,
    getMaxSaleSupply,
    getTotalSaleSupply,
    transferAsset,
  };
}
