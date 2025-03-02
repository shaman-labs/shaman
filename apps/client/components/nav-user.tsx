'use client';

import { ChevronsUpDown, LogOut, Sparkles, Wallet } from 'lucide-react';
import BoringAvatar from 'boring-avatars';
import { useFundWallet, usePrivy } from '@privy-io/react-auth';
import { Chain, formatEther } from 'viem';
import { useBalance } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { useWalletDelegation } from '@/hooks/use-wallet-delegation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { trimHash } from '@/lib/utils';
import { useZugBalance } from '@/hooks/use-zug-balance';
import { chain } from '@/mud/supportedChains';
import { useDialogContext } from '@/contexts/dialog-context';
import { useEmbeddedWallet } from '@/hooks/use-embedded-wallet';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { fundWallet } = useFundWallet();
  const { user, login, logout } = usePrivy();
  const embeddedWallet = useEmbeddedWallet();
  const address = embeddedWallet?.address;
  const { data: balance } = useBalance({ address: address as `0x${string}` });
  const { data: zugBalance } = useZugBalance(address as `0x${string}`);
  const { openBuyZug } = useDialogContext();
  const router = useRouter();
  useWalletDelegation();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {user ? (
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Avatar className="h-8 w-8 rounded-lg">
                  <BoringAvatar name={address} variant="beam" />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {trimHash(address)}
                  </span>
                  <span className="truncate text-xs">
                    {zugBalance || 0} ZUG | {formatEther(balance?.value || 0n)}{' '}
                    ETH
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          ) : (
            <SidebarMenuButton
              size="lg"
              className="flex justify-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={login}>
              <span className="truncate font-semibold">Connect Wallet</span>
            </SidebarMenuButton>
          )}
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push(`/account/${address}`)}>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 rounded-lg">
                  <BoringAvatar name={address} variant="beam" />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Shaman Wallet</span>
                  <span className="truncate text-xs">{trimHash(address)}</span>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  fundWallet(address || '', { chain: chain as Chain })
                }>
                <Wallet />
                Fund Shaman Wallet
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openBuyZug(true)}>
                <Sparkles />
                Buy ZUG
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={logout}>
              <LogOut />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
