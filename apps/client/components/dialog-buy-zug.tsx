'use client';

import { useState } from 'react';
import { formatEther } from 'viem';
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
import { useZugPrice } from '@/hooks/use-zug-price';
import { useZugAddress } from '@/hooks/use-zug-address';
import { useZugSaleSupply } from '@/hooks/use-zug-sale-supply';
import { handleError } from '@/lib/errors';

export function DialogBuyZug(props: DialogProps) {
  const mud = useMUD();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const { data: price } = useZugPrice(BigInt(quantity));
  const { data: zugAddress } = useZugAddress();
  const { data: saleSupply } = useZugSaleSupply();

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await mud?.calls.embedded?.systemCalls?.purchase(BigInt(quantity));

      toast({
        title: 'Success',
        description: 'Purchase successful.',
      });

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
          <DialogTitle>Make a Purchase</DialogTitle>
          <DialogDescription>
            <span className="block mt-1 mb-2">
              ZUG is a utility token used to purchase Units of Work in our
              ecosystem. While ZUG has a total supply of 1 billion tokens, only
              10M tokens are available during this beta phase.
            </span>
            <span className="block mb-2">
              As units gets used, the available supply of ZUG decreases.
            </span>
            <span className="block mb-2">
              Available Supply:{' '}
              <span className="font-bold">{saleSupply?.currentSupply}</span>
            </span>
            <span className="block mb-4">
              ZUG Contract Address:{' '}
              <span className="font-bold">{zugAddress}</span>
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
              max={Number(saleSupply?.currentSupply)}
              onChange={(e) => setQuantity(Number(e.target.value))}
              type="number"
              className="text-right"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 items-center mb-4">
          <Label htmlFor="price" className="text-right">
            Total
          </Label>
          <p className="text-right">{formatEther(price || 0n)} ETH</p>
        </div>
        <DialogFooter>
          <Button disabled={loading} onClick={handlePurchase} type="submit">
            {loading ? 'Confirming...' : 'Confirm Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
