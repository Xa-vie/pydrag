import { memo, useState } from 'react';
import NodeWrapper from './NodeWrapper';
import { Code2 } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import { FunctionCallNodeData, NodeComponentProps } from './types';
import { FunctionNodeData } from '@/store/use-flow-store';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';

const FunctionCallNode = memo(({ data, id, selected }: NodeComponentProps<FunctionCallNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const nodes = useFlowStore(state => state.nodes);
  const [searchTerm, setSearchTerm] = useState('');

  const functionNodes = nodes.filter(node => 
    node.data.type === 'function' && 
    (node.data as FunctionNodeData).name
  );

  const filteredFunctions = functionNodes.filter(node => 
    (node.data as FunctionNodeData).name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedFunction = functionNodes.find(node => 
    (node.data as FunctionNodeData).name === data.functionName
  );

  const handleFunctionSelect = (name: string) => {
    const func = functionNodes.find(node => 
      (node.data as FunctionNodeData).name === name
    );
    updateNode(id, {
      ...data,
      functionName: name,
      arguments: new Array((func?.data as FunctionNodeData)?.parameters?.length || 0).fill('')
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
      id={id}
      icon={Code2}
      label="Call Function"
      selected={selected}
      category="functions"
    >
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
              {filteredFunctions.map(func => {
                const funcData = func.data as FunctionNodeData;
                return (
                  <button
                    key={func.id}
                    onClick={() => handleFunctionSelect(funcData.name)}
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
                      <div className="font-medium text-sm truncate">{funcData.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {funcData.parameters.length > 0 
                          ? `Parameters: ${funcData.parameters.join(', ')}` 
                          : 'No parameters'}
                      </div>
                    </div>
                    {funcData.returnValue && (
                      <div className="shrink-0 px-1.5 py-0.5 rounded-sm bg-green-500/10 text-green-500 text-[10px] font-medium">
                        Returns
                      </div>
                    )}
                  </button>
                );
              })}
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
                  <div className="font-medium text-sm">{(selectedFunction.data as FunctionNodeData).name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(selectedFunction.data as FunctionNodeData).parameters.length} parameter{(selectedFunction.data as FunctionNodeData).parameters.length !== 1 ? 's' : ''}
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

            {(selectedFunction.data as FunctionNodeData).parameters.length > 0 && (
              <div className="space-y-2">
                <label className={nodeStyles.label}>Arguments</label>
                <div className="space-y-2">
                  {(selectedFunction.data as FunctionNodeData).parameters.map((param: string, index: number) => (
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
    </NodeWrapper>
  );
});

FunctionCallNode.displayName = 'FunctionCallNode';

export default FunctionCallNode; 