'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { Minus, MoreVertical, Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDialogContext } from '@/contexts/dialog-context';
import { useZugBalance } from '@/hooks/use-zug-balance';
import { useEmbeddedWallet } from '@/hooks/use-embedded-wallet';
import { useWorkflow } from '@/hooks/use-workflow';
import { useWorkflowLogs } from '@/hooks/use-workflow-logs';
import { WorkflowLogType, WorkflowLogsTableData } from '@/types/workflow';
import { DataTable } from '@/components/data-table';

type ChartDataPoint = {
  day: string;
  executions: number;
};

type DayExecutions = {
  [key: string]: number;
};

const logTypes = [
  {
    label: 'Execution',
    color: 'hsl(var(--chart-1))',
  },
];

const getChartData = (logs: WorkflowLogsTableData[]): ChartDataPoint[] => {
  const groupedByDay: DayExecutions = logs.reduce((acc, log) => {
    const date = new Date(log.timestamp);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as DayExecutions);

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days.map(
    (day): ChartDataPoint => ({
      day,
      executions: groupedByDay[day] || 0,
    })
  );
};

const chartConfig = {
  executions: {
    label: 'Executions',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function Page() {
  const { workflowId } = useParams();
  const { data: workflow, refetch } = useWorkflow(workflowId as string);
  const { data: workflowLogs } = useWorkflowLogs(workflowId as string);
  const executionLogs = workflowLogs?.filter(
    (log) => log.logType === WorkflowLogType.COMPLETION
  );
  const embeddedWallet = useEmbeddedWallet();
  const { refetch: refetchZugBalance } = useZugBalance(
    embeddedWallet?.address as `0x${string}`
  );
  const { openAddBalance, openWithdrawBalance, openViewLog } =
    useDialogContext();

  const handleRefetch = useCallback(() => {
    refetch();
    refetchZugBalance();
  }, [refetch, refetchZugBalance]);

  const chartData: ChartDataPoint[] = useMemo(
    () =>
      getChartData(
        executionLogs?.map((log) => ({
          id: log.workflowLogId,
          workflowId: log.workflowId,
          logType: log.logType,
          shamanId: log.shamanId,
          timestamp: new Date(Number(log.createdAt) * 1000).toISOString(),
          metadata: log.metadata,
          amount: log.amount,
          success: log.success,
        })) || []
      ),
    [executionLogs]
  );

  const tableData: WorkflowLogsTableData[] = useMemo(
    () =>
      workflowLogs?.map((log) => ({
        id: log.workflowLogId,
        logType: log.logType as WorkflowLogType,
        timestamp: new Date(Number(log.createdAt) * 1000).toISOString(),
        logMetadata: log.metadata,
        shamanId: log.shamanId,
        metadata: log.metadata,
        success: log.success,
        amount: log.amount,
      })) || [],
    [workflowLogs]
  );

  const columns: ColumnDef<WorkflowLogsTableData>[] = useMemo(
    () => [
      {
        accessorKey: 'timestamp',
        header: 'Age',
        cell: ({ row }) => {
          const timestamp = new Date(row.original.timestamp ?? '');
          return formatDistanceToNow(timestamp, { addSuffix: true });
        },
      },
      {
        accessorKey: 'logType',
        header: 'Log Type',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: logTypes[row.original.logType]?.color,
              }}
            />
            {logTypes[row.original.logType]?.label}
          </div>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
          return row.original.amount !== undefined ? row.original.amount : '-';
        },
      },
      {
        accessorKey: 'success',
        header: 'Status',
        cell: ({ row }) => {
          if (row.original.logType === WorkflowLogType.COMPLETION) {
            return (
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    row.original.success ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {row.original.success ? 'Success' : 'Failed'}
              </div>
            );
          }
          return null;
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          if (row.original.logType === WorkflowLogType.COMPLETION) {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      openViewLog(true, undefined, handleRefetch, row.original)
                    }>
                    View logs
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
          return null;
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openViewLog]
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
                  <BreadcrumbPage className="text-xs">
                    {workflowId}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Tabs defaultValue="workflow" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="shamans">Shamans</TabsTrigger>
              <TabsTrigger value="executions">Executions</TabsTrigger>
            </TabsList>
            <TabsContent value="workflow">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>ZUG Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-5xl font-bold">
                        {Number(workflow?.balance || 0)}
                      </p>
                    </CardContent>
                    <CardFooter className="flex flex-row items-center justify-end mt-auto space-x-3">
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() =>
                          openAddBalance(
                            true,
                            workflowId as string,
                            handleRefetch
                          )
                        }>
                        <Plus />
                        Add Balance
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() =>
                          openWithdrawBalance(
                            true,
                            workflowId as string,
                            handleRefetch
                          )
                        }>
                        <Minus />
                        Withdraw Balance
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Executions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <LineChart
                          accessibilityLayer
                          data={chartData}
                          margin={{
                            left: 12,
                            right: 12,
                          }}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Line
                            dataKey="executions"
                            type="step"
                            stroke="var(--color-executions)"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                      <div className="leading-none text-muted-foreground">
                        Showing executions for the last 7 days
                      </div>
                    </CardFooter>
                  </Card>
                </div>
                <div className="flex flex-col gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable columns={columns} data={tableData} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="shamans">
              {/* {workflow?.shamanIds && workflow.shamanIds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workflow.shamanIds.map((shamanId) => (
                    <Card key={shamanId}>
                      <CardHeader>
                        <CardTitle>{shamanId}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Shaman details will go here</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center p-4">No shamans in this workflow</p>
              )} */}
            </TabsContent>
            <TabsContent value="executions">
              <Card>
                <CardHeader>
                  <CardTitle>All Execution Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={tableData.filter(
                      (log) => log.logType === WorkflowLogType.COMPLETION
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
