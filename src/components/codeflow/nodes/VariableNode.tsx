import { memo, useState, useMemo, useRef } from 'react';
import { ArrowRightLeft, Plus, X, Trash2, ChevronDown, ChevronRight, AlertCircle, Pencil, Type, Hash, CheckCircle2, CircleSlash2, Braces, List } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import NodeWrapper from './NodeWrapper';
import { VariableNodeData, NodeComponentProps } from './types';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';
import { findParentFunctionNodeByPosition } from '../utils';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

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
  const getNodes = useFlowStore(state => state.getNodes);
  const getEdges = useFlowStore(state => state.getEdges);
  const [nameError, setNameError] = useState<string | null>(null);
  const [newListItem, setNewListItem] = useState('');
  const [newDictKey, setNewDictKey] = useState('');
  const [newDictValue, setNewDictValue] = useState('');
  const [isListOpen, setIsListOpen] = useState(false);
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [editingListIndex, setEditingListIndex] = useState<number | null>(null);
  const [editingListValue, setEditingListValue] = useState('');
  const [editingDictIndex, setEditingDictIndex] = useState<number | null>(null);
  const [editingDictKey, setEditingDictKey] = useState('');
  const [editingDictValue, setEditingDictValue] = useState('');
  const listInputRef = useRef<HTMLInputElement | null>(null);
  const dictKeyInputRef = useRef<HTMLInputElement | null>(null);
  const dictValueInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [objectMap, setObjectMap] = useState<Record<string, any>>({});
  const [listAddType, setListAddType] = useState<'string' | 'number' | 'boolean' | 'none' | 'object' | 'list'>('string');
  const [listAddBoolean, setListAddBoolean] = useState<boolean>(false);
  const [listAddObject, setListAddObject] = useState<Record<string, any>>({});
  const [listAddNestedList, setListAddNestedList] = useState<any[]>([]);
  const [nestedListItem, setNestedListItem] = useState('');
  const [listAddObjectKey, setListAddObjectKey] = useState('');
  const [listAddObjectValue, setListAddObjectValue] = useState('');
  
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

  const nodes = getNodes();
  const edges = getEdges();
  const parentFunctionNode = findParentFunctionNodeByPosition(id, nodes);
  const availableParameters: string[] = Array.isArray(parentFunctionNode?.data?.parameters) ? parentFunctionNode.data.parameters : [];

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

  // Validation helpers
  const isDuplicateDictKey = (key: string, excludeIndex?: number) => {
    return (data.dictItems || []).some((item: DictItem, idx: number) => item.key === key && idx !== excludeIndex);
  };
  
  const isDuplicateObjectKey = (key: string, obj: Record<string, any>) => {
    return key in obj;
  };

  const isInvalidType = (value: string, type: string) => {
    if (type === 'number') return isNaN(Number(value));
    return false;
  };

  const handleAddListItem = () => {
    let value: any;
    if (listAddType === 'string') value = newListItem;
    else if (listAddType === 'number') value = Number(newListItem);
    else if (listAddType === 'boolean') value = listAddBoolean;
    else if (listAddType === 'none') value = null;
    else if (listAddType === 'object') value = { ...listAddObject };
    else if (listAddType === 'list') value = [...listAddNestedList];
    else value = newListItem;
    if (listAddType === 'object' && Object.keys(listAddObject).length === 0) return;
    if (listAddType === 'list' && listAddNestedList.length === 0) return;
    if (listAddType !== 'object' && listAddType !== 'list' && listAddType !== 'none' && listAddType !== 'boolean' && (value === undefined || value === '' || (listAddType === 'number' && isNaN(value)))) return;
    setError(null);
    const newListItems = [...(data.listItems || []), value];
    const newData: VariableNodeData = {
      ...data,
      listItems: newListItems,
      value: JSON.stringify(newListItems)
    };
    updateNode(id, newData);
    setNewListItem('');
    setListAddBoolean(false);
    setListAddObject({});
    setListAddNestedList([]);
    setListAddObjectKey('');
    setListAddObjectValue('');
    if (data.name && !nameError) {
      const formattedValue = `[${newListItems.map(item => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return `{${Object.entries(item).map(([k, v]) => `"${k}": "${v}"`).join(', ')}}`;
        }
        if (Array.isArray(item)) {
          return `[${item.map(nestedItem => {
            if (nestedItem === null) return 'None';
            if (nestedItem === true) return 'True';
            if (nestedItem === false) return 'False';
            if (nestedItem === '') return '""';
            if (typeof nestedItem === 'number') return nestedItem;
            return `"${nestedItem}"`;
          }).join(', ')}]`;
        }
        if (item === null) return 'None';
        if (item === true) return 'True';
        if (item === false) return 'False';
        if (item === '') return '""';
        if (typeof item === 'number') return item;
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
        if (item === null) return 'None';
        if (item === true) return 'True';
        if (item === false) return 'False';
        if (item === '') return '""';
        if (typeof item === 'number') return item;
        return `"${item}"`;
      }).join(', ')}]`;
      setVariable(data.name, formattedValue, id);
    }
  };

  const handleAddDictItem = () => {
    if (!newDictKey || (!newDictValue && newDictValue !== '')) return;
    if (isDuplicateDictKey(newDictKey)) {
      setError('Duplicate key: this key already exists in the dictionary');
      return;
    }
    let value: any = newDictValue;
    if (newDictValue === 'true') value = true;
    else if (newDictValue === 'false') value = false;
    else if (newDictValue === 'None') value = null;
    else if (newDictValue === '') value = '';
    else if (!isNaN(Number(newDictValue)) && newDictValue.trim() !== '') value = Number(newDictValue);
    // else keep as string
    setError(null);
    const newDictItems = [...(data.dictItems || []), { key: newDictKey, value }];
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
        if (item.value === null) return `"${item.key}": None`;
        if (item.value === true) return `"${item.key}": True`;
        if (item.value === false) return `"${item.key}": False`;
        if (item.value === '') return `"${item.key}": ""`;
        if (typeof item.value === 'number') return `"${item.key}": ${item.value}`;
        return `"${item.key}": "${item.value}"`;
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
        if (item.value === null) return `"${item.key}": None`;
        if (item.value === true) return `"${item.key}": True`;
        if (item.value === false) return `"${item.key}": False`;
        if (item.value === '') return `"${item.key}": ""`;
        if (typeof item.value === 'number') return `"${item.key}": ${item.value}`;
        return `"${item.key}": "${item.value}"`;
      }).join(', ')}}`;
      setVariable(data.name, formattedValue, id);
    }
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
              onClick={() => handleNameChange({ target: { value: param } } as any)}
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

  // Inline edit save handlers
  const saveListEdit = (index: number) => {
    const newListItems = [...(data.listItems || [])];
    newListItems[index] = editingListValue;
    updateNode(id, { ...data, listItems: newListItems });
    setEditingListIndex(null);
    setEditingListValue('');
  };
  const saveDictEdit = (index: number) => {
    const newDictItems = [...(data.dictItems || [])];
    newDictItems[index] = { key: editingDictKey, value: editingDictValue };
    updateNode(id, { ...data, dictItems: newDictItems });
    setEditingDictIndex(null);
    setEditingDictKey('');
    setEditingDictValue('');
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
          <div className="flex flex-wrap gap-2">
            {VALUE_TYPES.map(({ type, label }) => (
              <Badge
                key={type}
                onClick={() => handleValueTypeChange(type as VariableNodeData['valueType'])}
                className={clsx(
                  "cursor-pointer transition-all hover:scale-105",
                  data.valueType === type 
                    ? "bg-primary hover:bg-primary/90" 
                    : "bg-secondary hover:bg-secondary/90"
                )}
                variant={data.valueType === type ? "default" : "secondary"}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Value Input based on type */}
        {data.valueType === 'list' && (
          <div>
            <Collapsible open={isListOpen} onOpenChange={setIsListOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={clsx(
                    "w-full flex items-center justify-between px-2 py-1 rounded-md transition-colors",
                    isListOpen ? "bg-muted/60" : "hover:bg-muted/40",
                    "group"
                  )}
                  aria-label={isListOpen ? 'Collapse list' : 'Expand list'}
                >
                  <span className="flex items-center gap-2">
                    <span className={clsx(nodeStyles.label, "mb-0 cursor-pointer select-none")}>List Items</span>
                    {!isListOpen && (
                      <span className="text-[10px] text-muted-foreground ml-1">Click to expand</span>
                    )}
                    <Badge variant="secondary" className="text-xs">{(data.listItems || []).length}</Badge>
                  </span>
                  {isListOpen ? (
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform" />
                  )}
                </Button>
              </CollapsibleTrigger>
              {/* Add item input always visible */}
              <div className="flex flex-col gap-2 mt-2 mb-3">
                <div className="flex items-center gap-1 mb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant={listAddType === 'string' ? 'default' : 'outline'}
                        className="h-7 w-7 text-xs"
                        onClick={() => setListAddType('string')}
                        aria-label="String"
                      >
                        <Type className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Text</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant={listAddType === 'number' ? 'default' : 'outline'}
                        className="h-7 w-7 text-xs"
                        onClick={() => setListAddType('number')}
                        aria-label="Number"
                      >
                        <Hash className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Number</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant={listAddType === 'boolean' ? 'default' : 'outline'}
                        className="h-7 w-7 text-xs"
                        onClick={() => setListAddType('boolean')}
                        aria-label="Boolean"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Boolean</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant={listAddType === 'none' ? 'default' : 'outline'}
                        className="h-7 w-7 text-xs"
                        onClick={() => setListAddType('none')}
                        aria-label="None"
                      >
                        <CircleSlash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>None</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant={listAddType === 'list' ? 'default' : 'outline'}
                        className="h-7 w-7 text-xs"
                        onClick={() => setListAddType('list')}
                        aria-label="List"
                      >
                        <List className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Nested List</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant={listAddType === 'object' ? 'default' : 'outline'}
                        className="h-7 w-7 text-xs"
                        onClick={() => setListAddType('object')}
                        aria-label="Object"
                  >
                        <Braces className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Object</TooltipContent>
                  </Tooltip>
                </div>

                {listAddType === 'string' && (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newListItem}
                      onChange={e => setNewListItem(e.target.value)}
                      placeholder="Enter string value"
                      onKeyDown={e => e.key === 'Enter' && handleAddListItem()}
                    />
                    <Button type="button" variant="secondary" size="sm" className="h-8" onClick={handleAddListItem}>
                      <Plus className="h-4 w-4 mr-1" />Add
                    </Button>
                  </div>
                )}

                {listAddType === 'number' && (
              <div className="flex items-center gap-2">
                    <Input
                      type="number"
                  value={newListItem}
                      onChange={e => setNewListItem(e.target.value)}
                      placeholder="Enter number value"
                      onKeyDown={e => e.key === 'Enter' && handleAddListItem()}
                    />
                    <Button type="button" variant="secondary" size="sm" className="h-8" onClick={handleAddListItem}>
                      <Plus className="h-4 w-4 mr-1" />Add
                    </Button>
                  </div>
                )}

                {listAddType === 'boolean' && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center justify-start gap-2 h-8 rounded-md border border-input bg-transparent px-3 py-1">
                      <Switch 
                        checked={listAddBoolean} 
                        onCheckedChange={setListAddBoolean}
                        className="data-[state=checked]:bg-primary"
                      />
                      <span className={clsx(
                        "text-xs font-mono transition-colors",
                        listAddBoolean ? "text-primary font-medium" : "text-muted-foreground"
                      )}>
                        {listAddBoolean ? 'True' : 'False'}
                      </span>
                    </div>
                    <Button type="button" variant="secondary" size="sm" className="h-8" onClick={handleAddListItem}>
                      <Plus className="h-4 w-4 mr-1" />Add
                    </Button>
                  </div>
                )}

                {listAddType === 'none' && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center justify-start gap-2 h-8 rounded-md border border-input bg-transparent px-3 py-1">
                      <CircleSlash2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground">None</span>
                    </div>
                    <Button type="button" variant="secondary" size="sm" className="h-8" onClick={handleAddListItem}>
                      <Plus className="h-4 w-4 mr-1" />Add
                    </Button>
                  </div>
                )}

                {listAddType === 'list' && (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <Input
                        value={nestedListItem}
                        onChange={e => setNestedListItem(e.target.value)}
                        placeholder="List item"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && nestedListItem.trim() !== '') {
                            setError(null);
                            let value: any = nestedListItem;
                            if (nestedListItem === 'true') value = true;
                            else if (nestedListItem === 'false') value = false;
                            else if (nestedListItem === 'None') value = null;
                            else if (!isNaN(Number(nestedListItem)) && nestedListItem.trim() !== '') value = Number(nestedListItem);
                            setListAddNestedList([...listAddNestedList, value]);
                            setNestedListItem('');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (nestedListItem.trim() !== '') {
                            setError(null);
                            let value: any = nestedListItem;
                            if (nestedListItem === 'true') value = true;
                            else if (nestedListItem === 'false') value = false;
                            else if (nestedListItem === 'None') value = null;
                            else if (!isNaN(Number(nestedListItem)) && nestedListItem.trim() !== '') value = Number(nestedListItem);
                            setListAddNestedList([...listAddNestedList, value]);
                            setNestedListItem('');
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {listAddNestedList.length > 0 && (
                      <div className="font-mono text-xs bg-muted rounded px-2 py-1 mb-2">
                        {'[' + listAddNestedList.map(item => {
                          if (item === null) return 'None';
                          if (item === true) return 'True';
                          if (item === false) return 'False';
                          if (typeof item === 'number') return item;
                          return `"${item}"`;
                        }).join(', ') + ']'}
                      </div>
                    )}
                    {listAddNestedList.length > 0 && (
                      <div className="flex justify-between">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-destructive" 
                          onClick={() => setListAddNestedList([])}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />Clear
                        </Button>
                        <Button type="button" variant="secondary" size="sm" className="h-8" onClick={handleAddListItem}>
                          <Plus className="h-4 w-4 mr-1" />Add List
                        </Button>
                      </div>
                    )}
                    {listAddNestedList.length === 0 && (
                      <Button type="button" variant="secondary" size="sm" className="h-8" disabled>
                        <Plus className="h-4 w-4 mr-1" />Add List
                      </Button>
                    )}
                  </div>
                )}

                {listAddType === 'object' && (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <Input
                        value={listAddObjectKey}
                        onChange={e => setListAddObjectKey(e.target.value)}
                        placeholder="Key"
                        className="max-w-[100px]"
                      />
                      <Input
                        value={listAddObjectValue}
                        onChange={e => setListAddObjectValue(e.target.value)}
                        placeholder="Value"
                        className="max-w-[120px]"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && listAddObjectKey) {
                            if (isDuplicateObjectKey(listAddObjectKey, listAddObject)) {
                              setError(`Duplicate key: "${listAddObjectKey}" already exists in this object`);
                              return;
                            }
                            setError(null);
                            setListAddObject(obj => ({ ...obj, [listAddObjectKey]: listAddObjectValue }));
                            setListAddObjectKey('');
                            setListAddObjectValue('');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (listAddObjectKey) {
                            if (isDuplicateObjectKey(listAddObjectKey, listAddObject)) {
                              setError(`Duplicate key: "${listAddObjectKey}" already exists in this object`);
                              return;
                            }
                            setError(null);
                            setListAddObject(obj => ({ ...obj, [listAddObjectKey]: listAddObjectValue }));
                            setListAddObjectKey('');
                            setListAddObjectValue('');
                          }
                        }}
                >
                  <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {Object.keys(listAddObject).length > 0 && (
                      <div className="font-mono text-xs bg-muted rounded px-2 py-1 mb-2">
                        {'{ ' + Object.entries(listAddObject).map(([k, v]) => `"${k}": "${v}"`).join(', ') + ' }'}
                      </div>
                    )}
                    <Button type="button" variant="secondary" size="sm" className="h-8" onClick={handleAddListItem}>
                      <Plus className="h-4 w-4 mr-1" />Add Object
                    </Button>
                  </div>
                )}
              </div>
              <CollapsibleContent>
                {(data.listItems || []).length === 0 ? (
                  <div className="bg-muted/40 rounded-md p-2 text-center text-sm text-muted-foreground italic border border-muted/30">
                    Empty list. Add items above.
                  </div>
                ) : (
                  <div className="space-y-2 mb-2 bg-muted/30 rounded-md p-2 border border-muted/30">
                    {(data.listItems || []).map((item: any, index: number) => {
                      let type: string;
                      let displayValue;
                      if (item && typeof item === 'object' && !Array.isArray(item)) {
                        type = 'object';
                        displayValue = `{${Object.entries(item).map(([k, v]) => `"${k}": "${v}"`).join(', ')}}`;
                      } else if (item === null) {
                        type = 'null';
                        displayValue = 'None';
                      } else if (item === true || item === false) {
                        type = 'boolean';
                        displayValue = item === true ? 'True' : 'False';
                      } else if (item === '') {
                        type = 'empty';
                        displayValue = '""';
                      } else if (typeof item === 'number') {
                        type = 'number';
                        displayValue = item;
                      } else {
                        type = 'string';
                        displayValue = `"${item}"`;
                      }
                      const isEditing = editingListIndex === index;
                      return (
                        <Card key={index} className="p-2 flex items-center justify-between bg-background border-muted">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="px-1 py-0 text-xs">
                              {index}
                            </Badge>
                            {isEditing ? (
                              (editingListValue.length > 30 || editingListValue.includes('\n')) ? (
                                <Textarea
                                  value={editingListValue}
                                  onChange={e => setEditingListValue(e.target.value)}
                                  onBlur={() => saveListEdit(index)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) { saveListEdit(index); }
                                    if (e.key === 'Escape') { setEditingListIndex(null); setEditingListValue(''); }
                                  }}
                                  className="min-h-[60px] resize-y"
                                  autoFocus
                                />
                              ) : (
                                <Input
                                  ref={listInputRef}
                                  value={editingListValue}
                                  onChange={e => setEditingListValue(e.target.value)}
                                  onBlur={() => saveListEdit(index)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') { saveListEdit(index); }
                                    if (e.key === 'Escape') { setEditingListIndex(null); setEditingListValue(''); }
                                  }}
                                  autoFocus
                                />
                              )
                            ) : (
                              <div
                                className="font-mono text-sm truncate max-w-[160px] cursor-pointer group hover:bg-accent/40 rounded px-1 transition flex items-center"
                                onClick={() => { setEditingListIndex(index); setEditingListValue(String(displayValue)); }}
                                title={String(displayValue)}
                              >
                                {displayValue}
                                <Pencil className="ml-1 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                              </div>
                            )}
                            <Badge variant="secondary" className="ml-2 text-xs capitalize">
                              {type === 'empty' ? 'empty string' : type}
                            </Badge>
                          </div>
                          <button
                            onClick={() => handleRemoveListItem(index)}
                            className="p-1 text-destructive hover:text-destructive/80 rounded-full hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </Card>
                      );
                    })}
            </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {data.valueType === 'dict' && (
          <div>
            <Collapsible open={isDictOpen} onOpenChange={setIsDictOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={clsx(
                    "w-full flex items-center justify-between px-2 py-1 rounded-md transition-colors",
                    isDictOpen ? "bg-muted/60" : "hover:bg-muted/40",
                    "group"
                  )}
                  aria-label={isDictOpen ? 'Collapse dict' : 'Expand dict'}
                >
                  <span className="flex items-center gap-2">
                    <span className={clsx(nodeStyles.label, "mb-0 cursor-pointer select-none")}>Dictionary Items</span>
                    {!isDictOpen && (
                      <span className="text-[10px] text-muted-foreground ml-1">Click to expand</span>
                    )}
                    <Badge variant="secondary" className="text-xs">{(data.dictItems || []).length}</Badge>
                  </span>
                  {isDictOpen ? (
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform" />
                  )}
                </Button>
              </CollapsibleTrigger>
              {/* Add item input always visible */}
              <div className="flex flex-col gap-2 mt-2 mb-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={newDictKey}
                    onChange={e => setNewDictKey(e.target.value)}
                    placeholder="Key"
                  />
                  <Input
                    value={newDictValue}
                    onChange={e => setNewDictValue(e.target.value)}
                    placeholder="Value"
                    onKeyDown={e => e.key === 'Enter' && handleAddDictItem()}
                  />
                </div>
                {Object.keys(objectMap).length > 0 && (
                  <div className="font-mono text-xs bg-muted rounded px-2 py-1 mb-2">
                    {'{ ' + Object.entries(objectMap).map(([k, v]) => `"${k}": "${v}"`).join(', ') + ' }'}
                  </div>
                )}
                <Button
                  onClick={handleAddDictItem}
                  size="sm"
                  variant="secondary"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Key-Value Pair
                </Button>
              </div>
              <CollapsibleContent>
                {(data.dictItems || []).length === 0 ? (
                  <div className="bg-muted/40 rounded-md p-2 text-center text-sm text-muted-foreground italic border border-muted/30">
                    Empty dictionary. Add key-value pairs above.
                  </div>
                ) : (
                  <div className="space-y-2 mb-2 bg-muted/30 rounded-md p-2 border border-muted/30">
                    {(data.dictItems || []).map((item: DictItem, index: number) => {
                      let type: string;
                      let displayValue;
                      if (item.value === null) {
                        type = 'null';
                        displayValue = 'None';
                      } else if (typeof item.value === 'boolean') {
                        type = 'boolean';
                        displayValue = item.value ? 'True' : 'False';
                      } else if (item.value === '') {
                        type = 'empty';
                        displayValue = '""';
                      } else if (!isNaN(Number(item.value)) && item.value !== '' && item.value !== null && typeof item.value !== 'boolean') {
                        type = 'number';
                        displayValue = item.value;
                      } else {
                        type = 'string';
                        displayValue = `"${item.value}"`;
                      }
                      const isEditing = editingDictIndex === index;
                      return (
                        <Card key={index} className="p-2 border-muted bg-background flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 w-full">
                            {isEditing ? (
                              <>
                                <Input
                                  ref={dictKeyInputRef}
                                  value={editingDictKey}
                                  onChange={e => setEditingDictKey(e.target.value)}
                                  onBlur={() => saveDictEdit(index)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') { saveDictEdit(index); }
                                    if (e.key === 'Escape') { setEditingDictIndex(null); setEditingDictKey(''); setEditingDictValue(''); }
                                  }}
                                  className="max-w-[80px]"
                                  autoFocus
                                />
                                <span className="text-xs text-muted-foreground">:</span>
                                {(editingDictValue.length > 30 || editingDictValue.includes('\n')) ? (
                                  <Textarea
                                    value={editingDictValue}
                                    onChange={e => setEditingDictValue(e.target.value)}
                                    onBlur={() => saveDictEdit(index)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter' && !e.shiftKey) { saveDictEdit(index); }
                                      if (e.key === 'Escape') { setEditingDictIndex(null); setEditingDictKey(''); setEditingDictValue(''); }
                                    }}
                                    className="min-h-[40px] resize-y max-w-[120px]"
                                  />
                                ) : (
                                  <Input
                                    ref={dictValueInputRef}
                                    value={editingDictValue}
                                    onChange={e => setEditingDictValue(e.target.value)}
                                    onBlur={() => saveDictEdit(index)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') { saveDictEdit(index); }
                                      if (e.key === 'Escape') { setEditingDictIndex(null); setEditingDictKey(''); setEditingDictValue(''); }
                                    }}
                                    className="max-w-[120px]"
                                  />
                                )}
                              </>
                            ) : (
                              <>
                                <span
                                  className="font-mono text-xs bg-muted px-2 py-1 rounded-md text-foreground/80 max-w-[80px] truncate cursor-pointer group hover:bg-accent/40 transition flex items-center"
                                  title={item.key}
                                  onClick={() => { setEditingDictIndex(index); setEditingDictKey(item.key); setEditingDictValue(item.value); }}
                                >
                                  {item.key}
                                  <Pencil className="ml-1 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                                </span>
                                <span className="text-xs text-muted-foreground">:</span>
                                <span
                                  className="font-mono text-sm bg-background px-2 py-1 rounded-md max-w-[120px] truncate cursor-pointer group hover:bg-accent/40 transition flex items-center"
                                  title={String(displayValue)}
                                  onClick={() => { setEditingDictIndex(index); setEditingDictKey(item.key); setEditingDictValue(item.value); }}
                                >
                                  {displayValue}
                                </span>
                              </>
                            )}
                            <Badge variant="secondary" className="ml-2 text-xs capitalize">
                              {type === 'empty' ? 'empty string' : type}
                            </Badge>
            </div>
                          <button
                            onClick={() => handleRemoveDictItem(index)}
                            className="p-1 text-destructive hover:text-destructive/80 rounded-full hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </Card>
                      );
                    })}
          </div>
        )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
      {renderParameterSuggestions()}
      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-md px-2 py-1 mb-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </NodeWrapper>
  );
});

VariableNode.displayName = 'VariableNode';

export default VariableNode; 