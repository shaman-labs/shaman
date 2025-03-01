'use client';

import { MoreHorizontal, Pencil, Plus, Webhook } from 'lucide-react';

import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useParams, useRouter } from 'next/navigation';
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
import { useShamans } from '@/hooks/use-shamans';
import { trimHash } from '@/lib/utils';

export function NavShamans() {
  const { user, login } = usePrivy();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { data: shamans } = useShamans();
  const { shamanId } = useParams();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Shamans</SidebarGroupLabel>
      <SidebarMenu>
        {shamans.map((item) => (
          <SidebarMenuItem key={item.shamanId}>
            <SidebarMenuButton asChild isActive={shamanId === item.shamanId}>
              <Link href={`/shaman/${item.shamanId}`}>
                <Webhook />
                <span>{trimHash(item.shamanId, 4)}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/shaman/${item.shamanId}/update`)
                  }>
                  <Pencil className="text-muted-foreground" />
                  <span>Update</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => (user ? router.push('/shaman') : login())}>
            <Plus />
            <span>New Shaman</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
