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
            <Trash2 className="h-4 w-4 text-red-500" />
          </div>
        </foreignObject>
      </g>
    </> 
  );
};

// Remove lodash import and add this utility function
const debounce = (fn: Function, ms: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  const wrapper = function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
  wrapper.cancel = () => clearTimeout(timeoutId);
  return wrapper;
};

// Add this generic handler outside the component
const createNodeDataHandler = (
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  generateCode: () => void
) => {
  return (nodeId: string, propertyName: string, value: any) => {
    setNodes(nds => 
      nds.map(node => 
        node.id === nodeId
          ? { ...node, data: { ...node.data, [propertyName]: value } }
          : node
      )
    );
    generateCode();
  };
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

  // Track available variables
  const getAvailableVariables = useCallback((nodeId: string): string[] => {
    const variables: string[] = [];
    
    // Get all nodes that come before this node in the flow
    const processedNodes = new Set<string>();
    const nodesToProcess = new Set<string>();
    
    // Find all nodes that lead to this node
    const findPreviousNodes = (currentId: string) => {
      edges.forEach(edge => {
        if (edge.target === currentId && !processedNodes.has(edge.source)) {
          nodesToProcess.add(edge.source);
          processedNodes.add(edge.source);
          findPreviousNodes(edge.source);
        }
      });
    };
    
    findPreviousNodes(nodeId);
    
    // Collect variables from previous nodes
    nodesToProcess.forEach(id => {
      const node = nodes.find(n => n.id === id);
      if (node) {
        switch (node.type) {
          case 'variableBlock':
            if (node.data.variable) {
              variables.push(node.data.variable);
            }
            break;
          case 'inputBlock':
            if (node.data.variable) {
              variables.push(node.data.variable);
            }
            break;
          case 'forBlock':
            if (node.data.variable) {
              variables.push(node.data.variable);
            }
            if (node.data.indexVar) {
              variables.push(node.data.indexVar);
            }
            if (node.data.counterVar) {
              variables.push(node.data.counterVar);
            }
            break;
          case 'listBlock':
          case 'dictBlock':
          case 'setBlock':
          case 'tupleBlock':
            if (node.data.variable) {
              variables.push(node.data.variable);
            }
            break;
        }
      }
    });
    
    return variables;
  }, [nodes, edges]);

  const memoizedVariables = useMemo(() => {
    const varsMap = new Map<string, string[]>();
    nodes.forEach(node => {
      varsMap.set(node.id, getAvailableVariables(node.id));
    });
    return varsMap;
  }, [nodes, getAvailableVariables]);

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
      setEdges((eds) => {
        const targetHasConnection = eds.some(edge => edge.target === params.target);
        if (targetHasConnection) {
          return eds;
        }
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

  const handleDeleteNode = useCallback(({ 
    nodes: nodesToDelete, 
    edges: edgesToDelete 
  }: { 
    nodes: Node[]; 
    edges?: Edge[] 
  }) => {
    deleteElements({
      nodes: nodesToDelete,
      edges: edgesToDelete || edges.filter(edge =>
        nodesToDelete?.some((node: Node) =>
          edge.source === node.id || edge.target === node.id
        )
      )
    });
  }, [deleteElements, edges]);

  const handleMoveNode = useCallback((nodeId: string, direction: 'up' | 'down') => {
    setNodes(nds => {
      const index = nds.findIndex(n => n.id === nodeId);
      if (index === -1 || (direction === 'up' && index === 0) || (direction === 'down' && index === nds.length - 1)) {
        return nds;
      }

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const newNodes = [...nds];
      [newNodes[index], newNodes[newIndex]] = [newNodes[newIndex], newNodes[index]];
      
      return newNodes;
    });
  }, []);

  // First move generateCode above handleNodeDataChange
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
    const calculateDepth = (nodeId: string): number => {
      const queue: [string, number][] = [[nodeId, 0]];
      const visited = new Set<string>();
      let maxDepth = 0;

      while (queue.length > 0) {
        const [currentId, currentDepth] = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const parents = childToParents.get(currentId) || [];
        parents.forEach(parentId => {
          queue.push([parentId, currentDepth + 1]);
          maxDepth = Math.max(maxDepth, currentDepth + 1);
        });
      }

      return maxDepth;
    };

    // Calculate depths for all nodes
    nodes.forEach(node => {
      const depth = calculateDepth(node.id);
      nodeRelationships.set(node.id, {
        depth,
        parentIds: childToParents.get(node.id) || []
      });
    });

    // Replace the rootNodes processing with a topological sort
    const processNodesInOrder = (nodesToProcess: Node[]) => {
      const processed = new Set<string>();
      const queue: string[] = [];

      // Initialize queue with nodes that have no incoming edges
      nodesToProcess.forEach(node => {
        if (!edges.some(e => e.target === node.id)) {
          queue.push(node.id);
        }
      });

      while (queue.length > 0) {
        const nodeId = queue.shift()!;
        if (processed.has(nodeId)) continue;
        
        processNode(nodeId);
        processed.add(nodeId);

        // Add children to queue
        edges
          .filter(e => e.source === nodeId)
          .forEach(e => {
            if (!processed.has(e.target)) {
              queue.push(e.target);
            }
          });
      }
    };

    // Process nodes in order, respecting parent-child relationships
    processNodesInOrder(nodes);

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

  // Then define handleNodeDataChange
  const handleNodeDataChange = useCallback(
    (nodeId: string, propertyName: string, value: any) => {
      setNodes(nds => 
        nds.map(node => 
          node.id === nodeId
            ? { ...node, data: { ...node.data, [propertyName]: value } }
            : node
        )
      );
      generateCode(); // Now generateCode is properly initialized
    },
    [generateCode] // Correct dependency
  );

  // Update the onDrop handler to use the generic handler
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      if (!type) return;

      const dataStr = event.dataTransfer.getData('application/reactflow/data');
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
          // Initialize default values
          ...(type === 'forBlock' ? { 
            loopType: 'range',
            start: '0',
            end: '10',
            step: '1'
          } : {}),
          // Common properties
          variable: '',
          value: '',
          condition: '',
          // Single handler for all data changes
          handleDataChange: (property: string, value: any) => {
            handleNodeDataChange(newNode.id, property, value);
          },
          // Special cases that need custom logic
          onDelete: handleDeleteNode,
          onMoveUp: () => handleMoveNode(newNode.id, 'up'),
          onMoveDown: () => handleMoveNode(newNode.id, 'down'),
          get availableVariables() {
            return getAvailableVariables(newNode.id);
          }
        }
      };

      const availableVariables = memoizedVariables.get(newNode.id) || [];

      setNodes((nds) => nds.concat(newNode));
      generateCode();
    },
    [handleNodeDataChange, handleDeleteNode, handleMoveNode, getAvailableVariables]
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

  // Generate code whenever nodes or edges change
  useEffect(() => {
    generateCode();
  }, [nodes, edges, generateCode]);

  // Update the debounce implementation
  const debouncedGenerateCode = useMemo(
    () => debounce(generateCode, 300),
    [generateCode]
  );

  // Cleanup effect
  useEffect(() => {
    debouncedGenerateCode();
    return () => debouncedGenerateCode.cancel();
  }, [nodes, edges, debouncedGenerateCode]);

  const { theme } = useTheme();

  // Add the edgeTypes object
  const edgeTypes = {
    default: CustomEdge,
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* <div className="w-full h-full bg-slate-800 relative"> */}

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
          colorMode={theme === 'light' ? 'light' : 'dark'}
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
          connectionMode={ConnectionMode.Loose}
          isValidConnection={(connection) => {
            // Quick check for self-connection
            if (connection.source === connection.target) return false;
            
            // Use a Set for faster lookups
            const existingTargets = new Set(
              edges.filter(e => e.target === connection.target).map(e => e.source)
            );
            return !existingTargets.has(connection.source);
          }}
        >
          <Background color="#475569" gap={16} size={1} />
          <Controls
            className="bg-slate-800 border-white/10 text-white"
            showInteractive={false}
          />
          <Panel position="top-left" className="">
            <CodeSnippetsPanel onDragStart={onDragStart} />
          </Panel>
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
      {/* </div> */}
      <PythonProvider>
        <RunCodeSidebar code={code} />
      </PythonProvider>
    </div>
  );
} 