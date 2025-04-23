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
  dataType?: 'string' | 'list' | 'dict';
  targetVariable?: string;
  operation?: string;
  parameters: string[];
  resultVariable?: string;
  generateComment: boolean;
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
  | OperationNodeData;

interface FlowState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodes: Node<NodeData>[];
  variables: Map<string, { value: string; nodeId: string }>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: string, position: { x: number; y: number }, data?: NodeData) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  setSelectedNodes: (nodes: Node<NodeData>[]) => void;
  getVariable: (name: string) => string | undefined;
  setVariable: (name: string, value: string, nodeId: string) => void;
  deleteVariable: (name: string) => void;
  getAllVariables: () => string[];
  clearCanvas: () => void;
}

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
        dataType: undefined,
        targetVariable: undefined,
        operation: '',
        parameters: [],
        resultVariable: '',
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
    default:
      return {
        ...baseData,
        type: 'print' as const,
        label: 'Print',
        message: '',
        generateComment: false
      };
  }
};

// Add initial edges
const initialEdges: Edge[] = [

];

// Initial nodes with comments and examples
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

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [...initialNodes],
  edges: [...initialEdges],
  selectedNodes: [],
  variables: new Map(),
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[],
    });
  },
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
  addNode: (type: string, position: { x: number; y: number }, data?: NodeData) => {
    const nodes = get().nodes;
    const lastNode = nodes[nodes.length - 1];
    const newNode: Node<NodeData> = {
      id: crypto.randomUUID(),
      type,
      position: lastNode ? {
        x: lastNode.position.x,
        y: lastNode.position.y + (lastNode.data.measured?.height || 300) + 100 // Add 100px padding between nodes
      } : position,
      data: data || createInitialNodeData(type),
    };

    set({
      nodes: [...nodes, newNode],
    });
  },
  updateNode: (id: string, newData: Partial<NodeData>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          const updatedNode = { ...node, data: { ...node.data, ...newData } };
          
          // Handle variable updates
          if (node.type === 'variable' && 'name' in newData) {
            const oldName = node.data.name;
            const newName = newData.name;
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
    const node = get().nodes.find(n => n.id === id);
    if (node?.type === 'variable' && node.data.name) {
      get().deleteVariable(node.data.name);
    }

    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    });
  },
  setSelectedNodes: (nodes: Node<NodeData>[]) => {
    set({ selectedNodes: nodes });
  },
  getVariable: (name: string) => {
    return get().variables.get(name)?.value;
  },
  setVariable: (name: string, value: string, nodeId: string) => {
    const variables = new Map(get().variables);
    variables.set(name, { value, nodeId });
    set({ variables });
  },
  deleteVariable: (name: string) => {
    const variables = new Map(get().variables);
    variables.delete(name);
    set({ variables });
  },
  getAllVariables: () => {
    return Array.from(get().variables.keys());
  },
  clearCanvas: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodes: [],
      variables: new Map()
    });
  },
})); 