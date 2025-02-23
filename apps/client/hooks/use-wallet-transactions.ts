import { Hex } from 'viem';

import { useQuery } from '@tanstack/react-query';
import { arbitrumSepolia } from 'wagmi/chains';
import { Transaction } from '@covalenthq/client-sdk';
import goldrush from '@/services/goldrush';

export const useWalletTransactions = (walletAddress?: Hex) => {
  return useQuery({
    queryKey: ['walletTransactions', walletAddress],
    initialData: null,
    queryFn: async () => {
      if (!walletAddress) return null;

      const results: Transaction[] = [];
      for await (const tx of goldrush.TransactionService.getAllTransactionsForAddress(
        arbitrumSepolia.id,
        walletAddress,
        {
          quoteCurrency: 'USD',
        }
      )) {
        results.push(...(tx.data?.items ?? []));
      }

      return results;
    },
    enabled: !!walletAddress,
  });
};
