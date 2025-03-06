'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Hex } from 'viem';
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
import { useSpells } from '@/hooks/use-spells';
import { Skeleton } from '@/components/ui/skeleton';
import { useShamanSpells } from '@/hooks/use-shaman-spells';

export function DialogAddSpell(props: DialogProps) {
  const mud = useMUD();
  const [loading, setLoading] = useState(false);
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  const { data: spells, isLoading: spellsLoading } = useSpells();
  const { data: shamanSpells, isLoading: shamanSpellsLoading } =
    useShamanSpells(props.shamanId || '');
  const { shamanId: shamanIdParam } = useParams();
  const shamanId = props.shamanId || shamanIdParam;

  const isSpellAlreadyAdded = (spellId: string) => {
    return shamanSpells?.some((spell) => spell.spellId === spellId) || false;
  };

  const handleAddSpell = async () => {
    if (!selectedSpellId) {
      toast({
        title: 'Error',
        description: 'Please select a spell to add.',
        variant: 'destructive',
      });
      return;
    }

    if (isSpellAlreadyAdded(selectedSpellId)) {
      toast({
        title: 'Error',
        description: 'This spell is already added to your Shaman.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await mud?.calls.embedded?.systemCalls?.addSpellToShaman(
        shamanId as Hex,
        selectedSpellId as Hex
      );

      toast({
        title: 'Success',
        description: 'Spell added successfully.',
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
          <DialogTitle>Add Spell</DialogTitle>
          <DialogDescription>
            <span className="block text-sm text-muted-foreground mb-2">
              Select a spell to add to your Shaman.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
            <div className="divide-y">
              {spellsLoading || shamanSpellsLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : spells?.length ? (
                spells.map((spell) => {
                  const alreadyAdded = isSpellAlreadyAdded(spell.spellId);
                  return (
                    <div
                      key={spell.spellId}
                      className={`p-4 cursor-pointer hover:bg-accent/50 flex items-center justify-between ${
                        selectedSpellId === spell.spellId ? 'bg-accent' : ''
                      } ${alreadyAdded ? 'opacity-50' : ''}`}
                      onClick={() =>
                        !alreadyAdded && setSelectedSpellId(spell.spellId)
                      }>
                      <span>{spell.name}</span>
                      {alreadyAdded && (
                        <span className="text-xs text-muted-foreground">
                          Already added
                        </span>
                      )}
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
            disabled={loading || !selectedSpellId}
            onClick={handleAddSpell}
            type="submit">
            {loading ? 'Adding...' : 'Add Spell'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
