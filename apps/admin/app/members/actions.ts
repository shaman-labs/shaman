'use server';

import { Hex } from 'viem';
import { CHAIN_ID, RPC_URL } from '@/lib/config';
import {
  adminAccount,
  chain,
  publicClient,
  worldContract,
} from '@/lib/contracts';

export async function setMembers(addresses: Hex[]) {
  try {
    console.log('Adding members to world:', {
      chainId: CHAIN_ID,
      rpcUrl: RPC_URL,
      account: adminAccount.address,
    });
    console.log('Addming members:', addresses);

    await worldContract.simulate.setMembers([addresses], {
      account: adminAccount.address,
    });

    const hash = await worldContract.write.setMembers([addresses], {
      chain,
      account: adminAccount.address,
    });

    console.log('Transaction hash:', hash);

    await publicClient.waitForTransactionReceipt({ hash });

    return { success: true, hash };
  } catch (error) {
    console.error('Error processing wallets:', error);
    return { success: false, error: (error as Error).message };
  }
}
