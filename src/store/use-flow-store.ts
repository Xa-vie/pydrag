import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { createCodeGenerationSlice } from './code-generation-slice';
import { createPagesSlice } from './pages-slice';

// Node data types
export interface BaseNodeData {
  label: string;
  type: string;
  measured?: {
    width: number;
    height: number;
  };
  [key: string]: unknown;
}

export interface IfNodeData extends BaseNodeData {
  type: 'ifBlock';
  condition?: string;
  elifConditions: { id: string; condition: string }[];
  hasElse: boolean;
}

export interface ElifNodeData extends BaseNodeData {
  type: 'elifBlock';
  condition?: string;
}

export interface ElseNodeData extends BaseNodeData {
  type: 'elseBlock';
}

export interface ForLoopNodeData extends BaseNodeData {
  type: 'forLoop';
  condition?: string;
}

export interface VariableNodeData extends BaseNodeData {
  type: 'variable';
  name?: string;
  value?: string;
  isReference?: boolean;
  referencedVariable?: string;
}

export interface DatabaseNodeData extends BaseNodeData {
  type: 'database';
  query?: string;
}

export interface FunctionNodeData extends BaseNodeData {
  type: 'function';
  name: string;
  internalNodes: Node<NodeData>[];
  internalEdges: Edge[];
  parameters: string[];
  returnValue: boolean;
}

export interface PrintNodeData extends BaseNodeData {
  type: 'print';
  message?: string;
}

export interface CommentNodeData extends BaseNodeData {
  type: 'comment';
  level: string;
  label: string;
  arrowStyle?: { [key: string]: string };
  generateComment: boolean;
}

export interface FunctionCallNodeData extends BaseNodeData {
  type: 'functionCall';
  label: string;
  functionName: string;
  arguments: string[];
}

export interface TryNodeData extends BaseNodeData {
  type: 'tryBlock';
  code?: string;
  error?: string;
  hasFinally?: boolean;
}

export interface ExceptNodeData extends BaseNodeData {
  type: 'exceptBlock';
  exceptionType?: string;
}

export interface FinallyNodeData extends BaseNodeData {
  type: 'finallyBlock';
}

export interface ReturnNodeData extends BaseNodeData {
  type: 'return';
  returnValue: string;
}

export interface OperationNodeData extends BaseNodeData {
  type: 'operation';
  sourceVariable?: string;
  operation?: string;
  operationValue?: string;
  createNewVariable?: boolean;
  targetVariable?: string;
  generateComment?: boolean;
}

export interface WhileNodeData extends BaseNodeData {
  type: 'whileLoop';
  condition: string;
}

export interface BreakNodeData extends BaseNodeData {
  type: 'break';
}

export interface ContinueNodeData extends BaseNodeData {
  type: 'continue';
}

export type NodeData = 
  | IfNodeData 
  | ForLoopNodeData 
  | VariableNodeData 
  | DatabaseNodeData 
  | FunctionNodeData 
  | PrintNodeData
  | CommentNodeData
  | FunctionCallNodeData
  | ElifNodeData
  | ElseNodeData
  | TryNodeData
  | ExceptNodeData
  | FinallyNodeData
  | ReturnNodeData
  | OperationNodeData
  | WhileNodeData
  | BreakNodeData
  | ContinueNodeData;

// Helper function to create initial node data
const createInitialNodeData = (type: string): NodeData => {
  const baseData = {
    measured: {
      width: 280,
      height: 72
    }
  };

  switch (type) {
    case 'ifBlock':
      return {
        ...baseData,
        type: 'ifBlock' as const,
        label: 'If Condition',
        condition: '',
        elifConditions: [],
        hasElse: false,
        generateComment: false
      };
    case 'elifBlock':
      return {
        ...baseData,
        type: 'elifBlock' as const,
        label: 'Elif Condition',
        condition: '',
        generateComment: false
      };
    case 'elseBlock':
      return {
        ...baseData,
        type: 'elseBlock' as const,
        label: 'Else',
        generateComment: false
      };
    case 'whileLoop':
      return {
        ...baseData,
        type: 'whileLoop' as const,
        label: 'While Loop',
        condition: '',
        generateComment: false
      };
    case 'forLoop':
      return {
        ...baseData,
        type: 'forLoop' as const,
        label: 'For Loop',
        condition: '',
        generateComment: false
      };
    case 'variable':
      return {
        ...baseData,
        type: 'variable' as const,
        label: 'Variable',
        value: '',
        generateComment: false
      };
    case 'database':
      return {
        ...baseData,
        type: 'database' as const,
        label: 'Database',
        query: '',
        generateComment: false
      };
    case 'function':
      return {
        ...baseData,
        type: 'function' as const,
        label: 'Function',
        name: '',
        internalNodes: [],
        internalEdges: [],
        parameters: [],
        returnValue: false,
        generateComment: false
      };
    case 'comment':
      return {
        ...baseData,
        type: 'comment' as const,
        label: 'Comment',
        level: '1',
        arrowStyle: {},
        generateComment: false
      };
    case 'operation':
      return {
        ...baseData,
        type: 'operation' as const,
        label: 'Operation',
        sourceVariable: '',
        operation: '',
        operationValue: '',
        createNewVariable: false,
        targetVariable: '',
        generateComment: false
      };
    case 'return':
      return {
        ...baseData,
        type: 'return' as const,
        label: 'Return',
        returnValue: ''
      };
    case 'print':
      return {
        ...baseData,
        type: 'print' as const,
        label: 'Print',
        message: '',
        generateComment: false
      };
    case 'break':
      return {
        ...baseData,
        type: 'break' as const,
        label: 'Break',
        generateComment: false
      };
    case 'continue':
      return {
        ...baseData,
        type: 'continue' as const,
        label: 'Continue',
        generateComment: false
      };
    default:
      return {
        ...baseData,
        type: type as const,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        generateComment: false
      };
  }
};

// Initial values
const initialEdges: Edge[] = [];

const initialNodes: Node<NodeData>[] = [
  {
    id: 'comment1',
    type: 'comment',
    position: { x: 100, y: 100 },
    data: {
      type: 'comment',
      level: '1',
      label: 'A simple Hello World program',
      arrowStyle: {},
      generateComment: true
    }
  },
  {
    id: 'print1',
    type: 'print',
    position: { x: 100, y: 350 },
    data: {
      type: 'print',
      label: 'Print',
      message: 'Hello, World!'
    }
  }
];

// Define slice types
interface NodesSlice {
  nodes: Node<NodeData>[];
  onNodesChange: OnNodesChange;
  addNode: (type: string, position: { x: number; y: number }, data?: NodeData) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  getNodes: () => Node<NodeData>[];
}

interface EdgesSlice {
  edges: Edge[];
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  getEdges: () => Edge[];
}

interface SelectionSlice {
  selectedNodes: Node<NodeData>[];
  setSelectedNodes: (nodes: Node<NodeData>[]) => void;
}

interface VariablesSlice {
  variables: Map<string, { value: string; nodeId: string }>;
  getVariable: (name: string) => string | undefined;
  setVariable: (name: string, value: string, nodeId: string) => void;
  deleteVariable: (name: string) => void;
  getAllVariables: () => string[];
}

interface CanvasSlice {
  clearCanvas: () => void;
}

// Import code generation slice from separate file
// The CodeGenerationSlice interface is imported from the separate file

// Combine all slice types including CodeGenerationSlice
type FlowStore = 
  & NodesSlice 
  & EdgesSlice 
  & SelectionSlice 
  & VariablesSlice 
  & CanvasSlice 
  & ReturnType<typeof createCodeGenerationSlice>
  & ReturnType<typeof createPagesSlice>;

// Create slices
const createNodesSlice = (set: any, get: any): NodesSlice => ({
  nodes: [...initialNodes],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[]
    });
  },
  addNode: (type: string, position: { x: number; y: number }, data?: NodeData) => {
    const nodes = get().nodes;
    const lastNode = nodes[nodes.length - 1];
    const newNode: Node<NodeData> = {
      id: crypto.randomUUID(),
      type,
      position: lastNode ? {
        x: lastNode.position.x,
        y: lastNode.position.y + (lastNode.data.measured?.height || 300) + 100
      } : position,
      data: data || createInitialNodeData(type),
    };

    set({
      nodes: [...nodes, newNode],
    });
  },
  updateNode: (id: string, newData: Partial<NodeData>) => {
    set({
      nodes: get().nodes.map((node: Node<NodeData>) => {
        if (node.id === id) {
          const updatedNode = { 
            ...node, 
            data: { ...node.data, ...newData } as NodeData
          };
          
          // Handle variable updates - delegating to variables slice
          if (node.type === 'variable' && 'name' in newData && 'name' in node.data) {
            const oldName = node.data.name as string;
            const newName = newData.name as string;
            if (oldName && newName && oldName !== newName) {
              const variables = new Map(get().variables);
              const value = variables.get(oldName);
              if (value) {
                variables.delete(oldName);
                variables.set(newName, value);
                set({ variables });
              }
            }
          }
          
          return updatedNode;
        }
        return node;
      }),
    });
  },
  deleteNode: (id: string) => {
    const node = get().nodes.find((n: Node<NodeData>) => n.id === id);
    if (node?.type === 'variable' && 'name' in node.data && node.data.name) {
      get().deleteVariable(node.data.name as string);
    }

    set({
      nodes: get().nodes.filter((node: Node<NodeData>) => node.id !== id),
    });
  },
  getNodes: () => get().nodes,
});

const createEdgesSlice = (set: any, get: any): EdgesSlice => ({
  edges: [...initialEdges],
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  getEdges: () => get().edges,
});

const createSelectionSlice = (set: any): SelectionSlice => ({
  selectedNodes: [],
  setSelectedNodes: (nodes: Node<NodeData>[]) => {
    set({ selectedNodes: nodes });
  }
});

const createVariablesSlice = (set: any, get: any): VariablesSlice => ({
  variables: new Map(),
  getVariable: (name: string) => {
    return get().variables.get(name)?.value;
  },
  setVariable: (name: string, value: string, nodeId: string) => {
    const oldVariables = get().variables;
    const variables = new Map(oldVariables);
    variables.set(name, { value, nodeId });
    set({ variables: new Map(variables) });
  },
  deleteVariable: (name: string) => {
    const oldVariables = get().variables;
    const variables = new Map(oldVariables);
    variables.delete(name);
    set({ variables: new Map(variables) });
  },
  getAllVariables: () => {
    return Array.from(get().variables.keys());
  }
});

const createCanvasSlice = (set: any): CanvasSlice => ({
  clearCanvas: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodes: [],
      variables: new Map()
    });
  }
});

// Create the combined store
export const useFlowStore = create<FlowStore>()((set, get) => ({
  ...createNodesSlice(set, get),
  ...createEdgesSlice(set, get),
  ...createSelectionSlice(set),
  ...createVariablesSlice(set, get),
  ...createCanvasSlice(set),
  ...createCodeGenerationSlice(set, get),
  ...createPagesSlice(set, get),
})); 