'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Hex } from 'viem';
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
import { useMUD } from '@/contexts/mud-context';
import { useShaman } from '@/hooks/use-shaman';
import { handleError } from '@/lib/errors';

export function DialogActivation(props: DialogProps) {
  const mud = useMUD();
  const [loading, setLoading] = useState(false);
  const { shamanId: shamanIdParam } = useParams();
  const shamanId = props.shamanId || shamanIdParam;
  const { data: shaman } = useShaman(shamanId as string);
  const isActive = shaman?.active;

  const handleToggleActivation = async () => {
    setLoading(true);
    try {
      await mud?.calls.embedded?.systemCalls?.updateShamanStatus(
        shamanId as Hex,
        !isActive
      );

      toast({
        title: 'Success',
        description: `Shaman has been ${isActive ? 'deactivated' : 'activated'}.`,
        variant: 'default',
      });

      props.onOpenChange(false);
      props.onSuccess?.();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isActive ? 'Deactivate Shaman' : 'Activate Shaman'}
          </DialogTitle>
          <DialogDescription>
            <span className="block text-sm text-muted-foreground mb-2">
              Are you sure you want to {isActive ? 'deactivate ' : 'activate '}
              this Shaman?
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={loading}
            onClick={handleToggleActivation}
            type="submit">
            {loading
              ? isActive
                ? 'Deactivating...'
                : 'Activating...'
              : isActive
                ? 'Deactivate Shaman'
                : 'Activate Shaman'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
