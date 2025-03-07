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
import { useShaman } from '@/hooks/use-shaman';

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
                  {shamanLog?.metadata ? (
                    <a
                      href={`https://gateway.shaman.fun/ipfs/${shamanLog.metadata}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 text-sm font-medium truncate block">
                      ipfs://{shamanLog.metadata}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No IPFS link available
                    </p>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {shamanLogMetadata?.results.map((result, index) => (
            <Table key={index} className="my-4">
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} className="font-semibold">
                    Result {index + 1}
                  </TableCell>
                </TableRow>
                {Object.entries(result.result).map(([key, value]) => (
                  <TableRow key={`${index}-${key}`}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell className="break-words whitespace-normal max-w-[400px]">
                      {String(value ?? 'N/A')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ))}

          <h3 className="text-lg font-medium mt-6 mb-2">Shaman Metadata</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Shaman ID</TableCell>
                <TableCell className="break-words whitespace-normal">
                  {shaman?.shamanId}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Creator</TableCell>
                <TableCell className="break-words whitespace-normal">
                  {shaman?.creator}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Created At</TableCell>
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
