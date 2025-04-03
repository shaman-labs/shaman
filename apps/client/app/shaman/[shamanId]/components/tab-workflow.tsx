'use client';

import {
  ReactFlow,
  Background,
  Position,
  MarkerType,
  useReactFlow,
} from '@xyflow/react';
import {
  IconPlus,
  IconTrash,
  IconDotsVertical,
  IconArrowBigUpLine,
} from '@tabler/icons-react';

import { useParams } from 'next/navigation';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { Hex } from 'viem';
import { Highlight, themes } from 'prism-react-renderer';
import { logTypes } from '../constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDialogContext } from '@/contexts/dialog-context';
import { useZugBalance } from '@/hooks/use-zug-balance';
import { useEmbeddedWallet } from '@/hooks/use-embedded-wallet';
import { useShaman } from '@/hooks/use-shaman';
import { useShamanLogs } from '@/hooks/use-shaman-logs';
import { ShamanLogType, ShamanLogsTableData } from '@/types/shaman';
import { DataTable } from '@/components/data-table';
import { useShamanSpells } from '@/hooks/use-shaman-spells';
import { useMUD } from '@/contexts/mud-context';
import { toast } from '@/hooks/use-toast';
import { LabelCreator } from '@/components/label-creator';
import { useShamanSources } from '@/hooks/use-shaman-sources';
import { handleError } from '@/lib/errors';

import '@xyflow/react/dist/style.css';

const sourceLabels: Record<string, string> = {
  'interval-hourly': 'Interval (hr)',
  'interval-daily': 'Interval (day)',
  'interval-quarter-hourly': 'Interval (15 min)',
};

export function WorkflowTab() {
  const mud = useMUD();
  const { shamanId } = useParams();
  const { data: shaman, refetch } = useShaman(shamanId as string);
  const { data: shamanLogs } = useShamanLogs(shamanId as string);
  const [spellId, setSpellId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const embeddedWallet = useEmbeddedWallet();
  const { refetch: refetchZugBalance } = useZugBalance(
    embeddedWallet?.address as `0x${string}`
  );
  const { data: shamanSources } = useShamanSources(shamanId as string);
  const { openViewLog, openAddSpell } = useDialogContext();
  const { data: shamanSpells } = useShamanSpells(shamanId as string);
  const selectedSpell = shamanSpells?.find(
    (spell) => spell.spellId === spellId
  );
  const spellLogs = shamanLogs?.filter((log) => log.spellId === spellId);
  const spellExecutionLogs = spellLogs?.filter(
    (log) => log.logType === ShamanLogType.COMPLETION
  );
  const isShamanCreator = embeddedWallet?.address === shaman?.creator;
  const reactFlow = useReactFlow();

  useEffect(() => {
    if (shamanSpells?.length || shamanSources?.length) {
      setTimeout(() => {
        reactFlow.fitView();
      }, 75);
    }
  }, [shamanSpells, shamanSources, reactFlow]);

  const handleRefetch = useCallback(() => {
    refetch();
    refetchZugBalance();
  }, [refetch, refetchZugBalance]);

  const handleRemoveSpell = useCallback(async () => {
    try {
      setLoading(true);
      await mud?.calls.embedded?.systemCalls?.removeSpellFromShaman(
        shamanId as Hex,
        selectedSpell?.spellId as Hex
      );
      toast({
        title: 'Success',
        description: 'Spell removed from shaman.',
      });
      setSpellId(null);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [selectedSpell, mud, shamanId]);

  const handleUpdateSpellVersion = useCallback(async () => {
    try {
      setLoading(true);
      await mud?.calls.embedded?.systemCalls?.updateSpellVersion(
        shamanId as Hex,
        selectedSpell?.spellId as Hex
      );
      toast({
        title: 'Success',
        description: 'Spell version updated.',
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [selectedSpell, mud, shamanId]);

  const spellTableData: ShamanLogsTableData[] = useMemo(
    () =>
      spellLogs?.map((log) => ({
        id: log.shamanLogId,
        logType: log.logType as ShamanLogType,
        timestamp: new Date(Number(log.createdAt) * 1000).toISOString(),
        metadata: log.metadata,
        shamanId: log.shamanId,
        success: log.success,
        amount: log.amount,
        spellId: log.spellId,
      })) || [],
    [spellLogs]
  );

  const logColumns: ColumnDef<ShamanLogsTableData>[] = useMemo(
    () => [
      {
        accessorKey: 'logType',
        header: 'Log Type',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: logTypes[row.original.logType]?.color,
              }}
            />
            {logTypes[row.original.logType]?.label}
          </div>
        ),
      },
      {
        accessorKey: 'success',
        header: 'Status',
        cell: ({ row }) => {
          if (row.original.logType === ShamanLogType.COMPLETION) {
            return (
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    row.original.success ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {row.original.success ? 'Success' : 'Failed'}
              </div>
            );
          }
          return '-';
        },
      },
      {
        accessorKey: 'timestamp',
        header: 'Age',
        cell: ({ row }) => {
          const timestamp = new Date(row.original.timestamp ?? '');
          return formatDistanceToNow(timestamp, { addSuffix: true });
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          if (row.original.logType === ShamanLogType.COMPLETION) {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <IconDotsVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      openViewLog(true, undefined, handleRefetch, row.original)
                    }>
                    View logs
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
          return null;
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openViewLog]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="w-full h-[420px]">
            <ReactFlow
              colorMode="dark"
              fitView
              proOptions={{
                hideAttribution: true,
              }}
              onNodeClick={(event, node) => {
                if (node.id !== 'add-new-spell') {
                  reactFlow.fitView();
                  setSpellId(node.id);
                } else {
                  openAddSpell(
                    true,
                    undefined,
                    handleRefetch,
                    shamanId as string
                  );
                }
              }}
              nodes={[
                ...(shamanSources?.map((source, index) => ({
                  id: source.sourceId,
                  data: {
                    label: (
                      <div className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground">
                        {sourceLabels[source.name]}
                      </div>
                    ),
                  },
                  position: { x: index * 200 - 200, y: 0 },
                  style: {
                    borderRadius: '8px',
                  },
                  type: 'input',
                  sourcePosition: Position.Right,
                  targetPosition: Position.Left,
                })) || []),
                ...(shamanSpells?.map((spell, index) => ({
                  id: spell.spellId,
                  data: {
                    label: (
                      <div className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground">
                        {spell.name}
                      </div>
                    ),
                  },
                  selected: spell.spellId === spellId,
                  position: { x: index * 200, y: 0 },
                  style: {
                    borderRadius: '8px',
                  },
                  sourcePosition: Position.Right,
                  targetPosition: Position.Left,
                })) || []),
                ...(isShamanCreator
                  ? [
                      {
                        id: 'add-new-spell',
                        data: {
                          label: (
                            <div className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground">
                              <IconPlus className="h-4 w-4" /> Add Spell
                            </div>
                          ),
                        },
                        position: {
                          x: (shamanSpells?.length || 0) * 200,
                          y: 0,
                        },
                        style: {
                          borderRadius: '8px',
                        },
                        selectable: false,
                        targetPosition: Position.Left,
                        sourcePosition: Position.Right,
                        type: 'output',
                      },
                    ]
                  : []),
              ]}
              edges={[
                ...(shamanSources?.slice(0, -1).map((source, index) => ({
                  id: `edge-${source.sourceId}-${shamanSources[index + 1].sourceId}`,
                  source: source.sourceId,
                  target: shamanSources[index + 1].sourceId,
                  type: 'default',
                  animated: false,
                  markerEnd: {
                    type: MarkerType.Arrow,
                  },
                })) || []),
                ...(shamanSources?.length
                  ? [
                      {
                        id: `edge-source-to-first-spell`,
                        source:
                          shamanSources[shamanSources.length - 1].sourceId,
                        target:
                          shamanSpells?.length > 0
                            ? shamanSpells[0].spellId
                            : 'add-new-spell',
                        type: 'default',
                        animated: true,
                        markerEnd: {
                          type: MarkerType.Arrow,
                        },
                      },
                    ]
                  : []),
                ...(shamanSpells?.slice(0, -1).map((spell, index) => ({
                  id: `edge-${spell.spellId}-${shamanSpells[index + 1].spellId}`,
                  source: spell.spellId,
                  target: shamanSpells[index + 1].spellId,
                  type: 'default',
                  animated: false,
                  markerEnd: {
                    type: MarkerType.Arrow,
                  },
                })) || []),
                ...(shamanSpells?.length
                  ? [
                      {
                        id: `edge-last-to-add`,
                        source: shamanSpells[shamanSpells.length - 1].spellId,
                        target: 'add-new-spell',
                        type: 'default',
                        animated: true,
                        markerEnd: {
                          type: MarkerType.Arrow,
                        },
                      },
                    ]
                  : []),
              ]}
              nodesDraggable={false}>
              <Background />
            </ReactFlow>
          </div>
          <div className="w-full space-y-4">
            {selectedSpell && (
              <>
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <CardTitle className="break-words">
                          {selectedSpell.name}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground mt-1">
                          Created by{' '}
                          <LabelCreator creator={selectedSpell.creator} />
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Installed Version:{' '}
                          <span className="font-mono">
                            {selectedSpell.version}
                          </span>
                        </div>
                      </div>
                      {isShamanCreator && (
                        <div className="flex flex-row gap-2">
                          {selectedSpell?.latestVersion !==
                            selectedSpell?.version && (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={loading}
                              onClick={handleUpdateSpellVersion}>
                              <IconArrowBigUpLine className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveSpell}
                            disabled={loading}
                            className="self-start sm:self-auto">
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="prompt" className="w-full mt-2 mb-8">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="prompt">Prompt</TabsTrigger>
                        <TabsTrigger value="code">Code</TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="prompt"
                        className="max-h-[33vh] overflow-auto border rounded-md">
                        <div className="flex flex-col h-full w-full">
                          <Highlight
                            theme={themes.nightOwl}
                            code={selectedSpell?.prompt || ''}
                            language="markdown">
                            {({
                              style,
                              tokens,
                              getLineProps,
                              getTokenProps,
                            }) => (
                              <pre
                                className="w-full p-3 sm:p-4 text-xs sm:text-sm whitespace-pre-wrap"
                                style={{
                                  ...style,
                                  maxWidth: '100%',
                                }}>
                                {tokens.map((line, i) => (
                                  <div
                                    key={i}
                                    {...getLineProps({ line })}
                                    className="whitespace-pre-wrap">
                                    {line.map((token, key) => (
                                      <span
                                        key={key}
                                        {...getTokenProps({ token })}
                                      />
                                    ))}
                                  </div>
                                ))}
                              </pre>
                            )}
                          </Highlight>
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="code"
                        className="max-h-[33vh] overflow-auto border rounded-md">
                        <div className="flex flex-col h-full w-full">
                          <Highlight
                            theme={themes.nightOwl}
                            code={selectedSpell?.code || ''}
                            language="tsx">
                            {({
                              style,
                              tokens,
                              getLineProps,
                              getTokenProps,
                            }) => (
                              <pre
                                className="overflow-x-auto w-full p-3 sm:p-4 text-xs sm:text-sm whitespace-pre"
                                style={{
                                  ...style,
                                  maxWidth: '100%',
                                }}>
                                {tokens.map((line, i) => (
                                  <div
                                    key={i}
                                    {...getLineProps({ line })}
                                    className="whitespace-pre">
                                    {line.map((token, key) => (
                                      <span
                                        key={key}
                                        {...getTokenProps({ token })}
                                      />
                                    ))}
                                  </div>
                                ))}
                              </pre>
                            )}
                          </Highlight>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col gap-1 p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">
                          Last Execution
                        </p>
                        <p className="text-sm font-medium">
                          {spellLogs && spellLogs.length > 0
                            ? formatDistanceToNow(
                                new Date(Number(spellLogs[0].createdAt) * 1000),
                                { addSuffix: true }
                              )
                            : 'Never'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">
                          Success Rate
                        </p>
                        <p className="text-sm font-medium">
                          {spellExecutionLogs && spellExecutionLogs.length > 0
                            ? Math.round(
                                (spellExecutionLogs.filter((log) => log.success)
                                  .length /
                                  spellExecutionLogs.length) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Spell Execution Logs</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    {spellLogs && spellLogs.length > 0 ? (
                      <div className="space-y-4">
                        <DataTable columns={logColumns} data={spellTableData} />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No execution logs found for this spell
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
