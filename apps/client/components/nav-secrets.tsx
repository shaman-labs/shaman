'use client';

import { IconDots, IconPlus, IconKey, IconTrash } from '@tabler/icons-react';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { DialogDeleteSecret } from './dialog-delete-secret';
import { DialogAddSecret } from './dialog-add-secret';
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
import { useSecrets } from '@/hooks/use-secrets';

export function NavSecrets() {
  const { user, login } = usePrivy();
  const { isMobile } = useSidebar();
  const { data: secrets } = useSecrets();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    key: string;
  }>({
    isOpen: false,
    key: '',
  });

  const handleOpenDeleteDialog = (key: string) => {
    setDeleteDialogState({
      isOpen: true,
      key,
    });
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="p-0">Secrets</SidebarGroupLabel>
      <SidebarMenu>
        {secrets.map((item) => (
          <SidebarMenuItem key={item}>
            <SidebarMenuButton asChild>
              <div className="flex items-center gap-2">
                <IconKey />
                <span>{item}</span>
              </div>
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
                <DropdownMenuItem onClick={() => handleOpenDeleteDialog(item)}>
                  <IconTrash className="text-muted-foreground" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => (user ? setIsAddDialogOpen(true) : login())}>
            <IconPlus />
            <span>New Secret</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <DialogAddSecret
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <DialogDeleteSecret
        open={deleteDialogState.isOpen}
        onOpenChange={(isOpen: boolean) =>
          setDeleteDialogState((prev) => ({ ...prev, isOpen }))
        }
        secretKey={deleteDialogState.key}
      />
    </SidebarGroup>
  );
}
