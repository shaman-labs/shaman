'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Hex, formatUnits } from 'viem';
import { ColumnDef } from '@tanstack/react-table';
import { BalanceItem } from '@covalenthq/client-sdk';
import { Transaction } from '@covalenthq/client-sdk';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLinkIcon } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { AppSidebar } from '@/components/app-sidebar';
import { AlertDialogPaywall } from '@/components/alert-dialog-paywall';
import { useTokenBalances } from '@/hooks/use-token-balances';
import { DataTable } from '@/components/data-table';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWalletTransactions } from '@/hooks/use-wallet-transactions';
import { trimHash } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useDialogContext } from '@/contexts/dialog-context';
import { Grid, GridItem } from '@/components/grid';

const transactionsColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'block_signed_at',
    header: 'Age',
    cell: ({ row }) => {
      const timestamp = new Date(row.original.block_signed_at ?? '');
      return formatDistanceToNow(timestamp, { addSuffix: true });
    },
  },
  {
    accessorKey: 'tx_hash',
    header: 'Hash',
    cell: ({ row }) => {
      return trimHash(row.original.tx_hash ?? undefined);
    },
  },
  {
    accessorKey: 'to_address',
    header: 'To',
    cell: ({ row }) => {
      return trimHash(row.original.to_address ?? undefined);
    },
  },
  {
    accessorKey: 'gas_quote',
    header: 'Gas Spent',
    cell: ({ row }) => {
      return `${row.original.gas_quote?.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })} USD`;
    },
  },
  {
    id: 'external_link',
    header: '',
    cell: ({ row }) => {
      const txHash = row.original.tx_hash;
      if (!txHash) return null;
      return (
        <Link
          href={`https://sepolia.arbiscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline">
          <ExternalLinkIcon className="w-4 h-4" />
        </Link>
      );
    },
  },
];

export default function Page() {
  const { address } = useParams();
  const { data: balances } = useTokenBalances(address as Hex);
  const { data: transactions } = useWalletTransactions(address as Hex);
  const [open, setOpen] = useState(false);
  const { openTransferAsset } = useDialogContext();

  const assetsColumns: ColumnDef<BalanceItem>[] = useMemo(
    () => [
      {
        accessorKey: 'contract_display_name',
        header: 'Name',
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        cell: ({ row }) => {
          const balance = row.original.balance ?? 0n;
          const decimals = row.original.contract_decimals ?? 18;
          const formatted = formatUnits(balance, decimals);
          return `${Number(formatted).toLocaleString(undefined, {
            maximumFractionDigits: decimals,
          })} ${row.original.contract_ticker_symbol}`;
        },
      },
      {
        accessorKey: 'quote_rate',
        header: 'Rate',
        cell: ({ row }) => {
          const rate = row.original.quote_rate ?? 0;
          return `${rate.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })} USD`;
        },
      },
      {
        accessorKey: 'pretty_quote',
        header: 'USD Value',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
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
                    openTransferAsset(true, undefined, undefined, row.original);
                  }}>
                  Transfer
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    window.open(
                      `https://sepolia.arbiscan.io/address/${row.original.contract_address}`,
                      '_blank'
                    );
                  }}>
                  View Contract <ExternalLinkIcon className="w-4 h-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [openTransferAsset]
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
                  <BreadcrumbPage>{address}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Grid cols={{ sm: 1, lg: 2 }} gap={4}>
            <GridItem>
              <Card>
                <CardHeader>
                  <CardTitle>Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={assetsColumns}
                    data={balances?.items ?? []}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {balances?.items?.length || 0} tokens
                  </div>
                  <Button variant="outline">View Portfolio</Button>
                </CardFooter>
              </Card>
            </GridItem>
            <GridItem>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={transactionsColumns}
                    data={transactions ?? []}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing recent {transactions?.length || 0} transactions
                  </div>
                  <Button variant="outline">View All</Button>
                </CardFooter>
              </Card>
            </GridItem>
          </Grid>
        </div>
        <AlertDialogPaywall open={open} onOpenChange={setOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}
