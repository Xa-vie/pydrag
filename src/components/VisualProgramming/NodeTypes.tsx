import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const nodeStyles = {
  base: "shadow-lg border-2 transition-all duration-200 hover:shadow-xl",
  handle: "w-3 h-3 bg-foreground/50 hover:bg-foreground transition-colors duration-200",
  input: "bg-background/50 focus:bg-background transition-colors duration-200 text-sm",
};

const getNodeColors = (color: string) => ({
  border: `border-${color}-200 hover:border-${color}-400`,
  header: `bg-${color}-100/50 border-b border-${color}-200`,
  gradient: `bg-gradient-to-b from-${color}-50/50`,
});

const NodeWrapper = ({ children, color }: { children: React.ReactNode; color: string }) => {
  const colors = getNodeColors(color);
  return (
    <Card className={cn(nodeStyles.base, colors.border)}>
      {children}
    </Card>
  );
};

export const IfBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="blue">
    <CardHeader className={getNodeColors("blue").header}>
      <CardTitle className="text-sm font-medium">If Condition</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("blue").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
      <Input 
        value={data.condition}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Enter condition..."
        className={nodeStyles.input}
      />
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const PrintBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="green">
    <CardHeader className={getNodeColors("green").header}>
      <CardTitle className="text-sm font-medium">Print</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("green").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
      <Input 
        value={data.content}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Print content..."
        className={nodeStyles.input}
      />
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const InputBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="purple">
    <CardHeader className={getNodeColors("purple").header}>
      <CardTitle className="text-sm font-medium">Input</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("purple").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
      <div className="space-y-2">
        <Input 
          value={data.variable}
          onChange={(e) => data.onChange?.(e.target.value)}
          placeholder="Variable name..."
          className={nodeStyles.input}
        />
        <Input 
          value={data.prompt}
          onChange={(e) => data.onPromptChange?.(e.target.value)}
          placeholder="Prompt..."
          className={nodeStyles.input}
        />
      </div>
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const ForBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="yellow">
    <CardHeader className={getNodeColors("yellow").header}>
      <CardTitle className="text-sm font-medium">For Loop</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("yellow").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
      <div className="space-y-2">
        <Input 
          value={data.variable}
          onChange={(e) => data.onChange?.(e.target.value)}
          placeholder="Loop variable..."
          className={nodeStyles.input}
        />
        <Input 
          value={data.iterable}
          onChange={(e) => data.onIterableChange?.(e.target.value)}
          placeholder="Iterable..."
          className={nodeStyles.input}
        />
      </div>
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const WhileBlock = ({ data }: { data: any }) => (
  <Card className="w-48">
    <CardHeader className={getNodeColors("red").header}>
      <CardTitle>While Loop</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("red").gradient}>
      <Handle type="target" position={Position.Top} />
      <Input 
        value={data.condition}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Condition..."
      />
      <Handle type="source" position={Position.Bottom} />
    </CardContent>
  </Card>
);

export const ListBlock = ({ data }: { data: any }) => (
  <Card className="w-48">
    <CardHeader className={getNodeColors("indigo").header}>
      <CardTitle>List</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("indigo").gradient}>
      <Handle type="target" position={Position.Top} />
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
      <Handle type="source" position={Position.Bottom} />
    </CardContent>
  </Card>
);

export const DictBlock = ({ data }: { data: any }) => (
  <Card className="w-48">
    <CardHeader className={getNodeColors("pink").header}>
      <CardTitle>Dictionary</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("pink").gradient}>
      <Handle type="target" position={Position.Top} />
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
      <Handle type="source" position={Position.Bottom} />
    </CardContent>
  </Card>
);

export const FunctionBlock = ({ data }: { data: any }) => (
  <Card className="w-48">
    <CardHeader className={getNodeColors("orange").header}>
      <CardTitle>Function</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("orange").gradient}>
      <Handle type="target" position={Position.Top} />
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
      <Handle type="source" position={Position.Bottom} />
    </CardContent>
  </Card>
);

export const ReturnBlock = ({ data }: { data: any }) => (
  <Card className="w-48">
    <CardHeader className={getNodeColors("teal").header}>
      <CardTitle>Return</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("teal").gradient}>
      <Handle type="target" position={Position.Top} />
      <Input 
        value={data.value}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder="Return value..."
      />
      <Handle type="source" position={Position.Bottom} />
    </CardContent>
  </Card>
);

export const TupleBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="indigo">
    <CardHeader className={getNodeColors("indigo").header}>
      <CardTitle className="text-sm font-medium">Tuple</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("indigo").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
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
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const SetBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="fuchsia">
    <CardHeader className={getNodeColors("fuchsia").header}>
      <CardTitle className="text-sm font-medium">Set</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("fuchsia").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
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
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const LambdaBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="amber">
    <CardHeader className={getNodeColors("amber").header}>
      <CardTitle className="text-sm font-medium">Lambda</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("amber").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
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
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const OpenFileBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="cyan">
    <CardHeader className={getNodeColors("cyan").header}>
      <CardTitle className="text-sm font-medium">Open File</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("cyan").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
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
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const TryBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="rose">
    <CardHeader className={getNodeColors("rose").header}>
      <CardTitle className="text-sm font-medium">Try/Except</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("rose").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
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
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const ImportBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="emerald">
    <CardHeader className={getNodeColors("emerald").header}>
      <CardTitle className="text-sm font-medium">Import</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("emerald").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
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
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const NumpyArrayBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="violet">
    <CardHeader className={getNodeColors("violet").header}>
      <CardTitle className="text-sm font-medium">NumPy Array</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("violet").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
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
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const MatplotlibPlotBlock = ({ data }: { data: any }) => (
  <NodeWrapper color="sky">
    <CardHeader className={getNodeColors("sky").header}>
      <CardTitle className="text-sm font-medium">Plot</CardTitle>
    </CardHeader>
    <CardContent className={getNodeColors("sky").gradient}>
      <Handle type="target" position={Position.Top} className={nodeStyles.handle} />
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
      <Handle type="source" position={Position.Bottom} className={nodeStyles.handle} />
    </CardContent>
  </NodeWrapper>
);

export const nodeTypes = {
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