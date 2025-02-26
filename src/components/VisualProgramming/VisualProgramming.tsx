'use client';

import { useCallback, useState, useEffect } from 'react';
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
  ConnectionMode,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './NodeTypes';
import { CodeSnippetsPanel } from './CodeSnippets';
import { Button } from '@/components/ui/button';
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
  Copy,
  Package,
  Table
} from 'lucide-react';
import { useTheme } from 'next-themes';
import RunCodeSidebar from './RunCodeSidebar';
import { PythonProvider } from 'react-py';

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

  // useEffect(() => {
  //   navigator.serviceWorker
  //     .register('/react-py-sw.js')
  //     .then((registration) =>
  //       console.log(
  //         'Service Worker registration successful with scope: ',
  //         registration.scope
  //       )
  //     )
  //     .catch((err) => console.log('Service Worker registration failed: ', err))
  // }, [])
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [code, setCode] = useState<string>('');
  const { deleteElements } = useReactFlow();

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
          params: '',
          expression: '',
          filename: '',
          mode: '',
          module: '',
          alias: '',
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
          onParamsChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, params: value } }
                  : node
              )
            );
            generateCode();
          },
          onExpressionChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, expression: value } }
                  : node
              )
            );
            generateCode();
          },
          onFilenameChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, filename: value } }
                  : node
              )
            );
            generateCode();
          },
          onModeChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, mode: value } }
                  : node
              )
            );
            generateCode();
          },
          onAliasChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, alias: value } }
                  : node
              )
            );
            generateCode();
          },
          onPromptChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, prompt: value } }
                  : node
              )
            );
            generateCode();
          },
          onConditionsChange: (conditions: string[]) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, conditions: conditions } }
                  : node
              )
            );
            generateCode();
          },
          onTypeChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, variableType: value } }
                  : node
              )
            );
            generateCode();
          },
          onPrintItemsChange: (items: string[]) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, printItems: items } }
                  : node
              )
            );
            generateCode();
          },
          onLoopTypeChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, loopType: value } }
                  : node
              )
            );
            generateCode();
          },
          onStartChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, start: value } }
                  : node
              )
            );
            generateCode();
          },
          onEndChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, end: value } }
                  : node
              )
            );
            generateCode();
          },
          onStepChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, step: value } }
                  : node
              )
            );
            generateCode();
          },
          onIndexVarChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, indexVar: value } }
                  : node
              )
            );
            generateCode();
          },
          onUseCounterChange: (useCounter: boolean) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, useCounter: useCounter } }
                  : node
              )
            );
            generateCode();
          },
          onCounterVarChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, counterVar: value } }
                  : node
              )
            );
            generateCode();
          },
          onCounterInitChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, counterInit: value } }
                  : node
              )
            );
            generateCode();
          },
          onCounterIncrementChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, counterIncrement: value } }
                  : node
              )
            );
            generateCode();
          },
          onShowDocstringChange: (showDocstring: boolean) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, showDocstring: showDocstring } }
                  : node
              )
            );
            generateCode();
          },
          onReturnTypeChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, returnType: value } }
                  : node
              )
            );
            generateCode();
          },
          onDocstringChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, docstring: value } }
                  : node
              )
            );
            generateCode();
          },
          onItemsChange: (items: string[]) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, items: items } }
                  : node
              )
            );
            generateCode();
          },
          onOperationChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, operation: value } }
                  : node
              )
            );
            generateCode();
          },
          onAppendValueChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, appendValue: value } }
                  : node
              )
            );
            generateCode();
          },
          onInsertIndexChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, insertIndex: value } }
                  : node
              )
            );
            generateCode();
          },
          onInsertValueChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, insertValue: value } }
                  : node
              )
            );
            generateCode();
          },
          onRemoveValueChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, removeValue: value } }
                  : node
              )
            );
            generateCode();
          },
          onPopIndexChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, popIndex: value } }
                  : node
              )
            );
            generateCode();
          },
          onReverseSortChange: (value: boolean) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, reverseSort: value } }
                  : node
              )
            );
            generateCode();
          },
          // Add default values for for loop
          loopType: type === 'forBlock' ? 'range' : undefined,
          start: type === 'forBlock' ? '0' : undefined,
          end: type === 'forBlock' ? '10' : undefined,
          step: type === 'forBlock' ? '1' : undefined,
          onKeyValuePairsChange: (pairs) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, keyValuePairs: pairs } }
                  : node
              )
            );
            generateCode();
          },
          onUpdateKeyChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, updateKey: value } }
                  : node
              )
            );
            generateCode();
          },
          onUpdateValueChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, updateValue: value } }
                  : node
              )
            );
            generateCode();
          },
          onGetKeyChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, getKey: value } }
                  : node
              )
            );
            generateCode();
          },
          onDeleteKeyChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, deleteKey: value } }
                  : node
              )
            );
            generateCode();
          },
          onSetItemsChange: (items) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, setItems: items } }
                  : node
              )
            );
            generateCode();
          },
          onAddItemChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, addItem: value } }
                  : node
              )
            );
            generateCode();
          },
          onRemoveItemChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, removeItem: value } }
                  : node
              )
            );
            generateCode();
          },
          onOtherSetChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, otherSet: value } }
                  : node
              )
            );
            generateCode();
          },
          onTupleItemsChange: (items) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, tupleItems: items } }
                  : node
              )
            );
            generateCode();
          },
          onAccessIndexChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, accessIndex: value } }
                  : node
              )
            );
            generateCode();
          },
          onCountValueChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, countValue: value } }
                  : node
              )
            );
            generateCode();
          },
          onFindValueChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, findValue: value } }
                  : node
              )
            );
            generateCode();
          },
          onMethodChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, method: value } }
                  : node
              )
            );
            generateCode();
          },
          onRouteChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, route: value } }
                  : node
              )
            );
            generateCode();
          },
          onUrlChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, url: value } }
                  : node
              )
            );
            generateCode();
          },
          onDataChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, data: value } }
                  : node
              )
            );
            generateCode();
          },
          onConnectionChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, connection: value } }
                  : node
              )
            );
            generateCode();
          },
          onQueryChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, query: value } }
                  : node
              )
            );
            generateCode();
          },
          onResponseModelChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, responseModel: value } }
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
          pythonCode += `${indent}${node.data.variable} = input(${JSON.stringify(node.data.prompt || "Enter a value: ")})\n`;
          break;
        
        case 'printBlock':
          if (node.data.printItems && node.data.printItems.length > 0) {
            const items = node.data.printItems.map(item => 
              item.startsWith('"') || item.startsWith("'") ? item : JSON.stringify(item)
            ).join(', ');
            pythonCode += `${indent}print(${items})\n`;
          } else if (node.data.content) {
            pythonCode += `${indent}print(${JSON.stringify(node.data.content)})\n`;
          } else {
            pythonCode += `${indent}print()\n`;
          }
          break;
        
        case 'ifBlock':
          if (node.data.conditions && node.data.conditions.length > 0) {
            // First condition is the main if
            pythonCode += `${indent}if ${node.data.conditions[0]}:\n`;
            
            // Add else if conditions
            for (let i = 1; i < node.data.conditions.length; i++) {
              if (node.data.conditions[i].trim()) {
                pythonCode += `${indent}elif ${node.data.conditions[i]}:\n`;
                pythonCode += `${indent}  pass\n`; // Placeholder for elif blocks
              }
            }
          } else if (node.data.condition) {
            // Fallback to the old single condition
            pythonCode += `${indent}if ${node.data.condition}:\n`;
          }
          break;
        
        case 'forBlock':
          if (node.data.loopType === 'range') {
            const start = node.data.start || '0';
            const end = node.data.end || '10';
            const step = node.data.step || '1';
            
            if (step === '1' && start === '0') {
              pythonCode += `${indent}for ${node.data.variable || 'i'} in range(${end}):\n`;
            } else if (step === '1') {
              pythonCode += `${indent}for ${node.data.variable || 'i'} in range(${start}, ${end}):\n`;
            } else {
              pythonCode += `${indent}for ${node.data.variable || 'i'} in range(${start}, ${end}, ${step}):\n`;
            }
          } else if (node.data.loopType === 'enumerate') {
            pythonCode += `${indent}for ${node.data.indexVar || 'i'}, ${node.data.variable || 'item'} in enumerate(${node.data.iterable || 'items'}):\n`;
          } else {
            // Default to collection iteration
            pythonCode += `${indent}for ${node.data.variable || 'item'} in ${node.data.iterable || 'items'}:\n`;
          }
          break;
        
        case 'whileBlock':
          pythonCode += `${indent}while ${node.data.condition || 'True'}:\n`;
          
          // Add counter initialization if needed
          if (node.data.useCounter) {
            const counterVar = node.data.counterVar || 'counter';
            const initValue = node.data.counterInit || '0';
            pythonCode += `${indent}  ${counterVar} = ${initValue}\n`;
            
            // Add counter increment at the end of the loop
            // We'll need to add this after processing children
            const increment = node.data.counterIncrement || '1';
            setTimeout(() => {
              const childrenCode = pythonCode.split('\n');
              let lastChildLine = -1;
              
              // Find the last line of this block
              for (let i = childrenCode.length - 1; i >= 0; i--) {
                const line = childrenCode[i];
                if (line.startsWith(indent + '  ') && !line.includes(`${counterVar} += ${increment}`)) {
                  lastChildLine = i;
                  break;
                }
              }
              
              if (lastChildLine >= 0) {
                childrenCode.splice(lastChildLine + 1, 0, `${indent}  ${counterVar} += ${increment}`);
                pythonCode = childrenCode.join('\n');
              }
            }, 0);
          }
          break;
        
        case 'variableBlock':
          if (node.data.variable) {
            let value = node.data.value || '';
            
            // Format value based on type
            if (node.data.variableType === 'string' && !value.startsWith('"') && !value.startsWith("'")) {
              value = `"${value}"`;
            } else if (node.data.variableType === 'number' && isNaN(Number(value))) {
              value = '0';
            } else if (node.data.variableType === 'boolean' && !['true', 'false', 'True', 'False'].includes(value)) {
              value = 'False';
            } else if (!node.data.variableType && isNaN(Number(value)) && !value.startsWith('"') && !value.startsWith("'")) {
              value = `"${value}"`;
            }
            
            pythonCode += `${indent}${node.data.variable} = ${value}\n`;
          }
          break;
        
        case 'listBlock':
          if (node.data.variable) {
            const operation = node.data.operation || 'create';
            
            switch (operation) {
              case 'create':
                if (node.data.items && node.data.items.length > 0) {
                  const items = node.data.items.map(item => 
                    isNaN(Number(item)) && !item.startsWith('"') && !item.startsWith("'") ? `"${item}"` : item
                  ).join(', ');
                  pythonCode += `${indent}${node.data.variable} = [${items}]\n`;
                } else if (node.data.value) {
                  pythonCode += `${indent}${node.data.variable} = [${node.data.value}]\n`;
                } else {
                  pythonCode += `${indent}${node.data.variable} = []\n`;
                }
                break;
                
              case 'append':
                if (node.data.appendValue) {
                  const value = isNaN(Number(node.data.appendValue)) && 
                                !node.data.appendValue.startsWith('"') && 
                                !node.data.appendValue.startsWith("'") 
                                ? `"${node.data.appendValue}"` 
                                : node.data.appendValue;
                  pythonCode += `${indent}${node.data.variable}.append(${value})\n`;
                }
                break;
                
              case 'insert':
                if (node.data.insertIndex !== undefined && node.data.insertValue) {
                  const value = isNaN(Number(node.data.insertValue)) && 
                                !node.data.insertValue.startsWith('"') && 
                                !node.data.insertValue.startsWith("'") 
                                ? `"${node.data.insertValue}"` 
                                : node.data.insertValue;
                  pythonCode += `${indent}${node.data.variable}.insert(${node.data.insertIndex}, ${value})\n`;
                }
                break;
                
              case 'remove':
                if (node.data.removeValue) {
                  const value = isNaN(Number(node.data.removeValue)) && 
                                !node.data.removeValue.startsWith('"') && 
                                !node.data.removeValue.startsWith("'") 
                                ? `"${node.data.removeValue}"` 
                                : node.data.removeValue;
                  pythonCode += `${indent}${node.data.variable}.remove(${value})\n`;
                }
                break;
                
              case 'pop':
                if (node.data.popIndex !== undefined && node.data.popIndex !== '') {
                  pythonCode += `${indent}${node.data.variable}.pop(${node.data.popIndex})\n`;
                } else {
                  pythonCode += `${indent}${node.data.variable}.pop()\n`;
                }
                break;
                
              case 'clear':
                pythonCode += `${indent}${node.data.variable}.clear()\n`;
                break;
                
              case 'sort':
                if (node.data.reverseSort) {
                  pythonCode += `${indent}${node.data.variable}.sort(reverse=True)\n`;
                } else {
                  pythonCode += `${indent}${node.data.variable}.sort()\n`;
                }
                break;
                
              case 'reverse':
                pythonCode += `${indent}${node.data.variable}.reverse()\n`;
                break;
            }
          }
          break;
        
        case 'dictBlock':
          if (node.data.variable) {
            const operation = node.data.operation || 'create';
            
            switch (operation) {
              case 'create':
                if (node.data.keyValuePairs && node.data.keyValuePairs.length > 0) {
                  const pairs = node.data.keyValuePairs.map(pair => {
                    const key = isNaN(Number(pair.key)) && !pair.key.startsWith('"') && !pair.key.startsWith("'") 
                      ? `"${pair.key}"` : pair.key;
                    const value = isNaN(Number(pair.value)) && !pair.value.startsWith('"') && !pair.value.startsWith("'") 
                      ? `"${pair.value}"` : pair.value;
                    return `${key}: ${value}`;
                  }).join(', ');
                  pythonCode += `${indent}${node.data.variable} = {${pairs}}\n`;
                } else {
                  pythonCode += `${indent}${node.data.variable} = {}\n`;
                }
                break;
                
              case 'update':
                if (node.data.updateKey) {
                  const key = isNaN(Number(node.data.updateKey)) && !node.data.updateKey.startsWith('"') && !node.data.updateKey.startsWith("'") 
                    ? `"${node.data.updateKey}"` : node.data.updateKey;
                  const value = isNaN(Number(node.data.updateValue)) && !node.data.updateValue?.startsWith('"') && !node.data.updateValue?.startsWith("'") 
                    ? `"${node.data.updateValue}"` : node.data.updateValue;
                  pythonCode += `${indent}${node.data.variable}[${key}] = ${value}\n`;
                }
                break;
                
              case 'get':
                if (node.data.getKey) {
                  const key = isNaN(Number(node.data.getKey)) && !node.data.getKey.startsWith('"') && !node.data.getKey.startsWith("'") 
                    ? `"${node.data.getKey}"` : node.data.getKey;
                  pythonCode += `${indent}${node.data.variable}.get(${key})\n`;
                }
                break;
                
              case 'delete':
                if (node.data.deleteKey) {
                  const key = isNaN(Number(node.data.deleteKey)) && !node.data.deleteKey.startsWith('"') && !node.data.deleteKey.startsWith("'") 
                    ? `"${node.data.deleteKey}"` : node.data.deleteKey;
                  pythonCode += `${indent}del ${node.data.variable}[${key}]\n`;
                }
                break;
                
              case 'clear':
                pythonCode += `${indent}${node.data.variable}.clear()\n`;
                break;
                
              case 'keys':
                pythonCode += `${indent}${node.data.variable}.keys()\n`;
                break;
                
              case 'values':
                pythonCode += `${indent}${node.data.variable}.values()\n`;
                break;
            }
          }
          break;
        
        case 'tupleBlock':
          if (node.data.variable) {
            const operation = node.data.operation || 'create';
            
            switch (operation) {
              case 'create':
                if (node.data.tupleItems && node.data.tupleItems.length > 0) {
                  const items = node.data.tupleItems.map(item => 
                    isNaN(Number(item)) && !item.startsWith('"') && !item.startsWith("'") ? `"${item}"` : item
                  ).join(', ');
                  pythonCode += `${indent}${node.data.variable} = (${items})\n`;
                } else {
                  pythonCode += `${indent}${node.data.variable} = ()\n`;
                }
                break;
                
              case 'access':
                if (node.data.accessIndex !== undefined) {
                  pythonCode += `${indent}${node.data.variable}[${node.data.accessIndex}]\n`;
                }
                break;
                
              case 'count':
                if (node.data.countValue) {
                  const value = isNaN(Number(node.data.countValue)) && !node.data.countValue.startsWith('"') && !node.data.countValue.startsWith("'") 
                    ? `"${node.data.countValue}"` : node.data.countValue;
                  pythonCode += `${indent}${node.data.variable}.count(${value})\n`;
                }
                break;
                
              case 'index':
                if (node.data.findValue) {
                  const value = isNaN(Number(node.data.findValue)) && !node.data.findValue.startsWith('"') && !node.data.findValue.startsWith("'") 
                    ? `"${node.data.findValue}"` : node.data.findValue;
                  pythonCode += `${indent}${node.data.variable}.index(${value})\n`;
                }
                break;
            }
          }
          break;
        
        case 'setBlock':
          if (node.data.variable) {
            const operation = node.data.operation || 'create';
            
            switch (operation) {
              case 'create':
                if (node.data.setItems && node.data.setItems.length > 0) {
                  const items = node.data.setItems.map(item => 
                    isNaN(Number(item)) && !item.startsWith('"') && !item.startsWith("'") ? `"${item}"` : item
                  ).join(', ');
                  pythonCode += `${indent}${node.data.variable} = {${items}}\n`;
                } else {
                  pythonCode += `${indent}${node.data.variable} = set()\n`;
                }
                break;
                
              case 'add':
                if (node.data.addItem) {
                  const value = isNaN(Number(node.data.addItem)) && !node.data.addItem.startsWith('"') && !node.data.addItem.startsWith("'") 
                    ? `"${node.data.addItem}"` : node.data.addItem;
                  pythonCode += `${indent}${node.data.variable}.add(${value})\n`;
                }
                break;
                
              case 'remove':
                if (node.data.removeItem) {
                  const value = isNaN(Number(node.data.removeItem)) && !node.data.removeItem.startsWith('"') && !node.data.removeItem.startsWith("'") 
                    ? `"${node.data.removeItem}"` : node.data.removeItem;
                  pythonCode += `${indent}${node.data.variable}.remove(${value})\n`;
                }
                break;
                
              case 'union':
                if (node.data.otherSet) {
                  pythonCode += `${indent}${node.data.variable} = ${node.data.variable}.union(${node.data.otherSet})\n`;
                }
                break;
                
              case 'intersection':
                if (node.data.otherSet) {
                  pythonCode += `${indent}${node.data.variable} = ${node.data.variable}.intersection(${node.data.otherSet})\n`;
                }
                break;
                
              case 'difference':
                if (node.data.otherSet) {
                  pythonCode += `${indent}${node.data.variable} = ${node.data.variable}.difference(${node.data.otherSet})\n`;
                }
                break;
                
              case 'clear':
                pythonCode += `${indent}${node.data.variable}.clear()\n`;
                break;
            }
          }
          break;
        
        case 'functionBlock':
          if (node.data.name) {
            const params = node.data.params || '';
            pythonCode += `${indent}def ${node.data.name}(${params})`;
            
            // Add return type annotation if provided
            if (node.data.returnType) {
              pythonCode += ` -> ${node.data.returnType}`;
            }
            
            pythonCode += ':\n';
            
            // Add docstring if enabled
            if (node.data.showDocstring && node.data.docstring) {
              pythonCode += `${indent}  """${node.data.docstring}"""\n`;
            }
          }
          break;
        
        case 'returnBlock':
          pythonCode += `${indent}return ${node.data.value || 'None'}\n`;
          break;
        
        case 'lambdaBlock':
          if (node.data.variable) {
            const params = node.data.params || 'x';
            const expression = node.data.expression || 'x';
            pythonCode += `${indent}${node.data.variable} = lambda ${params}: ${expression}\n`;
          }
          break;
        
        case 'openBlock':
          if (node.data.variable && node.data.filename) {
            const mode = node.data.mode || 'r';
            pythonCode += `${indent}${node.data.variable} = open(${JSON.stringify(node.data.filename)}, "${mode}")\n`;
          }
          break;
        
        case 'tryBlock':
          pythonCode += `${indent}try:\n`;
          if (node.data.code) {
            pythonCode += `${indent}  ${node.data.code}\n`;
          }
          pythonCode += `${indent}except ${node.data.error || 'Exception'}:\n`;
          pythonCode += `${indent}  pass\n`;
          break;
        
        case 'importBlock':
          if (node.data.module) {
            if (node.data.alias) {
              pythonCode += `${indent}import ${node.data.module} as ${node.data.alias}\n`;
            } else {
              pythonCode += `${indent}import ${node.data.module}\n`;
            }
          }
          break;
        
        case 'numpyArrayBlock':
          if (node.data.variable) {
            pythonCode += `${indent}import numpy as np\n`;
            pythonCode += `${indent}${node.data.variable} = np.array(${node.data.value || '[]'})\n`;
          }
          break;
        
        case 'flaskApiBlock':
          if (node.data.route && node.data.name) {
            const method = node.data.method || 'GET';
            const responseModel = node.data.responseModel ? ` -> ${node.data.responseModel}` : '';
            
            pythonCode += `${indent}@app.${method.toLowerCase()}("${node.data.route}"${responseModel})\n`;
            pythonCode += `${indent}async def ${node.data.name}():\n`;
            
            if (method === 'GET') {
              pythonCode += `${indent}  # Process GET request\n`;
              pythonCode += `${indent}  return {"message": "Success"}\n`;
            } else if (method === 'POST') {
              pythonCode += `${indent}  # Process POST request with request body\n`;
              pythonCode += `${indent}  return {"message": "Data received"}\n`;
            } else if (method === 'PUT') {
              pythonCode += `${indent}  # Update resource\n`;
              pythonCode += `${indent}  return {"message": "Resource updated"}\n`;
            } else if (method === 'DELETE') {
              pythonCode += `${indent}  # Delete resource\n`;
              pythonCode += `${indent}  return {"message": "Resource deleted"}\n`;
            }
          }
          break;
        
        case 'httpRequestBlock':
          if (node.data.variable && node.data.url) {
            const method = node.data.method || 'GET';
            pythonCode += `${indent}import requests\n`;
            
            if (method === 'GET') {
              pythonCode += `${indent}${node.data.variable} = requests.get('${node.data.url}')\n`;
            } else if (method === 'POST') {
              const jsonData = node.data.data || '{}';
              pythonCode += `${indent}${node.data.variable} = requests.post('${node.data.url}', json=${jsonData})\n`;
            } else if (method === 'PUT') {
              const jsonData = node.data.data || '{}';
              pythonCode += `${indent}${node.data.variable} = requests.put('${node.data.url}', json=${jsonData})\n`;
            } else if (method === 'DELETE') {
              pythonCode += `${indent}${node.data.variable} = requests.delete('${node.data.url}')\n`;
            }
          }
          break;
        
        case 'sqlQueryBlock':
          if (node.data.connection && node.data.variable && node.data.query) {
            pythonCode += `${indent}cursor = ${node.data.connection}.cursor()\n`;
            pythonCode += `${indent}cursor.execute("""${node.data.query}""")\n`;
            pythonCode += `${indent}${node.data.variable} = cursor.fetchall()\n`;
          }
          break;
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
          isValidConnection={(connection) => {
            if (connection.source === connection.target) {
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
      <PythonProvider>
        <RunCodeSidebar code={code} />
      </PythonProvider>
    </div>
  );
} 