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
import { useParams, usePathname, useRouter } from 'next/navigation';
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
import { trimHash } from '@/lib/utils';
import { useDialogContext } from '@/contexts/dialog-context';
import { useWorkflows } from '@/hooks/use-workflows';

export function NavWorkflows() {
  const { user, login } = usePrivy();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { data: workflows } = useWorkflows();
  const { workflowId } = useParams();
  const { openTrigger, openDelete } = useDialogContext();
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Shamans</SidebarGroupLabel>
      <SidebarMenu>
        {workflows.map((item) => (
          <SidebarMenuItem key={item.workflowId}>
            <SidebarMenuButton
              asChild
              isActive={workflowId === item.workflowId}>
              <Link href={`/workflow/${item.workflowId}`}>
                <Webhook />
                <span>{trimHash(item.workflowId, 4)}</span>
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
                    router.push(`/workflow/${item.workflowId}/update`)
                  }>
                  <Pencil className="text-muted-foreground" />
                  <span>Update</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    openTrigger(
                      true,
                      `/workflow/${item.workflowId}`,
                      undefined,
                      item.workflowId
                    )
                  }>
                  <Zap className="text-muted-foreground" />
                  <span>Trigger</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    openDelete(true, `/workflow/${item.workflowId}`, undefined)
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
            isActive={pathname === '/workflow'}
            onClick={() => (user ? router.push('/workflow') : login())}>
            <Plus />
            <span>New Shaman</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
