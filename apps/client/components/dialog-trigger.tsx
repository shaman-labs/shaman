'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { DialogProps } from '@/contexts/dialog-context';
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

export function DialogTrigger(props: DialogProps) {
  const [loading, setLoading] = useState(false);
  const { shamanId: shamanIdParam } = useParams();
  const shamanId = props.shamanId || shamanIdParam;

  const handleTrigger = async () => {
    setLoading(true);
    try {
      await triggerShaman(shamanId as string);

      toast({
        title: 'Success',
        description: 'Shaman has been triggered.',
        variant: 'default',
      });

      props.onOpenChange(false);
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
              This action will cost you ZUGs.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={loading} onClick={handleTrigger} type="submit">
            {loading ? 'Triggering...' : 'Trigger Shaman'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
