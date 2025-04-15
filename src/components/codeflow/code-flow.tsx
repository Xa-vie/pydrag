'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import type {  ComponentType } from 'react';
import {
  Background,
  NodeProps,
  Node,
  ReactFlowInstance,
  BackgroundVariant,
  useKeyPress,
  useOnSelectionChange,
} from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Controls = dynamic(() => import('@xyflow/react').then(mod => mod.Controls), {
  ssr: false,
  loading: () => <Skeleton className="w-10 h-24" />
});

const MiniMap = dynamic(() => import('@xyflow/react').then(mod => mod.MiniMap), {
  ssr: false,
  loading: () => <Skeleton className="w-48 h-48" />
});

const Panel = dynamic(() => import('@xyflow/react').then(mod => mod.Panel), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />
});

const ReactFlow = dynamic(() => import('@xyflow/react').then(mod => mod.ReactFlow), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />
});
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '@/store/use-flow-store';
import { 
  useRegisterActions,
} from 'kbar';
import type { 
  NodeData, 
} from '@/store/use-flow-store';
import { snapToIndentation, INDENTATION_WIDTH } from './utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Loading components
const SidebarSkeleton = () => (
  <div className="w-64 h-screen border-r bg-background/95 backdrop-blur-sm p-4">
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  </div>
);

const CodePanelSkeleton = () => (
  <div className="absolute top-4 right-4 w-96 bg-background/95 backdrop-blur-sm rounded-lg border p-4">
    <div className="space-y-4">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-32 w-full" />
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
);

const NodeSkeleton = () => (
  <div className="w-[280px] h-[72px] rounded-lg border bg-background/95 backdrop-blur-sm p-4">
    <Skeleton className="h-4 w-24" />
  </div>
);

// Dynamic imports for layout components with loading states
const Sidebar = dynamic(() => import('./sidebar'), { 
  ssr: false,
  loading: () => <SidebarSkeleton />
});
const CodePanel = dynamic(() => import('./code-panel'), { 
  ssr: false,
  loading: () => <CodePanelSkeleton />
});

// Dynamic imports for node components with loading states
const IfNode = dynamic(() => import('./nodes/IfNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const ElifNode = dynamic(() => import('./nodes/ElifNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const ElseNode = dynamic(() => import('./nodes/ElseNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const VariableNode = dynamic(() => import('./nodes/VariableNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const ForLoopNode = dynamic(() => import('./nodes/ForLoopNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const DatabaseNode = dynamic(() => import('./nodes/DatabaseNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const FunctionCallNode = dynamic(() => import('./nodes/FunctionCallNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const PrintNode = dynamic(() => import('./nodes/PrintNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const TryBlockNode = dynamic(() => import('./nodes/TryBlockNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const ExceptBlockNode = dynamic(() => import('./nodes/ExceptBlockNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const FinallyBlockNode = dynamic(() => import('./nodes/FinallyBlockNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const FunctionNode = dynamic(() => import('./nodes/FunctionNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const CommentNode = dynamic(() => import('./nodes/CommentNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const ReturnNode = dynamic(() => import('./nodes/ReturnNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});
const OperationNode = dynamic(() => import('./nodes/OperationNode'), { 
  ssr: false,
  loading: () => <NodeSkeleton />
});

// Custom props type for node components
interface NodeComponentProps<T extends NodeData> {
  id: string;
  data: T;
  selected?: boolean;
}

// Node types configuration
const nodeTypes = {
  ifBlock: IfNode as unknown as ComponentType<NodeProps>,
  elifBlock: ElifNode as unknown as ComponentType<NodeProps>,
  elseBlock: ElseNode as unknown as ComponentType<NodeProps>,
  forLoop: ForLoopNode as unknown as ComponentType<NodeProps>,
  variable: VariableNode as unknown as ComponentType<NodeProps>,
  database: DatabaseNode as unknown as ComponentType<NodeProps>,
  print: PrintNode as unknown as ComponentType<NodeProps>,
  function: FunctionNode as unknown as ComponentType<NodeProps>,
  comment: CommentNode as unknown as ComponentType<NodeProps>,
  functionCall: FunctionCallNode as unknown as ComponentType<NodeProps>,
  tryBlock: TryBlockNode as unknown as ComponentType<NodeProps>,
  exceptBlock: ExceptBlockNode as unknown as ComponentType<NodeProps>,
  finallyBlock: FinallyBlockNode as unknown as ComponentType<NodeProps>,
  return: ReturnNode as unknown as ComponentType<NodeProps>,
  operation: OperationNode as unknown as ComponentType<NodeProps>,
};

export function CodeFlow() {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodes,
    clearCanvas,
  } = useFlowStore();

  // Handle node selection
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      const typedNodes = nodes.map(node => ({
        ...node,
        data: node.data as NodeData
      })) as Node<NodeData>[];
      setSelectedNodes(typedNodes);
    },
  });

  // Handle delete key press
  const deleteKeyPressed = useKeyPress(['Delete']);
  useEffect(() => {
    if (deleteKeyPressed) {
      const selectedNodes = useFlowStore.getState().selectedNodes;
      selectedNodes.forEach((node) => {
        useFlowStore.getState().deleteNode(node.id);
      });
    }
  }, [deleteKeyPressed]);

  // Handle clear canvas shortcut (Ctrl+Shift+C)
  const clearCanvasShortcut = useKeyPress(['Control', 'Shift', 'c']);
  useEffect(() => {
    if (clearCanvasShortcut) {
      setIsClearDialogOpen(true);
    }
  }, [clearCanvasShortcut]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      // Get the exact drop position
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Snap to indentation grid
      position.x = snapToIndentation(position.x);

      // Initialize node data based on type
      let initialData: NodeData;
      switch (type) {
        case 'operation':
          initialData = {
            type: 'operation',
            label: 'Operation',
            dataType: undefined,
            targetVariable: undefined,
            operation: '',
            parameters: [],
            resultVariable: '',
            generateComment: false,
            measured: {
              width: 280,
              height: 72
            }
          };
          break;
        case 'ifBlock':
          initialData = {
            type: 'ifBlock',
            label: 'If Condition',
            condition: '',
            elifConditions: [],
            hasElse: false,
            generateComment: false
          };
          break;
        case 'elifBlock':
          initialData = {
            type: 'elifBlock',
            label: 'Elif Condition',
            condition: ''
          };
          break;
        case 'elseBlock':
          initialData = {
            type: 'elseBlock',
            label: 'Else'
          };
          break;
        case 'tryBlock':
          initialData = {
            type: 'tryBlock',
            label: 'Try Block',
            code: ''
          };
          break;
        case 'exceptBlock':
          initialData = {
            type: 'exceptBlock',
            label: 'Except Block',
            exceptionType: 'Exception'
          };
          break;
        case 'finallyBlock':
          initialData = {
            type: 'finallyBlock',
            label: 'Finally Block'
          };
          break;
        case 'print':
          initialData = {
            type: 'print',
            label: 'Print',
            message: ''
          };
          break;
        case 'forLoop':
          initialData = {
            type: 'forLoop',
            label: 'For Loop',
            condition: ''
          };
          break;
        case 'variable':
          initialData = {
            type: 'variable',
            label: 'Variable',
            value: ''
          };
          break;
        case 'database':
          initialData = {
            type: 'database',
            label: 'Database',
            query: ''
          };
          break;
        case 'function':
          initialData = {
            type: 'function',
            label: 'Function',
            name: '',
            internalNodes: [],
            internalEdges: [],
            parameters: [],
            returnValue: false
          };
          break;
        case 'functionCall':
          initialData = {
            type: 'functionCall',
            label: 'Call Function',
            functionName: '',
            arguments: []
          };
          break;
        case 'return':
          initialData = {
            type: 'return',
            label: 'Return',
            returnValue: ''
          };
          break;
        default:
          initialData = {
            type: 'print',
            label: 'Unknown',
            message: ''
          };
      }

      addNode(type, position, initialData);
    },
    [addNode, reactFlowInstance]
  );

  // Add KBar actions for each node type
  useRegisterActions([
    {
      id: 'add-if-node',
      name: 'Add If Condition',
      shortcut: ['i'],
      keywords: 'condition branch flow control if else elif',
      section: 'Control Flow',
      subtitle: 'Create conditional branches in your code',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        console.log(lastNode)
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('ifBlock', position);
      },
    },
    {
      id: 'add-elif-node',
      name: 'Add Elif Condition',
      shortcut: ['e'],
      keywords: 'condition branch flow control elif else if',
      section: 'Control Flow',
      subtitle: 'Create elif conditional branches',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('elifBlock', position);
      },
    },
    {
      id: 'add-else-node',
      name: 'Add Else Block',
      shortcut: ['l'],
      keywords: 'condition branch flow control else',
      section: 'Control Flow',
      subtitle: 'Create else fallback branch',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('elseBlock', position);
      },
    },
    {
      id: 'add-for-loop',
      name: 'Add For Loop',
      shortcut: ['f'],
      keywords: 'loop iterate repeat for range sequence',
      section: 'Control Flow',
      subtitle: 'Create loops and iterations',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('forLoop', position);
      },
    },
    {
      id: 'add-function',
      name: 'Add Function Definition',
      shortcut: ['u'],
      keywords: 'function define method subroutine procedure',
      section: 'Control Flow',
      subtitle: 'Define reusable code blocks',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('function', position);
      },
    },
    {
      id: 'add-function-call',
      name: 'Add Function Call',
      shortcut: ['c'],
      keywords: 'call invoke execute function method',
      section: 'Control Flow',
      subtitle: 'Call a defined function',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('functionCall', position);
      },
    },
    {
      id: 'add-variable',
      name: 'Add Variable',
      shortcut: ['v'],
      keywords: 'var value store data variable assign',
      section: 'Data',
      subtitle: 'Store and manipulate data',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('variable', position);
      },
    },
    {
      id: 'add-print',
      name: 'Add Print',
      shortcut: ['p'],
      keywords: 'print output log console display',
      section: 'Data',
      subtitle: 'Output text or variables',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('print', position);
      },
    },
    {
      id: 'add-database',
      name: 'Add Database Query',
      shortcut: ['d'],
      keywords: 'sql query database storage db',
      section: 'Data',
      subtitle: 'Execute SQL queries',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('database', position);
      },
    },
    {
      id: 'add-comment',
      name: 'Add Comment',
      shortcut: ['a'],
      keywords: 'comment annotation note documentation',
      section: 'Documentation',
      subtitle: 'Add notes and documentation',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('comment', position);
      },
    },
    {
      id: 'add-try-block',
      name: 'Add Try Block',
      shortcut: ['t'],
      keywords: 'try except error exception handling',
      section: 'Error Handling',
      subtitle: 'Handle potential errors',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('tryBlock', position);
      },
    },
    {
      id: 'add-except-block',
      name: 'Add Except Block',
      shortcut: ['x'],
      keywords: 'except catch error exception handling',
      section: 'Error Handling',
      subtitle: 'Catch specific exceptions',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('exceptBlock', position);
      },
    },
    {
      id: 'add-finally-block',
      name: 'Add Finally Block',
      shortcut: ['y'],
      keywords: 'finally cleanup error exception handling',
      section: 'Error Handling',
      subtitle: 'Execute cleanup code',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('finallyBlock', position);
      },
    },
    {
      id: 'add-operation',
      name: 'Add Operation',
      shortcut: ['o'],
      keywords: 'operation string list dict function method',
      section: 'Data',
      subtitle: 'Perform operations on strings, lists, or dictionaries',
      perform: () => {
        const nodes = useFlowStore.getState().nodes;
        const lastNode = nodes[nodes.length - 1];
        const position = lastNode ? {
          x: lastNode.position.x,
          y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 100 // Add 100px padding between nodes
        } : {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('operation', position);
      },
    },
  ], [reactFlowInstance, addNode]);

  const handleClearCanvas = useCallback(() => {
    clearCanvas();
    setIsClearDialogOpen(false);
  }, [clearCanvas]);

console.log(nodes)
  return (
    <div className="flex h-screen w-full border rounded-lg overflow-hidden" suppressHydrationWarning>
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={setReactFlowInstance}
          snapToGrid={true}
          snapGrid={[INDENTATION_WIDTH, 50]} 
          colorMode={'dark'} 
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          fitView={false}
          className="bg-background/50 backdrop-blur-[2px]"
          panOnScroll
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls className="bg-background/80 backdrop-blur-sm border rounded-md shadow-md" />
          <MiniMap className="border bg-background/80 backdrop-blur-sm rounded-md shadow-md" />
          <Panel position="top-right">
            <Suspense fallback={<CodePanelSkeleton />}>
              <CodePanel />
            </Suspense>
          </Panel>
          
          {/* Clear Canvas Button */}
          <Panel position="top-left" className="mt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-background/80 backdrop-blur-sm border rounded-md shadow-md flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clear Canvas</span>
                        <kbd className="pointer-events-none ml-1 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                          <span className="text-xs">Ctrl</span>+<span className="text-xs">Shift</span>+<span className="text-xs">C</span>
                        </kbd>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear Canvas</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to clear the canvas? This will remove all nodes and edges. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearCanvas} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Clear Canvas
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Clear all nodes and edges from the canvas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

export default CodeFlow;
