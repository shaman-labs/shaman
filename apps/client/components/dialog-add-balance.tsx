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
import { useEmbeddedWallet } from '@/hooks/use-embedded-wallet';
import { useZugBalance } from '@/hooks/use-zug-balance';

export function DialogAddBalance(props: DialogProps) {
  const mud = useMUD();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const embeddedWallet = useEmbeddedWallet();
  const { data: zugBalance } = useZugBalance(
    embeddedWallet?.address as `0x${string}`
  );
  const { shamanId: shamanIdParam } = useParams();
  const shamanId = props.shamanId || shamanIdParam;

  const handleAddBalance = async () => {
    setLoading(true);
    try {
      await mud?.calls.embedded?.systemCalls?.addBalance(
        shamanId as Hex,
        BigInt(quantity)
      );

      toast({
        title: 'Success',
        description: 'Balance added successfully.',
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
          <DialogTitle>Add Balance</DialogTitle>
          <DialogDescription>
            <span className="block text-sm text-muted-foreground mb-2">
              Add $ZUG tokens to your Shaman Balance.
            </span>
            <span className="block text-sm text-muted-foreground">
              Your $ZUG Balance: {Number(zugBalance)}
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
              max={Number(zugBalance)}
              onChange={(e) => setQuantity(Number(e.target.value))}
              type="number"
              className="text-right"
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={loading} onClick={handleAddBalance} type="submit">
            {loading ? 'Confirming...' : 'Add Balance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
