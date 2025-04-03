'use client';

import { IconDotsVertical } from '@tabler/icons-react';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { logTypes } from '../constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDialogContext } from '@/contexts/dialog-context';
import { useShamanLogs } from '@/hooks/use-shaman-logs';
import { ShamanLogType, ShamanLogsTableData } from '@/types/shaman';
import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { trimHash } from '@/lib/utils';
import { useShaman } from '@/hooks/use-shaman';

export function LogsTab() {
  const { shamanId } = useParams();
  const { data: shamanLogs, isLoading: logsLoading } = useShamanLogs(
    shamanId as string
  );
  const { openViewLog } = useDialogContext();
  const { data: shaman } = useShaman(shamanId as string);

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
          const spell = shaman?.spells?.find(
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
                      openViewLog(true, undefined, undefined, row.original)
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
    [openViewLog, shaman?.spells]
  );

  return (
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
  );
}
