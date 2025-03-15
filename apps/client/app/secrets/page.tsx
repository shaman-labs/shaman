'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useSecrets } from '@/hooks/use-secrets';
import { DialogAddSecret } from '@/components/dialog-add-secret';
import { DialogDeleteSecret } from '@/components/dialog-delete-secret';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Grid, GridItem } from '@/components/grid';

export default function Page() {
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
                  <BreadcrumbPage>Secrets</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
            <GridItem>
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Create New Secret</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p>Create a new secret to be used in your shamans.</p>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm mt-auto">
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="w-full"
                    variant="default">
                    <Plus />
                    Create Secret
                  </Button>
                </CardFooter>
              </Card>
            </GridItem>
          </Grid>
          <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
            {secrets.map((key: string) => (
              <GridItem key={key}>
                <Card className="flex flex-col">
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
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Value is hidden for security purposes.
                    </p>
                  </CardContent>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </div>
      </SidebarInset>

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
    </SidebarProvider>
  );
}
