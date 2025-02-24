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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Editor } from '@monaco-editor/react';
import { nodeTypes } from './NodeTypes';
import { CodeSnippetsPanel } from './CodeSnippets';
import { PyodideRunner } from './PyodideRunner';
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
  Play
} from 'lucide-react';

let id = 0;
const getId = () => `${id++}`;

export function VisualProgramming() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [code, setCode] = useState<string>('');

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

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      if (!type) return;
      
      const dataStr = event.dataTransfer.getData('application/reactflow/data') as string;
      const data = JSON.parse(dataStr);

      // Check if the drop target is the pane
      const reactFlowBounds = (event.target as Element)
        .closest('.react-flow')
        ?.getBoundingClientRect();

      if (!reactFlowBounds) {
        return;
      }

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
          onChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, ...getUpdateData(node.type, value) } }
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
    [setNodes]
  );

  const getUpdateData = (type: string | undefined, value: string) => {
    if (!type) return {};
    
    switch (type) {
      case 'inputBlock':
        return { variable: value };
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
    let indentLevel = 0;
    const indentSize = 4;
    const getIndentation = () => ' '.repeat(indentLevel * indentSize);

    // Create a graph representation
    const graph = new Map<string, string[]>();
    edges.forEach(edge => {
      if (!graph.has(edge.source)) {
        graph.set(edge.source, []);
      }
      graph.get(edge.source)?.push(edge.target);
    });

    // Helper function to get node by id
    const getNode = (id: string) => nodes.find(n => n.id === id);

    // Process nodes in order of dependencies
    const processed = new Set<string>();
    const processNode = (nodeId: string, currentIndent: number) => {
      if (processed.has(nodeId)) return;
      
      const node = getNode(nodeId);
      if (!node) return;

      const indent = ' '.repeat(currentIndent * indentSize);
      processed.add(nodeId);

      switch (node.type) {
        case 'inputBlock':
          pythonCode += `${indent}${node.data.variable} = input("${node.data.prompt}")\n`;
          break;
        case 'printBlock':
          pythonCode += `${indent}print("${node.data.content}")\n`;
          break;
        case 'ifBlock':
          pythonCode += `${indent}if ${node.data.condition}:\n`;
          // Process children with increased indent
          graph.get(nodeId)?.forEach(childId => {
            processNode(childId, currentIndent + 1);
          });
          break;
        case 'forBlock':
          pythonCode += `${indent}for ${node.data.variable} in ${node.data.iterable}:\n`;
          graph.get(nodeId)?.forEach(childId => {
            processNode(childId, currentIndent + 1);
          });
          break;
        case 'whileBlock':
          pythonCode += `${indent}while ${node.data.condition}:\n`;
          graph.get(nodeId)?.forEach(childId => {
            processNode(childId, currentIndent + 1);
          });
          break;
        case 'listBlock':
          pythonCode += `${indent}${node.data.variable} = ${node.data.value}\n`;
          break;
        case 'dictBlock':
          pythonCode += `${indent}${node.data.variable} = ${node.data.value}\n`;
          break;
        case 'functionBlock':
          pythonCode += `${indent}def ${node.data.name}(${node.data.params}):\n`;
          graph.get(nodeId)?.forEach(childId => {
            processNode(childId, currentIndent + 1);
          });
          break;
        case 'returnBlock':
          pythonCode += `${indent}return ${node.data.value}\n`;
          break;
      }

      // Process unprocessed children
      graph.get(nodeId)?.forEach(childId => {
        if (!processed.has(childId)) {
          processNode(childId, currentIndent);
        }
      });
    };

    // Find root nodes (nodes with no incoming edges)
    const rootNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    // Process from root nodes
    rootNodes.forEach(node => processNode(node.id, 0));

    setCode(pythonCode);
  }, [nodes, edges]);

  // Generate code whenever nodes or edges change
  useEffect(() => {
    generateCode();
  }, [nodes, edges, generateCode]);

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
          fitView
          className="bg-dot-pattern"
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
      <div className="w-1/4 h-full bg-slate-900 p-4 flex flex-col">
        <Tabs defaultValue="code" className="flex-1">
          <TabsList className="bg-slate-800 border-white/10">
            <TabsTrigger value="code" className="data-[state=active]:bg-slate-700">
              <Code2 className="h-4 w-4 mr-2" />
              Code
            </TabsTrigger>
            <TabsTrigger value="output" className="data-[state=active]:bg-slate-700">
              <Play className="h-4 w-4 mr-2" />
              Output
            </TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="flex-1 mt-0">
            <Card className="border-white/10 bg-transparent h-full">
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
            </Card>
          </TabsContent>
          <TabsContent value="output" className="flex-1 mt-0">
            <Card className="border-white/10 bg-transparent h-full">
              <PyodideRunner code={code} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 