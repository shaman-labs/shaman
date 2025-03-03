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
    balance: bigint,
    name: string,
    abilityIds: Hex[],
    sourceIds: Hex[],
    metadata: string
  ): Promise<Hex> => {
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

    await worldContract.simulate.createShaman(
      [balance, name, abilityIds, sourceIds, metadata],
      {
        account: account.address,
      }
    );

    const hash = await worldContract.write.createShaman(
      [balance, name, abilityIds, sourceIds, metadata],
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

  // Shaman balance management
  const depositShamanBalance = async (shamanId: Hex, amount: bigint) => {
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

    await worldContract.simulate.depositShamanBalance([shamanId, amount], {
      account: account.address,
    });

    const hash = await worldContract.write.depositShamanBalance(
      [shamanId, amount],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  const withdrawShamanBalance = async (shamanId: Hex, amount: bigint) => {
    await worldContract.simulate.withdrawShamanBalance([shamanId, amount], {
      account: account.address,
    });

    const hash = await worldContract.write.withdrawShamanBalance(
      [shamanId, amount],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  // Shaman status management
  const updateShamanStatus = async (shamanId: Hex, active: boolean) => {
    await worldContract.simulate.updateShamanStatus([shamanId, active], {
      account: account.address,
    });

    const hash = await worldContract.write.updateShamanStatus(
      [shamanId, active],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  // Shaman ability management
  const addAbilityToShaman = async (shamanId: Hex, abilityId: Hex) => {
    await worldContract.simulate.addAbilityToShaman([shamanId, abilityId], {
      account: account.address,
    });

    const hash = await worldContract.write.addAbilityToShaman(
      [shamanId, abilityId],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  const removeAbilityFromShaman = async (shamanId: Hex, abilityId: Hex) => {
    await worldContract.simulate.removeAbilityFromShaman(
      [shamanId, abilityId],
      {
        account: account.address,
      }
    );

    const hash = await worldContract.write.removeAbilityFromShaman(
      [shamanId, abilityId],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  // Shaman source management
  const addSourceToShaman = async (shamanId: Hex, sourceId: Hex) => {
    await worldContract.simulate.addSourceToShaman([shamanId, sourceId], {
      account: account.address,
    });

    const hash = await worldContract.write.addSourceToShaman(
      [shamanId, sourceId],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  const removeSourceFromShaman = async (shamanId: Hex, sourceId: Hex) => {
    await worldContract.simulate.removeSourceFromShaman([shamanId, sourceId], {
      account: account.address,
    });

    const hash = await worldContract.write.removeSourceFromShaman(
      [shamanId, sourceId],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  // Ability management
  const createAbility = async (name: string, metadata: string) => {
    await worldContract.simulate.createAbility([name, metadata], {
      account: account.address,
    });

    const hash = await worldContract.write.createAbility([name, metadata], {
      chain,
      account,
    });

    return waitForTransaction(hash);
  };

  const updateAbilityMetadata = async (abilityId: Hex, metadata: string) => {
    await worldContract.simulate.updateAbilityMetadata([abilityId, metadata], {
      account: account.address,
    });

    const hash = await worldContract.write.updateAbilityMetadata(
      [abilityId, metadata],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  const updateAbilityName = async (abilityId: Hex, name: string) => {
    await worldContract.simulate.updateAbilityName([abilityId, name], {
      account: account.address,
    });

    const hash = await worldContract.write.updateAbilityName(
      [abilityId, name],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  // Source management
  const createSource = async (name: string, metadata: string) => {
    await worldContract.simulate.createSource([name, metadata], {
      account: account.address,
    });

    const hash = await worldContract.write.createSource([name, metadata], {
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

  // Getter functions for shaman data
  const getShamanMetadata = async (shamanId: Hex): Promise<string> => {
    return (await worldContract.read.getShamanMetadata([shamanId])) as string;
  };

  const getShamanName = async (shamanId: Hex): Promise<string> => {
    return (await worldContract.read.getShamanName([shamanId])) as string;
  };

  const getShamanCreator = async (shamanId: Hex): Promise<Hex> => {
    return (await worldContract.read.getShamanCreator([shamanId])) as Hex;
  };

  const getShamanBalance = async (shamanId: Hex): Promise<bigint> => {
    return (await worldContract.read.getShamanBalance([shamanId])) as bigint;
  };

  const getShamanActive = async (shamanId: Hex): Promise<boolean> => {
    return (await worldContract.read.getShamanActive([shamanId])) as boolean;
  };

  const getShamanState = async (shamanId: Hex): Promise<number> => {
    return (await worldContract.read.getShamanState([shamanId])) as number;
  };

  const getShamanAbilityIds = async (shamanId: Hex): Promise<Hex[]> => {
    return (await worldContract.read.getShamanAbilityIds([shamanId])) as Hex[];
  };

  const getShamanSourceIds = async (shamanId: Hex): Promise<Hex[]> => {
    return (await worldContract.read.getShamanSourceIds([shamanId])) as Hex[];
  };

  const getAbilityName = async (abilityId: Hex): Promise<string> => {
    return (await worldContract.read.getAbilityName([abilityId])) as string;
  };

  const getAbilityMetadata = async (abilityId: Hex): Promise<string> => {
    return (await worldContract.read.getAbilityMetadata([abilityId])) as string;
  };

  const getAbilityCreator = async (abilityId: Hex): Promise<Hex> => {
    return (await worldContract.read.getAbilityCreator([abilityId])) as Hex;
  };

  return {
    createShaman,
    updateShamanMetadata,
    updateShamanStatus,
    depositShamanBalance,
    withdrawShamanBalance,
    addAbilityToShaman,
    removeAbilityFromShaman,
    addSourceToShaman,
    removeSourceFromShaman,
    createAbility,
    updateAbilityMetadata,
    updateAbilityName,
    createSource,
    purchase,
    transferAsset,
    getBalanceOf,
    getPrice,
    getTokenAddress,
    getTokenSupply,
    getMaxSaleSupply,
    getTotalSaleSupply,
    getShamanMetadata,
    getShamanName,
    getShamanCreator,
    getShamanBalance,
    getShamanActive,
    getShamanState,
    getShamanAbilityIds,
    getShamanSourceIds,
    getAbilityName,
    getAbilityMetadata,
    getAbilityCreator,
  };
}
