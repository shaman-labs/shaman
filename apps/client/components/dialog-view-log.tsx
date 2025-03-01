'use client';

import { useState } from 'react';
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

interface ShamanLogMetadata {
  shamanId: string;
  prompt: string;
  shamanCreator: string;
  shamanCreatedAt: string;
}

interface ShamanLogResult {
  type: string;
  status: number;
}

interface ShamanLog {
  success: boolean;
  result: ShamanLogResult;
  timestamp: number;
  shamanMetadata: ShamanLogMetadata;
}

export function DialogViewLog(props: DialogProps) {
  const { shamanLog } = props as DialogProps & { shamanLog?: ShamanLog };
  const { data: shamanLogMetadata } = useShamanLogMetadata(
    shamanLog?.logMetadata
  );
  const [, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    props.onOpenChange?.(false);
  };

  if (!shamanLog) {
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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Shaman Log</DialogTitle>
          <DialogDescription>
            Viewing log details for Shaman ID:{' '}
            {trimHash(shamanLog?.shamanMetadata?.shamanId)}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="text-lg font-medium mb-2">Log Information</h3>
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
              {Object.keys(shamanLogMetadata?.result || {}).map((key) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{key}</TableCell>
                  <TableCell>{shamanLogMetadata?.result[key]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <h3 className="text-lg font-medium mt-6 mb-2">Shaman Metadata</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Shaman ID</TableCell>
                <TableCell className="break-all">
                  {shamanLogMetadata?.shamanMetadata?.shamanId}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Prompt</TableCell>
                <TableCell>
                  {shamanLogMetadata?.shamanMetadata?.prompt}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Creator</TableCell>
                <TableCell className="break-all">
                  {shamanLogMetadata?.shamanMetadata?.shamanCreator}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Created At</TableCell>
                <TableCell>
                  {new Date(
                    shamanLogMetadata?.shamanMetadata?.shamanCreatedAt ?? ''
                  ).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
