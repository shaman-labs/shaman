'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  Clock,
  FileCode,
  LinkIcon,
  Minus,
  MoreVertical,
  Plus,
  User,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
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
import { useShaman } from '@/hooks/use-shaman';
import { useShamanLogs } from '@/hooks/use-shaman-logs';
import { ShamanLogType, ShamanLogsTableData } from '@/types/shaman';
import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';

type ChartDataPoint = {
  day: string;
  executions: number;
};

type DayExecutions = {
  [key: string]: number;
};

const logTypes = [
  {
    label: 'Queued',
    color: 'hsl(var(--chart-2))',
  },
  {
    label: 'Started',
    color: 'hsl(var(--chart-3))',
  },
  {
    label: 'Executed',
    color: 'hsl(var(--chart-1))',
  },
  {
    label: 'Deposit ZUG',
    color: 'hsl(var(--chart-4))',
  },
  {
    label: 'Withdraw ZUG',
    color: 'hsl(var(--chart-5))',
  },
  {
    label: 'Refunded ZUG',
    color: 'hsl(var(--chart-6))',
  },
];

const getChartData = (logs: ShamanLogsTableData[]): ChartDataPoint[] => {
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
  const { shamanId } = useParams();
  const {
    data: shaman,
    isLoading: shamanLoading,
    refetch,
  } = useShaman(shamanId as string);
  const { data: shamanLogs, isLoading: logsLoading } = useShamanLogs(
    shamanId as string
  );
  const executionLogs = shamanLogs?.filter(
    (log) => log.logType === ShamanLogType.COMPLETION
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
          id: log.shamanLogId,
          shamanId: log.shamanId,
          logType: log.logType,
          timestamp: new Date(Number(log.createdAt) * 1000).toISOString(),
          metadata: log.metadata,
          amount: log.amount,
          success: log.success,
        })) || []
      ),
    [executionLogs]
  );

  const tableData: ShamanLogsTableData[] = useMemo(
    () =>
      shamanLogs?.map((log) => ({
        id: log.shamanLogId,
        logType: log.logType as ShamanLogType,
        timestamp: new Date(Number(log.createdAt) * 1000).toISOString(),
        metadata: log.metadata,
        shamanId: log.shamanId,
        success: log.success,
        amount: log.amount,
      })) || [],
    [shamanLogs]
  );

  const columns: ColumnDef<ShamanLogsTableData>[] = useMemo(
    () => [
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
        accessorKey: 'success',
        header: 'Status',
        cell: ({ row }) => {
          if (row.original.logType === ShamanLogType.COMPLETION) {
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
        accessorKey: 'timestamp',
        header: 'Age',
        cell: ({ row }) => {
          const timestamp = new Date(row.original.timestamp ?? '');
          return formatDistanceToNow(timestamp, { addSuffix: true });
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          if (row.original.logType === ShamanLogType.COMPLETION) {
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
                <BreadcrumbItem>
                  <Link href="/shaman" className="text-muted-foreground">
                    Shamans
                  </Link>
                </BreadcrumbItem>
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
          <Tabs defaultValue="shaman" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="shaman">Shaman</TabsTrigger>
              <TabsTrigger value="spells">Spells</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="shaman">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>ZUG Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {shamanLoading ? (
                        <Skeleton className="h-14 w-32 mx-auto" />
                      ) : (
                        <p className="text-center text-5xl font-bold">
                          {Number(shaman?.balance || 0)}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-row items-center justify-end mt-auto space-x-3">
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() =>
                          openAddBalance(
                            true,
                            shamanId as string,
                            handleRefetch
                          )
                        }>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Balance
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() =>
                          openWithdrawBalance(
                            true,
                            shamanId as string,
                            handleRefetch
                          )
                        }>
                        <Minus className="mr-2 h-4 w-4" />
                        Withdraw Balance
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card className="pt-6">
                    <CardContent className="flex-grow space-y-4">
                      <div className="grid gap-6 divide-y divide-border">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <FileCode className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xs font-medium text-muted-foreground">
                              Name
                            </h3>
                            {shamanLoading ? (
                              <Skeleton className="h-5 w-32" />
                            ) : (
                              <p className="text-base font-semibold">
                                {shaman?.name}
                              </p>
                            )}
                          </div>
                        </div>

                        {shaman?.description && (
                          <div className="flex items-start gap-3 pt-4">
                            <div className="bg-primary/10 p-2 rounded-md mt-1">
                              <FileCode className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xs font-medium text-muted-foreground">
                                Description
                              </h3>
                              <p className="text-sm">{shaman.description}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-4">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xs font-medium text-muted-foreground">
                              Creator
                            </h3>
                            {shamanLoading ? (
                              <Skeleton className="h-5 w-40" />
                            ) : (
                              <p className="font-mono text-sm truncate">
                                {shaman?.creator}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <LinkIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h3 className="text-xs font-medium text-muted-foreground">
                              IPFS Link
                            </h3>
                            {shaman?.metadata ? (
                              <a
                                href={`https://gateway.shaman.fun/ipfs/${shaman.metadata}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 text-sm font-medium truncate block">
                                ipfs://{shaman.metadata}
                              </a>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No IPFS link available
                              </p>
                            )}
                          </div>
                        </div>

                        {shaman?.createdAt && (
                          <div className="flex items-center gap-3 pt-4">
                            <div className="bg-primary/10 p-2 rounded-md">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xs font-medium text-muted-foreground">
                                Created
                              </h3>
                              <p className="text-sm">
                                {format(
                                  Number(shaman.createdAt) * 1000,
                                  'PPpp'
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex flex-col gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2 p-4 rounded-lg border">
                          <p className="text-sm text-muted-foreground">
                            Total Executions
                          </p>
                          <p className="text-2xl font-bold">
                            {executionLogs?.length || 0}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 rounded-lg border">
                          <p className="text-sm text-muted-foreground">
                            Success Rate
                          </p>
                          <p className="text-2xl font-bold">
                            {executionLogs?.length
                              ? Math.round(
                                  (executionLogs.filter((log) => log.success)
                                    .length /
                                    executionLogs.length) *
                                    100
                                )
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    </CardContent>
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
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
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
                      <CardTitle>Recent Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {logsLoading ? (
                        <div className="space-y-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                          ))}
                        </div>
                      ) : tableData.length > 0 ? (
                        <DataTable
                          columns={columns}
                          data={tableData.slice(0, 5)}
                        />
                      ) : (
                        <p className="text-center py-8 text-muted-foreground">
                          No logs found for this shaman
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="spells">
              <Card>
                <CardHeader>
                  <CardTitle>Shaman Spells</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Spells tab functionality will be implemented in a future
                      update.
                    </p>
                    <p className="text-muted-foreground mt-2">
                      This shaman has {shaman?.spellCount || 0} spells.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>Shaman Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  {logsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : tableData.length > 0 ? (
                    <DataTable columns={columns} data={tableData} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No logs found for this shaman
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
