'use client';

import {
  ReactFlow,
  Background,
  Position,
  MarkerType,
  Connection,
  ConnectionLineType,
  SelectionMode,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  addEdge,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  NodeProps,
  Handle,
} from '@xyflow/react';
import {
  IconDotsVertical,
  IconArrowBigUpLine,
  IconDeviceFloppy,
  IconLoader2,
  IconPlus,
} from '@tabler/icons-react';

import { useParams } from 'next/navigation';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useMutation } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Hex } from 'viem';
import { Highlight, themes } from 'prism-react-renderer';
import { Chain } from 'viem/chains';
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
import { useMUD } from '@/contexts/mud-context';
import { toast } from '@/hooks/use-toast';
import { LabelCreator } from '@/components/label-creator';
import { handleError } from '@/lib/errors';
import { DialogAddSpell } from '@/components/dialog-add-spell';
import { useSpells } from '@/hooks/use-spells';
import { DialogAddSource } from '@/components/dialog-add-source';
import { useSources } from '@/hooks/use-sources';
import { spellChains } from '@/mud/supportedChains';

import '@xyflow/react/dist/style.css';

type WorkflowData = {
  sourceIds: Hex[];
  spellIds: Hex[];
  spellChains: string[];
  spellEdges: {
    fromSpellIndex: bigint;
    toSpellIndex: bigint;
  }[];
};

type SourceNode = Node & {
  data: {
    sourceId: Hex;
    label: React.ReactNode;
  };
};

type SpellNode = Node & {
  data: {
    spellId: Hex;
    chain?: string;
    label: React.ReactNode;
  };
};

const isSourceNode = (node: Node): node is SourceNode =>
  node.type === 'shamanNode' && 'sourceId' in node.data;

const isSpellNode = (node: Node): node is SpellNode =>
  node.type === 'shamanNode' && 'spellId' in node.data;

const chainColors: Record<string, string> = {
  '1': '#29B6AF', // Ethereum
  '10': '#FF0000', // Optimism
  '137': '#8247E5', // Polygon
  '42161': '#28A0F0', // Arbitrum
  '8453': '#0052FF', // Base
  default: '#a3f7bf', // Default color
};

const getChainColor = (chainId?: string) => {
  return chainId && chainColors[chainId]
    ? chainColors[chainId]
    : chainColors.default;
};

type ShamanNodeData = {
  label: string;
  sourceId?: Hex;
  spellId?: Hex;
  chain?: string;
};

function ShamanNode({ data, isConnectable }: NodeProps) {
  const nodeData = data as ShamanNodeData;
  const isSource = nodeData.sourceId !== undefined;
  const nodeChainId = nodeData.chain ? nodeData.chain.toString() : 'default';
  const nodeChainColor = getChainColor(nodeChainId);
  const nodeChainName = nodeData.chain
    ? spellChains.find((c) => c.id === Number(nodeData.chain))?.name
    : undefined;

  return (
    <div
      className="w-[200px] h-[60px] shadow-md rounded-xl border-2 bg-background relative flex items-center justify-center"
      style={{ borderColor: isSource ? chainColors.default : nodeChainColor }}>
      <div className="text-sm text-muted-foreground hover:text-foreground text-center px-3 py-2">
        {nodeData.label}
      </div>
      {nodeChainName && (
        <div className="absolute top-1 right-2 text-xs font-mono opacity-50">
          {nodeChainName}
        </div>
      )}

      {isSource ? (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-2 h-2"
        />
      ) : (
        <>
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            className="w-2 h-2"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="w-2 h-2"
          />
        </>
      )}
    </div>
  );
}

export function WorkflowTab() {
  const mud = useMUD();
  const { shamanId } = useParams();
  const { data: spells } = useSpells();
  const { data: sources } = useSources();
  const { data: shaman, refetch } = useShaman(shamanId as string);
  const { data: shamanLogs } = useShamanLogs(shamanId as string);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [updateSpellLoading, setUpdateSpellLoading] = useState(false);
  const [addSpell, setAddSpell] = useState(false);
  const [addSource, setAddSource] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const embeddedWallet = useEmbeddedWallet();
  const { refetch: refetchZugBalance } = useZugBalance(
    embeddedWallet?.address as `0x${string}`
  );
  const { openViewLog } = useDialogContext();
  const selectedSpell = shaman?.spells?.find(
    (spell) => spell.spellId === selectedNode?.data.spellId
  );
  const spellLogs = shamanLogs?.filter(
    (log) => log.spellId === selectedNode?.data.spellId
  );
  const spellExecutionLogs = spellLogs?.filter(
    (log) => log.logType === ShamanLogType.COMPLETION
  );
  const isShamanCreator = embeddedWallet?.address === shaman?.creator;

  useEffect(() => {
    if (!shaman) return;
    if (isDirty) return;

    const horizontalGap = 300;
    const verticalGap = 150;
    const sourceCount = shaman.sources?.length ?? 0;

    const sourceNodes: Node[] =
      shaman.sources?.map((source, index) => {
        const defaultPosition = {
          x: (index - (sourceCount - 1) / 2) * horizontalGap,
          y: 0,
        };

        return {
          id: `source-${source.sourceId}-${index}`,
          data: {
            sourceId: source.sourceId as Hex,
            label:
              sources?.find((src) => src.sourceId === source.sourceId)?.name ||
              source.sourceId,
          },
          position: defaultPosition,
          type: 'shamanNode',
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          connectable: false, // Sources cannot be connected manually
        };
      }) || [];

    const spellNodes: Node[] =
      shaman.spells?.map((spell, index) => {
        const defaultPosition = { x: 0, y: (index + 1) * verticalGap };

        return {
          id: `spell-${spell.spellId}-${index}`,
          data: {
            spellId: spell.spellId as Hex,
            chain: spell.chain,
            label:
              spells?.find((s) => s.spellId === spell.spellId)?.name ||
              spell.spellId,
          },
          position: defaultPosition,
          type: 'shamanNode',
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          connectable: true, // Spells can be connected
        };
      }) || [];

    const allEdges: Edge[] = [];
    const firstSpellNode = spellNodes[0];

    if (firstSpellNode) {
      const sourceEdges: Edge[] = sourceNodes.map((sourceNode) => ({
        id: `edge-${sourceNode.id}-to-${firstSpellNode.id}`,
        source: sourceNode.id,
        target: firstSpellNode.id,
        type: 'default',
        animated: true,
        markerEnd: { type: MarkerType.Arrow },
      }));

      allEdges.push(...sourceEdges);
    }

    if (shaman.spellEdges && shaman.spells) {
      for (const edge of shaman.spellEdges) {
        const fromIndex = Number(edge.fromSpellIndex);
        const toIndex = Number(edge.toSpellIndex);

        if (
          fromIndex < shaman.spells.length &&
          toIndex < shaman.spells.length
        ) {
          const fromSpellNode = spellNodes[fromIndex];
          const toSpellNode = spellNodes[toIndex];

          if (fromSpellNode && toSpellNode) {
            allEdges.push({
              id: `edge-${fromSpellNode.id}-to-${toSpellNode.id}`,
              source: fromSpellNode.id,
              target: toSpellNode.id,
              type: 'default',
              animated: false,
              markerEnd: { type: MarkerType.Arrow },
            });
          }
        }
      }
    }

    setNodes([...sourceNodes, ...spellNodes]);
    setEdges(allEdges);
    setIsDirty(false);
  }, [shaman, spells, sources, setNodes, setEdges, isDirty]);

  const addSpellNode = useCallback(
    (newSpellId: Hex, chain?: Chain) => {
      const spellNodes = nodes.filter((node) => isSpellNode(node));
      const sourceNodes = nodes.filter((node) => isSourceNode(node));
      const isFirstSpell = spellNodes.length === 0;
      const index = spellNodes.length;
      const verticalGap = 150;

      const newNode: Node = {
        id: `spell-${newSpellId}-${index}`,
        data: {
          spellId: newSpellId,
          chain: chain?.id,
          label:
            spells?.find((spell) => spell.spellId === newSpellId)?.name ||
            newSpellId,
        },
        position: { x: 0, y: (index + 1) * verticalGap },
        type: 'shamanNode',
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };

      setNodes((nds) => [...nds, newNode]);

      if (isFirstSpell && sourceNodes.length > 0) {
        const newEdges = sourceNodes.map((sourceNode) => ({
          id: `edge-${sourceNode.id}-to-spell-${newSpellId}-${index}`,
          source: sourceNode.id,
          target: `spell-${newSpellId}-${index}`,
          type: 'default',
          animated: true,
          markerEnd: { type: MarkerType.Arrow },
        }));

        setEdges((eds) => [...eds, ...newEdges]);
      }

      setIsDirty(true);
    },
    [nodes, spells, setNodes, setEdges]
  );

  const addSourceNode = useCallback(
    (newSourceId: Hex) => {
      const sourceNodes = nodes.filter((node) => isSourceNode(node));
      const index = sourceNodes.length;
      const horizontalGap = 300;
      const sourceCount = sourceNodes.length + 1;

      const newNode: Node = {
        id: `source-${newSourceId}-${index}`,
        data: {
          sourceId: newSourceId,
          label:
            sources?.find((src) => src.sourceId === newSourceId)?.name ||
            newSourceId,
        },
        position: {
          x: (index - (sourceCount - 1) / 2) * horizontalGap,
          y: 0,
        },
        type: 'shamanNode',
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        connectable: false,
      };

      const spellNodes = nodes.filter((node) => node.id.startsWith('spell-'));
      const firstSpellNode = spellNodes[0];

      setNodes((nds) => {
        const allSourceNodes = [...sourceNodes, newNode];
        const repositionedSourceNodes = allSourceNodes.map((node, idx) => ({
          ...node,
          position: {
            x: (idx - (sourceCount - 1) / 2) * horizontalGap,
            y: 0,
          },
        }));

        const otherNodes = nds.filter((node) => !isSourceNode(node));

        return [...repositionedSourceNodes, ...otherNodes];
      });

      if (firstSpellNode) {
        const newEdge: Edge = {
          id: `edge-source-${newSourceId}-${index}-to-${firstSpellNode.id}`,
          source: `source-${newSourceId}-${index}`,
          target: firstSpellNode.id,
          type: 'default',
          animated: true,
          markerEnd: { type: MarkerType.Arrow },
        };

        setEdges((eds) => [...eds, newEdge]);
      }

      setIsDirty(true);
    },
    [nodes, sources, setNodes, setEdges]
  );

  const handleRefetch = useCallback(() => {
    refetch();
    refetchZugBalance();
  }, [refetch, refetchZugBalance]);

  const handleUpdateSpellVersion = useCallback(async () => {
    if (!selectedSpell?.spellId || !shamanId || !mud) return;
    try {
      setUpdateSpellLoading(true);
      await mud.calls.embedded?.systemCalls?.updateSpellVersion(
        shamanId as Hex,
        selectedSpell.spellId as Hex
      );
      toast({
        title: 'Success',
        description: 'Spell version updated.',
      });
      handleRefetch();
    } catch (error) {
      handleError(error);
    } finally {
      setUpdateSpellLoading(false);
    }
  }, [selectedSpell, mud, shamanId, handleRefetch]);

  const extractWorkflowData = useCallback((): WorkflowData => {
    const spellNodes = nodes
      .filter((node) => isSpellNode(node))
      .sort((a, b) => {
        const aIndex = parseInt(a.id.split('-')[2]);
        const bIndex = parseInt(b.id.split('-')[2]);
        return aIndex - bIndex;
      });

    const sourceNodes = nodes.filter((node) => isSourceNode(node));
    const spellIds = spellNodes.map((node) => node.data.spellId as Hex);
    const spellChains = spellNodes.map((node) => node.data.chain || '');
    const sourceIds = sourceNodes.map((node) => node.data.sourceId as Hex);

    const spellEdges = edges
      .filter((edge) => {
        const sourceId = edge.source;
        const targetId = edge.target;
        return sourceId.startsWith('spell-') && targetId.startsWith('spell-');
      })
      .map((edge) => {
        const sourceIndex = parseInt(edge.source.split('-')[2]);
        const targetIndex = parseInt(edge.target.split('-')[2]);

        return {
          fromSpellIndex: BigInt(sourceIndex),
          toSpellIndex: BigInt(targetIndex),
        };
      });

    return {
      sourceIds,
      spellIds,
      spellChains,
      spellEdges,
    };
  }, [nodes, edges]);

  const { mutate: saveWorkflow, isPending: isSavingWorkflow } = useMutation({
    mutationFn: async ({
      currentShamanId,
      sourceIds,
      spellIds,
      spellChains,
      spellEdges,
    }: {
      currentShamanId: Hex;
      sourceIds: Hex[];
      spellIds: Hex[];
      spellChains: string[];
      spellEdges: {
        fromSpellIndex: bigint;
        toSpellIndex: bigint;
      }[];
    }) => {
      if (!mud?.calls?.embedded?.systemCalls?.updateShamanWorkflow) {
        throw new Error(
          'updateShamanWorkflow system call not found. Please implement it.'
        );
      }

      return await mud.calls.embedded.systemCalls.updateShamanWorkflow(
        currentShamanId,
        sourceIds,
        spellIds,
        spellChains,
        spellEdges
      );
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Workflow saved successfully.',
      });
      handleRefetch();
      setIsDirty(false);
    },
    onError: (error) => {
      handleError(error);
      toast({
        title: 'Error Saving Workflow',
        description:
          error.message || 'An unexpected error occurred while saving.',
        variant: 'destructive',
      });
    },
  });

  const handleSaveWorkflow = useCallback(() => {
    if (!shamanId) return;

    const workflowData = extractWorkflowData();

    saveWorkflow({
      currentShamanId: shamanId as Hex,
      sourceIds: workflowData.sourceIds,
      spellIds: workflowData.spellIds,
      spellChains: workflowData.spellChains,
      spellEdges: workflowData.spellEdges,
    });
  }, [shamanId, extractWorkflowData, saveWorkflow]);

  const handleAddSpell = useCallback(
    (spellId: string, chain: Chain) => {
      addSpellNode(spellId as Hex, chain);
    },
    [addSpellNode]
  );

  const handleAddSource = useCallback(
    (sourceId: string) => {
      addSourceNode(sourceId as Hex);
    },
    [addSourceNode]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;

      if (!source || !target) return;

      const isSourceSpell = source.startsWith('spell-');
      const isTargetSpell = target.startsWith('spell-');

      if (!isSourceSpell || !isTargetSpell) {
        toast({
          title: 'Connection not allowed',
          description: 'You can only connect between spells',
          variant: 'destructive',
        });
        return;
      }

      setEdges((eds) => addEdge(connection, eds));
      setIsDirty(true);
    },
    [setEdges]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setEdges((eds) => {
        return deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, eds);
          const outgoers = getOutgoers(node, nodes, eds);
          const connectedEdges = getConnectedEdges([node], eds);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge)
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `edge-${source}-to-${target}`,
              source,
              target,
              type: 'default',
              animated: false,
              markerEnd: { type: MarkerType.Arrow },
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, eds);
      });

      setIsDirty(true);
    },
    [nodes, setEdges]
  );

  const onEdgesDelete = useCallback(() => {
    setIsDirty(true);
  }, []);

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    if (nodes.length === 0) {
      setSelectedNode(null);
    }
  }, []);

  const handleNodeClick = useCallback((_: unknown, node: Node) => {
    if (isSpellNode(node)) {
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  }, []);

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
    [openViewLog, handleRefetch]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Workflow</CardTitle>
        {isShamanCreator && (
          <div className="flex flex-row gap-4">
            <Button
              onClick={() => setAddSource(true)}
              size="sm"
              variant="secondary">
              <IconPlus className="mr-1 h-4 w-4" />
              Add Source
            </Button>
            <Button
              onClick={() => setAddSpell(true)}
              size="sm"
              variant="secondary">
              <IconPlus className="mr-1 h-4 w-4" />
              Add Spell
            </Button>
            <Button
              size="sm"
              onClick={handleSaveWorkflow}
              disabled={isSavingWorkflow || !isDirty}>
              {isSavingWorkflow ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconDeviceFloppy className="mr-1 h-4 w-4" />
              )}
              Save Workflow
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="w-full h-[calc(100vh-250px)] relative">
            <ReactFlow
              colorMode="dark"
              fitView
              proOptions={{
                hideAttribution: true,
              }}
              nodes={nodes}
              edges={edges}
              nodeTypes={{
                shamanNode: ShamanNode,
              }}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onNodeClick={handleNodeClick}
              nodesConnectable={isShamanCreator}
              elementsSelectable={isShamanCreator}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              connectionLineStyle={{ stroke: '#3b82f6' }}
              connectionLineType={ConnectionLineType.Bezier}
              selectionOnDrag={isShamanCreator}
              selectionMode={isShamanCreator ? SelectionMode.Full : undefined}>
              <Background />
            </ReactFlow>

            {selectedSpell && (
              <div className="absolute bottom-4 right-4 w-96 max-w-[calc(100%-32px)] z-10">
                <Card className="bg-background/95 backdrop-blur-sm shadow-lg border-2">
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
                          {selectedSpell?.version !==
                            selectedSpell?.latestVersion && (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={updateSpellLoading || isSavingWorkflow}
                              onClick={handleUpdateSpellVersion}>
                              {updateSpellLoading ? (
                                <IconLoader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <IconArrowBigUpLine className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="prompt" className="w-full mt-2 mb-4">
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
                    <div>
                      <Card>
                        <CardContent className="overflow-x-auto">
                          {spellLogs && spellLogs.length > 0 ? (
                            <div className="space-y-4">
                              <DataTable
                                columns={logColumns}
                                data={spellTableData}
                              />
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground">
                                No execution logs found for this spell
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <DialogAddSpell
        open={addSpell}
        onOpenChange={setAddSpell}
        onSelect={handleAddSpell}
      />
      <DialogAddSource
        open={addSource}
        onOpenChange={setAddSource}
        onSelect={handleAddSource}
      />
    </Card>
  );
}
