'use client';

import {
  CirclePlay,
  CircleStop,
  MoreHorizontal,
  Pencil,
  Plus,
  Webhook,
  Zap,
} from 'lucide-react';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
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
import { useDialogContext } from '@/contexts/dialog-context';
import { useShamans } from '@/hooks/use-shamans';
import { useEmbeddedWallet } from '@/hooks/use-embedded-wallet';

export function NavShamans() {
  const { user, login } = usePrivy();
  const { address } = useEmbeddedWallet();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { data: shamans } = useShamans();
  const userShamans = shamans.filter((shaman) => shaman.creator === address);
  const { shamanId } = useParams();
  const { openTrigger, openActivation } = useDialogContext();
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <Link href="/" className="text-muted-foreground">
          Shamans
        </Link>
      </SidebarGroupLabel>
      <SidebarMenu>
        {userShamans.map((item) => (
          <SidebarMenuItem key={item.shamanId}>
            <SidebarMenuButton asChild isActive={shamanId === item.shamanId}>
              <Link href={`/shaman/${item.shamanId}`}>
                <Webhook />
                <span>{item.name}</span>
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
                <DropdownMenuItem
                  onClick={() =>
                    openActivation(
                      true,
                      `/shaman/${item.shamanId}`,
                      undefined,
                      item.shamanId
                    )
                  }>
                  {item.active ? (
                    <>
                      <CircleStop className="text-muted-foreground" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <CirclePlay className="text-muted-foreground" />
                      <span>Activate</span>
                    </>
                  )}
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
                {/* <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    openDelete(true, `/shaman/${item.shamanId}`, undefined)
                  }
                  className="text-red-500">
                  <Trash2 className="text-red-500" />
                  <span>Delete</span>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
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
