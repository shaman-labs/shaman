'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { createConfig } from '@privy-io/wagmi';
import { arbitrumSepolia, base } from 'wagmi/chains';
import { WagmiProvider } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { ThemeProvider } from 'next-themes';
import { LoadingScreen } from './loading-screen';
import { MUDProvider } from '@/contexts/mud-context';
import { DialogContextProvider } from '@/contexts/dialog-context';
import { chain } from '@/mud/supportedChains';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [arbitrumSepolia, base],
  transports: {
    [arbitrumSepolia.id]: http(),
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL!, {
      batch: true,
    }),
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: 'dark',
        },
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
        defaultChain: chain,
      }}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <MUDProvider>
            <ThemeProvider attribute="class" defaultTheme="dark">
              <DialogContextProvider>
                <LoadingScreen>{children}</LoadingScreen>
              </DialogContextProvider>
            </ThemeProvider>
          </MUDProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
