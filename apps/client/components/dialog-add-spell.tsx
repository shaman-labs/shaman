'use client';

import { useState } from 'react';
import { Chain } from 'viem/chains';
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
import { useSpells } from '@/hooks/use-spells';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { spellChains } from '@/mud/supportedChains';

export interface DialogAddSpellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (spellId: string, chain: Chain) => void;
}

export function DialogAddSpell(props: DialogAddSpellProps) {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const { data: spells, isLoading: spellsLoading } = useSpells();

  const handleAddSpell = async () => {
    if (!selectedSpellId) {
      toast({
        title: 'Error',
        description: 'Please select a spell to add.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedChainId) {
      toast({
        title: 'Error',
        description: 'Please select a chain.',
        variant: 'destructive',
      });
      return;
    }

    const chain = spellChains.find((chain) => chain.id === selectedChainId);
    if (!chain) {
      toast({
        title: 'Error',
        description: 'Please select a valid chain.',
        variant: 'destructive',
      });
      return;
    }

    props.onSelect(selectedSpellId, chain);
    props.onOpenChange?.(false);
  };

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Spell</DialogTitle>
          <DialogDescription>
            <span className="block text-sm text-muted-foreground mb-2">
              Select a spell to add to your Shaman.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Select onValueChange={(value) => setSelectedChainId(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a chain" />
            </SelectTrigger>
            <SelectContent>
              {spellChains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
            <div className="divide-y">
              {spellsLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : spells?.length ? (
                spells.map((spell) => {
                  return (
                    <div
                      key={spell.spellId}
                      className={`p-4 cursor-pointer flex items-center justify-between ${
                        selectedSpellId === spell.spellId
                          ? 'bg-accent'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedSpellId(spell.spellId)}>
                      <span className="flex flex-col">
                        <span className="font-semibold">{spell.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Version: {spell.version}
                        </span>
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No spells available
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!selectedSpellId || !selectedChainId}
            onClick={handleAddSpell}
            type="submit">
            Add Spell
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
