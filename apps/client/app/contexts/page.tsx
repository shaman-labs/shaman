'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useContexts } from '@/hooks/use-contexts';
import { DialogAddContext } from '@/components/dialog-add-context';
import { DialogDeleteContext } from '@/components/dialog-delete-context';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export default function Page() {
  const { data: contexts } = useContexts();
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>Contexts</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Manage your environment variables and secrets.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Context
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contexts.map((key: string) => (
              <Card key={key} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="truncate">{key}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDeleteDialog(key)}
                      className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">
                    Value is hidden for security purposes.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>

      <DialogAddContext
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <DialogDeleteContext
        open={deleteDialogState.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteDialogState((prev) => ({ ...prev, isOpen }))
        }
        contextKey={deleteDialogState.key}
      />
    </SidebarProvider>
  );
}
