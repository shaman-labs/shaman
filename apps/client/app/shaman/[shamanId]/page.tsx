'use client';

import { useParams } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import { ShamanTab } from './components/tab-shaman';
import { WorkflowTab } from './components/tab-workflow';
import { LogsTab } from './components/tab-logs';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useShaman } from '@/hooks/use-shaman';

export default function Page() {
  const { shamanId } = useParams();
  const { data: shaman, isLoading: shamanLoading } = useShaman(
    shamanId as string
  );

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
                  <BreadcrumbPage>
                    {shamanLoading ? 'Loading...' : shaman?.name || shamanId}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {!shamanLoading && shaman?.active !== undefined && (
            <div
              className={`ml-auto mr-4 inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors ${shaman.active ? 'border-transparent bg-green-500 text-white' : 'border-transparent bg-red-500 text-white'}`}>
              {shaman.active ? 'Active' : 'Inactive'}
            </div>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Tabs defaultValue="workflow" className="w-full">
            <TabsList className="grid mb-5 w-full grid-cols-3">
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="shaman">Shaman</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="workflow">
              <ReactFlowProvider>
                <WorkflowTab />
              </ReactFlowProvider>
            </TabsContent>
            <TabsContent value="shaman">
              <ShamanTab />
            </TabsContent>
            <TabsContent value="logs" className="mt-2">
              <LogsTab />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
