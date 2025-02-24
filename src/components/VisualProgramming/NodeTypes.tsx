import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Type, Trash2, Info, Printer, Variable, Code2, Repeat, CircleDot, MoveUp, MoveDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const nodeStyles = {
  base: "shadow-lg border-0 transition-all duration-200 hover:shadow-2xl rounded-lg bg-white dark:bg-slate-900",
  handle: "w-3 h-3 bg-slate-400 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-400 transition-colors duration-200 rounded-full",
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

const NodeWrapper = ({ 
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
};

export const IfBlock = ({ data, id }: { data: any; id: string }) => (
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
        <div className="space-y-1">
          <label className={nodeStyles.label}>Condition</label>
          <Input 
            value={data.condition}
            onChange={(e) => data.onChange?.(e.target.value)}
            placeholder="e.g., x > 0"
            className={cn(nodeStyles.input, getNodeColors("blue").ring)}
          />
        </div>
        <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
      </div>
    </div>
  </NodeWrapper>
);

export const PrintBlock = ({ data, id }: { data: any; id: string }) => (
  <NodeWrapper
    color="green"
    onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
    info="Outputs text or variable values to the console"
    title="Print"
  >
    <>
      <Printer className={cn("h-4 w-4", getNodeColors("green").icon)} />
    </>
    <div className="space-y-3">
      <div>
        <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
        <div className="space-y-1">
          <label className={nodeStyles.label}>Output Content</label>
          <Input
            value={data.content}
            onChange={(e) => data.onChange?.(e.target.value)}
            placeholder="Text or variable to print..."
            className={cn(nodeStyles.input, getNodeColors("green").ring)}
          />
        </div>
        <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
      </div>
    </div>
  </NodeWrapper>
);

export const InputBlock = ({ data, id }: { data: any; id: string }) => (
  <NodeWrapper 
    color="purple"
    onDelete={() => data.onDelete?.({ nodes: [{ id }] })}
    info="Creates an input prompt to get user input and store it in a variable"
    title="Input"
  >
    <div className="space-y-3">
      <div>
        <Input 
          value={data.variable}
          onChange={(e) => data.onChange?.(e.target.value)}
          placeholder="e.g., user_input"
          className={cn(nodeStyles.input, getNodeColors("purple").ring)}
        />
      </div>
      <div>
        <Input 
          value={data.prompt}
          onChange={(e) => data.onPromptChange?.(e.target.value)}
          placeholder="Enter your prompt..."
          className={cn(nodeStyles.input, getNodeColors("purple").ring)}
        />
      </div>
    </div>
  </NodeWrapper>
);

export const ForBlock = ({ data, id }: { data: any; id: string }) => (
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
            <label className={nodeStyles.label}>Iterator Variable</label>
            <Input 
              value={data.variable}
              onChange={(e) => data.onChange?.(e.target.value)}
              placeholder="e.g., i"
              className={cn(nodeStyles.input, getNodeColors("yellow").ring)}
            />
          </div>
          <div className="space-y-1">
            <label className={nodeStyles.label}>Sequence</label>
            <Input 
              value={data.iterable}
              onChange={(e) => data.onIterableChange?.(e.target.value)}
              placeholder="e.g., range(10)"
              className={cn(nodeStyles.input, getNodeColors("yellow").ring)}
            />
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
      </div>
    </div>
  </NodeWrapper>
);

export const WhileBlock = ({ data, id }: { data: any; id: string }) => (
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
        <div className="space-y-1">
          <label className={nodeStyles.label}>Condition</label>
          <Input 
            value={data.condition}
            onChange={(e) => data.onChange?.(e.target.value)}
            placeholder="e.g., x < 100"
            className={cn(nodeStyles.input, getNodeColors("red").ring)}
          />
        </div>
        <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
      </div>
    </div>
  </NodeWrapper>
);

export const ListBlock = ({ data }: { data: any }) => (
  <Card className="w-48">
    <CardHeader className={getNodeColors("indigo").header}>
      <CardTitle>List</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("indigo").gradient}>
      <Input 
        value={data.variable}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="List name..."
      />
      <Input 
        value={data.value}
        onChange={(e) => data.onValueChange?.(e.target.value)}
        placeholder="Initial value..."
        className="mt-2"
      />
    </CardContent>
  </Card>
);

export const DictBlock = ({ data }: { data: any }) => (
  <Card className="w-48">
    <CardHeader className={getNodeColors("pink").header}>
      <CardTitle>Dictionary</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("pink").gradient}>
      <Input 
        value={data.variable}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Dict name..."
      />
      <Input 
        value={data.value}
        onChange={(e) => data.onValueChange?.(e.target.value)}
        placeholder="Initial value..."
        className="mt-2"
      />
    </CardContent>
  </Card>
);

export const FunctionBlock = ({ data }: { data: any }) => (
  <Card className="w-48">
    <CardHeader className={getNodeColors("orange").header}>
      <CardTitle>Function</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("orange").gradient}>
      <Input 
        value={data.name}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Function name..."
      />
      <Input 
        value={data.params}
        onChange={(e) => data.onParamsChange?.(e.target.value)}
        placeholder="Parameters..."
        className="mt-2"
      />
    </CardContent>
  </Card>
);

export const ReturnBlock = ({ data }: { data: any }) => (
  <Card className="w-48">
    <CardHeader className={getNodeColors("teal").header}>
      <CardTitle>Return</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("teal").gradient}>
      <Input 
        value={data.value}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Return value..."
      />
    </CardContent>
  </Card>
);

export const TupleBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="indigo" title="Tuple">
    <div className="space-y-2">
      <Input 
        value={data.variable}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Tuple name..."
        className={nodeStyles.input}
      />
      <Input 
        value={data.value}
        onChange={(e) => data.onValueChange?.(e.target.value)}
        placeholder="Initial value..."
        className={nodeStyles.input}
      />
    </div>
  </NodeWrapper>
);

export const SetBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="fuchsia" title="Set">
    <div className="space-y-2">
      <Input 
        value={data.variable}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Set name..."
        className={nodeStyles.input}
      />
      <Input 
        value={data.value}
        onChange={(e) => data.onValueChange?.(e.target.value)}
        placeholder="Initial value..."
        className={nodeStyles.input}
      />
    </div>
  </NodeWrapper>
);

export const LambdaBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="amber" title="Lambda">
    <div className="space-y-2">
      <Input 
        value={data.params}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Parameters..."
        className={nodeStyles.input}
      />
      <Input 
        value={data.expression}
        onChange={(e) => data.onExpressionChange?.(e.target.value)}
        placeholder="Expression..."
        className={nodeStyles.input}
      />
    </div>
  </NodeWrapper>
);

export const OpenFileBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="cyan" title="Open File">
    <div className="space-y-2">
      <Input 
        value={data.variable}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="File variable..."
        className={nodeStyles.input}
      />
      <Input 
        value={data.filename}
        onChange={(e) => data.onFilenameChange?.(e.target.value)}
        placeholder="Filename..."
        className={nodeStyles.input}
      />
      <Input 
        value={data.mode}
        onChange={(e) => data.onModeChange?.(e.target.value)}
        placeholder="Mode (r/w/a)..."
        className={nodeStyles.input}
      />
    </div>
  </NodeWrapper>
);

export const TryBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="rose" title="Try/Except">
    <div className="space-y-2">
      <Input 
        value={data.code}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Try block code..."
        className={nodeStyles.input}
      />
      <Input 
        value={data.error}
        onChange={(e) => data.onErrorChange?.(e.target.value)}
        placeholder="Exception type..."
        className={nodeStyles.input}
      />
    </div>
  </NodeWrapper>
);

export const ImportBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="emerald" title="Import">
    <div className="space-y-2">
      <Input 
        value={data.module}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Module name..."
        className={nodeStyles.input}
      />
      <Input 
        value={data.alias}
        onChange={(e) => data.onAliasChange?.(e.target.value)}
        placeholder="Alias (optional)..."
        className={nodeStyles.input}
      />
    </div>
  </NodeWrapper>
);

export const NumpyArrayBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="violet" title="NumPy Array">
    <div className="space-y-2">
      <Input 
        value={data.variable}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Array name..."
        className={nodeStyles.input}
      />
      <Input 
        value={data.value}
        onChange={(e) => data.onValueChange?.(e.target.value)}
        placeholder="Array value..."
        className={nodeStyles.input}
      />
    </div>
  </NodeWrapper>
);

export const MatplotlibPlotBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="sky" title="Plot">
    <div className="space-y-2">
      <Input 
        value={data.x}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="X data..."
        className={nodeStyles.input}
      />
      <Input 
        value={data.y}
        onChange={(e) => data.onYChange?.(e.target.value)}
        placeholder="Y data..."
        className={nodeStyles.input}
      />
      <Input 
        value={data.type}
        onChange={(e) => data.onTypeChange?.(e.target.value)}
        placeholder="Plot type..."
        className={nodeStyles.input}
      />
    </div>
  </NodeWrapper>
);

export const VariableBlock = ({ data, id }: { data: any; id: string }) => (
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
              onChange={(e) => data.onChange?.(e.target.value)}
              placeholder="e.g., my_variable"
              className={cn(nodeStyles.input, getNodeColors("blue").ring)}
            />
          </div>
          <div className="space-y-1">
            <label className={nodeStyles.label}>Value</label>
            <Input
              value={data.value}
              onChange={(e) => data.onValueChange?.(e.target.value)}
              placeholder="Value to assign (number or text)"
              className={cn(nodeStyles.input, getNodeColors("blue").ring)}
            />
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
      </div>
    </div>
  </NodeWrapper>
);

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
  matplotlibPlotBlock: MatplotlibPlotBlock,
}; 