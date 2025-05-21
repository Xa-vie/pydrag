import { memo, useState, useMemo, useRef } from 'react';
import { Calculator, Plus, X, Globe } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import NodeWrapper from './NodeWrapper';
import { OperationNodeData, NodeComponentProps } from './types';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';
import VariableReference from '../components/VariableReference';

// Tooltip helper
const operationExamples: Record<string, string> = {
  '+': 'a + b (Add/Concatenate)',
  '-': 'a - b (Subtract)',
  '*': 'a * b (Multiply/Repeat)',
  '/': 'a / b (Divide)',
  '%': 'a % b (Modulo)',
  '**': 'a ** b (Power)',
  '==': 'a == b (Equal)',
  '!=': 'a != b (Not Equal)',
  '<': 'a < b',
  '>': 'a > b',
  '<=': 'a <= b',
  '>=': 'a >= b',
  'upper()': 'str.upper()',
  'lower()': 'str.lower()',
  'strip()': 'str.strip()',
  'len()': 'len(x)',
  'append': 'list.append(item)',
  'sorted()': 'sorted(list)',
  'reversed()': 'reversed(list)',
  'get': 'dict.get(key, None)',
  'update': 'dict.update(other)',
  'keys()': 'dict.keys()',
  'values()': 'dict.values()',
  'and': 'a and b',
  'or': 'a or b',
  'not': 'not a',
  'int()': 'int(x)',
  'str()': 'str(x)',
  'float()': 'float(x)',
  'min()': 'min(list)',
  'max()': 'max(list)',
  'sum()': 'sum(list)',
};

const operationResultType: Record<string, string> = {
  '+': 'Same as operands',
  '-': 'number',
  '*': 'number or string/list',
  '/': 'float',
  '%': 'number',
  '**': 'number',
  '==': 'boolean',
  '!=': 'boolean',
  '<': 'boolean',
  '>': 'boolean',
  '<=': 'boolean',
  '>=': 'boolean',
  'upper()': 'string',
  'lower()': 'string',
  'strip()': 'string',
  'len()': 'int',
  'append': 'list (in-place)',
  'sorted()': 'list',
  'reversed()': 'iterator',
  'get': 'value',
  'update': 'dict (in-place)',
  'keys()': 'list',
  'values()': 'list',
  'and': 'boolean',
  'or': 'boolean',
  'not': 'boolean',
  'int()': 'int',
  'str()': 'string',
  'float()': 'float',
  'min()': 'number',
  'max()': 'number',
  'sum()': 'number',
};

// Type definitions
interface VariableInfo {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'list' | 'dict' | 'unknown';
  value: string;
}

const OperationNode = memo(({ data, id, selected }: NodeComponentProps<OperationNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const setVariable = useFlowStore(state => state.setVariable);
  const variables = useFlowStore(state => state.variables);
  // Get nodes for position information
  const nodes = useFlowStore(state => state.getNodes());
  const [variableNameError, setVariableNameError] = useState<string | null>(null);
  const [showCreated, setShowCreated] = useState(false);
  const createdTimeout = useRef<NodeJS.Timeout | null>(null);
  const [version, setVersion] = useState(0);
  
  // Get current node position for scope checking
  const currentNode = nodes.find(n => n.id === id);
  const nodeY = currentNode?.position.y || 0;

  // Get all available variables with type information from the store
  const variablesWithTypes = useMemo(() => {
    const vars = getAllVariables();
    return vars.map(varName => {
      const value = getVariable(varName);
      let type: VariableInfo['type'] = 'unknown';
      
      if (value !== undefined) {
        try {
          // First try to parse the value
          const parsedValue = JSON.parse(value);
          
          // Infer the type
          if (typeof parsedValue === 'string') type = 'string';
          else if (typeof parsedValue === 'number') type = 'number';
          else if (typeof parsedValue === 'boolean') type = 'boolean';
          else if (Array.isArray(parsedValue)) type = 'list';
          else if (typeof parsedValue === 'object' && parsedValue !== null) type = 'dict';
        } catch {
          // For unparsable strings like "var1 + var2", assume string format
          if (value.includes('"') || !value.match(/[+\-*/%<>=]/)) {
            type = 'string';
          } else if (value.includes('[') && value.includes(']')) {
            type = 'list';
          } else if (value.includes('{') && value.includes('}')) {
            type = 'dict';
          } else if (value === 'True' || value === 'False') {
            type = 'boolean';
          } else if (!isNaN(Number(value))) {
            type = 'number';
          } else {
            type = 'string'; // default to string if we can't determine
          }
        }
      }
      
      return { name: varName, type, value: value || '' };
    });
  }, [getAllVariables, getVariable, variables]); // Re-run when variables change

  // List of variables created by this node
  const createdVariables = useMemo(() => {
    // Use the variable store to find variables with this node's id
    const allVars = getAllVariables();
    return allVars
      .map(name => ({
        name,
        value: getVariable(name),
        nodeId: (variables as Map<string, { value: string; nodeId: string }>).get(name)?.nodeId,
      }))
      .filter(v => v.nodeId === id);
  }, [getAllVariables, getVariable, id, version, variables]); // Re-run when variables or version changes

  // Define operations based on variable type
  const getOperationsForType = (type: VariableInfo['type']) => {
    switch(type) {
      case 'string':
        return [
          { op: '+', label: 'Concatenate (+)', needsValue: true },
          { op: '*', label: 'Repeat (*)', needsValue: true },
          { op: 'upper()', label: 'To Uppercase', needsValue: false },
          { op: 'lower()', label: 'To Lowercase', needsValue: false },
          { op: 'strip()', label: 'Strip', needsValue: false },
          { op: 'len()', label: 'Get Length', needsValue: false },
          { op: 'int()', label: 'To Int', needsValue: false },
          { op: 'str()', label: 'To String', needsValue: false },
          { op: 'float()', label: 'To Float', needsValue: false },
        ];
      case 'list':
        return [
          { op: '+', label: 'Concatenate (+)', needsValue: true },
          { op: '*', label: 'Repeat (*)', needsValue: true },
          { op: 'append', label: 'Append Item', needsValue: true },
          { op: 'len()', label: 'Get Length', needsValue: false },
          { op: 'sorted()', label: 'Sort', needsValue: false },
          { op: 'reversed()', label: 'Reverse', needsValue: false },
          { op: 'min()', label: 'Min', needsValue: false },
          { op: 'max()', label: 'Max', needsValue: false },
          { op: 'sum()', label: 'Sum', needsValue: false },
        ];
      case 'dict':
        return [
          { op: 'get', label: 'Get Value', needsValue: true },
          { op: 'update', label: 'Update', needsValue: true },
          { op: 'keys()', label: 'Get Keys', needsValue: false },
          { op: 'values()', label: 'Get Values', needsValue: false },
          { op: 'len()', label: 'Get Length', needsValue: false },
        ];
      case 'boolean':
        return [
          { op: 'and', label: 'AND', needsValue: true },
          { op: 'or', label: 'OR', needsValue: true },
          { op: 'not', label: 'NOT', needsValue: false },
        ];
      case 'number':
      default:
        return [
          { op: '+', label: 'Add (+)', needsValue: true },
          { op: '-', label: 'Subtract (-)', needsValue: true },
          { op: '*', label: 'Multiply (*)', needsValue: true },
          { op: '/', label: 'Divide (/)', needsValue: true },
          { op: '%', label: 'Modulo (%)', needsValue: true },
          { op: '**', label: 'Power (**)', needsValue: true },
          { op: '==', label: 'Equal (==)', needsValue: true },
          { op: '!=', label: 'Not Equal (!=)', needsValue: true },
          { op: '<', label: 'Less Than (<)', needsValue: true },
          { op: '>', label: 'Greater Than (>)', needsValue: true },
          { op: '<=', label: 'Less or Equal (<=)', needsValue: true },
          { op: '>=', label: 'Greater or Equal (>=)', needsValue: true },
          { op: 'int()', label: 'To Int', needsValue: false },
          { op: 'str()', label: 'To String', needsValue: false },
          { op: 'float()', label: 'To Float', needsValue: false },
          { op: 'min()', label: 'Min', needsValue: false },
          { op: 'max()', label: 'Max', needsValue: false },
          { op: 'sum()', label: 'Sum', needsValue: false },
        ];
    }
  };

  // Get the type of the selected source variable
  const getSourceVariableType = (): VariableInfo['type'] => {
    if (!data.sourceVariable) return 'unknown';
    
    const variable = variablesWithTypes.find(v => v.name === data.sourceVariable);
    return variable?.type || 'unknown';
  };

  const sourceVarType = getSourceVariableType();
  const operations = getOperationsForType(sourceVarType);
  
  // Find current operation details
  const currentOperation = operations.find(op => op.op === data.operation);
  
  // Validate variable name for new variables
  const validateVariableName = (name: string): string | null => {
    if (!name) return null; // Empty name is handled by placeholder
    
    const PYTHON_KEYWORDS = [
      'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 
      'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 
      'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 
      'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
    ];
    
    if (PYTHON_KEYWORDS.includes(name)) {
      return `'${name}' is a Python keyword`;
    }
    
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      return 'Variable name must start with a letter or underscore and contain only letters, numbers, and underscores';
    }

    const variableNames = variablesWithTypes.map(v => v.name);
    if (variableNames.includes(name)) {
      return `Variable '${name}' already exists`;
    }

    return null;
  };

  const handleSourceVariableChange = (variable: string) => {
    // Reset operation when changing source variable since operation options depend on type
    updateNode(id, { 
      ...data, 
      sourceVariable: variable,
      operation: '',
      operationValue: ''
    });
  };

  const handleOperationChange = (operation: string) => {
    // Find if the operation needs a value
    const opDetails = operations.find(op => op.op === operation);
    
    updateNode(id, { 
      ...data, 
      operation,
      // Clear operationValue if the operation doesn't need a value
      operationValue: opDetails?.needsValue ? data.operationValue : ''
    });
  };

  const handleOperationValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const operationValue = e.target.value;
    updateNode(id, { ...data, operationValue });
  };

  const handleCreateNewVariableChange = (checked: boolean) => {
    updateNode(id, {
      ...data,
      createNewVariable: checked,
      // Reset target variable when toggling
      targetVariable: checked ? '' : data.sourceVariable 
    });
  };

  const handleTargetVariableChange = (variable: string) => {
    updateNode(id, { ...data, targetVariable: variable });
  };

  const handleNewVariableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVariable = e.target.value.trim();
    const error = validateVariableName(targetVariable);
    setVariableNameError(error);
    
    updateNode(id, { ...data, targetVariable });
  };

  const generateOperationCode = () => {
    if (!data.sourceVariable || !data.operation) return '';

    const op = data.operation;
    const srcVar = data.sourceVariable;

    // Handle operations based on their format
    if (op.endsWith('()')) {
      // Function-style operations like upper() or len()
      return `${op.slice(0, -2)}(${srcVar})`;
    } else if (['append', 'get', 'update'].includes(op)) {
      // Method-style operations
      const value = data.operationValue || '';
      switch (op) {
        case 'append':
          return `${srcVar}.append(${value})`;
        case 'get':
          return `${srcVar}.get(${value}, None)`;
        case 'update':
          return `${srcVar}.update(${value})`;
        default:
          return '';
      }
    } else if (['and', 'or', 'not'].includes(op)) {
      // Boolean operations
      const value = data.operationValue || '';
      switch (op) {
        case 'not':
          return `not ${srcVar}`;
        case 'and':
        case 'or':
          return `${srcVar} ${op} ${value}`;
        default:
          return '';
      }
    } else if (['int()', 'str()', 'float()'].includes(op)) {
      return `${op.slice(0, -2)}(${srcVar})`;
    } else if (['min()', 'max()', 'sum()'].includes(op)) {
      return `${op.slice(0, -2)}(${srcVar})`;
    } else {
      // Standard operations (+, -, *, /, etc.)
      return `${srcVar} ${op} ${data.operationValue || ''}`;
    }
  };

  const generateFinalCode = () => {
    const operationCode = generateOperationCode();
    if (!operationCode) return '';
    
    // If creating a new variable or targeting an existing variable
    if (data.createNewVariable && data.targetVariable) {
      return `${data.targetVariable} = ${operationCode}`;
    } else if (data.targetVariable) {
      return `${data.targetVariable} = ${operationCode}`;
    }
    
    // For operations that modify in place like append
    return operationCode;
  };

  const handleMakeVariableGlobal = () => {
    // Only proceed if we have valid data
    if (!data.createNewVariable || !data.targetVariable || variableNameError || 
        !data.sourceVariable || !data.operation) {
      return;
    }
    
    // Register the new variable globally
    const finalCode = generateFinalCode();
    if (finalCode) {
      setVariable(data.targetVariable, finalCode.split(' = ')[1], id);
      setShowCreated(true);
      if (createdTimeout.current) clearTimeout(createdTimeout.current);
      createdTimeout.current = setTimeout(() => setShowCreated(false), 1500);
    }
  };

  // Determine if the operation requires a value input
  const operationNeedsValue = currentOperation?.needsValue ?? false;
  const resultType = data.operation ? operationResultType[data.operation] || 'unknown' : '';

  // Handler for renaming a created variable
  const handleRenameVariable = (oldName: string, newName: string) => {
    if (!newName || oldName === newName) return;
    // Validate new name
    const error = validateVariableName(newName);
    if (error) {
      setVariableNameError(error);
      return;
    }
    // Rename in the variable store
    const variables = (useFlowStore.getState().variables as Map<string, { value: string; nodeId: string }>);
    const value = variables.get(oldName)?.value;
    if (value !== undefined) {
      variables.delete(oldName);
      variables.set(newName, { value, nodeId: id });
      useFlowStore.setState({ variables });
      setVersion(v => v + 1);
    }
    setVariableNameError(null);
  };

  // Handler for deleting a created variable
  const handleDeleteVariable = (name: string) => {
    const variables = (useFlowStore.getState().variables as Map<string, { value: string; nodeId: string }>);
    variables.delete(name);
    useFlowStore.setState({ variables });
    setVersion(v => v + 1);
  };

  return (
    <NodeWrapper
      id={id}
      icon={Calculator}
      label="Operation"
      selected={selected}
      category="core"
    >
      <div className="space-y-4">
        {variablesWithTypes.length > 0 ? (
          <>
            {/* Source Variable Selection (Badges) */}
            <div>
              <label className={nodeStyles.label}>Source Variable</label>
              <div className={nodeStyles.suggestions.list}>
                {variablesWithTypes.map(variable => (
                  <button
                    key={variable.name}
                    onClick={() => handleSourceVariableChange(variable.name)}
                    className={clsx(
                      nodeStyles.suggestions.item,
                      "flex items-center gap-1.5",
                      data.sourceVariable === variable.name && "bg-primary/10 text-primary"
                    )}
                    title={`Type: ${variable.type}`}
                  >
                    <span>{variable.name}</span>
                    <span className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary/70">
                      {variable.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {data.sourceVariable && (
              <>
                {/* Operations Selection (Badges) with tooltips */}
                <div>
                  <label className={nodeStyles.label}>Operation for {sourceVarType}</label>
                  <div className={nodeStyles.suggestions.list}>
                    {operations.map(({ op, label }) => (
                      <button
                        key={op}
                        onClick={() => handleOperationChange(op)}
                        className={clsx(
                          nodeStyles.suggestions.item,
                          data.operation === op && "bg-primary/10 text-primary"
                        )}
                        title={operationExamples[op] || label}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {data.operation && operationNeedsValue && (
                  <div>
                    <label className={nodeStyles.label}>Value</label>
                    <input
                      type="text"
                      className={nodeStyles.input}
                      placeholder="Value or variable name"
                      value={data.operationValue || ''}
                      onChange={handleOperationValueChange}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="createNewVariable" 
                    checked={!!data.createNewVariable}
                    onCheckedChange={handleCreateNewVariableChange}
                  />
                  <Label htmlFor="createNewVariable">Create new variable</Label>
                </div>
                
                {data.createNewVariable ? (
                  <div>
                    <label className={nodeStyles.label}>New Variable Name</label>
                    <input
                      type="text"
                      className={clsx(
                        nodeStyles.input,
                        variableNameError ? "border-destructive focus:ring-destructive/50" : ""
                      )}
                      placeholder="Enter new variable name"
                      value={data.targetVariable || ''}
                      onChange={handleNewVariableNameChange}
                    />
                    {variableNameError && (
                      <p className={nodeStyles.error}>{variableNameError}</p>
                    )}
                    <Button 
                      className="mt-3 w-full flex items-center justify-center gap-2"
                      variant="outline"
                      onClick={handleMakeVariableGlobal}
                      disabled={!data.targetVariable || !!variableNameError}
                    >
                      <Globe className="h-4 w-4" />
                      <span>Create Variable</span>
                    </Button>
                    {showCreated && (
                      <div className="mt-2 text-green-600 text-xs font-semibold flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                        Variable created!
                      </div>
                    )}
                    {/* List of created variables with rename/delete */}
                    {createdVariables.length > 0 && (
                      <div className="mt-4">
                        <label className={nodeStyles.label}>Created Variables</label>
                        <div className="space-y-2">
                          {createdVariables.map(v => (
                            <div key={v.name} className="flex items-center gap-2">
                              <input
                                className={nodeStyles.input + ' w-32'}
                                value={v.name}
                                onChange={e => handleRenameVariable(v.name, e.target.value)}
                                onBlur={e => handleRenameVariable(v.name, e.target.value)}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteVariable(v.name)}
                                title="Delete variable"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className={nodeStyles.label}>Store Result In</label>
                    <div className={nodeStyles.suggestions.list}>
                      {variablesWithTypes.map(variable => (
                        <button
                          key={variable.name}
                          onClick={() => handleTargetVariableChange(variable.name)}
                          className={clsx(
                            nodeStyles.suggestions.item,
                            "flex items-center gap-1.5",
                            (data.targetVariable || data.sourceVariable) === variable.name && "bg-primary/10 text-primary"
                          )}
                          title={`Type: ${variable.type}`}
                        >
                          <span>{variable.name}</span>
                          <span className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary/70">
                            {variable.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="p-4 text-center border border-dashed rounded-md">
            <p className="text-sm text-muted-foreground mb-2">No variables found</p>
            <p className="text-xs text-muted-foreground">Create a variable node first</p>
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});

OperationNode.displayName = 'OperationNode';
export default OperationNode; 