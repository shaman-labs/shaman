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

export function NavSpells() {
  const { user, login } = usePrivy();
  const router = useRouter();
  const { data: spells } = useSpells();
  const { spellId } = useParams();
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Spells</SidebarGroupLabel>
      <SidebarMenu>
        {spells.map((item) => (
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
