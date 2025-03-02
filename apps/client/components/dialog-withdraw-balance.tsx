'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Hex } from 'viem';
import { DialogProps } from '@/contexts/dialog-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useWorkflow } from '@/hooks/use-workflow';

export function DialogWithdrawBalance(props: DialogProps) {
  const mud = useMUD();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { workflowId: workflowIdParam } = useParams();
  const workflowId = props.workflowId || workflowIdParam;
  const { data: workflow } = useWorkflow(workflowId as string);

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await mud?.calls.embedded?.systemCalls?.withdrawWorkflowBalance(
        workflowId as Hex,
        BigInt(quantity)
      );

      toast({
        title: 'Success',
        description: 'Withdrawal successful.',
      });

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
          <DialogTitle>Withdraw Balance</DialogTitle>
          <DialogDescription>
            <span className="block text-sm text-muted-foreground mb-2">
              Withdraw ZUG tokens from your Shaman Balance.
            </span>
            <span className="block text-sm text-muted-foreground">
              Your Workflow&apos;s ZUG Balance: {Number(workflow?.balance)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              type="number"
              className="text-right"
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={loading} onClick={handleWithdraw} type="submit">
            {loading ? 'Withdrawing...' : 'Withdraw'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
