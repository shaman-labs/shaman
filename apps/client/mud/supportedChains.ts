import { mudFoundry } from '@latticexyz/common/chains';
import { Chain, base, mainnet, optimism, arbitrum } from 'viem/chains';

export type ChainWithFaucetUrl = Chain & { faucetUrl?: string };

export const arbitrumSepolia: ChainWithFaucetUrl = {
  id: 421_614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  faucetUrl: 'https://www.alchemy.com/faucets/arbitrum-sepolia',
  rpcUrls: {
    alchemy: {
      http: [
        process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ??
          'https://sepolia-rollup.arbitrum.io/rpc',
      ],
      webSocket: [
        (
          process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ??
          'https://sepolia-rollup.arbitrum.io/rpc'
        ).replace('http', 'wss'),
      ],
    },
    default: {
      http: [
        process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ??
          'https://sepolia-rollup.arbitrum.io/rpc',
      ],
    },
    public: {
      http: ['https://sepolia-rollup.arbitrum.io/rpc'],
    },
  },
  blockExplorers: {
    etherscan: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' },
    default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 81930,
    },
  },
  testnet: true,
};

export const supportedChains = [mudFoundry, base, arbitrumSepolia];
export const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 421_614);
export const chain = (supportedChains.find((c) => c?.id === chainId) ??
  mudFoundry) as Chain;

export const spellChains = [base, mainnet, optimism, arbitrum];
