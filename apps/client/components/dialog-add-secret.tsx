'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleError } from '@/lib/errors';
import { createSecret } from '@/services/api';

export function DialogAddSecret(props: DialogProps) {
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const queryClient = useQueryClient();

  const handleAddSecret = async () => {
    if (!key.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a key.',
        variant: 'destructive',
      });
      return;
    }

    if (!value.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a value.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await createSecret(key, value);

      toast({
        title: 'Success',
        description: 'Context added successfully.',
      });

      // Invalidate the secrets query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['secrets'] });

      // Reset form
      setKey('');
      setValue('');

      props.onSuccess?.();
      props.onOpenChange?.(false);
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
          <DialogTitle>Add Secret</DialogTitle>
          <DialogDescription>
            <span className="block text-sm text-muted-foreground mb-2">
              Add a new key-value pair to your secrets.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="key" className="text-right">
              Key
            </Label>
            <Input
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="col-span-3"
              placeholder="secretKeyName"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Value
            </Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="col-span-3"
              placeholder="your-secret-value"
              type="password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={loading} onClick={handleAddSecret} type="submit">
            {loading ? 'Adding...' : 'Add Secret'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
