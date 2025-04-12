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
import { Terminal, ChevronRight, GitBranch, Repeat, Code2, ArrowRightLeft, Database, Trash2, Code, Play, type LucideIcon, GripVertical } from 'lucide-react';
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
    id: 'basic',
    label: 'Basic',
    description: 'Essential nodes for data and output',
    items: [
      { type: 'print', label: 'Print', icon: Terminal, description: 'Output text or variables' },
      { type: 'variable', label: 'Variable', icon: ArrowRightLeft, description: 'Store and manipulate data' },
    ],
  },
  {
    id: 'conditions',
    label: 'Conditions',
    description: 'Control flow with conditions',
    items: [
      { type: 'ifBlock', label: 'If Condition', icon: GitBranch, description: 'Create conditional branches' },
    ],
  },
  {
    id: 'loops',
    label: 'Loops',
    description: 'Iterate and repeat code',
    items: [
      { type: 'forLoop', label: 'For Loop', icon: Repeat, description: 'Create loops and iterations' },
    ],
  },
  {
    id: 'functions',
    label: 'Functions',
    description: 'Define and call functions',
    items: [
      { type: 'function', label: 'Function', icon: Code2, description: 'Define reusable functions' },
      { type: 'functionCall', label: 'Call Function', icon: Play, description: 'Call a defined function' },
    ],
  },
  {
    id: 'documentation',
    label: 'Documentation',
    description: 'Add comments and annotations',
    items: [
      { type: 'annotation', label: 'Comment', icon: Code, description: 'Add comments to your code' },
    ],
  }
];

// Sidebar component
const Sidebar = ({ onAddNode }: { onAddNode: (type: string, position: { x: number, y: number }) => void }) => {
  const { getViewport } = useReactFlow();
  
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-[280px] flex flex-col h-full bg-background/50 backdrop-blur-sm border-r">
      {/* Simple Heading */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Node Library</h2>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-4">
      {nodeCategories.map((category) => (
          <div key={category.id} className="space-y-2">
              <div className="px-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {category.label}
            </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>
              </div>
            <div className="space-y-1">
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                      className="group relative flex items-center rounded-lg border bg-background/50 px-2 py-2 cursor-grab hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:shadow-sm active:scale-[0.98]"
                  draggable
                    onDragStart={(event) => onDragStart(event, item.type)}
                >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="shrink-0 p-1.5 rounded-md bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                    </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{item.label}</span>
                            <kbd className="hidden group-hover:inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground transition-opacity">
                              {item.type === 'ifBlock' ? 'i' :
                               item.type === 'forLoop' ? 'l' :
                               item.type === 'function' ? 'f' :
                               item.type === 'functionCall' ? 'c' :
                               item.type === 'variable' ? 'v' :
                               item.type === 'print' ? 'p' :
                               item.type === 'database' ? 'd' : ''}
                    </kbd>
                          </div>
                          <p className="text-xs text-muted-foreground truncate group-hover:text-accent-foreground/80">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
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
  parameters: string[];
  returnValue?: boolean;
}

interface PrintNodeData extends Record<string, unknown> {
  type: 'print';
  label: string;
  message?: string;
  updateMessage?: (value: string) => void;
}

interface FunctionCallNodeData extends Record<string, unknown> {
  type: 'functionCall';
  label: string;
  functionName?: string;
  arguments: string[];
}

// Add AnnotationNodeData type
interface AnnotationNodeData extends Record<string, unknown> {
  type: 'annotation';
  level: string;
  label: string;
  arrowStyle?: React.CSSProperties;
  generateComment?: boolean;
}

// Union type for all node data
export type NodeData = IfNodeData | ForLoopNodeData | VariableNodeData | DatabaseNodeData | FunctionNodeData | PrintNodeData | FunctionCallNodeData | AnnotationNodeData;

// Type guard functions
const isIfNodeData = (data: NodeData): data is IfNodeData => data.type === 'ifBlock';
const isForLoopNodeData = (data: NodeData): data is ForLoopNodeData => data.type === 'forLoop';
const isVariableNodeData = (data: NodeData): data is VariableNodeData => data.type === 'variable';
const isDatabaseNodeData = (data: NodeData): data is DatabaseNodeData => data.type === 'database';
const isFunctionNodeData = (data: NodeData): data is FunctionNodeData => data.type === 'function';
const isPrintNodeData = (data: NodeData): data is PrintNodeData => data.type === 'print';
const isFunctionCallNodeData = (data: NodeData): data is FunctionCallNodeData => data.type === 'functionCall';

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
    "relative group",
    "min-w-[280px] max-w-[320px]",
    "rounded-lg border shadow-sm",
    "bg-background transition-all duration-200",
    selected && "ring-2 ring-primary ring-offset-2",
    !selected && "hover:shadow-md"
  )}>
    <NodeToolbar 
      isVisible 
      className="flex items-center gap-2 p-2 border-b rounded-md bg-muted/50"
      position={Position.Top}
    >
      <div className="flex items-center gap-2 flex-1">
        <div className="p-1.5 rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium text-sm tracking-tight">{label}</span>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={clsx(
            "p-1.5 rounded-md transition-colors",
                    "hover:bg-destructive/10 hover:text-destructive"
          )}
        >
          <Trash2 size={14} />
        </button>
      )}
    </NodeToolbar>
    <div className="p-4">
    {children}
    </div>
  </div>
);
NodeWrapper.displayName = 'NodeWrapper';

// Common styles for inputs and labels
const nodeStyles = {
  input: clsx(
    "w-full rounded-md border bg-background px-3 py-2",
    "text-sm focus:outline-none focus:ring-2 focus:ring-primary",
    "placeholder:text-muted-foreground/50",
    "transition-colors duration-200"
  ),
  inputIcon: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4",
  label: "text-xs font-medium text-muted-foreground mb-1.5 block",
  handle: "!w-3 !h-3 !bg-muted-foreground/50 hover:!bg-muted-foreground transition-colors",
  handleLabel: "absolute text-[10px] font-medium bg-background/50 px-1.5 py-0.5 rounded-sm border shadow-sm whitespace-nowrap",
  suggestions: {
    container: "mt-2 space-y-1",
    title: "text-[10px] font-medium text-muted-foreground",
    list: "flex flex-wrap gap-1",
    item: clsx(
      "text-[10px] px-1.5 py-0.5 rounded-sm",
      "bg-muted hover:bg-muted/80 transition-colors",
      "cursor-pointer select-none"
    )
  },
  error: "mt-1.5 text-[10px] text-destructive font-medium",
  hint: "mt-1.5 text-[10px] text-muted-foreground"
};

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
      <div className={nodeStyles.suggestions.container}>
        <p className={nodeStyles.suggestions.title}>Available Variables:</p>
        <div className={nodeStyles.suggestions.list}>
          {availableVariables.map(varName => {
            const value = getVariable(varName);
            return (
              <button
                key={varName}
                onClick={() => handleConditionChange({ target: { value: varName } } as any)}
                className={nodeStyles.suggestions.item}
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
        className={nodeStyles.handle}
        id="in"
      />
      <div className="space-y-4">
        {/* If condition */}
        <div>
          <label className={nodeStyles.label}>If Condition</label>
          <div className="relative">
            <GitBranch className={nodeStyles.inputIcon} />
          <input
            value={data.condition || ''}
              onChange={handleConditionChange}
              placeholder="x > 0"
              className={clsx(nodeStyles.input, "pl-9")}
            />
            <Handle 
              type="source" 
              position={Position.Right} 
              className={clsx(nodeStyles.handle, "!bg-green-500/50 hover:!bg-green-500")}
              id="true"
            >
              <div className={clsx(nodeStyles.handleLabel, "left-full ml-1 -translate-y-1/2 top-1/2")}>
                  True
              </div>
            </Handle>
          </div>
          {renderVariableSuggestions()}
        </div>

        {/* Elif conditions */}
        {data.elifConditions?.map((elif, index) => (
          <div key={elif.id}>
            <div className="flex items-center justify-between mb-1.5">
              <label className={nodeStyles.label}>Elif Condition {index + 1}</label>
              <button
                onClick={() => removeElifCondition(elif.id)}
                className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="relative">
              <GitBranch className={nodeStyles.inputIcon} />
              <input
                value={elif.condition}
                onChange={(e) => handleElifConditionChange(elif.id, e.target.value)}
                placeholder="x < 0"
                className={clsx(nodeStyles.input, "pl-9")}
              />
              <Handle 
                type="source" 
                position={Position.Right} 
                className={clsx(nodeStyles.handle, "!bg-yellow-500/50 hover:!bg-yellow-500")}
                id={`elif-${elif.id}`}
              >
                <div className={clsx(nodeStyles.handleLabel, "left-full ml-1 -translate-y-1/2 top-1/2")}>
                    {elif.condition ? `Elif: ${elif.condition}` : `Elif ${index + 1}`}
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
          <div className="relative">
            <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
              Else block
            </div>
            <Handle 
              type="source" 
              position={Position.Right} 
              className={clsx(nodeStyles.handle, "!bg-red-500/50 hover:!bg-red-500")}
              id="else"
            >
              <div className={clsx(nodeStyles.handleLabel, "left-full ml-1 -translate-y-1/2 top-1/2")}>
                  Else
              </div>
            </Handle>
          </div>
        )}

        <p className={nodeStyles.hint}>
          Use variables in conditions by clicking them below or typing their names
        </p>
      </div>
    </NodeWrapper>
  );
});
IfNode.displayName = 'IfNode';

const ForLoopNode = memo(({ data, id, selected }: NodeComponentProps<ForLoopNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const deleteNode = useFlowStore(state => state.deleteNode);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const [loopType, setLoopType] = useState<'range' | 'collection' | 'enumerate'>('range');
  const [showExamples, setShowExamples] = useState(false);
  const availableVariables = getAllVariables();

  // Loop type specific state
  const [rangeStart, setRangeStart] = useState('0');
  const [rangeEnd, setRangeEnd] = useState('10');
  const [rangeStep, setRangeStep] = useState('1');
  const [iterableVar, setIterableVar] = useState('');
  const [indexVar, setIndexVar] = useState('i');

  // Initialize state from data if it exists
  useEffect(() => {
    if (data.condition) {
      // Parse existing condition to set initial state
      const condition = data.condition;
      if (condition.includes('range')) {
        setLoopType('range');
        const matches = condition.match(/range\((.*?)\)/);
        if (matches) {
          const params = matches[1].split(',').map(p => p.trim());
          if (params.length === 1) {
            setRangeStart('0');
            setRangeEnd(params[0]);
            setRangeStep('1');
          } else if (params.length === 2) {
            setRangeStart(params[0]);
            setRangeEnd(params[1]);
            setRangeStep('1');
          } else if (params.length === 3) {
            setRangeStart(params[0]);
            setRangeEnd(params[1]);
            setRangeStep(params[2]);
          }
        }
      } else if (condition.includes('enumerate')) {
        setLoopType('enumerate');
        const matches = condition.match(/(\w+),\s*(\w+)\s+in\s+enumerate\((\w+)\)/);
        if (matches) {
          setIndexVar(matches[2]);
          setIterableVar(matches[3]);
        }
      } else {
        setLoopType('collection');
        const matches = condition.match(/(\w+)\s+in\s+(\w+)/);
        if (matches) {
          setIndexVar(matches[1]);
          setIterableVar(matches[2]);
        }
      }
    }
  }, [data.condition]);

  // Update condition based on loop type and parameters
  const updateLoopCondition = useCallback(() => {
    let condition = '';
    switch (loopType) {
      case 'range':
        if (rangeStart === '0' && rangeStep === '1') {
          condition = `${indexVar} in range(${rangeEnd})`;
        } else if (rangeStep === '1') {
          condition = `${indexVar} in range(${rangeStart}, ${rangeEnd})`;
        } else {
          condition = `${indexVar} in range(${rangeStart}, ${rangeEnd}, ${rangeStep})`;
        }
        break;
      case 'collection':
        condition = `${indexVar} in ${iterableVar}`;
        break;
      case 'enumerate':
        condition = `i, ${indexVar} in enumerate(${iterableVar})`;
        break;
    }
    
    // Only update if the condition has actually changed
    if (condition !== data.condition) {
      updateNode(id, {
      ...data,
        condition
      });
    }
  }, [loopType, rangeStart, rangeEnd, rangeStep, iterableVar, indexVar, id, data.condition]);

  // Update condition when parameters change, but not when data changes
  useEffect(() => {
    updateLoopCondition();
  }, [loopType, rangeStart, rangeEnd, rangeStep, iterableVar, indexVar]);

  const handleLoopTypeChange = (type: 'range' | 'collection' | 'enumerate') => {
    setLoopType(type);
    // Reset index variable name based on type
    setIndexVar(type === 'enumerate' ? 'item' : 'i');
  };

  const renderLoopTypeSelector = () => (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      {[
        { type: 'range', label: 'Range', icon: '1..n' },
        { type: 'collection', label: 'Collection', icon: '[...]' },
        { type: 'enumerate', label: 'Enumerate', icon: '(i,x)' }
      ].map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => handleLoopTypeChange(type as any)}
          className={clsx(
            "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all",
            "flex items-center justify-center gap-2",
            loopType === type 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <span className="font-mono">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );

  const renderRangeInputs = () => (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <label className={nodeStyles.label}>Start</label>
        <input
          value={rangeStart}
          onChange={(e) => setRangeStart(e.target.value)}
          placeholder="0"
          className={nodeStyles.input}
          type="number"
        />
      </div>
      <div>
        <label className={nodeStyles.label}>End</label>
        <input
          value={rangeEnd}
          onChange={(e) => setRangeEnd(e.target.value)}
          placeholder="10"
          className={nodeStyles.input}
          type="number"
        />
      </div>
      <div>
        <label className={nodeStyles.label}>Step</label>
        <input
          value={rangeStep}
          onChange={(e) => setRangeStep(e.target.value)}
          placeholder="1"
          className={nodeStyles.input}
          type="number"
        />
      </div>
    </div>
  );

  const renderCollectionInput = () => (
    <div className="space-y-2">
      <label className={nodeStyles.label}>Collection Variable</label>
      <div className="relative">
        <input
          value={iterableVar}
          onChange={(e) => setIterableVar(e.target.value)}
          placeholder="e.g., my_list"
          className={nodeStyles.input}
        />
      </div>
      {availableVariables.length > 0 && (
        <div className={nodeStyles.suggestions.container}>
          <p className={nodeStyles.suggestions.title}>Available variables:</p>
          <div className={nodeStyles.suggestions.list}>
            {availableVariables.map(varName => {
              const value = getVariable(varName);
              return (
                <button
                  key={varName}
                  onClick={() => setIterableVar(varName)}
                  className={nodeStyles.suggestions.item}
                  title={`Value: ${value}`}
                >
                  {varName}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderIndexVarInput = () => (
    <div className="space-y-2">
      <label className={nodeStyles.label}>
        {loopType === 'enumerate' ? 'Item Variable' : 'Iterator Variable'}
      </label>
      <input
        value={indexVar}
        onChange={(e) => setIndexVar(e.target.value)}
        placeholder={loopType === 'enumerate' ? 'e.g., item' : 'e.g., i'}
        className={nodeStyles.input}
      />
    </div>
  );

  const toggleExamples = () => setShowExamples(!showExamples);

  const renderExamples = () => {
    const examples = {
      range: [
        'i in range(5)  # 0 to 4',
        'i in range(1, 6)  # 1 to 5',
        'i in range(0, 10, 2)  # even numbers'
      ],
      collection: [
        'item in my_list  # iterate list',
        'char in "hello"  # iterate string',
        'num in [1, 2, 3]  # iterate literal'
      ],
      enumerate: [
        'i, item in enumerate(items)',
        'idx, char in enumerate("hello")',
        'pos, val in enumerate([1, 2, 3])'
      ]
    };

    return (
      <div className="mt-2 p-2 rounded-md bg-muted/50 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Examples</span>
          <button
            onClick={toggleExamples}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {showExamples ? 'Hide' : 'Show'}
          </button>
        </div>
        {showExamples && (
          <div className="space-y-1 font-mono">
            {examples[loopType].map((example, i) => (
              <div key={i} className="text-muted-foreground">{example}</div>
            ))}
          </div>
        )}
      </div>
    );
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
        className={nodeStyles.handle}
        id="in"
      />
      <div className="space-y-6">
        {/* Loop Type Selector */}
        <div>
          <label className={nodeStyles.label}>Loop Type</label>
          {renderLoopTypeSelector()}
        </div>
        
        {/* Loop Configuration */}
        <div className="space-y-5">
          {loopType === 'range' && (
            <div className="space-y-4">
              <label className={nodeStyles.label}>Range Configuration</label>
              {renderRangeInputs()}
            </div>
          )}
          {(loopType === 'collection' || loopType === 'enumerate') && (
            <div className="space-y-4">
              <label className={nodeStyles.label}>Collection Configuration</label>
              {renderCollectionInput()}
            </div>
          )}
          <div className="pt-2">
            {renderIndexVarInput()}
          </div>
        </div>

        {/* Examples Section */}
        <div className="pt-2">
          {renderExamples()}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={clsx(nodeStyles.handle, "!bg-primary/50 hover:!bg-primary")}
        id="body"
        style={{ left: '25%' }}
      >
        <div className={clsx(nodeStyles.handleLabel, "-bottom-5 left-1/2 -translate-x-1/2")}>
          Body
        </div>
      </Handle>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={nodeStyles.handle}
        id="next"
        style={{ left: '75%' }}
      >
        <div className={clsx(nodeStyles.handleLabel, "-bottom-5 left-1/2 -translate-x-1/2")}>
          Next
        </div>
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
  const [nameError, setNameError] = useState<string | null>(null);
  
  // Python keywords that cannot be used as variable names
  const PYTHON_KEYWORDS = [
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 
    'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 
    'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 
    'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
  ];

  // Filter out the current variable from available variables
  const availableVariables = useMemo(() => {
    const allVars = getAllVariables();
    return allVars.filter(varName => varName !== data.name);
  }, [getAllVariables, data.name]);

  // Validate Python variable name
  const validateVariableName = (name: string): string | null => {
    if (!name) return null; // Empty name is handled by placeholder
    
    if (PYTHON_KEYWORDS.includes(name)) {
      return `'${name}' is a Python keyword`;
    }
    
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      return 'Variable name must start with a letter or underscore and contain only letters, numbers, and underscores';
    }

    if (availableVariables.includes(name)) {
      return `Variable '${name}' already exists`;
    }

    return null;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.trim();
    const error = validateVariableName(newName);
    setNameError(error);

    const newData: VariableNodeData = {
      ...data,
      name: newName
    };
    updateNode(id, newData);
    
    // Only set the variable if there are no validation errors
    if (!error && newName) {
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
    
    // Update the variable in the store if we have a valid name
    if (data.name && !nameError) {
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
        className={nodeStyles.handle}
        id="in"
      />
      <div className="space-y-4">
        {/* Variable Name Input */}
        <div>
          <label className={nodeStyles.label}>Variable Name</label>
          <div className="relative">
          <input
            value={data.name || ''}
            onChange={handleNameChange}
            placeholder="my_variable"
              className={clsx(
                nodeStyles.input,
                nameError ? "border-destructive focus:ring-destructive/50" : ""
              )}
            />
            {nameError && (
              <p className={nodeStyles.error}>{nameError}</p>
            )}
          </div>
        </div>

        {/* Value Input with Variable Suggestions */}
          <div>
          <label className={nodeStyles.label}>Value or Expression</label>
          <div className="relative">
            <input
              id={`variable-value-${id}`}
            value={data.value || ''}
              onChange={handleValueChange}
              placeholder="Enter value (e.g. 42, 'hello', x + 1)"
              className={nodeStyles.input}
          />
        </div>

          {/* Available Variables */}
          {availableVariables.length > 0 && (
            <div className={nodeStyles.suggestions.container}>
              <p className={nodeStyles.suggestions.title}>Available variables:</p>
              <div className={nodeStyles.suggestions.list}>
                {availableVariables.map(varName => {
                  const value = getVariable(varName);
                  return (
                    <button
                      key={varName}
                      onClick={() => insertVariable(varName)}
                      className={nodeStyles.suggestions.item}
                      title={`${varName} = ${value}`}
                    >
                      {varName}
                    </button>
                  );
                })}
      </div>
              </div>
          )}

          <p className={nodeStyles.hint}>
            Enter a value or click variables above to use them in expressions
          </p>
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={clsx(nodeStyles.handle, "!bg-primary/50 hover:!bg-primary")}
        id="out"
      >
        <div className={clsx(nodeStyles.handleLabel, "-bottom-5 left-1/2 -translate-x-1/2")}>
          Next
        </div>
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
        className={nodeStyles.handle}
        id="in"
      />
      <div className="space-y-2">
        <label className={nodeStyles.label}>SQL Query</label>
          <input
            value={data.query || ''}
            onChange={(e) => updateNode(id, { query: e.target.value })}
          placeholder="SELECT * FROM users"
          className={nodeStyles.input}
          />
        </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={clsx(nodeStyles.handle, "!bg-green-500/50 hover:!bg-green-500")}
        id="success"
        style={{ left: '25%' }}
      >
        <div className={clsx(nodeStyles.handleLabel, "-bottom-5 left-1/2 -translate-x-1/2")}>
          Success
        </div>
      </Handle>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={clsx(nodeStyles.handle, "!bg-red-500/50 hover:!bg-red-500")}
        id="error"
        style={{ left: '75%' }}
      >
        <div className={clsx(nodeStyles.handleLabel, "-bottom-5 left-1/2 -translate-x-1/2")}>
          Error
        </div>
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
        className={nodeStyles.handle}
        id="in"
      />
      <div className="space-y-4">
        <div>
          <label className={nodeStyles.label}>Message</label>
          <div className="relative">
            <Terminal className={nodeStyles.inputIcon} />
            <input
              id={`print-input-${id}`}
              value={data.message || ''}
              onChange={handleMessageChange}
              placeholder="Enter text or click variables below to insert them"
              className={clsx(nodeStyles.input, "pl-9")}
            />
        </div>

          {/* Available Variables */}
        {availableVariables.length > 0 && (
            <div className={nodeStyles.suggestions.container}>
              <p className={nodeStyles.suggestions.title}>Click to insert variable:</p>
              <div className={nodeStyles.suggestions.list}>
              {availableVariables.map(varName => {
                const value = getVariable(varName);
                return (
                  <button
                    key={varName}
                    onClick={() => insertVariable(varName)}
                      className={nodeStyles.suggestions.item}
                    title={`Current value: ${value}`}
                  >
                    {varName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

          <p className={nodeStyles.hint}>
          Type text and click variables to insert them. Variables will appear as {'{variable_name}'}
          </p>
      </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={clsx(nodeStyles.handle, "!bg-primary/50 hover:!bg-primary")}
        id="out"
      >
        <div className={clsx(nodeStyles.handleLabel, "-bottom-5 left-1/2 -translate-x-1/2")}>
          Next
        </div>
      </Handle>
    </NodeWrapper>
  );
});
PrintNode.displayName = 'PrintNode';

const FunctionNode = memo(({ data, id, selected }: NodeComponentProps<FunctionNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const deleteNode = useFlowStore(state => state.deleteNode);
  const [showAddParam, setShowAddParam] = useState(false);
  const [newParam, setNewParam] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      ...data,
      label: e.target.value
    });
  };

  const handleAddParameter = () => {
    if (newParam && !data.parameters?.includes(newParam)) {
      const parameters = [...(data.parameters || []), newParam];
      updateNode(id, {
        ...data,
        parameters
      });
      setNewParam('');
      setShowAddParam(false);
    }
  };

  const handleRemoveParameter = (param: string) => {
    const parameters = data.parameters?.filter(p => p !== param) || [];
    updateNode(id, {
      ...data,
      parameters
    });
  };

  const toggleReturnValue = () => {
    updateNode(id, {
      ...data,
      returnValue: !data.returnValue
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
        className={nodeStyles.handle}
        id="in"
      />
      <div className="space-y-4">
        <div>
          <label className={nodeStyles.label}>Function Name</label>
        <div className="relative">
            <Code2 className={nodeStyles.inputIcon} />
          <input
            value={data.label || ''}
            onChange={handleNameChange}
            placeholder="my_function"
              className={clsx(nodeStyles.input, "pl-9")}
            />
          </div>
        </div>

        {/* Parameters Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={nodeStyles.label}>Parameters</label>
            <Button
              onClick={() => setShowAddParam(true)}
              className="h-6 text-xs bg-muted hover:bg-muted/80"
              size="sm"
            >
              Add Parameter
            </Button>
          </div>
          
          {showAddParam && (
            <div className="flex gap-2 mb-2">
              <input
                value={newParam}
                onChange={(e) => setNewParam(e.target.value)}
                placeholder="param_name"
                className={nodeStyles.input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddParameter();
                  if (e.key === 'Escape') setShowAddParam(false);
                }}
              />
              <Button
                onClick={handleAddParameter}
                className="bg-primary text-primary-foreground"
                size="sm"
              >
                Add
              </Button>
        </div>
          )}

          {data.parameters?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.parameters.map(param => (
                <div
                  key={param}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs"
                >
                  <span>{param}</span>
                  <button
                    onClick={() => handleRemoveParameter(param)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </button>
      </div>
              ))}
      </div>
          )}
        </div>

        {/* Return Value Toggle */}
        <div className="flex items-center gap-2">
          <label className={nodeStyles.label}>Has Return Value</label>
          <Button
            onClick={toggleReturnValue}
            className={clsx(
              "h-6 text-xs",
              data.returnValue 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80"
            )}
            size="sm"
          >
            {data.returnValue ? 'Yes' : 'No'}
          </Button>
        </div>

        <p className={nodeStyles.hint}>
          Connect nodes to the body handle to define function contents
        </p>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={clsx(nodeStyles.handle, "!bg-primary/50 hover:!bg-primary")}
        id="body"
        style={{ left: '50%' }}
      >
        <div className={clsx(nodeStyles.handleLabel, "-bottom-5 left-1/2 -translate-x-1/2")}>
          Body
        </div>
      </Handle>

      {data.returnValue && (
        <Handle 
          type="source" 
          position={Position.Right} 
          className={clsx(nodeStyles.handle, "!bg-green-500/50 hover:!bg-green-500")}
          id="return"
        >
          <div className={clsx(nodeStyles.handleLabel, "left-full ml-1 -translate-y-1/2 top-1/2")}>
            Return
          </div>
        </Handle>
      )}
    </NodeWrapper>
  );
});
FunctionNode.displayName = 'FunctionNode';

const FunctionCallNode = memo(({ data, id, selected }: NodeComponentProps<FunctionCallNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const deleteNode = useFlowStore(state => state.deleteNode);
  const nodes = useFlowStore(state => state.nodes);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get all available functions
  const availableFunctions = useMemo(() => {
    return nodes
      .filter(node => node.type === 'function')
      .map(node => ({
        name: node.data.label,
        parameters: node.data.parameters || [],
        hasReturn: node.data.returnValue
      }));
  }, [nodes]);

  const filteredFunctions = useMemo(() => {
    if (!searchTerm) return availableFunctions;
    return availableFunctions.filter(f => 
      f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableFunctions, searchTerm]);

  const selectedFunction = availableFunctions.find(f => f.name === data.functionName);

  const handleFunctionSelect = (name: string) => {
    const func = availableFunctions.find(f => f.name === name);
    updateNode(id, {
      ...data,
      functionName: name,
      arguments: new Array(func?.parameters.length || 0).fill('')
    });
  };

  const handleArgumentChange = (index: number, value: string) => {
    const newArgs = [...(data.arguments || [])];
    newArgs[index] = value;
    updateNode(id, {
      ...data,
      arguments: newArgs
    });
  };

  return (
    <NodeWrapper 
      onDelete={() => deleteNode(id)}
      icon={Play}
      label="Call Function"
      selected={selected}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={nodeStyles.handle}
        id="in"
      />
      <div className="space-y-4">
        {!selectedFunction ? (
          <div className="space-y-3">
            <div className="relative">
              <Code2 className={nodeStyles.inputIcon} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search functions..."
                className={clsx(nodeStyles.input, "pl-9")}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2">
              {filteredFunctions.map(func => (
                <button
                  key={func.name}
                  onClick={() => handleFunctionSelect(func.name)}
                  className={clsx(
                    "flex items-center gap-2 p-2 rounded-md border text-left transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "group relative"
                  )}
                >
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Code2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{func.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {func.parameters.length > 0 
                        ? `Parameters: ${func.parameters.join(', ')}` 
                        : 'No parameters'}
                    </div>
                  </div>
                  {func.hasReturn && (
                    <div className="shrink-0 px-1.5 py-0.5 rounded-sm bg-green-500/10 text-green-500 text-[10px] font-medium">
                      Returns
                    </div>
                  )}
                </button>
              ))}
              {filteredFunctions.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No functions found
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Code2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{selectedFunction.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedFunction.parameters.length} parameter{selectedFunction.parameters.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleFunctionSelect('')}
              >
                Change
              </Button>
            </div>

            {selectedFunction.parameters.length > 0 && (
              <div className="space-y-2">
                <label className={nodeStyles.label}>Arguments</label>
                <div className="space-y-2">
                  {selectedFunction.parameters.map((param, index) => (
                    <div key={param} className="relative">
                      <input
                        value={data.arguments?.[index] || ''}
                        onChange={(e) => handleArgumentChange(index, e.target.value)}
                        placeholder={param}
                        className={nodeStyles.input}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-sm bg-muted text-[10px] font-medium text-muted-foreground">
                        {param}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedFunction?.hasReturn && (
        <Handle 
          type="source" 
          position={Position.Right} 
          className={clsx(nodeStyles.handle, "!bg-green-500/50 hover:!bg-green-500")}
          id="return"
        >
          <div className={clsx(nodeStyles.handleLabel, "left-full ml-1 -translate-y-1/2 top-1/2")}>
            Return Value
          </div>
        </Handle>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={nodeStyles.handle}
        id="next"
      >
        <div className={clsx(nodeStyles.handleLabel, "-bottom-5 left-1/2 -translate-x-1/2")}>
          Next
        </div>
      </Handle>
    </NodeWrapper>
  );
});
FunctionCallNode.displayName = 'FunctionCallNode';

const AnnotationNode = memo(({ data, id, selected }: NodeComponentProps<AnnotationNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const deleteNode = useFlowStore(state => state.deleteNode);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      ...data,
      label: e.target.value
    });
  };

  const toggleGenerateComment = () => {
    updateNode(id, {
      ...data,
      generateComment: !data.generateComment
    });
  };

  return (
    <NodeWrapper 
      onDelete={() => deleteNode(id)}
      icon={Code}
      label="Comment"
      selected={selected}
    >
      <div className="space-y-4">
        <div>
          <label className={nodeStyles.label}>Comment Text</label>
          <div className="relative">
            <Code className={nodeStyles.inputIcon} />
            <input
              value={data.label || ''}
              onChange={handleLabelChange}
              placeholder="Enter your comment..."
              className={clsx(nodeStyles.input, "pl-9")}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className={nodeStyles.label}>Generate in Code</label>
          <button
            onClick={toggleGenerateComment}
            className={clsx(
              "px-3 py-1 rounded-full text-xs transition-colors flex items-center gap-2",
              data.generateComment 
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            <div className={clsx(
              "w-3 h-3 rounded-full transition-colors",
              data.generateComment ? "bg-primary" : "bg-muted-foreground/30"
            )} />
            {data.generateComment ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <p className={nodeStyles.hint}>
          {data.generateComment 
            ? 'This comment will appear in the generated Python code'
            : 'This comment is only visible in the flow editor'}
        </p>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={nodeStyles.handle}
        id="out"
      >
        <div className={clsx(nodeStyles.handleLabel, "-bottom-5 left-1/2 -translate-x-1/2")}>
          Next
        </div>
      </Handle>
    </NodeWrapper>
  );
});
AnnotationNode.displayName = 'AnnotationNode';

const flowKey = 'python-flow';



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
        .filter(code => code !== '') // Filter out empty strings
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
    case 'annotation':
      // Only generate comment if generateComment is true
      if (node.data.generateComment) {
        return `${spaces}# ${node.data.label}`;
      }
      return '';
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

        const params = node.data.parameters?.join(', ') || '';
        const funcName = node.data.label?.toLowerCase().replace(/\s+/g, '_') || 'my_function';

        return `${spaces}def ${funcName}(${params}):${bodyCode}`;
      }
      return `${spaces}def my_function():\n${spaces}    pass`;
    }
    case 'functionCall': {
      if (isFunctionCallNodeData(node.data)) {
        const args = node.data.arguments?.join(', ') || '';
        const funcName = node.data.functionName?.toLowerCase().replace(/\s+/g, '_') || 'my_function';
        return `${spaces}${funcName}(${args})`;
      }
      return `${spaces}# Invalid function call`;
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
      .filter(code => code !== '') // Filter out empty strings
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
  functionCall: FunctionCallNode as unknown as ComponentType<NodeProps>,
  annotation: AnnotationNode as unknown as ComponentType<NodeProps>,
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
      shortcut: ['l'],
      keywords: 'loop iterate repeat for range sequence',
      section: 'Control Flow',
      subtitle: 'Create loops and iterations',
      perform: () => {
        const position = {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('forLoop', position);
      },
    },
    {
      id: 'add-function',
      name: 'Add Function',
      shortcut: ['f'],
      keywords: 'function def method subroutine procedure',
      section: 'Control Flow',
      subtitle: 'Define reusable functions',
      perform: () => {
        const position = {
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
        const position = {
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
        const position = {
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
        const position = {
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
        const position = {
          x: (reactFlowInstance?.getViewport().x || 0) + 100,
          y: (reactFlowInstance?.getViewport().y || 0) + 100
        };
        addNode('database', position);
      },
    },
  ], [reactFlowInstance, addNode]);

  return (
    <KBarProvider>
      <KBarPortal>
        <KBarPositioner className="z-50 bg-background/80 backdrop-blur-sm">
          <KBarAnimator className="w-[600px] max-w-[600px] overflow-hidden rounded-xl border bg-background shadow-2xl">
            <div className="border-b">
              <KBarSearch 
                className={clsx(
                  "w-full bg-transparent py-4 px-4 outline-none",
                  "text-base placeholder:text-muted-foreground/50"
                )}
                placeholder="Type a command or search..."
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto">
            <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      <div className="flex h-screen w-full border rounded-lg overflow-hidden" suppressHydrationWarning>
      <Sidebar onAddNode={addNode} />
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
          colorMode={'dark'} 
          defaultViewport={{ x: 50, y: 50, zoom: 1 }}
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
          <div className="px-4 py-2 text-xs font-medium text-muted-foreground/70 bg-muted/50 uppercase tracking-wider">
            {item}
          </div>
        ) : (
          <div
            className={clsx(
              "flex items-center justify-between px-4 py-3 cursor-pointer",
              "transition-colors duration-75",
              active ? 'bg-accent text-accent-foreground' : 'bg-transparent'
            )}
          >
            <div>
              <div className="text-sm font-medium">{item.name}</div>
              {item.subtitle && (
                <div className={clsx(
                  "text-xs",
                  active ? "text-accent-foreground/70" : "text-muted-foreground"
                )}>
                  {item.subtitle}
                </div>
              )}
            </div>
            {item.shortcut?.length ? (
              <div className="flex items-center gap-1">
                {item.shortcut.map((shortcut: string) => (
                  <kbd
                    key={shortcut}
                    className={clsx(
                      "px-1.5 h-5 text-[10px] font-medium rounded flex items-center justify-center",
                      "border shadow-sm",
                      active ? "bg-accent-foreground/10 border-accent-foreground/20" : "bg-muted"
                    )}
                  >
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
