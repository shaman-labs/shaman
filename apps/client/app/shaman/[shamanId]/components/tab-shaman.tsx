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
  IconDotsVertical,
} from '@tabler/icons-react';

import { useParams } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow, format } from 'date-fns';
import { logTypes } from '../constants';
import { ChartDataPoint, DayExecutions } from '../types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
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
import { Grid, GridItem } from '@/components/grid';
import { RowItem } from '@/components/row-item';
import { LabelCreator } from '@/components/label-creator';
import { LabelIPFS } from '@/components/label-ipfs';

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

export function ShamanTab() {
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
  const isShamanCreator = embeddedWallet?.address === shaman?.creator;

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

  return (
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
                  openAddBalance(true, shamanId as string, handleRefetch)
                }>
                <IconPlus className="mr-2 h-4 w-4" />
                Deposit
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  openWithdrawBalance(true, shamanId as string, handleRefetch)
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
                  <p className="text-base font-semibold">{shaman?.name}</p>
                )}
              </RowItem>

              {shaman?.description && (
                <RowItem icon={IconFileDescription} label="Description">
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
              <ChartContainer config={chartConfig} className="h-40 w-full">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
              <DataTable columns={logColumns} data={tableData.slice(0, 10)} />
            )}
          </CardContent>
        </Card>
      </GridItem>
    </Grid>
  );
}
