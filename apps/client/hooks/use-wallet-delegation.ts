'use client';

import { useEffect, useRef } from 'react';
import type { WalletWithMetadata, User } from '@privy-io/react-auth';
import {
  useWallets,
  useHeadlessDelegatedActions,
  useCreateWallet,
  useLogin,
} from '@privy-io/react-auth';

// Configuration for retry mechanism
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 2000, // 2 seconds
} as const;

/**
 * Hook to handle Privy wallet delegation with automatic retries
 * This will attempt to delegate the wallet when a user logs in,
 * retrying on failure with exponential backoff
 */
export function useWalletDelegation() {
  // Privy hooks
  const { ready, wallets } = useWallets();
  const { delegateWallet } = useHeadlessDelegatedActions();
  const { createWallet } = useCreateWallet();

  // Refs for managing retry state
  const retryCount = useRef<number>(0);
  const retryTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  /**
   * Attempts to delegate the wallet with retry mechanism
   */
  const attemptDelegation = async () => {
    if (!ready) return;

    try {
      // Find Privy embedded wallet
      const privyWallet = wallets.find(
        (wallet: { walletClientType: string }) =>
          wallet.walletClientType === 'privy'
      );

      if (!privyWallet) {
        await createWallet();
      }

      // Exit if no wallet found
      if (!privyWallet) {
        retryCount.current = 0;
        return;
      }

      // Attempt the delegation
      await delegateWallet({
        address: privyWallet.address,
        chainType: 'ethereum',
      });

      // Reset retry count on success
      retryCount.current = 0;
    } catch (error) {
      if (retryCount.current < RETRY_CONFIG.maxAttempts) {
        // Calculate delay with exponential backoff
        const delay = RETRY_CONFIG.baseDelay * Math.pow(2, retryCount.current);
        retryCount.current += 1;

        // Schedule retry
        retryTimeout.current = setTimeout(attemptDelegation, delay);
      } else {
        // Give up after max retries
        retryCount.current = 0;
        console.warn('Wallet delegation failed after max retries:', error);
      }
    }
  };

  /**
   * Cleanup function to clear any pending retries
   */
  const cleanup = () => {
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current);
      retryTimeout.current = null;
    }
  };

  // Handle login completion
  useLogin({
    onComplete: async ({ user }: { user: User }) => {
      // Check if wallet is already delegated
      const isAlreadyDelegated = user.linkedAccounts.find(
        (account): account is WalletWithMetadata =>
          account.type === 'wallet' && account.delegated
      );

      // Only attempt delegation if not already delegated
      if (!isAlreadyDelegated) {
        cleanup(); // Clear any existing retries
        Promise.resolve().then(attemptDelegation);
      }
    },
  });

  // Cleanup on unmount
  useEffect(() => cleanup, []);
}
