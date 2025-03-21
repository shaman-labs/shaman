'use client';

import {
  IconDots,
  IconEdit,
  IconPlus,
  IconActivity,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useSpells } from '@/hooks/use-spells';
import { useEmbeddedWallet } from '@/hooks/use-embedded-wallet';

export function NavSpells() {
  const { user, login } = usePrivy();
  const embeddedWallet = useEmbeddedWallet();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { data: spells } = useSpells();
  const userSpells = spells.filter(
    (spell) => spell.creator === embeddedWallet?.address
  );
  const { spellId } = useParams();
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <Link href="/spells" className="text-muted-foreground">
          Spells
        </Link>
      </SidebarGroupLabel>
      <SidebarMenu>
        {userSpells.map((item) => (
          <SidebarMenuItem key={item.spellId}>
            <SidebarMenuButton asChild isActive={spellId === item.spellId}>
              <Link href={`/spell/${item.spellId}`}>
                <IconActivity />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <IconDots />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}>
                <DropdownMenuItem
                  onClick={() => router.push(`/spell/${item.spellId}/update`)}>
                  <IconEdit className="text-muted-foreground" />
                  <span>Update</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname === '/spell'}
            onClick={() => (user ? router.push('/spell') : login())}>
            <IconPlus />
            <span>New Spell</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
