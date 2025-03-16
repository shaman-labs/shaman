import { usePrivy, WalletWithMetadata } from '@privy-io/react-auth';

export const useEmbeddedWallet = () => {
  const { user } = usePrivy();

  return (
    (user?.linkedAccounts?.find(
      (account) =>
        account.type === 'wallet' && account.connectorType === 'embedded'
    ) as WalletWithMetadata) ?? { address: null }
  );
};
