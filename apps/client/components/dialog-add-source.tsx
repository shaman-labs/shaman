'use client';

import { useState } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useSources } from '@/hooks/use-sources';

export interface DialogAddSourceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (sourceId: string) => void;
}

export function DialogAddSource(props: DialogAddSourceProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const { data: sources, isLoading: sourcesLoading } = useSources();

  const handleAddSource = async () => {
    if (!selectedSourceId) {
      toast({
        title: 'Error',
        description: 'Please select a source to add.',
        variant: 'destructive',
      });
      return;
    }

    props.onSelect(selectedSourceId);
    props.onOpenChange?.(false);
  };

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Source</DialogTitle>
          <DialogDescription>
            <span className="block text-sm text-muted-foreground mb-2">
              Select a source to add to your Shaman.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
            <div className="divide-y">
              {sourcesLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : sources?.length ? (
                sources.map((source) => {
                  return (
                    <div
                      key={source.sourceId}
                      className={`p-4 cursor-pointer flex items-center justify-between ${
                        selectedSourceId === source.sourceId
                          ? 'bg-accent'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedSourceId(source.sourceId)}>
                      <span className="flex flex-col">
                        <span className="font-semibold">{source.name}</span>
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No sources available
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!selectedSourceId}
            onClick={handleAddSource}
            type="submit">
            Add Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
