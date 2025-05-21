import { NodeData as StoreNodeData, BaseNodeData as StoreBaseNodeData } from '@/store/use-flow-store';

export interface BaseNodeData extends StoreBaseNodeData {
  [key: string]: any;
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

export interface WhileNodeData extends BaseNodeData {
  type: 'whileLoop';
  condition?: string;
}

export interface BreakNodeData extends BaseNodeData {
  type: 'break';
}

export interface ContinueNodeData extends BaseNodeData {
  type: 'continue';
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
  internalNodes: any[];
  internalEdges: any[];
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

export interface NodeComponentProps<T extends StoreBaseNodeData> {
  id: string;
  data: T;
  selected?: boolean;
} 