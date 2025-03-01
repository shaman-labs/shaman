'use client';

import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Webhook,
  Zap,
} from 'lucide-react';

import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useParams, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { useDialogContext } from '@/contexts/dialog-context';

export function NavShamans() {
  const { user, login } = usePrivy();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { data: shamans } = useShamans();
  const { shamanId } = useParams();
  const { openTrigger, openDelete } = useDialogContext();

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
                  onClick={() => router.push(`/update/${item.shamanId}`)}>
                  <Pencil className="text-muted-foreground" />
                  <span>Update</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    openTrigger(
                      true,
                      `/shaman/${item.shamanId}`,
                      undefined,
                      item.shamanId
                    )
                  }>
                  <Zap className="text-muted-foreground" />
                  <span>Trigger</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    openDelete(true, `/`, undefined, item.shamanId)
                  }
                  className="text-red-500">
                  <Trash2 className="text-red-500" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => (user ? router.push('/new') : login())}>
            <Plus />
            <span>New Shaman</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
