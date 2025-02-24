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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Editor } from '@monaco-editor/react';
import { nodeTypes } from './NodeTypes';
import { CodeSnippetsPanel } from './CodeSnippets';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
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
  Terminal
} from 'lucide-react';
import { CodeGeneration } from './CodeGeneration';
import { usePython } from '@/hooks/usePython';
import { PythonProvider } from 'react-py';
import { MarkerType, ReactFlowProvider } from '@xyflow/react';
import { theme } from 'tailwind.config';
import { useTheme } from 'next-themes';

let id = 0;
const getId = () => `${id++}`;

// Add this type definition for tracking node relationships
type NodeWithDepth = {
  nodeId: string;
  depth: number;
  parentId?: string;
};

export function VisualProgramming() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [code, setCode] = useState<string>('');

  const { runPython, output, error, isLoading, isRunning } = usePython();
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
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
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
                        [type === 'ifBlock' || type === 'whileBlock' ? 'condition' : 'variable']: value 
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

  const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  const generateCode = useCallback(() => {
    let pythonCode = '';
    const indentSize = 2;
    const processed = new Set<string>();
    
    nodes.forEach((node) => {
      if (processed.has(node.id)) return;
      
      const indent = ' '.repeat((node.data.depth || 0) * indentSize);
      processed.add(node.id);

      switch (node.type) {
        case 'inputBlock':
          pythonCode += `${indent}${node.data.variable} = input(${JSON.stringify(node.data.prompt)})\n`;
          break;
        case 'printBlock':
          pythonCode += `${indent}print("${node.data.content}")\n`;
          break;
        case 'ifBlock':
          if (node.data.condition) {
            pythonCode += `${indent}if ${node.data.condition}:\n`;
            pythonCode += `${indent}${' '.repeat(indentSize)}pass\n`;
          }
          break;
        case 'forBlock':
          pythonCode += `${indent}for ${node.data.variable} in ${node.data.iterable}:\n`;
          break;
        case 'whileBlock':
          pythonCode += `${indent}while ${node.data.condition}:\n`;
          break;
        case 'listBlock':
          pythonCode += `${indent}${node.data.variable} = ${node.data.value}\n`;
          break;
        case 'dictBlock':
          pythonCode += `${indent}${node.data.variable} = ${node.data.value}\n`;
          break;
        case 'functionBlock':
          pythonCode += `${indent}def ${node.data.name}(${node.data.params}):\n`;
          break;
        case 'returnBlock':
          pythonCode += `${indent}return ${node.data.value}\n`;
          break;
        case 'variableBlock':
          if (node.data.variable && node.data.value !== undefined) {
            // Handle string values by adding quotes if needed
            const value = isNaN(Number(node.data.value)) && !node.data.value.startsWith('"') 
              ? `"${node.data.value}"`
              : node.data.value;
            pythonCode += `${indent}${node.data.variable} = ${value}\n`;
          }
          break;
      }
    });

    setCode(pythonCode);
  }, [nodes]);

  // Generate code whenever nodes or edges change
  useEffect(() => {
    generateCode();
  }, [nodes, edges, generateCode]);

  const handleRunCode = async () => {
    await runPython(code);
  };

  const { theme } = useTheme();


  return (
    <PythonProvider>
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
            fitView
            className="bg-dot-pattern"
            colorMode={theme ? theme : 'dark'}
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
        <div className="w-1/4 h-full bg-slate-900 flex flex-col">
          {/* Top Bar with Run Button */}
          <div className="p-4 border-b border-white/10">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleRunCode}
              disabled={isLoading || isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Code
                </>
              )}
            </Button>
          </div>

          {/* Code Editor Section */}
          <div className="flex-1 min-h-0 p-4 border-b border-white/10">
            <div className="h-full rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  readOnly: true,
                  fontSize: 14,
                  lineNumbers: 'on',
                  renderLineHighlight: 'none',
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="h-2/5 p-4 bg-slate-800/50">
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
              <Terminal className="h-4 w-4" />
              Output
            </div>
            <div className="h-[calc(100%-2rem)] rounded-lg bg-slate-800 overflow-auto">
              {isRunning ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Running code...
                </div>
              ) : error ? (
                <div className="p-4 text-red-400 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{error}</pre>
                </div>
              ) : output ? (
                <div className="p-4 text-slate-200 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{output}</pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <span>No output yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PythonProvider>
  );
} 