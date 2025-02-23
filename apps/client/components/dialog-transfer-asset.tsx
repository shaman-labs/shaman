'use client';

import { useState } from 'react';
import { formatUnits, Hex } from 'viem';
import { parseUnits } from 'viem';
import { CirclePlus } from 'lucide-react';
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

export function DialogTransferAsset(props: DialogProps) {
  const mud = useMUD();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [recipient, setRecipient] = useState('');
  const asset = props.asset;

  const handleTransferAsset = async () => {
    setLoading(true);
    try {
      await mud?.calls.embedded?.systemCalls?.transferAsset(
        asset?.contract_address as Hex,
        recipient as Hex,
        parseUnits(amount.toString(), asset?.contract_decimals ?? 18)
      );

      toast({
        title: 'Success',
        description: 'Asset transferred successfully.',
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
          <DialogTitle>Transfer {asset?.contract_ticker_symbol}</DialogTitle>
          <DialogDescription>
            <span className="block text-sm text-muted-foreground mb-2">
              Transfer {asset?.contract_ticker_symbol} to another address.
            </span>
            <span className="block text-sm text-muted-foreground">
              Your Balance:{' '}
              {formatUnits(
                asset?.balance ?? 0n,
                asset?.contract_decimals ?? 18
              )}{' '}
              {asset?.contract_ticker_symbol}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="recipient" className="text-right">
              Recipient Address
            </Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              type="text"
              className="text-right"
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="amount"
                value={amount}
                max={Number(asset?.balance)}
                onChange={(e) => setAmount(Number(e.target.value))}
                type="number"
                className="text-right"
              />
              <Button
                onClick={() => setAmount(Number(asset?.balance))}
                variant="ghost"
                size="icon">
                <CirclePlus className="w-2 h-2" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={loading}
            onClick={handleTransferAsset}
            type="submit">
            {loading ? 'Confirming...' : 'Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
