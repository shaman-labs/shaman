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

interface DialogDeleteContextProps extends DialogProps {
  contextKey: string;
}

export function DialogDeleteContext(props: DialogDeleteContextProps) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { contextKey } = props;

  const handleDeleteContext = async () => {
    setLoading(true);
    try {
      await axios.delete('/api/context', { data: { key: contextKey } });

      toast({
        title: 'Success',
        description: 'Context deleted successfully.',
      });

      // Invalidate the contexts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['contexts'] });

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
          <DialogTitle>Delete Context</DialogTitle>
          <DialogDescription>
            <span className="block text-sm text-muted-foreground mb-2">
              Are you sure you want to delete this context?
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center font-medium">{contextKey}</p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            This action cannot be undone.
          </p>
        </div>
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
            onClick={handleDeleteContext}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
