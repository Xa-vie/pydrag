'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import type { ComponentType } from 'react';
import {
  Background,
  NodeProps,
  Node,
  ReactFlowInstance,
  BackgroundVariant,
  useKeyPress,
  useOnSelectionChange,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '@/store/use-flow-store';
import { useRegisterActions } from 'kbar';
import type { NodeData } from '@/store/use-flow-store';
import { snapToIndentation, INDENTATION_WIDTH } from './utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Import all nodes directly
import IfNode from './nodes/IfNode';
import ElifNode from './nodes/ElifNode';
import ElseNode from './nodes/ElseNode';
import ForLoopNode from './nodes/ForLoopNode';
import WhileNode from './nodes/WhileNode';
import VariableNode from './nodes/VariableNode';
import DatabaseNode from './nodes/DatabaseNode';
import PrintNode from './nodes/PrintNode';
import FunctionNode from './nodes/FunctionNode';
import CommentNode from './nodes/CommentNode';
import FunctionCallNode from './nodes/FunctionCallNode';
import TryBlockNode from './nodes/TryBlockNode';
import ExceptBlockNode from './nodes/ExceptBlockNode';
import FinallyBlockNode from './nodes/FinallyBlockNode';
import ReturnNode from './nodes/ReturnNode';
import OperationNode from './nodes/OperationNode';
import BreakNode from './nodes/BreakNode';
import ContinueNode from './nodes/ContinueNode';

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

const ClearButtonSkeleton = () => (
  <div className="mt-2">
    <Skeleton className="h-9 w-32" />
  </div>
);

// Dynamic imports for layout components with loading states
const Sidebar = dynamic(() => import('./flow-sidebar-content'), { 
  ssr: false,
  loading: () => <SidebarSkeleton />
});
const CodePanel = dynamic(() => import('./code-panel'), { 
  ssr: false,
  loading: () => <CodePanelSkeleton />
});
const ClearCanvasButton = dynamic(() => import('./clear-canvas-button'), { 
  ssr: false,
  loading: () => <ClearButtonSkeleton />
});

// Node types configuration
const nodeTypes = {
  ifBlock: IfNode as unknown as ComponentType<NodeProps>,
  elifBlock: ElifNode as unknown as ComponentType<NodeProps>,
  elseBlock: ElseNode as unknown as ComponentType<NodeProps>,
  forLoop: ForLoopNode as unknown as ComponentType<NodeProps>,
  whileLoop: WhileNode as unknown as ComponentType<NodeProps>,
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
  break: BreakNode as unknown as ComponentType<NodeProps>,
  continue: ContinueNode as unknown as ComponentType<NodeProps>,
};

// Move KBar actions outside component
const flowActions = [
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
      const position = lastNode ? {
        x: lastNode.position.x,
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('ifBlock', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('elifBlock', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('elseBlock', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('forLoop', position);
    },
  },
  {
    id: 'add-while-loop',
    name: 'Add While Loop',
    shortcut: ['w'],
    keywords: 'loop iterate repeat while condition',
    section: 'Control Flow',
    subtitle: 'Create loops that run while a condition is true',
    perform: () => {
      const nodes = useFlowStore.getState().nodes;
      const lastNode = nodes[nodes.length - 1];
      const position = lastNode ? {
        x: lastNode.position.x,
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('whileLoop', position);
    },
  },
  {
    id: 'add-break',
    name: 'Add Break',
    shortcut: ['b'],
    keywords: 'break exit loop stop',
    section: 'Control Flow',
    subtitle: 'Exit the current loop',
    perform: () => {
      const nodes = useFlowStore.getState().nodes;
      const lastNode = nodes[nodes.length - 1];
      const position = lastNode ? {
        x: lastNode.position.x,
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('break', position);
    },
  },
  {
    id: 'add-continue',
    name: 'Add Continue',
    shortcut: ['q'],
    keywords: 'continue next iteration loop skip',
    section: 'Control Flow',
    subtitle: 'Skip to the next iteration of the loop',
    perform: () => {
      const nodes = useFlowStore.getState().nodes;
      const lastNode = nodes[nodes.length - 1];
      const position = lastNode ? {
        x: lastNode.position.x,
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('continue', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('function', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('functionCall', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('variable', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('print', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('database', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('comment', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('tryBlock', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('exceptBlock', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('finallyBlock', position);
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
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('operation', position);
    },
  },
  {
    id: 'add-return-node',
    name: 'Add Return',
    shortcut: ['r'],
    keywords: 'return value function result exit',
    section: 'Control Flow',
    subtitle: 'Return a value from a function',
    perform: () => {
      const nodes = useFlowStore.getState().nodes;
      const lastNode = nodes[nodes.length - 1];
      const position = lastNode ? {
        x: lastNode.position.x,
        y: lastNode.position.y + (lastNode.data.measured?.height || 72) + 150
      } : {
        x: 100,
        y: 100
      };
      useFlowStore.getState().addNode('return', position);
    },
  },
];

export function CodeFlow() {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

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

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      position.x = snapToIndentation(position.x);

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
        case 'whileLoop':
          initialData = {
            type: 'whileLoop',
            label: 'While Loop',
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
        case 'break':
          initialData = {
            type: 'break',
            label: 'Break'
          };
          break;
        case 'continue':
          initialData = {
            type: 'continue',
            label: 'Continue'
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
    [reactFlowInstance, addNode]
  );

  // Update KBar registration to use external actions
  useRegisterActions(flowActions, [reactFlowInstance, addNode]);

  return (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onDrop={onDrop}
      nodesFocusable={false}
          onDragOver={onDragOver}
          onInit={setReactFlowInstance}
          snapToGrid={true}
          snapGrid={[INDENTATION_WIDTH, 75]} 
          colorMode={'dark'} 
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          fitView={false}
      className="bg-background/95"
          panOnScroll
          defaultEdgeOptions={{
            style: { strokeWidth: 2, stroke: 'rgba(var(--primary), 0.8)' },
            type: 'smoothstep',
            markerEnd: 'arrow',
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={2} color="#888" />
      <Controls className="bg-background/95 border-2 rounded-md shadow-md" />
      <MiniMap className="border-2 bg-background/95 rounded-md shadow-md" />
          <Panel position="top-right">
            <Suspense fallback={<CodePanelSkeleton />}>
              <CodePanel />
            </Suspense>
          </Panel>
          
          {/* Clear Canvas Button */}
          <Suspense fallback={<ClearButtonSkeleton />}>
            <ClearCanvasButton clearCanvas={clearCanvas} />
          </Suspense>
        </ReactFlow>
  );
}

export default CodeFlow;
