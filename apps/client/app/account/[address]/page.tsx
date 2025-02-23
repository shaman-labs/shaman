'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Hex, formatUnits } from 'viem';
import { ColumnDef } from '@tanstack/react-table';
import { BalanceItem } from '@covalenthq/client-sdk';
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

const columns: ColumnDef<BalanceItem>[] = [
  {
    accessorKey: 'contract_ticker_symbol',
    header: 'Symbol',
  },
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
    accessorKey: 'pretty_quote',
    header: 'USD Value',
  },
];

export default function Page() {
  const { address } = useParams();
  const { data: balances } = useTokenBalances(address as Hex);
  const [open, setOpen] = useState(false);

  console.log(balances);

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
                  <BreadcrumbPage>Account</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Assets</h1>
            <DataTable columns={columns} data={balances?.items ?? []} />
          </div>
        </div>
      </SidebarInset>
      <AlertDialogPaywall open={open} onOpenChange={setOpen} />
    </SidebarProvider>
  );
}
