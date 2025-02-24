'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  Node,
  Edge,
  Connection,
  addEdge,
  Panel,
  useReactFlow,
  getBezierPath,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Editor } from '@monaco-editor/react';
import { nodeTypes } from './NodeTypes';
import { CodeSnippetsPanel } from './CodeSnippets';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Save,
  FolderOpen,
  Code2,
  Play,
  Loader2,
  Terminal,
  Copy
} from 'lucide-react';
import { CodeGeneration } from './CodeGeneration';
import { usePython } from '@/hooks/usePython';
import { PythonProvider } from 'react-py';
import { ReactFlowProvider } from '@xyflow/react';
import { theme } from 'tailwind.config';
import { useTheme } from 'next-themes';
import CodeEditor from './CodeEditor';
import RunCodeSidebar from './RunCodeSidebar';

let id = 0;
const getId = () => `${id++}`;

// Add this type definition for tracking node relationships
type NodeWithDepth = {
  nodeId: string;
  depth: number;
  parentId?: string;
};

// Add proper type for the edge props
interface EdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  markerEnd?: string;
}

// Update the CustomEdge component
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { deleteElements } = useReactFlow();

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: 'rgb(100 116 139)', // slate-500
        }}
        className="react-flow__edge-path transition-all duration-200 hover:stroke-slate-300"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <g
        className="transition-all duration-200"
        onClick={(e) => {
          e.stopPropagation();
          deleteElements({ edges: [{ id }] });
        }}
        transform={`translate(${labelX - 12} ${labelY - 12})`}
      >
        <rect
          x="0"
          y="0"
          width="24"
          height="24"
          rx="6"
          className="fill-slate-800/50 stroke-slate-700/50 hover:fill-slate-700 hover:stroke-slate-600 transition-all duration-200 cursor-pointer"
        />
        <foreignObject
          width="24"
          height="24"
          className="text-slate-400 hover:text-red-400 transition-colors duration-200"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <div className="flex items-center justify-center w-full h-full">
            <Trash2 className="h-4 w-4" />
          </div>
        </foreignObject>
      </g>
    </>
  );
};

export function VisualProgramming() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [code, setCode] = useState<string>('');
  const { deleteElements } = useReactFlow();

  const { runPython, output, error, isLoading, isRunning } = usePython();

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      // Allow multiple connections from the same source
      setEdges((eds) => {
        // Check if target already has a connection
        const targetHasConnection = eds.some(edge => edge.target === params.target);
        
        // If target already has a connection, don't add new one
        if (targetHasConnection) {
          return eds;
        }
        
        // Add the new connection
        return addEdge({
          ...params,
          type: 'default',
          animated: true,
          style: { strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#64748b',
          },
        }, eds);
      });
    },
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDeleteNode = useCallback(({ nodes: nodesToDelete, edges: edgesToDelete }) => {
    deleteElements({
      nodes: nodesToDelete,
      edges: edgesToDelete || edges.filter(edge =>
        nodesToDelete?.some(node =>
          edge.source === node.id || edge.target === node.id
        )
      )
    });
  }, [deleteElements, edges]);

  const handleMoveNode = useCallback((nodeId: string, direction: 'up' | 'down') => {
    setNodes((nds) => {
      const nodeIndex = nds.findIndex(n => n.id === nodeId);
      if (nodeIndex === -1) return nds;

      const newNodes = [...nds];
      const targetIndex = direction === 'up' ? nodeIndex - 1 : nodeIndex + 1;

      if (targetIndex < 0 || targetIndex >= nds.length) return nds;

      // Swap nodes
      [newNodes[nodeIndex], newNodes[targetIndex]] = [newNodes[targetIndex], newNodes[nodeIndex]];

      // Update positions
      newNodes[nodeIndex] = {
        ...newNodes[nodeIndex],
        position: { ...nds[nodeIndex].position }
      };
      newNodes[targetIndex] = {
        ...newNodes[targetIndex],
        position: { ...nds[targetIndex].position }
      };

      return newNodes;
    });
    generateCode();
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      if (!type) return;

      const dataStr = event.dataTransfer.getData('application/reactflow/data') as string;
      const data = JSON.parse(dataStr);

      const reactFlowBounds = (event.target as Element)
        .closest('.react-flow')
        ?.getBoundingClientRect();

      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: getId(),
        type,
        position,
        data: {
          ...data,
          condition: '',
          variable: '',
          value: '',
          content: '',
          iterable: '',
          onDelete: handleDeleteNode,
          onMoveUp: () => handleMoveNode(newNode.id, 'up'),
          onMoveDown: () => handleMoveNode(newNode.id, 'down'),
          onChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? {
                    ...node,
                    data: {
                      ...node.data,
                      [type === 'printBlock' ? 'content' : 
                       type === 'ifBlock' || type === 'whileBlock' ? 'condition' : 'variable']: value
                    }
                  }
                  : node
              )
            );
            generateCode();
          },
          onValueChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, value: value } }
                  : node
              )
            );
            generateCode();
          },
          onIterableChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, iterable: value } }
                  : node
              )
            );
            generateCode();
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
      generateCode();
    },
    [setNodes, handleDeleteNode, handleMoveNode]
  );

  const getUpdateData = (type: string | undefined, value: string) => {
    if (!type) return {};

    switch (type) {
      case 'inputBlock':
        // Parse the input value to separate variable name and prompt
        const [variable, ...promptParts] = value.split('=').map(s => s.trim());
        return {
          variable: variable || 'x',
          prompt: promptParts.join('=') || 'Enter value: '
        };
      case 'printBlock':
        return { content: value };
      case 'ifBlock':
        return { condition: value };
      case 'forBlock':
        return { variable: value };
      case 'whileBlock':
        return { condition: value };
      case 'listBlock':
        return { variable: value };
      case 'dictBlock':
        return { variable: value };
      case 'functionBlock':
        return { name: value };
      case 'returnBlock':
        return { value: value };
      case 'variableBlock':
        return {
          variable: value,
          value: data.value || '0'
        };
      default:
        return {};
    }
  };

  const onDragStart = useCallback((event: React.DragEvent, nodeType: string, data: any) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const generateCode = useCallback(() => {
    let pythonCode = '';
    const indentSize = 2;

    // Build a map of node relationships and their depths
    const nodeRelationships = new Map<string, { depth: number; parentIds: string[] }>();
    const childToParents = new Map<string, string[]>();

    // First pass: Build the parent-child relationships from edges
    edges.forEach(edge => {
      const parents = childToParents.get(edge.target) || [];
      childToParents.set(edge.target, [...parents, edge.source]);
    });

    // Second pass: Calculate depths by taking maximum depth of parents + 1
    const calculateDepth = (nodeId: string, visited = new Set<string>()): number => {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);

      const parents = childToParents.get(nodeId) || [];
      if (parents.length === 0) return 0;

      const parentDepths = parents.map(parentId => calculateDepth(parentId, visited));
      return Math.max(...parentDepths) + 1;
    };

    // Calculate depths for all nodes
    nodes.forEach(node => {
      const depth = calculateDepth(node.id);
      nodeRelationships.set(node.id, {
        depth,
        parentIds: childToParents.get(node.id) || []
      });
    });

    // Process nodes in order, respecting parent-child relationships
    const processed = new Set<string>();

    // Helper function to process a node and its children
    const processNode = (nodeId: string) => {
      if (processed.has(nodeId)) return;

      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      const nodeInfo = nodeRelationships.get(nodeId);
      const indent = ' '.repeat((nodeInfo?.depth || 0) * indentSize);
      processed.add(nodeId);

      // Generate code based on node type with proper indentation
      switch (node.type) {
        case 'inputBlock':
          pythonCode += `${indent}${node.data.variable} = input(${JSON.stringify(node.data.prompt)})\n`;
          break;
        case 'printBlock':
          pythonCode += `${indent}print(${JSON.stringify(node.data.content)})\n`;
          break;
        case 'ifBlock':
          if (node.data.condition) {
            pythonCode += `${indent}if ${node.data.condition}:\n`;
          }
          break;
        case 'forBlock':
          pythonCode += `${indent}for ${node.data.variable} in ${node.data.iterable}:\n`;
          break;
        case 'whileBlock':
          pythonCode += `${indent}while ${node.data.condition}:\n`;
          break;
        case 'variableBlock':
          if (node.data.variable && node.data.value !== undefined) {
            const value = isNaN(Number(node.data.value)) && !node.data.value.startsWith('"')
              ? `"${node.data.value}"`
              : node.data.value;
            pythonCode += `${indent}${node.data.variable} = ${value}\n`;
          }
          break;
        // ... other cases
      }

      // Find and process all children of the current node
      edges
        .filter(edge => edge.source === nodeId)
        .forEach(edge => {
          processNode(edge.target);
        });
    };

    // Start processing from root nodes (nodes with no parents)
    const rootNodes = nodes.filter(node =>
      !edges.some(edge => edge.target === node.id)
    );

    rootNodes.forEach(node => processNode(node.id));

    // Add a default pass statement for empty blocks
    const lines = pythonCode.split('\n');
    const processedCode = lines.map((line, index) => {
      if (line.trim().endsWith(':') &&
        (index === lines.length - 1 || !lines[index + 1].startsWith(' '))) {
        const currentDepth = line.search(/\S/);
        return line + '\n' + ' '.repeat(currentDepth + indentSize) + 'pass';
      }
      return line;
    }).join('\n');

    setCode(processedCode);
  }, [nodes, edges]);

  // Generate code whenever nodes or edges change
  useEffect(() => {
    generateCode();
  }, [nodes, edges, generateCode]);

  const handleRunCode = useCallback(async () => {
    await runPython(code);
  }, [code, runPython]);

  const { theme } = useTheme();

  // Add the edgeTypes object
  const edgeTypes = {
    default: CustomEdge,
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <div className="w-1/4 h-full border-r border-white/10">
        <CodeSnippetsPanel onDragStart={onDragStart} />
      </div>
      <div className="w-1/2 h-full bg-slate-800 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-dot-pattern"
          colorMode={theme as 'light' | 'dark'}
          defaultEdgeOptions={{
            type: 'default',
            animated: true,
            style: { strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#64748b',
            },
          }}
          connectOnClick={false}
          snapToGrid={true}
          snapGrid={[16, 16]}
          connectionMode="loose"
          connectingNodesValidator={(source, target) => {
            if (source === target) {
              return false;
            }
            
            return true;
          }}
        >
          <Background color="#475569" gap={16} size={1} />
          <Controls
            className="bg-slate-800 border-white/10 text-white"
            showInteractive={false}
          />
          <Panel position="top-right" className="bg-slate-800 p-2 rounded-lg border border-white/10">
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => {
                  // TODO: Implement save functionality
                }}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => {
                  // TODO: Implement load functionality
                }}
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => {
                  setNodes([]);
                  setEdges([]);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Panel>
        </ReactFlow>
      </div>
      <RunCodeSidebar code={code} />
    </div>
  );
} 