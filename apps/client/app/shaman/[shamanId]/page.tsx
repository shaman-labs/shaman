'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  IconClock,
  IconRobot,
  IconFileDescription,
  IconUser,
  IconLink,
  IconMinus,
  IconPlus,
  IconTrash,
  IconDotsVertical,
} from '@tabler/icons-react';

import { useParams } from 'next/navigation';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { Hex } from 'viem';
import { Highlight, themes } from 'prism-react-renderer';
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
import { useShamanSpells } from '@/hooks/use-shaman-spells';
import { useMUD } from '@/contexts/mud-context';
import { toast } from '@/hooks/use-toast';
import { trimHash } from '@/lib/utils';
import { Grid, GridItem } from '@/components/grid';
import { RowItem } from '@/components/row-item';
import { LabelCreator } from '@/components/label-creator';
import { LabelIPFS } from '@/components/label-ipfs';
import { handleError } from '@/lib/errors';

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
    label: 'Completed',
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
  const mud = useMUD();
  const { shamanId } = useParams();
  const {
    data: shaman,
    isLoading: shamanLoading,
    refetch,
  } = useShaman(shamanId as string);
  const { data: shamanLogs, isLoading: logsLoading } = useShamanLogs(
    shamanId as string
  );
  const [spellId, setSpellId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const executionLogs = shamanLogs?.filter(
    (log) => log.logType === ShamanLogType.COMPLETION
  );
  const embeddedWallet = useEmbeddedWallet();
  const { refetch: refetchZugBalance } = useZugBalance(
    embeddedWallet?.address as `0x${string}`
  );
  const { openAddBalance, openWithdrawBalance, openViewLog, openAddSpell } =
    useDialogContext();
  const { data: shamanSpells, isLoading: shamanSpellsLoading } =
    useShamanSpells(shamanId as string);
  const selectedSpell = shamanSpells?.find(
    (spell) => spell.spellId === spellId
  );
  const spellLogs = shamanLogs?.filter((log) => log.spellId === spellId);
  const spellExecutionLogs = spellLogs?.filter(
    (log) => log.logType === ShamanLogType.COMPLETION
  );
  const isShamanCreator = embeddedWallet?.address === shaman?.creator;

  useEffect(() => {
    if (shamanSpells?.length) {
      setSpellId(shamanSpells[0].spellId);
    }
  }, [shamanSpells]);

  const handleRefetch = useCallback(() => {
    refetch();
    refetchZugBalance();
  }, [refetch, refetchZugBalance]);

  const handleRemoveSpell = useCallback(async () => {
    try {
      setLoading(true);
      await mud?.calls.embedded?.systemCalls?.removeSpellFromShaman(
        shamanId as Hex,
        selectedSpell?.spellId as Hex
      );
      toast({
        title: 'Success',
        description: 'Spell removed from shaman.',
      });
      setSpellId(null);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [selectedSpell, mud, shamanId]);

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
          spellId: log.spellId,
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
        spellId: log.spellId,
      })) || [],
    [shamanLogs]
  );

  const spellTableData: ShamanLogsTableData[] = useMemo(
    () =>
      spellLogs?.map((log) => ({
        id: log.shamanLogId,
        logType: log.logType as ShamanLogType,
        timestamp: new Date(Number(log.createdAt) * 1000).toISOString(),
        metadata: log.metadata,
        shamanId: log.shamanId,
        success: log.success,
        amount: log.amount,
        spellId: log.spellId,
      })) || [],
    [spellLogs]
  );

  const logColumns: ColumnDef<ShamanLogsTableData>[] = useMemo(
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
          return '-';
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
                    <IconDotsVertical className="h-4 w-4" />
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

  const extendedLogColumns: ColumnDef<ShamanLogsTableData>[] = useMemo(
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
        accessorKey: 'spellId',
        header: 'Spell',
        cell: ({ row }) => {
          const spell = shamanSpells?.find(
            (spell) => spell.spellId === row.original.spellId
          );
          return (
            spell?.name ||
            (row.original.spellId ===
            '0x0000000000000000000000000000000000000000000000000000000000000000'
              ? '-'
              : trimHash(row.original.spellId))
          );
        },
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
          return '-';
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
          return row.original.amount;
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
                    <IconDotsVertical className="h-4 w-4" />
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
    [openViewLog, shamanSpells]
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
                  <Link href="/" className="text-muted-foreground">
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
            <TabsList className="grid mb-5 w-full grid-cols-3">
              <TabsTrigger value="shaman">Shaman</TabsTrigger>
              <TabsTrigger value="spells">Spells</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="shaman">
              <Grid cols={{ sm: 1, lg: 2 }} gap={4}>
                <GridItem>
                  <Card className="mb-4">
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
                    {isShamanCreator && (
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
                          <IconPlus className="mr-2 h-4 w-4" />
                          Deposit
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
                          <IconMinus className="mr-2 h-4 w-4" />
                          Withdraw
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                  <Card className="pt-6">
                    <CardContent className="flex-grow space-y-4">
                      <div className="grid gap-6 divide-y divide-border">
                        <RowItem icon={IconRobot} label="Name" noDivider>
                          {shamanLoading ? (
                            <Skeleton className="h-5 w-32" />
                          ) : (
                            <p className="text-base font-semibold">
                              {shaman?.name}
                            </p>
                          )}
                        </RowItem>

                        {shaman?.description && (
                          <RowItem
                            icon={IconFileDescription}
                            label="Description">
                            <p className="text-sm">{shaman.description}</p>
                          </RowItem>
                        )}

                        <RowItem icon={IconUser} label="Creator">
                          {shamanLoading ? (
                            <Skeleton className="h-5 w-40" />
                          ) : (
                            <div className="text-sm font-small">
                              <LabelCreator creator={shaman?.creator} />
                            </div>
                          )}
                        </RowItem>

                        <RowItem icon={IconLink} label="IPFS Link">
                          <LabelIPFS ipfs={shaman?.metadata} />
                        </RowItem>

                        {shaman?.createdAt && (
                          <RowItem icon={IconClock} label="Created">
                            <p className="text-sm">
                              {format(Number(shaman.createdAt) * 1000, 'PPpp')}
                            </p>
                          </RowItem>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </GridItem>
                <GridItem>
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle>Executions By Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {logsLoading ? (
                        <Skeleton className="h-40 w-full" />
                      ) : (
                        <ChartContainer
                          config={chartConfig}
                          className="h-40 w-full">
                          <LineChart data={chartData}>
                            <XAxis
                              dataKey="day"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 10 }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 10 }}
                            />
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <ChartTooltip
                              cursor={{
                                stroke: 'hsl(var(--muted-foreground))',
                              }}
                              wrapperStyle={{ outline: 'none' }}
                              content={<ChartTooltipContent />}
                            />
                            <Line
                              type="monotone"
                              dataKey="executions"
                              stroke={chartConfig.executions.color}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {logsLoading ? (
                        <Skeleton className="h-40 w-full" />
                      ) : (
                        <DataTable
                          columns={logColumns}
                          data={tableData.slice(0, 10)}
                        />
                      )}
                    </CardContent>
                  </Card>
                </GridItem>
              </Grid>
            </TabsContent>
            <TabsContent value="spells">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Shaman Spells</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {shamanSpells?.length > 0 || isShamanCreator ? (
                      <div className="w-full md:col-span-1 border rounded-md overflow-hidden mb-4 md:mb-0">
                        <div className="divide-y">
                          {shamanSpellsLoading
                            ? Array(3)
                                .fill(0)
                                .map((_, i) => (
                                  <Skeleton key={i} className="h-12 w-full" />
                                ))
                            : shamanSpells?.map((spell) => (
                                <div
                                  key={spell.spellId}
                                  className={`p-4 sm:p-5 cursor-pointer flex items-center justify-between ${
                                    spellId === spell.spellId
                                      ? 'bg-accent'
                                      : 'hover:bg-accent/50'
                                  }`}
                                  onClick={() => setSpellId(spell.spellId)}>
                                  <span className="truncate">{spell.name}</span>
                                </div>
                              ))}
                          <div
                            className={`p-4 sm:p-5 cursor-pointer hover:bg-accent/50 flex items-center justify-between`}
                            onClick={() =>
                              openAddSpell(
                                true,
                                undefined,
                                handleRefetch,
                                shamanId as string
                              )
                            }>
                            <span className="flex items-center gap-2">
                              <IconPlus className="h-4 w-4" /> Add Spell
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full md:col-span-2 lg:col-span-3 space-y-4">
                        <p className="text-muted-foreground">
                          No spells found.
                        </p>
                      </div>
                    )}

                    <div className="w-full md:col-span-2 lg:col-span-3 space-y-4">
                      {selectedSpell && (
                        <>
                          <Card>
                            <CardHeader className="pb-4">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <div>
                                  <CardTitle className="break-words">
                                    {selectedSpell.name}
                                  </CardTitle>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Created by{' '}
                                    <LabelCreator
                                      creator={selectedSpell.creator}
                                    />
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Installed Version:{' '}
                                    <span className="font-mono">
                                      {selectedSpell.version}
                                    </span>
                                  </div>
                                </div>
                                {isShamanCreator && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleRemoveSpell}
                                    disabled={loading}
                                    className="self-start sm:self-auto">
                                    <IconTrash className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <Tabs
                                defaultValue="prompt"
                                className="w-full mt-2 mb-8">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="prompt">
                                    Prompt
                                  </TabsTrigger>
                                  <TabsTrigger value="code">Code</TabsTrigger>
                                </TabsList>
                                <TabsContent
                                  value="prompt"
                                  className="max-h-[33vh] overflow-auto border rounded-md">
                                  <div className="flex flex-col h-full w-full">
                                    <Highlight
                                      theme={themes.nightOwl}
                                      code={selectedSpell?.prompt || ''}
                                      language="markdown">
                                      {({
                                        style,
                                        tokens,
                                        getLineProps,
                                        getTokenProps,
                                      }) => (
                                        <pre
                                          className="w-full p-3 sm:p-4 text-xs sm:text-sm whitespace-pre-wrap"
                                          style={{
                                            ...style,
                                            maxWidth: '100%',
                                          }}>
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
                                <TabsContent
                                  value="code"
                                  className="max-h-[33vh] overflow-auto border rounded-md">
                                  <div className="flex flex-col h-full w-full">
                                    <Highlight
                                      theme={themes.nightOwl}
                                      code={selectedSpell?.code || ''}
                                      language="tsx">
                                      {({
                                        style,
                                        tokens,
                                        getLineProps,
                                        getTokenProps,
                                      }) => (
                                        <pre
                                          className="overflow-x-auto w-full p-3 sm:p-4 text-xs sm:text-sm whitespace-pre"
                                          style={{
                                            ...style,
                                            maxWidth: '100%',
                                          }}>
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
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div className="flex flex-col gap-1 p-3 rounded-lg border">
                                  <p className="text-xs text-muted-foreground">
                                    Last Execution
                                  </p>
                                  <p className="text-sm font-medium">
                                    {spellLogs && spellLogs.length > 0
                                      ? formatDistanceToNow(
                                          new Date(
                                            Number(spellLogs[0].createdAt) *
                                              1000
                                          ),
                                          { addSuffix: true }
                                        )
                                      : 'Never'}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1 p-3 rounded-lg border">
                                  <p className="text-xs text-muted-foreground">
                                    Success Rate
                                  </p>
                                  <p className="text-sm font-medium">
                                    {spellExecutionLogs &&
                                    spellExecutionLogs.length > 0
                                      ? Math.round(
                                          (spellExecutionLogs.filter(
                                            (log) => log.success
                                          ).length /
                                            spellExecutionLogs.length) *
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
                              <CardTitle>Spell Execution Logs</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                              {spellLogs && spellLogs.length > 0 ? (
                                <div className="space-y-4">
                                  <DataTable
                                    columns={logColumns}
                                    data={spellTableData}
                                  />
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <p className="text-muted-foreground">
                                    No execution logs found for this spell
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="logs" className="mt-2">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Shaman Logs</CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:px-6">
                  {logsLoading ? (
                    <div className="space-y-2 px-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : tableData.length > 0 ? (
                    <DataTable columns={extendedLogColumns} data={tableData} />
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
