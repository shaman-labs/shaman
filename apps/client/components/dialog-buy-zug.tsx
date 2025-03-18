'use client';

import { useState } from 'react';
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
// import { useZugPrice } from '@/hooks/use-zug-price';
import { useZugAddress } from '@/hooks/use-zug-address';
// import { useZugSaleSupply } from '@/hooks/use-zug-sale-supply';
import { handleError } from '@/lib/errors';

export function DialogBuyZug(props: DialogProps) {
  const mud = useMUD();
  const [loading, setLoading] = useState(false);
  // const [quantity, setQuantity] = useState(10);
  // const { data: price } = useZugPrice(BigInt(quantity));
  const { data: zugAddress } = useZugAddress();
  // const { data: saleSupply } = useZugSaleSupply();

  const handleClaimZug = async () => {
    setLoading(true);
    try {
      await mud?.calls.embedded?.systemCalls?.claimZug(10n);

      toast({
        title: 'Success',
        description: 'Claim successful.',
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
          <DialogTitle>Claim ZUG</DialogTitle>
          <DialogDescription>
            <span className="block mt-1 mb-2">
              ZUG is a utility token used to purchase Units of Work in our
              ecosystem. For beta testing, ZUGs are free to claim.
            </span>
            <span className="block mb-4">
              ZUG Contract Address:{' '}
              <span className="font-bold">{zugAddress}</span>
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={loading} onClick={handleClaimZug} type="submit">
            {loading ? 'Confirming...' : 'Confirm Claim'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
