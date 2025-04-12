import { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Type, Trash2, Info, Printer, Variable, Code2, Repeat, CircleDot, MoveUp, MoveDown, FolderOpen, Package, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const nodeStyles = {
  base: "shadow-lg border-0 transition-all duration-200 hover:shadow-2xl rounded-lg bg-white dark:bg-slate-900",
  handle: "!w-3 !h-3 bg-slate-400 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-400 transition-colors duration-200 rounded-full",
  input: "bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-offset-0 focus:border-primary-500 dark:focus:border-primary-400 transition-colors duration-200 text-sm",
  header: "py-2 px-3 flex flex-col space-y-1",
  content: "p-3 pt-2",
  nodeWidth: "w-[280px]",
  label: "text-xs text-slate-500 dark:text-slate-400 font-medium",
  title: "text-sm font-semibold text-slate-900 dark:text-white tracking-tight",
  description: "text-xs text-slate-500 dark:text-slate-400 leading-tight",
};

const getNodeColors = (color: string) => ({
  border: `border-${color}-500/20 dark:border-${color}-400/20`,
  background: `bg-white dark:bg-slate-900`,
  header: ``,
  shadow: `shadow-${color}-500/20 dark:shadow-${color}-400/20`,
  ring: `focus-visible:ring-${color}-500/30 dark:focus-visible:ring-${color}-400/30`,
  icon: `text-${color}-500 dark:text-${color}-400`,
  title: `text-slate-900 dark:text-white`,
});

interface NodeWrapperProps {
  children: React.ReactNode[];
  color: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  info?: string;
  title: string;
  position?: number;
  totalNodes?: number;
}

interface NodeProps {
  data: {
    onDelete?: (params: { nodes: { id: string }[] }) => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    updateProperty?: (propertyName: string, value: any) => void;
    // Keep basic properties that are used across multiple node types
    variable?: string;
    value?: string;
    condition?: string;
    iterable?: string;
    content?: string;
    prompt?: string;
    name?: string;
    params?: string;
    code?: string;
    error?: string;
    expression?: string;
    filename?: string;
    mode?: string;
    module?: string;
    alias?: string;
    position?: number;
    totalNodes?: number;
    conditions?: string[];
    variableType?: string;
    printItems?: string[];
    loopType?: string;
    start?: string;
    end?: string;
    step?: string;
    indexVar?: string;
    useCounter?: boolean;
    counterVar?: string;
    counterInit?: string;
    counterIncrement?: string;
    showDocstring?: boolean;
    returnType?: string;
    docstring?: string;
    items?: string[];
    operation?: string;
    appendValue?: string;
    insertIndex?: string;
    insertValue?: string;
    removeValue?: string;
    popIndex?: string;
    reverseSort?: boolean;
    keyValuePairs?: { key: string, value: string }[];
    updateKey?: string;
    updateValue?: string;
    getKey?: string;
    deleteKey?: string;
    setItems?: string[];
    addItem?: string;
    removeItem?: string;
    otherSet?: string;
    tupleItems?: string[];
    accessIndex?: string;
    countValue?: string;
    findValue?: string;
    method?: string;
    route?: string;
    data?: string;
    url?: string;
    query?: string;
    connection?: string;
    responseModel?: string;
    availableVariables?: string[];
    handleDataChange?: (propertyName: string, value: any) => void;
  };
  id: string;
}

const NodeWrapper = memo(({
  children,
  color,
  onDelete,
  onMoveUp,
  onMoveDown,
  info,
  title,
  position,
  totalNodes
}: NodeWrapperProps) => {
  const colors = getNodeColors(color);
  return (
    <Card className={cn(
      nodeStyles.base,
      nodeStyles.nodeWidth,
      colors.border,
      colors.background,
      colors.shadow,
      "group"
    )}>
      <CardHeader className={cn(
        nodeStyles.header,
        colors.header,
      )}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn(nodeStyles.title, colors.title, "flex items-center gap-2")}>
            {children[0]} <span className="ml-1">{title}</span>
          </CardTitle>
          <div className="flex items-center gap-1">
            {onMoveUp && position !== 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400/50 dark:text-slate-500/50 hover:text-blue-500 dark:hover:text-blue-400 group-hover:opacity-100 opacity-0 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
              >
                <MoveUp className="h-4 w-4" />
              </Button>
            )}
            {onMoveDown && position !== (totalNodes ?? 0) - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400/50 dark:text-slate-500/50 hover:text-blue-500 dark:hover:text-blue-400 group-hover:opacity-100 opacity-0 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
              >
                <MoveDown className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400/50 dark:text-slate-500/50 hover:text-red-500 dark:hover:text-red-400 group-hover:opacity-100 opacity-0 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {info && (
          <p className={nodeStyles.description}>
            {info}
          </p>
        )}
      </CardHeader>
      <CardContent className={nodeStyles.content}>
        {children[1]}
      </CardContent>
    </Card>
  );
});

NodeWrapper.displayName = 'NodeWrapper';

export const IfBlock = memo(({ data, id }: NodeProps) => {
  const [conditions, setConditions] = useState<string[]>(
    data.conditions?.length ? data.conditions : [data.condition || '']
  );

  const addCondition = () => {
    const newConditions = [...conditions, ''];
    setConditions(newConditions);
    data.updateProperty?.('conditions', newConditions);
  };

  const removeCondition = (index: number) => {
    if (conditions.length <= 1) return;
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
    data.updateProperty?.('conditions', newConditions);
  };

  const updateCondition = (index: number, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = value;
    setConditions(newConditions);
    data.updateProperty?.('conditions', newConditions);
  };

  return (
    <NodeWrapper
      color="blue"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Creates a conditional branch. Code inside will only run if the condition is true"
      title="If Condition"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Code2 className={cn("h-4 w-4", getNodeColors("blue").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <label className={nodeStyles.label}>
                    {index === 0 ? 'Condition' : index === 1 ? 'Else if' : `Else if ${index}`}
                  </label>
                  <Input
                    value={condition}
                    onChange={(e) => updateCondition(index, e.target.value)}
                    placeholder={index === 0 ? "e.g., x > 0" : "e.g., x < 0"}
                    className={cn(nodeStyles.input, getNodeColors("blue").ring)}
                  />
                </div>
                {conditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 mt-6 text-slate-400 hover:text-red-500"
                    onClick={() => removeCondition(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 text-xs"
              onClick={addCondition}
            >
              Add Else If
            </Button>
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

IfBlock.displayName = 'IfBlock';

export const PrintBlock = memo(({ data, id }: NodeProps) => {
  const [printItems, setPrintItems] = useState<string[]>(
    data.printItems?.length ? data.printItems : [data.content || '']
  );

  const addPrintItem = () => {
    const newItems = [...printItems, ''];
    setPrintItems(newItems);
    data.updateProperty?.('printItems', newItems);
  };

  const removePrintItem = (index: number) => {
    if (printItems.length <= 1) return;
    const newItems = printItems.filter((_, i) => i !== index);
    setPrintItems(newItems);
    data.updateProperty?.('printItems', newItems);
  };

  const updatePrintItem = (index: number, value: string) => {
    const newItems = [...printItems];
    newItems[index] = value;
    setPrintItems(newItems);
    data.updateProperty?.('printItems', newItems);
  };

  // Common text templates
  const textTemplates = [
    "Hello, World!",
    "The value is:",
    "Result:",
    "Count:",
    "Total:",
    "Current value:",
    "Processing...",
    "Done!",
    "Error:",
    "Success!"
  ];

  return (
    <NodeWrapper
      color="green"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      title="Print"
      info="Print values or variables to the console"
    >
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
      <div className="flex flex-col space-y-2">
        {printItems.map((item, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Select
                value={item.startsWith('"') || item.startsWith("'") ? "text" : "variable"}
                onValueChange={(value) => {
                  if (value === "text") {
                    updatePrintItem(index, `""`);
                  } else {
                    updatePrintItem(index, "");
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs flex-shrink-0 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>

              {item.startsWith('"') || item.startsWith("'") ? (
                // Text mode - show text templates
                <Select
                  value={item.slice(1, -1)}
                  onValueChange={(value) => updatePrintItem(index, `"${value}"`)}
                >
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Select or type text..." />
                  </SelectTrigger>
                  <SelectContent>
                    {textTemplates.map((template) => (
                      <SelectItem key={template} value={template}>
                        {template}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom text...</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                // Variable mode - show available variables
                <Select
                  value={item}
                  onValueChange={(value) => updatePrintItem(index, value)}
                >
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Select a variable..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(data.availableVariables?.map((variable) => (
                      <SelectItem key={variable} value={variable}>
                        {variable}
                      </SelectItem>
                    ))) || (
                      <SelectItem value="" disabled>
                        No variables available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => removePrintItem(index)}
                      disabled={printItems.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove item</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Show text input only when custom text is selected */}
            {item.startsWith('"') && item.slice(1, -1) === "custom" && (
              <Input
                value=""
                onChange={(e) => updatePrintItem(index, `"${e.target.value}"`)}
                placeholder="Enter custom text..."
                className={cn(nodeStyles.input, getNodeColors("green").ring)}
              />
            )}
          </div>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full", getNodeColors("green").ring)}
          onClick={addPrintItem}
        >
          Add Item
        </Button>
      </div>
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </NodeWrapper>
  );
});

PrintBlock.displayName = 'PrintBlock';

export const InputBlock = memo(({ data, id }: NodeProps) => (
  <NodeWrapper
    color="purple"
    onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
    info="Creates an input prompt to get user input and store it in a variable"
    title="Input"
  >
    <>
      <Type className={cn("h-4 w-4", getNodeColors("purple").icon)} />
    </>
    <div className="space-y-3">
      <div>
        <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
        <div className="space-y-2">
          <div className="space-y-1">
            <label className={nodeStyles.label}>Variable Name</label>
            <Input
              value={data.variable}
              onChange={(e) => data.updateProperty?.('variable', e.target.value)}
              placeholder="e.g., user_input"
              className={cn(nodeStyles.input, getNodeColors("purple").ring)}
            />
          </div>
          <div className="space-y-1">
            <label className={nodeStyles.label}>Prompt</label>
            <Input
              value={data.prompt}
              onChange={(e) => data.updateProperty?.('prompt', e.target.value)}
              placeholder="Enter your prompt..."
              className={cn(nodeStyles.input, getNodeColors("purple").ring)}
            />
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
      </div>
    </div>
  </NodeWrapper>
));

InputBlock.displayName = 'InputBlock';

export const ForBlock = memo(({ data, id }: NodeProps) => {
  const [loopType, setLoopType] = useState(data.loopType || "range");

  // Initialize with default values if not provided
  useEffect(() => {
    if (loopType === "range") {
      if (!data.start) data.updateProperty?.('start', "0");
      if (!data.end) data.updateProperty?.('end', "10");
      if (!data.step) data.updateProperty?.('step', "1");
    }
  }, [loopType, data]);

  const handleLoopTypeChange = (value: string) => {
    setLoopType(value);
    data.updateProperty?.('loopType', value);
  };

  return (
    <NodeWrapper
      color="yellow"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Creates a loop that iterates over a sequence"
      title="For Loop"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Repeat className={cn("h-4 w-4", getNodeColors("yellow").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>Loop Type</label>
              <Select value={loopType} onValueChange={handleLoopTypeChange}>
                <SelectTrigger className={cn(nodeStyles.input, getNodeColors("yellow").ring)}>
                  <SelectValue placeholder="Select loop type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="range">Range</SelectItem>
                  <SelectItem value="collection">Collection</SelectItem>
                  <SelectItem value="enumerate">Enumerate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Iterator Variable</label>
              <Input
                value={data.variable}
                onChange={(e) => data.updateProperty?.('variable', e.target.value)}
                placeholder="e.g., i"
                className={cn(nodeStyles.input, getNodeColors("yellow").ring)}
              />
            </div>
            {loopType === "range" && (
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className={nodeStyles.label}>Start</label>
                  <Input
                    value={data.start || "0"}
                    onChange={(e) => data.updateProperty?.('start', e.target.value)}
                    placeholder="0"
                    className={cn(nodeStyles.input, getNodeColors("yellow").ring)}
                  />
                </div>
                <div className="space-y-1">
                  <label className={nodeStyles.label}>End</label>
                  <Input
                    value={data.end || "10"}
                    onChange={(e) => data.updateProperty?.('end', e.target.value)}
                    placeholder="10"
                    className={cn(nodeStyles.input, getNodeColors("yellow").ring)}
                  />
                </div>
                <div className="space-y-1">
                  <label className={nodeStyles.label}>Step</label>
                  <Input
                    value={data.step || "1"}
                    onChange={(e) => data.updateProperty?.('step', e.target.value)}
                    placeholder="1"
                    className={cn(nodeStyles.input, getNodeColors("yellow").ring)}
                  />
                </div>
              </div>
            )}
            {(loopType === "collection" || loopType === "enumerate") && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Collection</label>
                <Input
                  value={data.iterable}
                  onChange={(e) => data.updateProperty?.('iterable', e.target.value)}
                  placeholder={loopType === "collection" ? "e.g., my_list" : "e.g., my_list"}
                  className={cn(nodeStyles.input, getNodeColors("yellow").ring)}
                />
              </div>
            )}
            {loopType === "enumerate" && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Index Variable</label>
                <Input
                  value={data.indexVar}
                  onChange={(e) => data.updateProperty?.('indexVar', e.target.value)}
                  placeholder="e.g., idx"
                  className={cn(nodeStyles.input, getNodeColors("yellow").ring)}
                />
              </div>
            )}
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

ForBlock.displayName = 'ForBlock';

export const WhileBlock = memo(({ data, id }: NodeProps) => {
  const [useCounter, setUseCounter] = useState(data.useCounter || false);

  const toggleCounter = () => {
    setUseCounter(!useCounter);
    data.updateProperty?.('useCounter', !useCounter);
  };

  return (
    <NodeWrapper
      color="red"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Creates a loop that continues while a condition is true"
      title="While Loop"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <CircleDot className={cn("h-4 w-4", getNodeColors("red").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>Condition</label>
              <Input
                value={data.condition}
                onChange={(e) => data.updateProperty?.('condition', e.target.value)}
                placeholder="e.g., x < 100"
                className={cn(nodeStyles.input, getNodeColors("red").ring)}
              />
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="useCounter"
                checked={useCounter}
                onCheckedChange={toggleCounter}
              />
              <label
                htmlFor="useCounter"
                className={nodeStyles.label}
              >
                Add counter variable
              </label>
            </div>
            {useCounter && (
              <div className="space-y-2 pt-1">
                <div className="space-y-1">
                  <label className={nodeStyles.label}>Counter Variable</label>
                  <Input
                    value={data.counterVar}
                    onChange={(e) => data.updateProperty?.('counterVar', e.target.value)}
                    placeholder="e.g., counter"
                    className={cn(nodeStyles.input, getNodeColors("red").ring)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className={nodeStyles.label}>Initial Value</label>
                    <Input
                      value={data.counterInit}
                      onChange={(e) => data.updateProperty?.('counterInit', e.target.value)}
                      placeholder="0"
                      className={cn(nodeStyles.input, getNodeColors("red").ring)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={nodeStyles.label}>Increment</label>
                    <Input
                      value={data.counterIncrement}
                      onChange={(e) => data.updateProperty?.('counterIncrement', e.target.value)}
                      placeholder="1"
                      className={cn(nodeStyles.input, getNodeColors("red").ring)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

WhileBlock.displayName = 'WhileBlock';

export const ListBlock = memo(({ data, id }: NodeProps) => {
  const [items, setItems] = useState<string[]>(
    data.items?.length ? data.items : ['']
  );
  const [operation, setOperation] = useState('create');

  const addItem = () => {
    const newItems = [...items, ''];
    setItems(newItems);
    data.updateProperty?.('items', newItems);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    data.updateProperty?.('items', newItems);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    data.updateProperty?.('items', newItems);
  };

  const handleOperationChange = (value: string) => {
    setOperation(value);
    data.updateProperty?.('operation', value);
  };

  return (
    <NodeWrapper
      color="indigo"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Creates and manipulates a list data structure"
      title="List"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Type className={cn("h-4 w-4", getNodeColors("indigo").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>List Name</label>
              <Input
                value={data.variable}
                onChange={(e) => data.updateProperty?.('variable', e.target.value)}
                placeholder="e.g., my_list"
                className={cn(nodeStyles.input, getNodeColors("indigo").ring)}
              />
            </div>

            <div className="space-y-1">
              <label className={nodeStyles.label}>Operation</label>
              <Select value={operation} onValueChange={handleOperationChange}>
                <SelectTrigger className={cn(nodeStyles.input, getNodeColors("indigo").ring)}>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="append">Append</SelectItem>
                  <SelectItem value="insert">Insert</SelectItem>
                  <SelectItem value="remove">Remove</SelectItem>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="clear">Clear</SelectItem>
                  <SelectItem value="sort">Sort</SelectItem>
                  <SelectItem value="reverse">Reverse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {operation === 'create' && (
              <div className="space-y-2">
                <label className={nodeStyles.label}>Initial Items</label>
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateItem(index, e.target.value)}
                      placeholder={`Item ${index + 1}`}
                      className={cn(nodeStyles.input, getNodeColors("indigo").ring)}
                    />
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-red-500"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1 text-xs"
                  onClick={addItem}
                >
                  Add Item
                </Button>
              </div>
            )}

            {operation === 'append' && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Value to Append</label>
                <Input
                  value={data.appendValue}
                  onChange={(e) => data.updateProperty?.('appendValue', e.target.value)}
                  placeholder="Value to append"
                  className={cn(nodeStyles.input, getNodeColors("indigo").ring)}
                />
              </div>
            )}

            {operation === 'insert' && (
              <>
                <div className="space-y-1">
                  <label className={nodeStyles.label}>Index</label>
                  <Input
                    value={data.insertIndex}
                    onChange={(e) => data.updateProperty?.('insertIndex', e.target.value)}
                    placeholder="Index (e.g., 0)"
                    className={cn(nodeStyles.input, getNodeColors("indigo").ring)}
                  />
                </div>
                <div className="space-y-1">
                  <label className={nodeStyles.label}>Value to Insert</label>
                  <Input
                    value={data.insertValue}
                    onChange={(e) => data.updateProperty?.('insertValue', e.target.value)}
                    placeholder="Value to insert"
                    className={cn(nodeStyles.input, getNodeColors("indigo").ring)}
                  />
                </div>
              </>
            )}

            {operation === 'remove' && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Value to Remove</label>
                <Input
                  value={data.removeValue}
                  onChange={(e) => data.updateProperty?.('removeValue', e.target.value)}
                  placeholder="Value to remove"
                  className={cn(nodeStyles.input, getNodeColors("indigo").ring)}
                />
              </div>
            )}

            {operation === 'pop' && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Index (optional)</label>
                <Input
                  value={data.popIndex}
                  onChange={(e) => data.updateProperty?.('popIndex', e.target.value)}
                  placeholder="Index (default: last item)"
                  className={cn(nodeStyles.input, getNodeColors("indigo").ring)}
                />
              </div>
            )}

            {operation === 'sort' && (
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="reverseSort"
                  checked={data.reverseSort}
                  onCheckedChange={(checked) => data.updateProperty?.('reverseSort', !!checked)}
                />
                <label
                  htmlFor="reverseSort"
                  className={nodeStyles.label}
                >
                  Reverse sort (descending)
                </label>
              </div>
            )}
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

ListBlock.displayName = 'ListBlock';

export const DictBlock = memo(({ data, id }: NodeProps) => {
  const [operation, setOperation] = useState(data.operation || 'create');
  const [keyValuePairs, setKeyValuePairs] = useState<{ key: string, value: string }[]>(
    data.keyValuePairs?.length ? data.keyValuePairs : [{ key: '', value: '' }]
  );

  const addKeyValuePair = () => {
    const newPairs = [...keyValuePairs, { key: '', value: '' }];
    setKeyValuePairs(newPairs);
    data.updateProperty?.('keyValuePairs', newPairs);
  };

  const removeKeyValuePair = (index: number) => {
    if (keyValuePairs.length <= 1) return;
    const newPairs = keyValuePairs.filter((_, i) => i !== index);
    setKeyValuePairs(newPairs);
    data.updateProperty?.('keyValuePairs', newPairs);
  };

  const updateKeyValuePair = (index: number, field: 'key' | 'value', value: string) => {
    const newPairs = [...keyValuePairs];
    newPairs[index][field] = value;
    setKeyValuePairs(newPairs);
    data.updateProperty?.('keyValuePairs', newPairs);
  };

  const handleOperationChange = (value: string) => {
    setOperation(value);
    data.updateProperty?.('operation', value);
  };

  return (
    <NodeWrapper
      color="pink"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Creates and manipulates a dictionary data structure"
      title="Dictionary"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Type className={cn("h-4 w-4", getNodeColors("pink").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>Dictionary Name</label>
              <Input
                value={data.variable}
                onChange={(e) => data.updateProperty?.('variable', e.target.value)}
                placeholder="e.g., my_dict"
                className={cn(nodeStyles.input, getNodeColors("pink").ring)}
              />
            </div>

            <div className="space-y-1">
              <label className={nodeStyles.label}>Operation</label>
              <Select value={operation} onValueChange={handleOperationChange}>
                <SelectTrigger className={cn(nodeStyles.input, getNodeColors("pink").ring)}>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update/Add Key</SelectItem>
                  <SelectItem value="get">Get Value</SelectItem>
                  <SelectItem value="delete">Delete Key</SelectItem>
                  <SelectItem value="clear">Clear</SelectItem>
                  <SelectItem value="keys">Get Keys</SelectItem>
                  <SelectItem value="values">Get Values</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {operation === 'create' && (
              <div className="space-y-2">
                <label className={nodeStyles.label}>Key-Value Pairs</label>
                {keyValuePairs.map((pair, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <div className="flex-1">
                      <Input
                        value={pair.key}
                        onChange={(e) => updateKeyValuePair(index, 'key', e.target.value)}
                        placeholder="Key"
                        className={cn(nodeStyles.input, getNodeColors("pink").ring)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={pair.value}
                        onChange={(e) => updateKeyValuePair(index, 'value', e.target.value)}
                        placeholder="Value"
                        className={cn(nodeStyles.input, getNodeColors("pink").ring)}
                      />
                      {keyValuePairs.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-red-500"
                          onClick={() => removeKeyValuePair(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1 text-xs"
                  onClick={addKeyValuePair}
                >
                  Add Key-Value Pair
                </Button>
              </div>
            )}

            {operation === 'update' && (
              <>
                <div className="space-y-1">
                  <label className={nodeStyles.label}>Key</label>
                  <Input
                    value={data.updateKey}
                    onChange={(e) => data.updateProperty?.('updateKey', e.target.value)}
                    placeholder="Key to update/add"
                    className={cn(nodeStyles.input, getNodeColors("pink").ring)}
                  />
                </div>
                <div className="space-y-1">
                  <label className={nodeStyles.label}>Value</label>
                  <Input
                    value={data.updateValue}
                    onChange={(e) => data.updateProperty?.('updateValue', e.target.value)}
                    placeholder="New value"
                    className={cn(nodeStyles.input, getNodeColors("pink").ring)}
                  />
                </div>
              </>
            )}

            {operation === 'get' && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Key</label>
                <Input
                  value={data.getKey}
                  onChange={(e) => data.updateProperty?.('getKey', e.target.value)}
                  placeholder="Key to retrieve"
                  className={cn(nodeStyles.input, getNodeColors("pink").ring)}
                />
              </div>
            )}

            {operation === 'delete' && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Key</label>
                <Input
                  value={data.deleteKey}
                  onChange={(e) => data.updateProperty?.('deleteKey', e.target.value)}
                  placeholder="Key to delete"
                  className={cn(nodeStyles.input, getNodeColors("pink").ring)}
                />
              </div>
            )}
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

DictBlock.displayName = 'DictBlock';

export const TupleBlock = memo(({ data, id }: NodeProps) => {
  const [operation, setOperation] = useState(data.operation || 'create');
  const [items, setItems] = useState<string[]>(
    data.tupleItems?.length ? data.tupleItems : ['']
  );

  const addItem = () => {
    const newItems = [...items, ''];
    setItems(newItems);
    data.updateProperty?.('tupleItems', newItems);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    data.updateProperty?.('tupleItems', newItems);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    data.updateProperty?.('tupleItems', newItems);
  };

  const handleOperationChange = (value: string) => {
    setOperation(value);
    data.updateProperty?.('operation', value);
  };

  return (
    <NodeWrapper
      color="amber"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Creates and accesses a tuple data structure"
      title="Tuple"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Type className={cn("h-4 w-4", getNodeColors("amber").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>Tuple Name</label>
              <Input
                value={data.variable}
                onChange={(e) => data.updateProperty?.('variable', e.target.value)}
                placeholder="e.g., my_tuple"
                className={cn(nodeStyles.input, getNodeColors("amber").ring)}
              />
            </div>

            <div className="space-y-1">
              <label className={nodeStyles.label}>Operation</label>
              <Select value={operation} onValueChange={handleOperationChange}>
                <SelectTrigger className={cn(nodeStyles.input, getNodeColors("amber").ring)}>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="access">Access by Index</SelectItem>
                  <SelectItem value="count">Count Occurrences</SelectItem>
                  <SelectItem value="index">Find Index</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {operation === 'create' && (
              <div className="space-y-2">
                <label className={nodeStyles.label}>Items</label>
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateItem(index, e.target.value)}
                      placeholder={`Item ${index + 1}`}
                      className={cn(nodeStyles.input, getNodeColors("amber").ring)}
                    />
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-red-500"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1 text-xs"
                  onClick={addItem}
                >
                  Add Item
                </Button>
              </div>
            )}

            {operation === 'access' && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Index</label>
                <Input
                  value={data.accessIndex}
                  onChange={(e) => data.updateProperty?.('accessIndex', e.target.value)}
                  placeholder="Index (e.g., 0)"
                  className={cn(nodeStyles.input, getNodeColors("amber").ring)}
                />
              </div>
            )}

            {operation === 'count' && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Value to Count</label>
                <Input
                  value={data.countValue}
                  onChange={(e) => data.updateProperty?.('countValue', e.target.value)}
                  placeholder="Value to count"
                  className={cn(nodeStyles.input, getNodeColors("amber").ring)}
                />
              </div>
            )}

            {operation === 'index' && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Value to Find</label>
                <Input
                  value={data.findValue}
                  onChange={(e) => data.updateProperty?.('findValue', e.target.value)}
                  placeholder="Value to find"
                  className={cn(nodeStyles.input, getNodeColors("amber").ring)}
                />
              </div>
            )}
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

TupleBlock.displayName = 'TupleBlock';

export const SetBlock = memo(({ data, id }: NodeProps) => {
  const [operation, setOperation] = useState(data.operation || 'create');
  const [items, setItems] = useState<string[]>(
    data.setItems?.length ? data.setItems : ['']
  );

  const addItem = () => {
    const newItems = [...items, ''];
    setItems(newItems);
    data.updateProperty?.('setItems', newItems);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    data.updateProperty?.('setItems', newItems);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    data.updateProperty?.('setItems', newItems);
  };

  const handleOperationChange = (value: string) => {
    setOperation(value);
    data.updateProperty?.('operation', value);
  };

  return (
    <NodeWrapper
      color="fuchsia"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Creates and manipulates a set data structure"
      title="Set"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Type className={cn("h-4 w-4", getNodeColors("fuchsia").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>Set Name</label>
              <Input
                value={data.variable}
                onChange={(e) => data.updateProperty?.('variable', e.target.value)}
                placeholder="e.g., my_set"
                className={cn(nodeStyles.input, getNodeColors("fuchsia").ring)}
              />
            </div>

            <div className="space-y-1">
              <label className={nodeStyles.label}>Operation</label>
              <Select value={operation} onValueChange={handleOperationChange}>
                <SelectTrigger className={cn(nodeStyles.input, getNodeColors("fuchsia").ring)}>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="add">Add Item</SelectItem>
                  <SelectItem value="remove">Remove Item</SelectItem>
                  <SelectItem value="union">Union</SelectItem>
                  <SelectItem value="intersection">Intersection</SelectItem>
                  <SelectItem value="difference">Difference</SelectItem>
                  <SelectItem value="clear">Clear</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {operation === 'create' && (
              <div className="space-y-2">
                <label className={nodeStyles.label}>Initial Items</label>
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateItem(index, e.target.value)}
                      placeholder={`Item ${index + 1}`}
                      className={cn(nodeStyles.input, getNodeColors("fuchsia").ring)}
                    />
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-red-500"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1 text-xs"
                  onClick={addItem}
                >
                  Add Item
                </Button>
              </div>
            )}

            {operation === 'add' && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Item to Add</label>
                <Input
                  value={data.addItem}
                  onChange={(e) => data.updateProperty?.('addItem', e.target.value)}
                  placeholder="Value to add"
                  className={cn(nodeStyles.input, getNodeColors("fuchsia").ring)}
                />
              </div>
            )}

            {operation === 'remove' && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Item to Remove</label>
                <Input
                  value={data.removeItem}
                  onChange={(e) => data.updateProperty?.('removeItem', e.target.value)}
                  placeholder="Value to remove"
                  className={cn(nodeStyles.input, getNodeColors("fuchsia").ring)}
                />
              </div>
            )}

            {(operation === 'union' || operation === 'intersection' || operation === 'difference') && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Other Set</label>
                <Input
                  value={data.otherSet}
                  onChange={(e) => data.updateProperty?.('otherSet', e.target.value)}
                  placeholder="Other set variable"
                  className={cn(nodeStyles.input, getNodeColors("fuchsia").ring)}
                />
              </div>
            )}
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

SetBlock.displayName = 'SetBlock';

export const LambdaBlock = memo(({ data, id }: NodeProps) => (
  <NodeWrapper
    color="amber"
    title="Lambda"
    onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
    onMoveUp={data.onMoveUp}
    onMoveDown={data.onMoveDown}
    position={data.position}
    totalNodes={data.totalNodes}
    info="Creates an anonymous function"
  >
    <>
      <Code2 className={cn("h-4 w-4", getNodeColors("amber").icon)} />
    </>
    <div className="space-y-2">
      <div className="space-y-1">
        <label className={nodeStyles.label}>Parameters</label>
        <Input
          value={data.params}
          onChange={(e) => data.updateProperty?.('params', e.target.value)}
          placeholder="Parameters..."
          className={nodeStyles.input}
        />
      </div>
      <div className="space-y-1">
        <label className={nodeStyles.label}>Expression</label>
        <Input
          value={data.expression}
          onChange={(e) => data.updateProperty?.('expression', e.target.value)}
          placeholder="Expression..."
          className={nodeStyles.input}
        />
      </div>
    </div>
  </NodeWrapper>
));

LambdaBlock.displayName = 'LambdaBlock';

export const OpenFileBlock = memo(({ data, id }: NodeProps) => (
  <NodeWrapper
    color="cyan"
    title="Open File"
    onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
    onMoveUp={data.onMoveUp}
    onMoveDown={data.onMoveDown}
    position={data.position}
    totalNodes={data.totalNodes}
    info="Opens a file for reading or writing"
  >
    <>
      <FolderOpen className={cn("h-4 w-4", getNodeColors("cyan").icon)} />
    </>
    <div className="space-y-2">
      <div className="space-y-1">
        <label className={nodeStyles.label}>File Variable</label>
        <Input
          value={data.variable}
          onChange={(e) => data.updateProperty?.('variable', e.target.value)}
          placeholder="File variable..."
          className={nodeStyles.input}
        />
      </div>
      <div className="space-y-1">
        <label className={nodeStyles.label}>Filename</label>
        <Input
          value={data.filename}
          onChange={(e) => data.updateProperty?.('filename', e.target.value)}
          placeholder="Filename..."
          className={nodeStyles.input}
        />
      </div>
      <div className="space-y-1">
        <label className={nodeStyles.label}>Mode</label>
        <Input
          value={data.mode}
          onChange={(e) => data.updateProperty?.('mode', e.target.value)}
          placeholder="Mode (r/w/a)..."
          className={nodeStyles.input}
        />
      </div>
    </div>
  </NodeWrapper>
));

OpenFileBlock.displayName = 'OpenFileBlock';

export const TryBlock = memo(({ data, id }: NodeProps) => (
  <NodeWrapper
    color="rose"
    onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
    onMoveUp={data.onMoveUp}
    onMoveDown={data.onMoveDown}
    info="Implements error handling with try/except blocks"
    title="Try/Except"
    position={data.position}
    totalNodes={data.totalNodes}
  >
    <>
      <Info className={cn("h-4 w-4", getNodeColors("rose").icon)} />
    </>
    <div className="space-y-3">
      <div>
        <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
        <div className="space-y-2">
          <div className="space-y-1">
            <label className={nodeStyles.label}>Try Block Code</label>
            <Input
              value={data.code}
              onChange={(e) => data.updateProperty?.('code', e.target.value)}
              placeholder="Code to try..."
              className={cn(nodeStyles.input, getNodeColors("rose").ring)}
            />
          </div>
          <div className="space-y-1">
            <label className={nodeStyles.label}>Exception Type</label>
            <Input
              value={data.error}
              onChange={(e) => data.updateProperty?.('error', e.target.value)}
              placeholder="e.g., Exception"
              className={cn(nodeStyles.input, getNodeColors("rose").ring)}
            />
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
      </div>
    </div>
  </NodeWrapper>
));

TryBlock.displayName = 'TryBlock';

export const ImportBlock = memo(({ data, id }: NodeProps) => (
  <NodeWrapper
    color="emerald"
    title="Import"
    onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
    onMoveUp={data.onMoveUp}
    onMoveDown={data.onMoveDown}
    position={data.position}
    totalNodes={data.totalNodes}
    info="Imports a module or package"
  >
    <>
      <Package className={cn("h-4 w-4", getNodeColors("emerald").icon)} />
    </>
    <div className="space-y-2">
      <div className="space-y-1">
        <label className={nodeStyles.label}>Module</label>
        <Input
          value={data.module}
          onChange={(e) => data.updateProperty?.('module', e.target.value)}
          placeholder="Module name..."
          className={nodeStyles.input}
        />
      </div>
      <div className="space-y-1">
        <label className={nodeStyles.label}>Alias</label>
        <Input
          value={data.alias}
          onChange={(e) => data.updateProperty?.('alias', e.target.value)}
          placeholder="Alias (optional)..."
          className={nodeStyles.input}
        />
      </div>
    </div>
  </NodeWrapper>
));

ImportBlock.displayName = 'ImportBlock';

export const NumpyArrayBlock = memo(({ data, id }: NodeProps) => (
  <NodeWrapper
    color="violet"
    title="NumPy Array"
    onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
    onMoveUp={data.onMoveUp}
    onMoveDown={data.onMoveDown}
    position={data.position}
    totalNodes={data.totalNodes}
    info="Creates a NumPy array"
  >
    <>
      <Table className={cn("h-4 w-4", getNodeColors("violet").icon)} />
    </>
    <div className="space-y-2">
      <div className="space-y-1">
        <label className={nodeStyles.label}>Array Name</label>
        <Input
          value={data.variable}
          onChange={(e) => data.updateProperty?.('variable', e.target.value)}
          placeholder="Array name..."
          className={nodeStyles.input}
        />
      </div>
      <div className="space-y-1">
        <label className={nodeStyles.label}>Array Value</label>
        <Input
          value={data.value}
          onChange={(e) => data.updateProperty?.('value', e.target.value)}
          placeholder="Array value..."
          className={nodeStyles.input}
        />
      </div>
    </div>
  </NodeWrapper>
));

NumpyArrayBlock.displayName = 'NumpyArrayBlock';

export const VariableBlock = memo(({ data, id }: NodeProps) => {
  const [variableType, setVariableType] = useState(data.variableType || "string");

  const handleTypeChange = (value: string) => {
    setVariableType(value);
    data.updateProperty?.('variableType', value);
  };

  return (
    <NodeWrapper
      color="blue"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Declares a variable and assigns it a value"
      title="Variable"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Variable className={cn("h-4 w-4", getNodeColors("blue").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>Variable Name</label>
              <Input
                value={data.variable}
                onChange={(e) => data.updateProperty?.('variable', e.target.value)}
                placeholder="e.g., my_variable"
                className={cn(nodeStyles.input, getNodeColors("blue").ring)}
              />
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Type</label>
              <Select value={variableType} onValueChange={handleTypeChange}>
                <SelectTrigger className={cn(nodeStyles.input, getNodeColors("blue").ring)}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Value</label>
              <Input
                value={data.value}
                onChange={(e) => data.updateProperty?.('value', e.target.value)}
                placeholder={variableType === "string" ? "Text value" :
                  variableType === "number" ? "Numeric value" : "true/false"}
                className={cn(nodeStyles.input, getNodeColors("blue").ring)}
              />
            </div>
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

VariableBlock.displayName = 'VariableBlock';

export const FunctionBlock = memo(({ data, id }: NodeProps) => {
  const [showDocstring, setShowDocstring] = useState(data.showDocstring || false);

  const toggleDocstring = () => {
    setShowDocstring(!showDocstring);
    data.updateProperty?.('showDocstring', !showDocstring);
  };

  return (
    <NodeWrapper
      color="orange"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Defines a reusable function with parameters"
      title="Function"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Code2 className={cn("h-4 w-4", getNodeColors("orange").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>Function Name</label>
              <Input
                value={data.name}
                onChange={(e) => data.updateProperty?.('name', e.target.value)}
                placeholder="e.g., my_function"
                className={cn(nodeStyles.input, getNodeColors("orange").ring)}
              />
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Parameters</label>
              <Input
                value={data.params}
                onChange={(e) => data.updateProperty?.('params', e.target.value)}
                placeholder="e.g., x, y=10"
                className={cn(nodeStyles.input, getNodeColors("orange").ring)}
              />
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Return Type (optional)</label>
              <Input
                value={data.returnType}
                onChange={(e) => data.updateProperty?.('returnType', e.target.value)}
                placeholder="e.g., int, str, None"
                className={cn(nodeStyles.input, getNodeColors("orange").ring)}
              />
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="showDocstring"
                checked={showDocstring}
                onCheckedChange={toggleDocstring}
              />
              <label
                htmlFor="showDocstring"
                className={nodeStyles.label}
              >
                Add docstring
              </label>
            </div>
            {showDocstring && (
              <div className="space-y-1 pt-1">
                <label className={nodeStyles.label}>Docstring</label>
                <Textarea
                  value={data.docstring}
                  onChange={(e) => data.updateProperty?.('docstring', e.target.value)}
                  placeholder="Function description..."
                  className={cn(nodeStyles.input, getNodeColors("orange").ring)}
                  rows={3}
                />
              </div>
            )}
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

FunctionBlock.displayName = 'FunctionBlock';

export const ReturnBlock = memo(({ data, id }: NodeProps) => (
  <NodeWrapper
    color="lime"
    onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
    onMoveUp={data.onMoveUp}
    onMoveDown={data.onMoveDown}
    info="Returns a value from a function"
    title="Return"
    position={data.position}
    totalNodes={data.totalNodes}
  >
    <>
      <Code2 className={cn("h-4 w-4", getNodeColors("lime").icon)} />
    </>
    <div className="space-y-3">
      <div>
        <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
        <div className="space-y-2">
          <div className="space-y-1">
            <label className={nodeStyles.label}>Return Value</label>
            <Input
              value={data.value}
              onChange={(e) => data.updateProperty?.('value', e.target.value)}
              placeholder="Value to return"
              className={cn(nodeStyles.input, getNodeColors("lime").ring)}
            />
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
      </div>
    </div>
  </NodeWrapper>
));

ReturnBlock.displayName = 'ReturnBlock';

export const FlaskApiBlock = memo(({ data, id }: NodeProps) => {
  const [method, setMethod] = useState(data.method || 'GET');

  const handleMethodChange = (value: string) => {
    setMethod(value);
    data.updateProperty?.('method', value);
  };

  return (
    <NodeWrapper
      color="cyan"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Create a Flask API endpoint"
      title="Flask API"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Code2 className={cn("h-4 w-4", getNodeColors("cyan").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>Route</label>
              <Input
                value={data.route}
                onChange={(e) => data.updateProperty?.('route', e.target.value)}
                placeholder="e.g., /api/data"
                className={cn(nodeStyles.input, getNodeColors("cyan").ring)}
              />
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Method</label>
              <Select value={method} onValueChange={handleMethodChange}>
                <SelectTrigger className={cn(nodeStyles.input, getNodeColors("cyan").ring)}>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Function Name</label>
              <Input
                value={data.name}
                onChange={(e) => data.updateProperty?.('name', e.target.value)}
                placeholder="e.g., get_data"
                className={cn(nodeStyles.input, getNodeColors("cyan").ring)}
              />
            </div>
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

FlaskApiBlock.displayName = 'FlaskApiBlock';

export const HttpRequestBlock = memo(({ data, id }: NodeProps) => {
  const [method, setMethod] = useState(data.method || 'GET');

  const handleMethodChange = (value: string) => {
    setMethod(value);
    data.updateProperty?.('method', value);
  };

  return (
    <NodeWrapper
      color="violet"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Make HTTP requests"
      title="HTTP Request"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Code2 className={cn("h-4 w-4", getNodeColors("violet").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>Variable Name</label>
              <Input
                value={data.variable}
                onChange={(e) => data.updateProperty?.('variable', e.target.value)}
                placeholder="e.g., response"
                className={cn(nodeStyles.input, getNodeColors("violet").ring)}
              />
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>URL</label>
              <Input
                value={data.url}
                onChange={(e) => data.updateProperty?.('url', e.target.value)}
                placeholder="e.g., https://api.example.com/data"
                className={cn(nodeStyles.input, getNodeColors("violet").ring)}
              />
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Method</label>
              <Select value={method} onValueChange={handleMethodChange}>
                <SelectTrigger className={cn(nodeStyles.input, getNodeColors("violet").ring)}>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(method === 'POST' || method === 'PUT') && (
              <div className="space-y-1">
                <label className={nodeStyles.label}>Data (JSON)</label>
                <Textarea
                  value={data.data}
                  onChange={(e) => data.updateProperty?.('data', e.target.value)}
                  placeholder='{"key": "value"}'
                  className={cn(nodeStyles.input, getNodeColors("violet").ring)}
                  rows={3}
                />
              </div>
            )}
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

HttpRequestBlock.displayName = 'HttpRequestBlock';

export const SqlQueryBlock = memo(({ data, id }: NodeProps) => {
  return (
    <NodeWrapper
      color="amber"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Execute SQL queries"
      title="SQL Query"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Code2 className={cn("h-4 w-4", getNodeColors("amber").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>Connection Variable</label>
              <Input
                value={data.connection}
                onChange={(e) => data.updateProperty?.('connection', e.target.value)}
                placeholder="e.g., conn"
                className={cn(nodeStyles.input, getNodeColors("amber").ring)}
              />
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Result Variable</label>
              <Input
                value={data.variable}
                onChange={(e) => data.updateProperty?.('variable', e.target.value)}
                placeholder="e.g., results"
                className={cn(nodeStyles.input, getNodeColors("amber").ring)}
              />
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>SQL Query</label>
              <Textarea
                value={data.query}
                onChange={(e) => data.updateProperty?.('query', e.target.value)}
                placeholder="SELECT * FROM table"
                className={cn(nodeStyles.input, getNodeColors("amber").ring)}
                rows={3}
              />
            </div>
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

SqlQueryBlock.displayName = 'SqlQueryBlock';

export const FastApiBlock = memo(({ data, id }: NodeProps) => {
  const [method, setMethod] = useState(data.method || 'GET');

  const handleMethodChange = (value: string) => {
    setMethod(value);
    data.updateProperty?.('method', value);
  };

  return (
    <NodeWrapper
      color="green"
      onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
      onMoveUp={data.onMoveUp}
      onMoveDown={data.onMoveDown}
      info="Create a FastAPI endpoint"
      title="FastAPI Endpoint"
      position={data.position}
      totalNodes={data.totalNodes}
    >
      <>
        <Code2 className={cn("h-4 w-4", getNodeColors("green").icon)} />
      </>
      <div className="space-y-3">
        <div>
          <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={nodeStyles.label}>Route</label>
              <Input
                value={data.route}
                onChange={(e) => data.updateProperty?.('route', e.target.value)}
                placeholder="e.g., /api/data"
                className={cn(nodeStyles.input, getNodeColors("green").ring)}
              />
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Method</label>
              <Select value={method} onValueChange={handleMethodChange}>
                <SelectTrigger className={cn(nodeStyles.input, getNodeColors("green").ring)}>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Function Name</label>
              <Input
                value={data.name}
                onChange={(e) => data.updateProperty?.('name', e.target.value)}
                placeholder="e.g., get_data"
                className={cn(nodeStyles.input, getNodeColors("green").ring)}
              />
            </div>
            <div className="space-y-1">
              <label className={nodeStyles.label}>Response Model (optional)</label>
              <Input
                value={data.responseModel}
                onChange={(e) => data.updateProperty?.('responseModel', e.target.value)}
                placeholder="e.g., Item"
                className={cn(nodeStyles.input, getNodeColors("green").ring)}
              />
            </div>
          </div>
          <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
        </div>
      </div>
    </NodeWrapper>
  );
});

FastApiBlock.displayName = 'FastApiBlock';

export const nodeTypes = {
  variableBlock: VariableBlock,
  ifBlock: IfBlock,
  printBlock: PrintBlock,
  inputBlock: InputBlock,
  forBlock: ForBlock,
  whileBlock: WhileBlock,
  listBlock: ListBlock,
  dictBlock: DictBlock,
  tupleBlock: TupleBlock,
  setBlock: SetBlock,
  functionBlock: FunctionBlock,
  returnBlock: ReturnBlock,
  lambdaBlock: LambdaBlock,
  openBlock: OpenFileBlock,
  tryBlock: TryBlock,
  importBlock: ImportBlock,
  numpyArrayBlock: NumpyArrayBlock,
  flaskApiBlock: FlaskApiBlock,
  httpRequestBlock: HttpRequestBlock,
  sqlQueryBlock: SqlQueryBlock,
  fastApiBlock: FastApiBlock,
}; 