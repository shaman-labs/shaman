'use client';

import { useState } from 'react';
import { LabelIPFS } from './label-ipfs';
import { LabelCreator } from './label-creator';
import { LabelShamanId } from './label-shaman-id';
import { DialogProps } from '@/contexts/dialog-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useShamanLogMetadata } from '@/hooks/use-shaman-log-metadata';
import { trimHash } from '@/lib/utils';
import { useShaman } from '@/hooks/use-shaman';

function RecursiveTableRows({ data, prefix }: { data: any; prefix: string }) {
  if (!data || typeof data !== 'object') {
    return (
      <TableRow>
        <TableCell className="font-medium">{prefix}</TableCell>
        <TableCell className="break-words whitespace-normal max-w-[400px]">
          {data === null || data === undefined ? 'N/A' : String(data)}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {Object.entries(data).map(([key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value !== null && typeof value === 'object') {
          return (
            <RecursiveTableRows key={newKey} data={value} prefix={newKey} />
          );
        }

        return (
          <TableRow key={newKey}>
            <TableCell className="font-medium">{newKey}</TableCell>
            <TableCell className="break-words whitespace-normal max-w-[400px]">
              {value === null || value === undefined ? 'N/A' : String(value)}
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

interface ShamanLogResult {
  type: string;
  status: number;
}

interface ShamanLog {
  success: boolean;
  result: ShamanLogResult;
  timestamp: number;
  metadata: string;
  shamanId: string;
}

export function DialogViewLog(props: DialogProps) {
  const { shamanLog } = props as DialogProps & { shamanLog?: ShamanLog };
  const { data: shamanLogMetadata } = useShamanLogMetadata(shamanLog?.metadata);
  const { data: shaman } = useShaman(shamanLog?.shamanId ?? '');

  const [, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    props.onOpenChange?.(false);
  };

  if (!shamanLogMetadata) {
    return (
      <Dialog {...props}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Shaman Log</DialogTitle>
            <DialogDescription>No log data available.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader className="sticky top-0 pb-2">
          <DialogTitle>Shaman Log</DialogTitle>
          <DialogDescription>
            Viewing log details for Shaman ID: {trimHash(shaman?.shamanId)}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 whitespace-pre-wrap overflow-y-auto flex-grow">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${shamanLogMetadata?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {shamanLogMetadata?.success ? 'Success' : 'Failed'}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">IPFS Link</TableCell>
                <TableCell>
                  <LabelIPFS ipfs={shamanLog?.metadata} copyable />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {shamanLogMetadata?.results?.map((result, index) => (
            <Table key={index} className="my-4">
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} className="font-semibold">
                    Result {index + 1}
                  </TableCell>
                </TableRow>
                <RecursiveTableRows data={result.result} prefix="" />
              </TableBody>
            </Table>
          ))}

          {shamanLogMetadata?.result && (
            <Table className="my-4">
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} className="font-semibold">
                    Result
                  </TableCell>
                </TableRow>
                <RecursiveTableRows data={shamanLogMetadata.result} prefix="" />
              </TableBody>
            </Table>
          )}

          <h3 className="text-lg font-medium mt-6 mb-2">Shaman Metadata</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Shaman ID</TableCell>
                <TableCell className="break-words whitespace-normal">
                  <LabelShamanId shamanId={shaman?.shamanId} copyable />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Created by</TableCell>
                <TableCell className="break-words whitespace-normal">
                  <LabelCreator creator={shaman?.creator} copyable />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Created at</TableCell>
                <TableCell>
                  {new Date(Number(shaman?.createdAt) * 1000).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="sticky bottom-0 bg-background z-10 pt-2 mt-auto">
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
