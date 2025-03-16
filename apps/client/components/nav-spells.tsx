'use client';

import { Plus, Webhook } from 'lucide-react';

import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSpells } from '@/hooks/use-spells';
import { useEmbeddedWallet } from '@/hooks/use-embedded-wallet';
export function NavSpells() {
  const { user, login } = usePrivy();
  const { address } = useEmbeddedWallet();
  const router = useRouter();
  const { data: spells } = useSpells();
  const userSpells = spells.filter((spell) => spell.creator === address);
  const { spellId } = useParams();
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <Link href="/spells">Spells</Link>
      </SidebarGroupLabel>
      <SidebarMenu>
        {userSpells.map((item) => (
          <SidebarMenuItem key={item.spellId}>
            <SidebarMenuButton asChild isActive={spellId === item.spellId}>
              <Link href={`/spell/${item.spellId}`}>
                <Webhook />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname === '/spell'}
            onClick={() => (user ? router.push('/spell') : login())}>
            <Plus />
            <span>New Spell</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
