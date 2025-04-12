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
  [key: string]: unknown;
}

export interface IfNodeData extends BaseNodeData {
  type: 'ifBlock';
  condition?: string;
  elifConditions: { id: string; condition: string }[];
  hasElse: boolean;
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
  internalNodes: Node<NodeData>[];
  internalEdges: Edge[];
  parameters: string[];
  returnValue: boolean;
}

export interface PrintNodeData extends BaseNodeData {
  type: 'print';
  message?: string;
}

export interface AnnotationNodeData extends BaseNodeData {
  type: 'annotation';
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

export type NodeData = 
  | IfNodeData 
  | ForLoopNodeData 
  | VariableNodeData 
  | DatabaseNodeData 
  | FunctionNodeData 
  | PrintNodeData
  | AnnotationNodeData
  | FunctionCallNodeData;

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
}

// Helper function to create initial node data
const createInitialNodeData = (type: string): NodeData => {
  switch (type) {
    case 'ifBlock':
      return {
        type: 'ifBlock' as const,
        label: 'If Condition',
        condition: '',
        elifConditions: [],
        hasElse: false,
        generateComment: false
      };
    case 'forLoop':
      return {
        type: 'forLoop' as const,
        label: 'For Loop',
        condition: '',
        generateComment: false
      };
    case 'variable':
      return {
        type: 'variable' as const,
        label: 'Variable',
        value: '',
        generateComment: false
      };
    case 'database':
      return {
        type: 'database' as const,
        label: 'Database',
        query: '',
        generateComment: false
      };
    case 'function':
      return {
        type: 'function' as const,
        label: 'Function',
        internalNodes: [],
        internalEdges: [],
        parameters: [],
        returnValue: false,
        generateComment: false
      };
    case 'annotation':
      return {
        type: 'annotation' as const,
        label: 'Annotation',
        level: '1',
        arrowStyle: {},
        generateComment: false
      };
    case 'print':
    default:
      return {
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

// Initial nodes with annotations and examples
const initialNodes: Node<NodeData>[] = [
  {
    id: 'comment1',
    type: 'annotation',
    position: { x: 100, y: 100 },
    data: {
      type: 'annotation',
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
    const newNode: Node<NodeData> = {
      id: crypto.randomUUID(),
      type,
      position,
      data: data || createInitialNodeData(type),
    };

    set({
      nodes: [...get().nodes, newNode],
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
})); 