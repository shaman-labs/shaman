import {
  createPublicClient,
  createWalletClient,
  getContract,
  Hex,
  http,
} from 'viem';
import { arbitrumSepolia, base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { IWorld } from 'contracts/abis/IWorld.abi';
import worlds from 'contracts/worlds.json';
import { ADMIN_PRIVATE_KEY, CHAIN_ID, RPC_URL } from '@/lib/config';

export const availableChains = [arbitrumSepolia, base];
export const chain =
  availableChains.find((chain) => chain.id === Number(CHAIN_ID)) ??
  arbitrumSepolia;

export const world = worlds[CHAIN_ID as keyof typeof worlds] as unknown as {
  address?: string;
  blockNumber?: bigint;
};
export const worldAddress = world?.address;

console.log('Using World Address', worldAddress);
console.log('Using Chain ID', chain.id);

if (!worldAddress) {
  throw new Error(
    `No world address found for chain ${CHAIN_ID}. Did you run \`mud deploy\`?`
  );
}

export const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL, {
    batch: true,
  }),
});

export const adminAccount = privateKeyToAccount(ADMIN_PRIVATE_KEY as Hex);

export const walletClient = createWalletClient({
  account: adminAccount,
  chain,
  transport: http(RPC_URL, {
    batch: true,
  }),
});

export const worldContract = getContract({
  address: worldAddress as Hex,
  abi: IWorld,
  client: {
    public: publicClient,
    wallet: walletClient,
  },
});
