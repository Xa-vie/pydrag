import { memo, useState, useEffect } from 'react';
import NodeWrapper from './NodeWrapper';
import { IfNodeData, NodeComponentProps } from './types';
import { GitBranch, AlertCircle, Plus, X } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';
import { findParentFunctionNodeByPosition } from '../utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';

// Common Python comparison operators
const COMPARISON_OPERATORS = [
  { value: '==', label: '==' },
  { value: '!=', label: '!=' },
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: 'in', label: 'in' },
  { value: 'not in', label: 'not in' },
];

// Logical operators
const LOGICAL_OPERATORS = [
  { value: 'and', label: 'AND' },
  { value: 'or', label: 'OR' },
  { value: 'not', label: 'NOT' }
];

const IfNode = memo(({ data, id, selected }: NodeComponentProps<IfNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const getNodes = useFlowStore(state => state.getNodes);
  const getEdges = useFlowStore(state => state.getEdges);
  const nodes = getNodes();
  const edges = getEdges();
  const parentFunctionNode = findParentFunctionNodeByPosition(id, nodes);
  const availableVariables = getAllVariables();
  const availableParameters: string[] = Array.isArray(parentFunctionNode?.data?.parameters) ? parentFunctionNode.data.parameters : [];

  // State for validation
  const [conditionError, setConditionError] = useState<string | null>(null);
  const [isUsingBuilder, setIsUsingBuilder] = useState(false);

  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCondition = e.target.value;
    updateNode(id, {
      ...data,
      condition: newCondition
    } as IfNodeData);
    
    // Validate the condition (simple validation)
    validateCondition(newCondition);
  };

  // Simple condition validation
  const validateCondition = (condition: string) => {
    if (!condition) {
      setConditionError('Condition is required');
      return;
    }

    // Check for balanced parentheses
    if ((condition.match(/\(/g) || []).length !== (condition.match(/\)/g) || []).length) {
      setConditionError('Unbalanced parentheses');
      return;
    }

    // Check if condition contains comparison operator
    const hasComparisonOp = COMPARISON_OPERATORS.some(op => condition.includes(op.value));
    if (!hasComparisonOp && !condition.includes('and') && !condition.includes('or') && !condition.includes('not')) {
      setConditionError('Missing comparison operator');
      return;
    }

    // Clear error if validation passes
    setConditionError(null);
  };

  // Effect to validate condition when it changes
  useEffect(() => {
    if (data.condition) {
      validateCondition(data.condition);
    }
  }, [data.condition]);

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

  // Insert operator at cursor position or at the end of condition
  const insertOperator = (operator: string) => {
    const currentCondition = data.condition || '';
    const newCondition = currentCondition + ' ' + operator + ' ';
    
    updateNode(id, {
      ...data,
      condition: newCondition
    } as IfNodeData);

    validateCondition(newCondition);
  };

  // Insert variable at cursor position or at the end of condition
  const insertVariable = (variableName: string) => {
    const currentCondition = data.condition || '';
    const newCondition = currentCondition + variableName;
    
    updateNode(id, {
      ...data,
      condition: newCondition
    } as IfNodeData);

    validateCondition(newCondition);
  };
  
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
                onClick={() => insertVariable(varName)}
                className={clsx(nodeStyles.suggestions.item, 'bg-secondary hover:bg-primary/10')}
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

  const renderParameterSuggestions = () => {
    if (!availableParameters.length) return null;
    return (
      <div className={nodeStyles.suggestions.container}>
        <p className={nodeStyles.suggestions.title}>Available Parameters:</p>
        <div className={nodeStyles.suggestions.list}>
          {availableParameters.map(param => (
            <button
              key={param}
              onClick={() => insertVariable(param)}
              className={nodeStyles.suggestions.item}
              title={`Parameter: ${param}`}
            >
              {param}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const clearCondition = () => {
    updateNode(id, {
      ...data,
      condition: ''
    } as IfNodeData);
    setConditionError(null);
  };

  const renderConditionBuilder = () => {
    if (!isUsingBuilder) return null;
    return (
      <div className="mt-2 rounded-xl border border-border/40 bg-gradient-to-br from-background/80 to-muted/60 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-xs font-semibold text-foreground/80 tracking-wide">Condition Builder</span>
          <Button variant="outline" size="sm" onClick={clearCondition} className="text-xs px-2 py-1 h-6">Clear</Button>
        </div>
        <div className="px-4 pb-2">
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">Preview:</span>
            <span className="ml-2 font-mono text-xs bg-background/70 px-2 py-1 rounded border border-border/40 text-foreground/80">{data.condition || <span className="text-muted-foreground">(empty)</span>}</span>
          </div>
          <div className="mb-2">
            <div className={nodeStyles.label + " mb-1"}>Comparison Operators</div>
            <div className="grid grid-cols-4 gap-1">
              {COMPARISON_OPERATORS.map(op => (
                <Tooltip key={op.value}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => insertOperator(op.value)}
                      className="text-xs px-2 py-1 h-7"
                    >
                      {op.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{op.value}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          <div className="mb-2">
            <div className={nodeStyles.label + " mb-1"}>Logical Operators</div>
            <div className="flex flex-wrap gap-1">
              {LOGICAL_OPERATORS.map(op => (
                <Tooltip key={op.value}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => insertOperator(op.value)}
                      className="text-xs px-2 py-1 h-7 bg-primary/10"
                    >
                      {op.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{op.value}</TooltipContent>
                </Tooltip>
              ))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const currentCondition = data.condition || '';
                      updateNode(id, {
                        ...data,
                        condition: '(' + currentCondition + ')'
                      } as IfNodeData);
                    }}
                    className="text-xs px-2 py-1 h-7"
                  >
                    ( )
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Group with parentheses</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <NodeWrapper 
      id={id}
      icon={GitBranch}
      label="If Condition"
      selected={selected}
      category="logic"
    >
      <div className="space-y-4">
        {/* If condition */}
        <div>
          <div className="flex justify-between items-center">
            <label className={nodeStyles.label}>If Condition</label>
            <Button
              variant="ghost" 
              size="sm" 
              onClick={() => setIsUsingBuilder(!isUsingBuilder)}
              className="h-6 text-xs"
            >
              {isUsingBuilder ? "Hide Builder" : "Show Builder"}
            </Button>
          </div>
          <div className="relative">
            <GitBranch className={nodeStyles.inputIcon} />
            <input
              value={data.condition || ''}
              onChange={handleConditionChange}
              placeholder="x > 0"
              className={clsx(
                nodeStyles.input, 
                "pl-9",
                conditionError ? "border-destructive" : ""
              )}
            />
          </div>
          
          {/* Error message */}
          {conditionError && (
            <div className="mt-1 flex items-center text-destructive text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              {conditionError}
            </div>
          )}

          {renderConditionBuilder()}
          {renderVariableSuggestions()}
          {renderParameterSuggestions()}
        </div>

        <p className={nodeStyles.hint}>
          Use variables in conditions by clicking them below or typing their names
        </p>
      </div>
    </NodeWrapper>
  );
});
IfNode.displayName = 'IfNode';

export default IfNode;