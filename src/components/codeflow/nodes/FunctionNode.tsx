import { NodeComponentProps } from "./types";
import { useState } from "react";
import { useFlowStore } from "@/store/use-flow-store";
import { memo } from "react";
import { nodeStyles } from "./nodeStyles";
import NodeWrapper from "./NodeWrapper";
import { clsx } from "clsx";
import { Code2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FunctionNodeData } from "./types";

const FunctionNode = memo(({ data, id, selected }: NodeComponentProps<FunctionNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const deleteNode = useFlowStore(state => state.deleteNode);
  const [showAddParam, setShowAddParam] = useState(false);
  const [newParam, setNewParam] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      ...data,
      name: e.target.value,
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
    const parameters = data.parameters?.filter((p: string) => p !== param) || [];
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
      id={id}
      icon={Code2}
      label="Function"
      selected={selected}
    >
      <div className="space-y-4">
        <div>
          <label className={nodeStyles.label}>Function Name</label>
          <div className="relative">
            <Code2 className={nodeStyles.inputIcon} />
            <input
              value={data.name || ''}
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

          {data.parameters && data.parameters.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.parameters.map((param: string) => (
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
          Place nodes below this block to add them to this function&apos;s body
        </p>
      </div>
    </NodeWrapper>
  );
});

FunctionNode.displayName = 'FunctionNode';

export default FunctionNode;