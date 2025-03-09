'use client';

import { memo, useMemo, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { usePython } from 'react-py';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  NodeProps,
  Connection,
  Edge,
  addEdge,
  Node,
  ReactFlowInstance,
  BackgroundVariant,
  NodeTypes,
  OnNodesChange,
  OnEdgesChange,
  Panel,
  useKeyPress,
  useOnSelectionChange,
  applyNodeChanges,
  applyEdgeChanges,
  NodeToolbar,
} from '@xyflow/react';
import { Terminal, ChevronRight, GitBranch, Repeat, Code2, ArrowRightLeft, Database, Trash2, Code, Play, type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import '@xyflow/react/dist/style.css';
import { useTheme } from 'next-themes';
import { useFlowStore } from '@/store/use-flow-store';
import { Button } from '../ui/button';
import { 
  KBarProvider, 
  KBarPortal, 
  KBarPositioner, 
  KBarAnimator, 
  KBarSearch,
  useRegisterActions,
  KBarResults,
  useMatches,
} from 'kbar';
import { ComponentType } from 'react';

// Available node types for the sidebar
const nodeCategories = [
  {
    id: 'control',
    label: 'Control Flow',
    items: [
      { type: 'ifBlock', label: 'If Condition', icon: GitBranch, shortcut: 'i' },
      { type: 'forLoop', label: 'For Loop', icon: Repeat, shortcut: 'f' },
      { type: 'function', label: 'Function', icon: Code2, shortcut: 's' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      { type: 'print', label: 'Print', icon: Terminal, shortcut: 'p' },
      { type: 'variable', label: 'Variable', icon: ArrowRightLeft, shortcut: 'v' },
      { type: 'database', label: 'Database', icon: Database, shortcut: 'd' },
    ],
  },
];

// Sidebar component
const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-[240px] p-4 bg-muted/50 border-r">
      <div className="space-y-4">
      {nodeCategories.map((category) => (
          <div key={category.id} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {category.label}
            </h3>
            <div className="space-y-1">
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                    className="flex items-center justify-between rounded-md border bg-background px-3 py-2 cursor-grab hover:bg-accent hover:text-accent-foreground transition-colors"
                  draggable
                    onDragStart={(event) => onDragStart(event, item.type)}
                >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                    </div>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {item.shortcut}
                    </kbd>
                </div>
              );
            })}
          </div>
        </div>
      ))}
        <div className="pt-4">
          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                ⌘
              </kbd>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                K
              </kbd>
              <span>to search nodes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Base type for node data
interface BaseNodeData extends Record<string, unknown> {
  label: string;
  onDelete?: () => void;
  type: string;
}

// Specific node data types
interface IfNodeData extends Record<string, unknown> {
  type: 'ifBlock';
  label: string;
  condition?: string;
  elifConditions: { id: string; condition: string }[];
  hasElse: boolean;
}

interface ForLoopNodeData extends Record<string, unknown> {
  type: 'forLoop';
  label: string;
  condition?: string;
  updateCondition?: (value: string) => void;
}

interface VariableNodeData extends Record<string, unknown> {
  type: 'variable';
  label: string;
  name?: string;
  value?: string;
}

interface DatabaseNodeData extends Record<string, unknown> {
  type: 'database';
  label: string;
  query?: string;
  updateQuery?: (value: string) => void;
}

interface FunctionNodeData extends Record<string, unknown> {
  type: 'function';
  label: string;
  internalNodes: Node<NodeData>[];
  internalEdges: Edge[];
}

interface PrintNodeData extends Record<string, unknown> {
  type: 'print';
  label: string;
  message?: string;
  updateMessage?: (value: string) => void;
}

// Union type for all node data
export type NodeData = IfNodeData | ForLoopNodeData | VariableNodeData | DatabaseNodeData | FunctionNodeData | PrintNodeData;

// Type guard functions
const isIfNodeData = (data: NodeData): data is IfNodeData => data.type === 'ifBlock';
const isForLoopNodeData = (data: NodeData): data is ForLoopNodeData => data.type === 'forLoop';
const isVariableNodeData = (data: NodeData): data is VariableNodeData => data.type === 'variable';
const isDatabaseNodeData = (data: NodeData): data is DatabaseNodeData => data.type === 'database';
const isFunctionNodeData = (data: NodeData): data is FunctionNodeData => data.type === 'function';
const isPrintNodeData = (data: NodeData): data is PrintNodeData => data.type === 'print';

// Custom props type for node components
interface NodeComponentProps<T extends NodeData> {
  id: string;
  data: T;
  selected?: boolean;
}

// Node wrapper with delete button and toolbar
const NodeWrapper = ({ 
  children, 
  onDelete,
  icon: Icon,
  label,
  selected,
}: { 
  children: ReactNode; 
  onDelete?: () => void;
  icon: LucideIcon;
  label: string;
  selected?: boolean;
}) => (
  <div className={clsx(
    "relative group min-w-[200px]",
    "rounded-lg border shadow-sm",
    "bg-background transition-all duration-200",
    selected && "ring-2 ring-primary ring-offset-2",
    !selected && "hover:shadow-md"
  )}>
    <NodeToolbar 
      isVisible 
      className="flex items-center gap-2 p-2 border-b rounded-t-lg bg-muted/50"
      position={Position.Top}
    >
      <div className="flex items-center gap-2 flex-1">
        <div className="p-1 rounded-md bg-primary/10">
          <Icon size={16} className="text-primary" />
        </div>
        <span className="font-medium text-sm">{label}</span>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 size={14} />
        </button>
      )}
    </NodeToolbar>
    <div className="p-3">
    {children}
    </div>
  </div>
);
NodeWrapper.displayName = 'NodeWrapper';

// Node Types
const IfNode = memo(({ data, id, selected }: NodeComponentProps<IfNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const deleteNode = useFlowStore(state => state.deleteNode);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const availableVariables = getAllVariables();

  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      ...data,
      condition: e.target.value
    } as IfNodeData);
  };

  const handleElifConditionChange = (elifId: string, value: string) => {
    const newElifConditions = data.elifConditions?.map(elif => 
      elif.id === elifId ? { ...elif, condition: value } : elif
    ) || [];
    
    updateNode(id, {
      ...data,
      elifConditions: newElifConditions
    } as IfNodeData);
  };

  const addElifCondition = () => {
    const newElifConditions = [...(data.elifConditions || []), { 
      id: crypto.randomUUID(), 
      condition: '' 
    }];
    
    updateNode(id, {
      ...data,
      elifConditions: newElifConditions
    } as IfNodeData);
  };

  const removeElifCondition = (elifId: string) => {
    const newElifConditions = data.elifConditions?.filter(elif => elif.id !== elifId) || [];
    
    updateNode(id, {
      ...data,
      elifConditions: newElifConditions
    } as IfNodeData);
  };

  const toggleElse = () => {
    updateNode(id, {
      ...data,
      hasElse: !data.hasElse
    } as IfNodeData);
  };

  // Helper to show variable suggestions
  const renderVariableSuggestions = () => {
    if (availableVariables.length === 0) return null;
    return (
      <div className="mt-2 space-y-1">
        <p className="text-[10px] text-muted-foreground">Available Variables:</p>
        <div className="flex flex-wrap gap-1">
          {availableVariables.map(varName => {
            const value = getVariable(varName);
            return (
              <button
                key={varName}
                onClick={() => handleConditionChange({ target: { value: varName } } as any)}
                className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted hover:bg-muted/80 transition-colors"
                title={`Value: ${value}`}
              >
                {varName}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <NodeWrapper 
      onDelete={() => deleteNode(id)}
      icon={GitBranch}
      label="If Condition"
      selected={selected}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-muted-foreground/50 hover:!bg-muted-foreground transition-colors"
        id="in"
      />
      <div className="space-y-4">
        {/* If condition */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">If Condition</label>
          <div className="relative">
          <input
            value={data.condition || ''}
              onChange={handleConditionChange}
              placeholder="x > 0"
              className="w-full rounded-md border bg-background pl-7 pr-10 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <GitBranch 
              size={14} 
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Handle 
              type="source" 
              position={Position.Right} 
              className="!w-3 !h-3 !bg-green-500/50 hover:!bg-green-500 transition-colors"
              id="true"
            >
              <div className="absolute top-1/2 left-full -translate-y-1/2 ml-1 min-w-[40px]">
                <div className="text-[10px] font-medium bg-background/50 px-2 py-0.5 rounded-sm border shadow-sm whitespace-nowrap">
                  True
        </div>
              </div>
            </Handle>
          </div>
          {renderVariableSuggestions()}
        </div>

        {/* Elif conditions */}
        {data.elifConditions?.map((elif, index) => (
          <div key={elif.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Elif Condition {index + 1}</label>
              <button
                onClick={() => removeElifCondition(elif.id)}
                className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="relative">
              <input
                value={elif.condition}
                onChange={(e) => handleElifConditionChange(elif.id, e.target.value)}
                placeholder="x < 0"
                className="w-full rounded-md border bg-background pl-7 pr-10 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <GitBranch 
                size={14} 
                className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Handle 
                type="source" 
                position={Position.Right} 
                className="!w-3 !h-3 !bg-yellow-500/50 hover:!bg-yellow-500 transition-colors"
                id={`elif-${elif.id}`}
              >
                <div className="absolute top-1/2 left-full -translate-y-1/2 ml-1">
                  <div className="text-[10px] font-medium bg-background/50 px-2 py-0.5 rounded-sm border shadow-sm whitespace-nowrap">
                    {elif.condition ? `Elif: ${elif.condition}` : `Elif ${index + 1}`}
                  </div>
                </div>
              </Handle>
            </div>
            {renderVariableSuggestions()}
          </div>
        ))}

        {/* Add elif and else buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={addElifCondition}
            className="flex-1 text-xs h-7 bg-muted hover:bg-muted/80"
          >
            Add Elif
          </Button>
          <Button
            onClick={toggleElse}
            className={clsx(
              "flex-1 text-xs h-7",
              data.hasElse ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            {data.hasElse ? 'Remove Else' : 'Add Else'}
          </Button>
        </div>

        {data.hasElse && (
          <div className="relative mt-4">
            <div className="rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground">
              Else block
            </div>
            <Handle 
              type="source" 
              position={Position.Right} 
              className="!w-3 !h-3 !bg-red-500/50 hover:!bg-red-500 transition-colors"
              id="else"
            >
              <div className="absolute top-1/2 left-full -translate-y-1/2 ml-1 min-w-[40px]">
                <div className="text-[10px] font-medium bg-background/50 px-2 py-0.5 rounded-sm border shadow-sm whitespace-nowrap">
                  Else
                </div>
              </div>
            </Handle>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground mt-4">
          Use variables in conditions by clicking them below or typing their names
        </div>
      </div>
    </NodeWrapper>
  );
});
IfNode.displayName = 'IfNode';

const ForLoopNode = memo(({ data, id, selected }: NodeComponentProps<ForLoopNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const deleteNode = useFlowStore(state => state.deleteNode);

  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData: ForLoopNodeData = {
      ...data,
      condition: e.target.value
    };
    updateNode(id, newData);
  };

  return (
    <NodeWrapper 
      onDelete={() => deleteNode(id)}
      icon={Repeat}
      label="For Loop"
      selected={selected}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-muted-foreground/50 hover:!bg-muted-foreground transition-colors"
        id="in"
      />
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Loop Condition</label>
          <input
            value={data.condition || ''}
            onChange={handleConditionChange}
          placeholder="i in range(10)"
          className="w-full rounded-md border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-primary/50 hover:!bg-primary transition-colors"
        id="body"
        style={{ left: '25%' }}
      >
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-background/50 px-1.5 py-0.5 rounded-sm border shadow-sm">Body</div>
      </Handle>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-muted-foreground/50 hover:!bg-muted-foreground transition-colors"
        id="next"
        style={{ left: '75%' }}
      >
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-background/50 px-1.5 py-0.5 rounded-sm border shadow-sm">Next</div>
      </Handle>
    </NodeWrapper>
  );
});
ForLoopNode.displayName = 'ForLoopNode';

const VariableNode = memo(({ data, id, selected }: NodeComponentProps<VariableNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const deleteNode = useFlowStore(state => state.deleteNode);
  const setVariable = useFlowStore(state => state.setVariable);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  
  // Filter out the current variable from available variables
  const availableVariables = useMemo(() => {
    const allVars = getAllVariables();
    return allVars.filter(varName => varName !== data.name);
  }, [getAllVariables, data.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.trim();
    const newData: VariableNodeData = {
      ...data,
      name: newName
    };
    updateNode(id, newData);
    if (newName) {
      setVariable(newName, data.value || '', id);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newData: VariableNodeData = {
      ...data,
      value: newValue
    };
    updateNode(id, newData);
    
    // Update the variable in the store if we have a name
    if (data.name) {
      setVariable(data.name, newValue, id);
    }
  };

  // Insert variable at cursor position
  const insertVariable = (varName: string) => {
    const input = document.getElementById(`variable-value-${id}`) as HTMLInputElement;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = data.value || '';
    
    // Insert variable name at cursor position
    const newValue = currentValue.slice(0, start) + varName + currentValue.slice(end);
    
    handleValueChange({ target: { value: newValue } } as any);

    // Reset cursor position after the inserted variable
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + varName.length, start + varName.length);
    }, 0);
  };

  return (
    <NodeWrapper 
      onDelete={() => deleteNode(id)}
      icon={ArrowRightLeft}
      label="Variable"
      selected={selected}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-muted-foreground/50 hover:!bg-muted-foreground transition-colors"
        id="in"
      />
      <div className="space-y-3">
        {/* Variable Name Input */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Variable Name</label>
          <input
            value={data.name || ''}
            onChange={handleNameChange}
            placeholder="my_variable"
            className="w-full rounded-md border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Value Input with Variable Suggestions */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Value or Expression</label>
          <div>
            <input
              id={`variable-value-${id}`}
              value={data.value || ''}
              onChange={handleValueChange}
              placeholder="Enter value (e.g. 42, 'hello', x + 1)"
              className="w-full rounded-md border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Available Variables */}
          {availableVariables.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">Available variables:</p>
              <div className="flex flex-wrap gap-1">
                {availableVariables.map(varName => {
                  const value = getVariable(varName);
                  return (
                    <button
                      key={varName}
                      onClick={() => insertVariable(varName)}
                      className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted hover:bg-muted/80 transition-colors"
                      title={`${varName} = ${value}`}
                    >
                      {varName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-[10px] text-muted-foreground">
            Enter a value or click variables above to use them in expressions
          </div>
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-primary/50 hover:!bg-primary transition-colors"
        id="out"
      >
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-background/50 px-1.5 py-0.5 rounded-sm border shadow-sm">Next</div>
      </Handle>
    </NodeWrapper>
  );
});
VariableNode.displayName = 'VariableNode';

const DatabaseNode = memo(({ data, id, selected }: NodeProps<DatabaseNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const deleteNode = useFlowStore(state => state.deleteNode);

  return (
    <NodeWrapper 
      onDelete={() => deleteNode(id)}
      icon={Database}
      label="Database"
      selected={selected}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-muted-foreground/50 hover:!bg-muted-foreground transition-colors"
        id="in"
      />
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">SQL Query</label>
          <input
            value={data.query || ''}
            onChange={(e) => updateNode(id, { query: e.target.value })}
          placeholder="SELECT * FROM users"
          className="w-full rounded-md border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-green-500/50 hover:!bg-green-500 transition-colors"
        id="success"
        style={{ left: '25%' }}
      >
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-background/50 px-1.5 py-0.5 rounded-sm border shadow-sm">Success</div>
      </Handle>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-red-500/50 hover:!bg-red-500 transition-colors"
        id="error"
        style={{ left: '75%' }}
      >
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-background/50 px-1.5 py-0.5 rounded-sm border shadow-sm">Error</div>
      </Handle>
    </NodeWrapper>
  );
});
DatabaseNode.displayName = 'DatabaseNode';

const PrintNode = memo(({ data, id, selected }: NodeComponentProps<PrintNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const deleteNode = useFlowStore(state => state.deleteNode);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const availableVariables = getAllVariables();

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData: PrintNodeData = {
      ...data,
      message: e.target.value
    };
    updateNode(id, newData);
  };

  // Insert variable at cursor position
  const insertVariable = (varName: string) => {
    const input = document.getElementById(`print-input-${id}`) as HTMLInputElement;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentMessage = data.message || '';
    
    // Insert {varName} at cursor position
    const newMessage = currentMessage.slice(0, start) + `{${varName}}` + currentMessage.slice(end);
    
    updateNode(id, {
      type: 'print',
      label: 'Print',
      message: newMessage
    });

    // Reset cursor position after the inserted variable
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + varName.length + 2, start + varName.length + 2);
    }, 0);
  };

  return (
    <NodeWrapper 
      onDelete={() => deleteNode(id)}
      icon={Terminal}
      label="Print"
      selected={selected}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-muted-foreground/50 hover:!bg-muted-foreground transition-colors"
        id="in"
      />
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Message</label>
          <div className="relative">
            <input
              id={`print-input-${id}`}
              value={data.message || ''}
              onChange={handleMessageChange}
              placeholder="Enter text or click variables below to insert them"
              className="w-full rounded-md border bg-background pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Terminal 
              size={14} 
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        {/* Variable suggestions */}
        {availableVariables.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Click to insert variable:</p>
            <div className="flex flex-wrap gap-1">
              {availableVariables.map(varName => {
                const value = getVariable(varName);
                return (
                  <button
                    key={varName}
                    onClick={() => insertVariable(varName)}
                    className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted hover:bg-muted/80 transition-colors"
                    title={`Current value: ${value}`}
                  >
                    {varName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground">
          Type text and click variables to insert them. Variables will appear as {'{variable_name}'}
      </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-primary/50 hover:!bg-primary transition-colors"
        id="out"
      >
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-background/50 px-1.5 py-0.5 rounded-sm border shadow-sm">Next</div>
      </Handle>
    </NodeWrapper>
  );
});
PrintNode.displayName = 'PrintNode';

const FunctionNode = memo(({ data, id, selected }: NodeProps<FunctionNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const deleteNode = useFlowStore(state => state.deleteNode);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      ...data,
      type: 'function',
      label: e.target.value
    });
  };

  return (
    <NodeWrapper 
      onDelete={() => deleteNode(id)}
      icon={Code2}
      label="Function"
      selected={selected}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-muted-foreground/50 hover:!bg-muted-foreground transition-colors"
        id="in"
      />
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Function Name</label>
        <div className="relative">
          <input
            value={data.label || ''}
            onChange={handleNameChange}
            placeholder="my_function"
            className="w-full rounded-md border bg-background pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Code2 
            size={14} 
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">
          Connect nodes to the body handle to define function contents
      </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-primary/50 hover:!bg-primary transition-colors"
        id="body"
      >
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-background/50 px-2 py-0.5 rounded-sm border shadow-sm">Body</div>
      </Handle>
    </NodeWrapper>
  );
});
FunctionNode.displayName = 'FunctionNode';

const flowKey = 'python-flow';

// Initial nodes for testing
const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'print',
    position: { x: 100, y: 100 },
    data: { 
      type: 'print',
      label: 'Print',
      message: 'Hello, World!'
    }
  }
];

// Code generation functions
const generateNodeCode = (node: Node<NodeData>, edges: Edge[], allNodes: Node<NodeData>[], indent: number = 0): string => {
  const spaces = ' '.repeat(indent * 4);
  
  // Get all available variables for expression validation
  const allVariables = allNodes
    .filter(n => n.type === 'variable' && isVariableNodeData(n.data) && n.data.name)
    .map(n => (n.data as VariableNodeData).name!)
    .filter(Boolean);

  const getChildNodesForHandle = (handleId: string) => {
    return edges
      .filter(edge => edge.source === node.id && edge.sourceHandle === handleId)
    .map(edge => allNodes.find(n => n.id === edge.target))
    .filter((n): n is Node<NodeData> => n !== undefined);
  };

  const generateBodyForHandle = (handleId: string, extraIndent: number = 1) => {
    const childNodes = getChildNodesForHandle(handleId);
    if (childNodes.length > 0) {
      return '\n' + childNodes
        .map(child => generateNodeCode(child, edges, allNodes, indent + extraIndent))
        .join('\n');
    }
    return `\n${spaces}${' '.repeat(4)}pass`;
  };

  // Helper to format condition expressions
  const formatCondition = (condition: string) => {
    // If it's a simple variable name, use it as is
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(condition)) {
      return condition;
    }
    // If it contains comparison operators, keep as is
    if (/[<>=!]+/.test(condition)) {
      return condition;
    }
    // Otherwise wrap in quotes
    return `"${condition}"`;
  };

  switch (node.type) {
    case 'print':
      if (isPrintNodeData(node.data)) {
        const message = node.data.message || 'Hello, World!';
        // Check if the message contains any variables
        if (message.includes('{') && message.includes('}')) {
          // Convert the message to an f-string
          return `${spaces}print(f"${message}")`;
        } else {
          // Regular string if no variables
          return `${spaces}print("${message}")`;
        }
      }
      return `${spaces}print("Hello, World!")`;
    case 'ifBlock':
      if (isIfNodeData(node.data)) {
        let code = `${spaces}if ${formatCondition(node.data.condition || 'True')}:${generateBodyForHandle('true')}`;
        
        // Add elif blocks
        node.data.elifConditions?.forEach(elif => {
          code += `\n${spaces}elif ${formatCondition(elif.condition || 'True')}:${generateBodyForHandle(`elif-${elif.id}`)}`;
        });
        
        // Add else block if it exists
        if (node.data.hasElse) {
          code += `\n${spaces}else:${generateBodyForHandle('else')}`;
        }
        
        return code;
      }
      return `${spaces}if True:${generateBodyForHandle('true')}`;
    case 'forLoop':
      if (isForLoopNodeData(node.data)) {
        return `${spaces}for ${node.data.condition || 'i in range(10)'}:${generateBodyForHandle('body')}`;
      }
      return `${spaces}for i in range(10):${generateBodyForHandle('body')}`;
    case 'variable':
      if (isVariableNodeData(node.data)) {
        const name = node.data.name || 'variable';
        const value = node.data.value || 'None';
        
        // Try to infer if the value is a number, boolean, or expression
        if (value === 'true' || value === 'false') {
          return `${spaces}${name} = ${value.toLowerCase()}`;
        } else if (!isNaN(Number(value))) {
          return `${spaces}${name} = ${value}`;
        } else if (value.includes('+') || value.includes('-') || value.includes('*') || value.includes('/') || 
                  allVariables.some(v => value.includes(v))) {
          return `${spaces}${name} = ${value}`;
        } else {
          return `${spaces}${name} = "${value}"`;
        }
      }
      return `${spaces}variable = None`;
    case 'database':
      if (isDatabaseNodeData(node.data)) {
      return `${spaces}# Database Query\n${spaces}${node.data.query || '# Enter SQL query'}`;
      }
      return `${spaces}# Database Query\n${spaces}# Enter SQL query`;
    case 'function': {
      if (isFunctionNodeData(node.data)) {
        const bodyNodes = getChildNodesForHandle('body');
        const bodyCode = bodyNodes.length > 0
          ? '\n' + bodyNodes
              .map(child => generateNodeCode(child, edges, allNodes, indent + 1))
              .join('\n')
          : `\n${spaces}    pass`;

        return `${spaces}def ${node.data.label?.toLowerCase().replace(/\s+/g, '_') || 'my_function'}():${bodyCode}`;
      }
      return `${spaces}def my_function():\n${spaces}    pass`;
    }
    default:
      return `${spaces}# Unknown node type: ${node.type}`;
  }
};

// Code Panel Component
const CodePanel = memo(({ nodes, edges }: { nodes: Node<NodeData>[]; edges: Edge[] }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { runPython, stdout, stderr, isLoading } = usePython();
  
  const generatedCode = useMemo(() => {
    // Find root nodes (nodes with no incoming edges)
    const rootNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    // Generate code starting from root nodes
    return rootNodes
      .sort((a, b) => a.position.y - b.position.y)
      .map(node => generateNodeCode(node, edges, nodes))
      .join('\n\n');
  }, [nodes, edges]);

  const handleRunCode = async () => {
    await runPython(generatedCode);
  };

  return (
    <div className={clsx(
      "absolute right-0 top-0 bottom-0 bg-background border-l shadow-lg transition-all duration-300 h-screen",
      isOpen ? "w-[400px]" : "w-0"
    )}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-background border rounded-l-md p-2 hover:bg-accent transition-colors"
      >
        <ChevronRight className={clsx("transition-transform", { "rotate-180": isOpen })} />
      </Button>
      {isOpen && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10">
                <Code size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Python Code</h3>
                <p className="text-xs text-muted-foreground">Generated from your flow</p>
              </div>
            </div>
            <Button
              onClick={handleRunCode}
              disabled={isLoading}
              size="sm"
              className={clsx(
                "flex items-center gap-2 px-4",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Play size={16} />
              {isLoading ? 'Running...' : 'Run Code'}
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden grid grid-rows-[1fr,auto]">
            {/* Code Section */}
            <div className="p-4 overflow-auto border-b">
              <div className="rounded-lg border bg-muted/50">
                <div className="border-b bg-muted px-4 py-2 text-sm font-medium">Code</div>
                <pre className="p-4 overflow-auto">
                  <code className="block font-mono text-sm whitespace-pre">{generatedCode}</code>
          </pre>
              </div>
              </div>

            {/* Output Section - Always visible but shows "No output yet" when empty */}
            <div className="p-4 bg-muted/10">
              <div className="rounded-lg border">
                <div className="border-b px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-primary" />
                    <h4 className="font-medium text-sm">Output</h4>
            </div>
                  {(stdout || stderr) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        // Clear output functionality can be added here
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="p-4 min-h-[150px] max-h-[300px] overflow-auto">
                  {stdout || stderr ? (
                    <>
                      {stdout && <pre className="text-sm text-green-500/90 mb-2">{stdout}</pre>}
                      {stderr && <pre className="text-sm text-red-500/90">{stderr}</pre>}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Terminal size={24} className="mb-2 opacity-50" />
                      <p className="text-sm">No output yet</p>
                      <p className="text-xs">Run your code to see the results</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
CodePanel.displayName = 'CodePanel';

const nodeTypes = {
  ifBlock: IfNode as unknown as ComponentType<NodeProps>,
  forLoop: ForLoopNode as unknown as ComponentType<NodeProps>,
  variable: VariableNode as unknown as ComponentType<NodeProps>,
  database: DatabaseNode as unknown as ComponentType<NodeProps>,
  print: PrintNode as unknown as ComponentType<NodeProps>,
  function: FunctionNode as unknown as ComponentType<NodeProps>,
}

export function CodeFlow() {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { theme } = useTheme();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodes,
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

  const internalNodeTypes = useMemo<NodeTypes>(() => ({
    ifBlock: IfNode,
    forLoop: ForLoopNode,
    variable: VariableNode,
    database: DatabaseNode,
  }), []);



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

      // Initialize node data based on type
      let initialData: NodeData;
      switch (type) {
        case 'ifBlock':
          initialData = {
            type: 'ifBlock',
            label: 'If Condition',
            condition: '',
            elifConditions: [],
            hasElse: false
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
            internalNodes: [],
            internalEdges: []
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
      name: 'Add If Node',
      shortcut: ['i'],
      keywords: 'condition branch flow control',
      perform: () => {
        const position = {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('ifBlock', position);
      },
    },
    {
      id: 'add-for-loop',
      name: 'Add For Loop',
      shortcut: ['f'],
      keywords: 'loop iterate repeat',
      perform: () => {
        const position = {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('forLoop', position);
      },
    },
    {
      id: 'add-variable',
      name: 'Add Variable',
      shortcut: ['v'],
      keywords: 'var value store data',
      perform: () => {
        const position = {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('variable', position);
      },
    },
    {
      id: 'add-database',
      name: 'Add Database Query',
      shortcut: ['d'],
      keywords: 'sql query database storage',
      perform: () => {
        const position = {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('database', position);
      },
    },
    {
      id: 'add-print',
      name: 'Add Print Node',
      shortcut: ['p'],
      keywords: 'print output log console',
      perform: () => {
        const position = {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('print', position);
      },
    },
    {
      id: 'add-function',
      name: 'Add Function',
      shortcut: ['s'],
      keywords: 'function def method nested',
      perform: () => {
        const position = {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('function', position);
      },
    },
  ], [reactFlowInstance, addNode]);

  return (
    <KBarProvider>
      {/* <KBarPortal>
        <KBarPositioner className="z-50">
          <KBarAnimator className="w-[600px] max-w-[600px] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md">
            <KBarSearch className="w-full bg-transparent py-3 px-4 outline-none" />
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal> */}
      <div className="flex h-screen w-full border rounded-lg overflow-hidden" suppressHydrationWarning>
      <Sidebar />
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
          // fitView
          proOptions={{ hideAttribution: true }}
          
            colorMode={theme  === 'dark' ? 'dark' : 'light'} 
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap />
          <Panel position="top-right">
            <CodePanel nodes={nodes} edges={edges} />
          </Panel>
        </ReactFlow>
      </div>
    </div>
    </KBarProvider>
  );
}

// Add RenderResults component
function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">{item}</div>
        ) : (
          <div
            className={`flex items-center justify-between px-4 py-2 cursor-pointer ${
              active ? 'bg-accent text-accent-foreground' : 'bg-transparent'
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <span>{item.name}</span>
            </div>
            {item.shortcut?.length ? (
              <div className="flex items-center gap-1">
                {item.shortcut.map((shortcut: string) => (
                  <kbd key={shortcut} className="px-2 py-1 text-xs rounded-md bg-muted">
                    {shortcut}
                  </kbd>
                ))}
              </div>
            ) : null}
          </div>
        )
      }
    />
  );
}

export default CodeFlow;
