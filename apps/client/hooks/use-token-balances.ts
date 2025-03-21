import { Hex } from 'viem';

import { useQuery } from '@tanstack/react-query';
import { chain } from '@/mud/supportedChains';
import goldrush from '@/services/goldrush';

export const useTokenBalances = (walletAddress?: Hex) => {
  return useQuery({
    queryKey: ['tokenBalances', walletAddress],
    initialData: null,
    queryFn: async () => {
      if (!walletAddress) return null;

      const results =
        await goldrush.BalanceService.getTokenBalancesForWalletAddress(
          chain.id,
          walletAddress,
          {
            quoteCurrency: 'USD',
          }
        );

      return results.data;
    },
    enabled: !!walletAddress,
  });
};
