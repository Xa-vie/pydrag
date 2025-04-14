import { memo, useState, useMemo, useEffect } from 'react';
import { useFlowStore } from '@/store/use-flow-store';
import NodeWrapper from './NodeWrapper';
import { OperationNodeData, NodeComponentProps } from './types';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';
import { Wrench, ChevronDown, Info, AlertCircle, Search } from 'lucide-react';

const OperationNode = memo(({ data, id, selected }: NodeComponentProps<OperationNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const [resultVariable, setResultVariable] = useState(data.resultVariable || '');
  const [operationError, setOperationError] = useState<string | null>(null);
  const [showParameterSuggestions, setShowParameterSuggestions] = useState<number | null>(null);

  // Get all available variables with their types
  const availableVariables = useMemo(() => {
    const vars = getAllVariables();
    return vars.map(varName => {
      const value = getVariable(varName);
      let type = 'unknown';
      
      if (value !== undefined) {
        try {
          const parsedValue = JSON.parse(value);
          if (typeof parsedValue === 'string') type = 'string';
          else if (Array.isArray(parsedValue)) type = 'list';
          else if (typeof parsedValue === 'object' && parsedValue !== null) type = 'dict';
          else if (typeof parsedValue === 'number') type = 'number';
          else if (typeof parsedValue === 'boolean') type = 'boolean';
        } catch {
          // If parsing fails, treat as string
          type = 'string';
        }
      }
      
      return { name: varName, type, value };
    });
  }, [getAllVariables, getVariable]);

  // Filter variables based on data type compatibility
  const filteredVariables = useMemo(() => {
    return availableVariables.filter(v => 
      !data.dataType || v.type === data.dataType
    );
  }, [availableVariables, data.dataType]);

  // Operation types for each data type
  const STRING_OPERATIONS = [
    { value: 'upper', label: 'Uppercase', description: 'Convert string to uppercase' },
    { value: 'lower', label: 'Lowercase', description: 'Convert string to lowercase' },
    { value: 'capitalize', label: 'Capitalize', description: 'Capitalize first character' },
    { value: 'strip', label: 'Strip Whitespace', description: 'Remove leading/trailing whitespace' },
    { value: 'replace', label: 'Replace', description: 'Replace substring with another' },
    { value: 'split', label: 'Split', description: 'Split string into list by delimiter' },
    { value: 'join', label: 'Join', description: 'Join list elements with separator' },
    { value: 'len', label: 'Length', description: 'Get string length' },
    { value: 'count', label: 'Count Substring', description: 'Count occurrences of substring' },
    { value: 'find', label: 'Find Substring', description: 'Find position of substring' },
    { value: 'startswith', label: 'Starts With', description: 'Check if string starts with prefix' },
    { value: 'endswith', label: 'Ends With', description: 'Check if string ends with suffix' },
  ];

  const LIST_OPERATIONS = [
    { value: 'append', label: 'Append', description: 'Add item to end of list' },
    { value: 'extend', label: 'Extend', description: 'Add all items from another list' },
    { value: 'insert', label: 'Insert', description: 'Insert item at specific position' },
    { value: 'remove', label: 'Remove', description: 'Remove first occurrence of item' },
    { value: 'pop', label: 'Pop', description: 'Remove and return item at index' },
    { value: 'index', label: 'Index', description: 'Find index of item in list' },
    { value: 'count', label: 'Count', description: 'Count occurrences of item' },
    { value: 'sort', label: 'Sort', description: 'Sort list in place' },
    { value: 'reverse', label: 'Reverse', description: 'Reverse list in place' },
    { value: 'len', label: 'Length', description: 'Get number of items in list' },
    { value: 'slice', label: 'Slice', description: 'Extract portion of list' },
  ];

  const DICT_OPERATIONS = [
    { value: 'keys', label: 'Get Keys', description: 'Get all dictionary keys' },
    { value: 'values', label: 'Get Values', description: 'Get all dictionary values' },
    { value: 'items', label: 'Get Items', description: 'Get all key-value pairs' },
    { value: 'get', label: 'Get Value', description: 'Get value by key with optional default' },
    { value: 'setdefault', label: 'Set Default', description: 'Get value or set default if missing' },
    { value: 'update', label: 'Update', description: 'Update dictionary with another dictionary' },
    { value: 'clear', label: 'Clear', description: 'Remove all items from dictionary' },
    { value: 'pop', label: 'Pop', description: 'Remove and return value by key' },
    { value: 'len', label: 'Length', description: 'Get number of key-value pairs' },
  ];

  // Get operations based on data type
  const getOperations = () => {
    switch (data.dataType) {
      case 'string':
        return STRING_OPERATIONS;
      case 'list':
        return LIST_OPERATIONS;
      case 'dict':
        return DICT_OPERATIONS;
      default:
        return [];
    }
  };

  // Auto-detect data type from selected variable
  useEffect(() => {
    if (data.targetVariable) {
      const variable = availableVariables.find(v => v.name === data.targetVariable);
      if (variable && variable.type !== 'unknown' && variable.type !== data.dataType) {
        updateNode(id, {
          ...data,
          dataType: variable.type as 'string' | 'list' | 'dict',
          operation: '', // Reset operation when type changes
          parameters: []
        });
      }
    }
  }, [data.targetVariable, availableVariables, data.dataType, id, updateNode]);

  // Select target variable
  const selectTargetVariable = (varName: string) => {
    const variable = availableVariables.find(v => v.name === varName);
    if (variable) {
      updateNode(id, {
        ...data,
        type: 'operation',
        targetVariable: varName,
        dataType: variable.type as 'string' | 'list' | 'dict',
        operation: '',
        parameters: []
      });
    }
  };

  // Select operation
  const selectOperation = (operation: string) => {
    updateNode(id, {
      ...data,
      type: 'operation',
      operation,
      parameters: getDefaultParameters(operation)
    });
  };

  // Handle parameter change
  const handleParameterChange = (index: number, value: string) => {
    const newParameters = [...data.parameters];
    newParameters[index] = value;
    updateNode(id, {
      ...data,
      type: 'operation',
      parameters: newParameters
    });
  };

  // Get default parameters based on operation
  const getDefaultParameters = (operation: string) => {
    switch (operation) {
      case 'replace':
        return ['', ''];
      case 'split':
        return [''];
      case 'join':
        return [''];
      case 'count':
        return [''];
      case 'find':
        return [''];
      case 'startswith':
        return [''];
      case 'endswith':
        return [''];
      case 'append':
        return [''];
      case 'extend':
        return [''];
      case 'insert':
        return ['0', ''];
      case 'remove':
        return [''];
      case 'pop':
        return ['-1'];
      case 'index':
        return [''];
      case 'sort':
        return ['False'];
      case 'slice':
        return ['0', 'None'];
      case 'get':
        return ['', 'None'];
      case 'setdefault':
        return ['', ''];
      case 'update':
        return ['{}'];
      case 'pop':
        return ['', 'None'];
      default:
        return [];
    }
  };

  // Handle result variable change
  const handleResultVariableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newResultVariable = e.target.value.trim();
    setResultVariable(newResultVariable);
    updateNode(id, {
      ...data,
      type: 'operation',
      resultVariable: newResultVariable
    });
  };

  // Insert variable at cursor position for parameters
  const insertVariableToParameter = (index: number, varName: string) => {
    const newParameters = [...data.parameters];
    newParameters[index] = varName;
    updateNode(id, {
      ...data,
      parameters: newParameters
    });
    setShowParameterSuggestions(null);
  };

  // Get parameter labels based on operation
  const getParameterLabels = () => {
    const { operation } = data;
    
    switch (operation) {
      case 'replace':
        return ['Old', 'New'];
      case 'split':
        return ['Delimiter'];
      case 'join':
        return ['Separator'];
      case 'count':
        return ['Substring'];
      case 'find':
        return ['Substring'];
      case 'startswith':
        return ['Prefix'];
      case 'endswith':
        return ['Suffix'];
      case 'append':
        return ['Value'];
      case 'extend':
        return ['List'];
      case 'insert':
        return ['Index', 'Value'];
      case 'remove':
        return ['Value'];
      case 'pop':
        return ['Index'];
      case 'index':
        return ['Value'];
      case 'sort':
        return ['Reverse'];
      case 'slice':
        return ['Start', 'End'];
      case 'get':
        return ['Key', 'Default'];
      case 'setdefault':
        return ['Key', 'Default'];
      case 'update':
        return ['Dictionary'];
      default:
        return [];
    }
  };

  // Get operation description
  const getOperationDescription = () => {
    const { operation } = data;
    const operations = getOperations();
    const op = operations.find(o => o.value === operation);
    return op?.description || '';
  };

  // Generate Python code for the operation
  const generateCode = () => {
    const { dataType, operation, parameters, targetVariable } = data;
    
    if (!operation || !targetVariable) return '';
    
    let code = '';
    
    switch (operation) {
      case 'upper':
      case 'lower':
      case 'capitalize':
      case 'strip':
        code = `${targetVariable}.${operation}()`;
        break;
      case 'replace':
        code = `${targetVariable}.replace(${parameters[0]}, ${parameters[1]})`;
        break;
      case 'split':
        code = `${targetVariable}.split(${parameters[0]})`;
        break;
      case 'join':
        code = `${parameters[0]}.join(${targetVariable})`;
        break;
      case 'len':
        code = `len(${targetVariable})`;
        break;
      case 'count':
        code = `${targetVariable}.count(${parameters[0]})`;
        break;
      case 'find':
        code = `${targetVariable}.find(${parameters[0]})`;
        break;
      case 'startswith':
        code = `${targetVariable}.startswith(${parameters[0]})`;
        break;
      case 'endswith':
        code = `${targetVariable}.endswith(${parameters[0]})`;
        break;
      case 'append':
        code = `${targetVariable}.append(${parameters[0]})`;
        break;
      case 'extend':
        code = `${targetVariable}.extend(${parameters[0]})`;
        break;
      case 'insert':
        code = `${targetVariable}.insert(${parameters[0]}, ${parameters[1]})`;
        break;
      case 'remove':
        code = `${targetVariable}.remove(${parameters[0]})`;
        break;
      case 'pop':
        code = `${targetVariable}.pop(${parameters[0]})`;
        break;
      case 'index':
        code = `${targetVariable}.index(${parameters[0]})`;
        break;
      case 'sort':
        code = `${targetVariable}.sort(reverse=${parameters[0]})`;
        break;
      case 'reverse':
        code = `${targetVariable}.reverse()`;
        break;
      case 'slice':
        code = `${targetVariable}[${parameters[0]}:${parameters[1]}]`;
        break;
      case 'keys':
        code = `list(${targetVariable}.keys())`;
        break;
      case 'values':
        code = `list(${targetVariable}.values())`;
        break;
      case 'items':
        code = `list(${targetVariable}.items())`;
        break;
      case 'get':
        code = `${targetVariable}.get(${parameters[0]}, ${parameters[1]})`;
        break;
      case 'setdefault':
        code = `${targetVariable}.setdefault(${parameters[0]}, ${parameters[1]})`;
        break;
      case 'update':
        code = `${targetVariable}.update(${parameters[0]})`;
        break;
      case 'clear':
        code = `${targetVariable}.clear()`;
        break;
      default:
        code = '';
    }
    
    // Store result in variable if specified
    if (resultVariable) {
      code = `${resultVariable} = ${code}`;
    }
    
    return code;
  };

  // Render parameter variable suggestions
  const renderParameterVariableSuggestions = (index: number) => {
    if (availableVariables.length === 0) return null;
    
    return (
      <div className={nodeStyles.suggestions.container}>
        <p className={nodeStyles.suggestions.title}>Available Variables:</p>
        <div className={nodeStyles.suggestions.list}>
          {availableVariables.map(varInfo => (
            <button
              key={varInfo.name}
              onClick={() => insertVariableToParameter(index, varInfo.name)}
              className={clsx(
                nodeStyles.suggestions.item,
                "flex items-center gap-1"
              )}
              title={`Value: ${varInfo.value}`}
            >
              <span>{varInfo.name}</span>
              <span className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary/70">
                {varInfo.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <NodeWrapper
      id={id}
      icon={Wrench}
      label="Operation"
      selected={selected}
    >
      <div className="flex flex-col gap-3">
        {/* Variable Selection */}
        <div>
          <label className={nodeStyles.label}>Target Variable</label>
          <div className={nodeStyles.suggestions.list}>
            {filteredVariables.map(varInfo => (
              <button
                key={varInfo.name}
                onClick={() => selectTargetVariable(varInfo.name)}
                className={clsx(
                  nodeStyles.suggestions.item,
                  "flex items-center gap-1",
                  data.targetVariable === varInfo.name && "bg-primary/10 text-primary"
                )}
                title={`Value: ${varInfo.value}`}
              >
                <span>{varInfo.name}</span>
                <span className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary/70">
                  {varInfo.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Operation Selection */}
        {data.dataType && (
          <div>
            <label className={nodeStyles.label}>Operation</label>
            <div className={nodeStyles.suggestions.list}>
              {getOperations().map((op) => (
                <button
                  key={op.value}
                  onClick={() => selectOperation(op.value)}
                  className={clsx(
                    nodeStyles.suggestions.item,
                    "flex items-center gap-1",
                    data.operation === op.value && "bg-primary/10 text-primary"
                  )}
                  title={op.description}
                >
                  <span>{op.label}</span>
                </button>
              ))}
            </div>
            
            {/* Operation Description */}
            {data.operation && (
              <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{getOperationDescription()}</span>
              </div>
            )}
          </div>
        )}

        {/* Parameters */}
        {data.operation && data.parameters.map((param, index) => (
          <div key={index}>
            <label className={nodeStyles.label}>{getParameterLabels()[index]}</label>
            <div className="relative">
              <input
                type="text"
                className={nodeStyles.input}
                value={param}
                onChange={(e) => handleParameterChange(index, e.target.value)}
                onFocus={() => setShowParameterSuggestions(index)}
                placeholder={`Enter ${getParameterLabels()[index].toLowerCase()}`}
              />
              {showParameterSuggestions === index && renderParameterVariableSuggestions(index)}
            </div>
          </div>
        ))}

        {/* Result Variable */}
        <div>
          <label className={nodeStyles.label}>Store Result In</label>
          <div className="relative">
            <input
              type="text"
              className={nodeStyles.input}
              value={resultVariable}
              onChange={handleResultVariableChange}
              placeholder="Variable name (optional)"
            />
          </div>
        </div>

        {/* Error Message */}
        {operationError && (
          <div className="flex items-start gap-1.5 text-[10px] text-destructive">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{operationError}</span>
          </div>
        )}

        {/* Generated Code Preview */}
        {data.operation && data.targetVariable && (
          <div className="mt-2 rounded-md bg-muted/50 p-2 text-xs font-mono">
            <pre className="whitespace-pre-wrap">{generateCode()}</pre>
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});

OperationNode.displayName = 'OperationNode';

export default OperationNode; 