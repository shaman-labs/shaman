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

  const updateShamanWorkflow = async (
    shamanId: Hex,
    sourceIds: Hex[],
    spellIds: Hex[],
    spellChains: string[],
    spellEdges: {
      fromSpellIndex: bigint;
      toSpellIndex: bigint;
    }[]
  ) => {
    await worldContract.simulate.updateShamanWorkflow(
      [shamanId, sourceIds, spellIds, spellChains, spellEdges],
      {
        account: account.address,
      }
    );

    const hash = await worldContract.write.updateShamanWorkflow(
      [shamanId, sourceIds, spellIds, spellChains, spellEdges],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  // Spell management
  const createSpell = async (name: string, metadata: string) => {
    await worldContract.simulate.createSpell([name, metadata], {
      account: account.address,
    });

    const hash = await worldContract.write.createSpell([name, metadata], {
      chain,
      account,
    });

    return waitForTransaction(hash);
  };

  const updateSpellMetadata = async (spellId: Hex, metadata: string) => {
    await worldContract.simulate.updateSpellMetadata([spellId, metadata], {
      account: account.address,
    });

    const hash = await worldContract.write.updateSpellMetadata(
      [spellId, metadata],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  const updateSpellName = async (spellId: Hex, name: string) => {
    await worldContract.simulate.updateSpellName([spellId, name], {
      account: account.address,
    });

    const hash = await worldContract.write.updateSpellName([spellId, name], {
      chain,
      account,
    });

    return waitForTransaction(hash);
  };

  const updateSpellVersion = async (shamanId: Hex, spellId: Hex) => {
    await worldContract.simulate.updateShamanSpellVersion([shamanId, spellId], {
      account: account.address,
    });

    const hash = await worldContract.write.updateShamanSpellVersion(
      [shamanId, spellId],
      {
        chain,
        account,
      }
    );

    return waitForTransaction(hash);
  };

  // Source management
  const createSource = async (
    sourceType: number,
    name: string,
    metadata: string
  ) => {
    await worldContract.simulate.createSource([sourceType, name, metadata], {
      account: account.address,
    });

    const hash = await worldContract.write.createSource(
      [sourceType, name, metadata],
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

  const claimZug = async (amount: bigint) => {
    await worldContract.simulate.claimZug([amount], {
      account: account.address,
    });

    const hash = await worldContract.write.claimZug([amount], {
      chain,
      account,
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

  const getShamanSpellIds = async (shamanId: Hex): Promise<Hex[]> => {
    return (await worldContract.read.getShamanSpellIds([shamanId])) as Hex[];
  };

  const getShamanSourceIds = async (shamanId: Hex): Promise<Hex[]> => {
    return (await worldContract.read.getShamanSourceIds([shamanId])) as Hex[];
  };

  const getSpellName = async (spellId: Hex): Promise<string> => {
    return (await worldContract.read.getSpellName([spellId])) as string;
  };

  const getSpellMetadata = async (spellId: Hex): Promise<string> => {
    return (await worldContract.read.getSpellMetadata([spellId])) as string;
  };

  const getSpellCreator = async (spellId: Hex): Promise<Hex> => {
    return (await worldContract.read.getSpellCreator([spellId])) as Hex;
  };

  return {
    createShaman,
    updateShamanMetadata,
    updateShamanStatus,
    depositShamanBalance,
    withdrawShamanBalance,
    updateShamanWorkflow,
    createSpell,
    updateSpellMetadata,
    updateSpellName,
    updateSpellVersion,
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
    getShamanSpellIds,
    getShamanSourceIds,
    getSpellName,
    getSpellMetadata,
    getSpellCreator,
    claimZug,
  };
}
