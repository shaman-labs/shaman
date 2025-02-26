'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { Minus, MoreVertical, Plus, Trash2, Zap, Pencil } from 'lucide-react';
import { themes } from 'prism-react-renderer';
import { Highlight } from 'prism-react-renderer';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
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
import { useShaman } from '@/hooks/use-shaman';
import { useDialogContext } from '@/contexts/dialog-context';
import { useZugBalance } from '@/hooks/use-zug-balance';
import { useEmbeddedWallet } from '@/hooks/use-embedded-wallet';
import { useShamanLogs } from '@/hooks/use-shaman-logs';
import { ShamanLog, ShamanLogType } from '@/types/shaman';
import { DataTable } from '@/components/data-table';

type ChartDataPoint = {
  day: string;
  executions: number;
};

type DayExecutions = {
  [key: string]: number;
};

const executionLogTypes = [
  {
    label: 'Execution',
    color: 'hsl(var(--chart-1))',
  },
  {
    label: 'Deposit',
    color: 'hsl(var(--chart-2))',
  },
  {
    label: 'Withdraw',
    color: 'hsl(var(--chart-3))',
  },
  {
    label: 'Refund',
    color: 'hsl(var(--chart-4))',
  },
];

const getChartData = (logs: ShamanLog[]): ChartDataPoint[] => {
  const groupedByDay: DayExecutions = logs.reduce((acc, log) => {
    const date = new Date(log.createdAt);
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

type ShamanLogsTableData = {
  id: string;
  logType: string;
  timestamp: string;
  logMetadata?: string;
  success?: boolean;
  type: ShamanLogType;
};

const columns: ColumnDef<ShamanLogsTableData>[] = [
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
            backgroundColor: executionLogTypes[row.original.type]?.color,
          }}
        />
        {executionLogTypes[row.original.type]?.label}
      </div>
    ),
  },
  {
    accessorKey: 'success',
    header: 'Status',
    cell: ({ row }) => {
      if (row.original.type === ShamanLogType.Execution) {
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: row.original.success ? 'green' : 'red',
              }}
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
      if (row.original.type === ShamanLogType.Execution) {
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
                onClick={() => {
                  window.open(
                    `https://gateway.shaman.fun/ipfs/${row.original.logMetadata}`,
                    '_blank'
                  );
                }}>
                View logs
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
      return null;
    },
  },
];

export default function Page() {
  const { shamanId } = useParams();
  const router = useRouter();
  const { data: shaman, refetch } = useShaman(shamanId as string);
  const { data: shamanLogs } = useShamanLogs(shamanId as string);
  const executionLogs = shamanLogs?.filter(
    (log) => log.logType === ShamanLogType.Execution
  );
  const embeddedWallet = useEmbeddedWallet();
  const { refetch: refetchZugBalance } = useZugBalance(
    embeddedWallet?.address as `0x${string}`
  );
  const { openAddBalance, openWithdrawBalance, openTrigger, openDelete } =
    useDialogContext();

  const handleRefetch = () => {
    refetch();
    refetchZugBalance();
  };

  const chartData: ChartDataPoint[] = useMemo(
    () =>
      getChartData(
        executionLogs?.map((log) => ({
          shamanLogId: log.shamanLogId,
          shamanId: log.shamanId,
          logType: log.logType,
          amount: Number(log.amount),
          createdAt: Number(log.createdAt) * 1000,
          success: log.success,
        })) || []
      ),
    [executionLogs]
  );

  const tableData: ShamanLogsTableData[] = useMemo(
    () =>
      shamanLogs?.map((log) => ({
        id: log.shamanLogId,
        logType: executionLogTypes[log.logType]?.label || 'Unknown',
        timestamp: new Date(Number(log.createdAt) * 1000).toISOString(),
        logMetadata: log.logMetadata,
        type: log.logType,
        success: log.success,
      })) || [],
    [shamanLogs]
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
                    {shamanId}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>$ZUG Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-5xl font-bold">
                    {Number(shaman?.balance || 0)}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-row items-center justify-end mt-auto space-x-3">
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() =>
                      openAddBalance(true, undefined, handleRefetch)
                    }>
                    <Plus />
                    Add Balance
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() =>
                      openWithdrawBalance(true, undefined, handleRefetch)
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
              <Card>
                <CardHeader>
                  <CardTitle>Shaman Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable columns={columns} data={tableData} />
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Shaman</CardTitle>
                  <Button
                    onClick={() => router.push(`/edit/${shamanId}`)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 max-w-full w-full">
                  <Tabs defaultValue="prompt" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="prompt">Prompt</TabsTrigger>
                      <TabsTrigger value="code">Code</TabsTrigger>
                    </TabsList>
                    <TabsContent value="prompt">
                      <div className="flex flex-col h-full w-full">
                        <Highlight
                          theme={themes.nightOwl}
                          code={shaman?.prompt || ''}
                          language="markdown">
                          {({ style, tokens, getLineProps, getTokenProps }) => (
                            <pre
                              className="w-full p-4 text-sm whitespace-pre-wrap"
                              style={{ ...style, maxWidth: '100%' }}>
                              {tokens.map((line, i) => (
                                <div
                                  key={i}
                                  {...getLineProps({ line })}
                                  className="whitespace-pre-wrap">
                                  {line.map((token, key) => (
                                    <span
                                      key={key}
                                      {...getTokenProps({ token })}
                                    />
                                  ))}
                                </div>
                              ))}
                            </pre>
                          )}
                        </Highlight>
                      </div>
                    </TabsContent>
                    <TabsContent value="code">
                      <div className="flex flex-col h-full w-full">
                        <Highlight
                          theme={themes.nightOwl}
                          code={shaman?.code || ''}
                          language="tsx">
                          {({ style, tokens, getLineProps, getTokenProps }) => (
                            <pre
                              className="overflow-x-auto w-full p-4 text-sm whitespace-pre"
                              style={{ ...style, maxWidth: '100%' }}>
                              {tokens.map((line, i) => (
                                <div
                                  key={i}
                                  {...getLineProps({ line })}
                                  className="whitespace-pre">
                                  {line.map((token, key) => (
                                    <span
                                      key={key}
                                      {...getTokenProps({ token })}
                                    />
                                  ))}
                                </div>
                              ))}
                            </pre>
                          )}
                        </Highlight>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex flex-row items-center justify-end mt-auto space-x-3">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => openTrigger(true, undefined, handleRefetch)}>
                    <Zap />
                    Trigger
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => openDelete(true, undefined, handleRefetch)}>
                    <Trash2 />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
