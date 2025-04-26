import { memo, useState, useMemo } from 'react';
import { ArrowRightLeft, Plus, X } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import NodeWrapper from './NodeWrapper';
import { VariableNodeData, NodeComponentProps } from './types';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';

interface DictItem {
  key: string;
  value: string;
}

const VariableNode = memo(({ data, id, selected }: NodeComponentProps<VariableNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const setVariable = useFlowStore(state => state.setVariable);
  const deleteVariable = useFlowStore(state => state.deleteVariable);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const [nameError, setNameError] = useState<string | null>(null);
  const [newListItem, setNewListItem] = useState('');
  const [newDictKey, setNewDictKey] = useState('');
  const [newDictValue, setNewDictValue] = useState('');
  
  // Python keywords that cannot be used as variable names
  const PYTHON_KEYWORDS = [
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 
    'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 
    'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 
    'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
  ];

  const VALUE_TYPES = [
    { type: 'string', label: 'String' },
    { type: 'number', label: 'Number' },
    { type: 'boolean', label: 'Boolean' },
    { type: 'list', label: 'List' },
    { type: 'dict', label: 'Dictionary' }
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
      setVariable(newName, JSON.stringify(data.value || ''), id);
    }
  };

  const handleValueTypeChange = (type: VariableNodeData['valueType']) => {
    let initialValue: any;
    switch (type) {
      case 'string':
        initialValue = '';
        break;
      case 'number':
        initialValue = 0;
        break;
      case 'boolean':
        initialValue = false;
        break;
      case 'list':
        initialValue = [];
        break;
      case 'dict':
        initialValue = [];
        break;
      default:
        initialValue = '';
    }

    const newData: VariableNodeData = {
      ...data,
      valueType: type,
      value: initialValue,
      listItems: type === 'list' ? [] : undefined,
      dictItems: type === 'dict' ? [] : undefined
    };
    updateNode(id, newData);
    
    if (data.name && !nameError) {
      setVariable(data.name, JSON.stringify(initialValue), id);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: any = e.target.value;
    
    if (data.valueType === 'number') {
      newValue = parseFloat(newValue) || 0;
    } else if (data.valueType === 'boolean') {
      newValue = newValue === 'true';
    } else if (data.valueType === 'list') {
      // Split by comma and trim each element, then wrap each in quotes
      const items = newValue.split(',').map((item: string) => item.trim());
      newValue = items;
    }

    const newData: VariableNodeData = {
      ...data,
      value: newValue
    };
    updateNode(id, newData);
    
    if (data.name && !nameError) {
      if (data.valueType === 'list') {
        // Format as a Python list with each element as a string
        const formattedValue = `[${newValue.map((item: string) => `"${item}"`).join(', ')}]`;
        setVariable(data.name, formattedValue, id);
      } else {
        setVariable(data.name, JSON.stringify(newValue), id);
      }
    }
  };

  const handleAddListItem = () => {
    if (!newListItem) return;
    
    const newListItems = [...(data.listItems || []), newListItem];
    const newData: VariableNodeData = {
      ...data,
      listItems: newListItems,
      value: JSON.stringify(newListItems) // Keep JSON.stringify for type compatibility
    };
    updateNode(id, newData);
    setNewListItem('');
    
    if (data.name && !nameError) {
      // Format the list items properly for Python
      const formattedValue = `[${newListItems.map(item => {
        // Try to parse as number first
        const num = Number(item);
        if (!isNaN(num)) {
          return num.toString();
        }
        // If not a number, wrap in quotes
        return `"${item}"`;
      }).join(', ')}]`;
      setVariable(data.name, formattedValue, id);
    }
  };

  const handleRemoveListItem = (index: number) => {
    const newListItems = [...(data.listItems || [])];
    newListItems.splice(index, 1);
    
    const newData: VariableNodeData = {
      ...data,
      listItems: newListItems,
      value: JSON.stringify(newListItems)
    };
    updateNode(id, newData);
    
    if (data.name && !nameError) {
      const formattedValue = `[${newListItems.map(item => {
        const num = Number(item);
        return !isNaN(num) ? num : `"${item}"`; 
      }).join(', ')}]`;
      setVariable(data.name, formattedValue, id);
    }
  };

  const handleAddDictItem = () => {
    if (!newDictKey || !newDictValue) return;
    
    const newDictItems = [...(data.dictItems || []), { key: newDictKey, value: newDictValue }];
    const newData: VariableNodeData = {
      ...data,
      dictItems: newDictItems,
      value: JSON.stringify(newDictItems)
    };
    updateNode(id, newData);
    setNewDictKey('');
    setNewDictValue('');
    
    if (data.name && !nameError) {
      const formattedValue = `{${newDictItems.map(item => {
        const numValue = Number(item.value);
        const formattedValue = !isNaN(numValue) ? numValue : `"${item.value}"`;
        return `"${item.key}": ${formattedValue}`;
      }).join(', ')}}`;
      setVariable(data.name, formattedValue, id);
    }
  };

  const handleRemoveDictItem = (index: number) => {
    const newDictItems = [...(data.dictItems || [])];
    newDictItems.splice(index, 1);
    
    const newData: VariableNodeData = {
      ...data,
      dictItems: newDictItems,
      value: JSON.stringify(newDictItems)
    };
    updateNode(id, newData);
    
    if (data.name && !nameError) {
      const formattedValue = `{${newDictItems.map(item => {
        const numValue = Number(item.value);
        const formattedValue = !isNaN(numValue) ? numValue : `"${item.value}"`;
        return `"${item.key}": ${formattedValue}`;
      }).join(', ')}}`;
      setVariable(data.name, formattedValue, id);
    }
  };

  return (
    <NodeWrapper 
      id={id}
      icon={ArrowRightLeft}
      label="Variable"
      selected={selected}
      category="core"
    >
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

        {/* Value Type Badges */}
        <div>
          <label className={nodeStyles.label}>Value Type</label>
          <div className={nodeStyles.suggestions.list}>
            {VALUE_TYPES.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => handleValueTypeChange(type as VariableNodeData['valueType'])}
                className={clsx(
                  nodeStyles.suggestions.item,
                  data.valueType === type && "bg-primary/10 text-primary"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Value Input based on type */}
        {data.valueType === 'list' && (
          <div>
            <label className={nodeStyles.label}>List Items</label>
            <div className="space-y-2">
              {data.listItems?.map((item: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={item}
                    readOnly
                    className={nodeStyles.input}
                  />
                  <button
                    onClick={() => handleRemoveListItem(index)}
                    className="p-1 text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  value={newListItem}
                  onChange={(e) => setNewListItem(e.target.value)}
                  placeholder="New item"
                  className={nodeStyles.input}
                />
                <button
                  onClick={handleAddListItem}
                  className="p-1 text-primary hover:text-primary/80"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {data.valueType === 'dict' && (
          <div>
            <label className={nodeStyles.label}>Dictionary Items</label>
            <div className="space-y-2">
              {data.dictItems?.map((item: DictItem, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={item.key}
                    readOnly
                    className={nodeStyles.input}
                  />
                  <input
                    value={item.value}
                    readOnly
                    className={nodeStyles.input}
                  />
                  <button
                    onClick={() => handleRemoveDictItem(index)}
                    className="p-1 text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  value={newDictKey}
                  onChange={(e) => setNewDictKey(e.target.value)}
                  placeholder="Key"
                  className={nodeStyles.input}
                />
                <input
                  value={newDictValue}
                  onChange={(e) => setNewDictValue(e.target.value)}
                  placeholder="Value"
                  className={nodeStyles.input}
                />
                <button
                  onClick={handleAddDictItem}
                  className="p-1 text-primary hover:text-primary/80"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!['list', 'dict'].includes(data.valueType || '') && (
          <div>
            <label className={nodeStyles.label}>Value</label>
            <div className="relative">
              <input
                type={data.valueType === 'number' ? 'number' : 'text'}
                value={data.value as string || ''}
                onChange={handleValueChange}
                placeholder={
                  data.valueType === 'string' ? 'Enter text' :
                  data.valueType === 'number' ? 'Enter number' :
                  data.valueType === 'boolean' ? 'true/false' : ''
                }
                className={nodeStyles.input}
              />
            </div>
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});

VariableNode.displayName = 'VariableNode';

export default VariableNode; 