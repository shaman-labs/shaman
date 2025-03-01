'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DialogProps, useDialogContext } from '@/contexts/dialog-context';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { triggerShaman } from '@/services/api';
import { ShamanLogType, ShamanTriggerResponse } from '@/types/shaman';

export function DialogTrigger(props: DialogProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ShamanTriggerResponse | null>(null);
  const { shamanId: shamanIdParam } = useParams();
  const { openViewLog } = useDialogContext();
  const shamanId = props.shamanId || shamanIdParam;

  useEffect(() => {
    if (props.open) {
      setResponse(null);
    }
  }, [props.open]);

  const handleTrigger = async () => {
    setLoading(true);
    try {
      const response = await triggerShaman(shamanId as string);
      setResponse(response);

      toast({
        title: response.success ? 'Success' : 'Error',
        description: response.success
          ? 'Shaman has been triggered.'
          : `Shaman failed to trigger. ${response.error || 'Unknown error.'}`,
        variant: response.success ? 'default' : 'destructive',
      });

      props.onSuccess?.();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Trigger Shaman</DialogTitle>
          <DialogDescription>
            <span className="block text-sm text-muted-foreground mb-2">
              Are you sure you want to trigger this Shaman? This action will
              execute the Shaman&apos;s task.
            </span>
            <span className="block text-sm text-muted-foreground">
              This action will cost you 1 $ZUG.
            </span>
          </DialogDescription>
        </DialogHeader>
        {response && (
          <div className="flex flex-row justify-between gap-2 mt-4 mb-4">
            <p className="text-sm text-muted-foreground">
              Execution Status:{' '}
              <span
                className={
                  response.success ? 'text-green-500' : 'text-red-500'
                }>
                {response.success ? 'Success' : 'Failed'}
              </span>
            </p>
            {response.success && (
              <p className="text-sm text-muted-foreground underline">
                <Button
                  variant="link"
                  onClick={() =>
                    openViewLog(true, undefined, undefined, {
                      success: response.success,
                      timestamp: response.timestamp.toString(),
                      logMetadata: response.logMetadataHash,
                      type: ShamanLogType.Execution,
                      id: shamanId as string,
                      logType: 'Execution',
                    })
                  }>
                  View Logs
                </Button>
              </p>
            )}
          </div>
        )}
        <DialogFooter>
          <Button disabled={loading} onClick={handleTrigger} type="submit">
            {loading ? 'Triggering...' : 'Trigger Shaman'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
