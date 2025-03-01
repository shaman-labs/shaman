'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export function DialogDelete(props: DialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { shamanId: shamanIdParam } = useParams();

  const handleDelete = async () => {
    setLoading(true);
    try {
      // In the updated API, we would need to:
      // 1. Get all workflows that have this shaman
      // 2. Remove the shaman from each workflow
      // The backend will handle the rest

      // Since there's no direct deleteShaman function anymore, we'll redirect to dashboard
      toast({
        title: 'Info',
        description:
          'To remove a shaman, you must remove it from all associated workflows.',
      });

      props.onSuccess?.();
      props.onOpenChange?.(false);

      // Redirect to dashboard if we're on the shaman page
      if (shamanIdParam) {
        router.push('/dashboard');
      }
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
          <DialogTitle>Remove Shaman</DialogTitle>
          <DialogDescription>
            To remove this Shaman, you need to remove it from all workflows
            it&apos;s associated with. Would you like to proceed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
            type="submit">
            {loading ? 'Processing...' : 'Proceed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
