'use client';

import { useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
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

interface DialogDeleteSecretProps extends DialogProps {
  secretKey: string;
}

export function DialogDeleteSecret(props: DialogDeleteSecretProps) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { secretKey } = props;

  const handleDeleteSecret = async () => {
    setLoading(true);
    try {
      await axios.delete('/api/secret', { data: { key: secretKey } });

      toast({
        title: 'Success',
        description: 'Secret deleted successfully.',
      });

      // Invalidate the secrets query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['secrets'] });

      props.onSuccess?.();
      props.onOpenChange?.(false);
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
          <DialogTitle>Delete Secret</DialogTitle>
          <DialogDescription>
            <span className="block text-sm text-muted-foreground mb-2">
              Are you sure you want to delete this secret?
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => props.onOpenChange?.(false)}
            className="mr-2">
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={handleDeleteSecret}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
