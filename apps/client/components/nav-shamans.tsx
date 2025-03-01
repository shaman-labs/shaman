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
import { useShamans } from '@/hooks/use-shamans';

export function NavShamans() {
  const { user, login } = usePrivy();
  const router = useRouter();
  const { data: shamans } = useShamans();
  const { shamanId } = useParams();
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Shamans</SidebarGroupLabel>
      <SidebarMenu>
        {shamans.map((item) => (
          <SidebarMenuItem key={item.shamanId}>
            <SidebarMenuButton asChild isActive={shamanId === item.shamanId}>
              <Link href={`/shaman/${item.shamanId}`}>
                <Webhook />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname === '/shaman'}
            onClick={() => (user ? router.push('/shaman') : login())}>
            <Plus />
            <span>New Shaman</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
