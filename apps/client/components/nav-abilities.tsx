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
import { useAbilities } from '@/hooks/use-abilities';

export function NavAbilities() {
  const { user, login } = usePrivy();
  const router = useRouter();
  const { data: abilities } = useAbilities();
  const { abilityId } = useParams();
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Abilities</SidebarGroupLabel>
      <SidebarMenu>
        {abilities.map((item) => (
          <SidebarMenuItem key={item.abilityId}>
            <SidebarMenuButton asChild isActive={abilityId === item.abilityId}>
              <Link href={`/ability/${item.abilityId}`}>
                <Webhook />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname === '/ability'}
            onClick={() => (user ? router.push('/ability') : login())}>
            <Plus />
            <span>New Ability</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
