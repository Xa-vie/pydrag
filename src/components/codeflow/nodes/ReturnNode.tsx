import { memo, useState } from 'react';
import NodeWrapper from './NodeWrapper';
import { ArrowRight } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import { nodeStyles } from './nodeStyles';
import { clsx } from 'clsx';
import { NodeComponentProps, BaseNodeData } from './types';
import { findParentFunctionNodeByPosition } from '../utils';

interface ReturnNodeData extends BaseNodeData {
  type: 'return';
  returnValue: string;
}

const ReturnNode = memo(({ data, id, selected }: NodeComponentProps<ReturnNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const getNodes = useFlowStore(state => state.getNodes);
  const getEdges = useFlowStore(state => state.getEdges);
  const [searchTerm, setSearchTerm] = useState('');

  const availableVariables = getAllVariables();
  const filteredVariables = availableVariables.filter(varName => 
    varName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nodes = getNodes();
  const edges = getEdges();
  const parentFunctionNode = findParentFunctionNodeByPosition(id, nodes);
  const availableParameters: string[] = Array.isArray(parentFunctionNode?.data?.parameters) ? parentFunctionNode.data.parameters : [];

  const handleReturnValueSelect = (value: string) => {
    updateNode(id, {
      ...data,
      returnValue: value
    });
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
              onClick={() => handleReturnValueSelect(param)}
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

  return (
    <NodeWrapper 
      id={id}
      icon={ArrowRight}
      label="Return"
      selected={selected}
      category="core"
    >
      <div className="space-y-4">
        {!data.returnValue ? (
          <div className="space-y-3">
            <div className="relative">
              <ArrowRight className={nodeStyles.inputIcon} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search variables..."
                className={clsx(nodeStyles.input, "pl-9")}
              />
            </div>
            <div className={nodeStyles.suggestions.container}>
              <p className={nodeStyles.suggestions.title}>Available Variables:</p>
              <div className={nodeStyles.suggestions.list}>
                {filteredVariables.map(varName => {
                  const value = getVariable(varName);
                  return (
                    <button
                      key={varName}
                      onClick={() => handleReturnValueSelect(varName)}
                      className={nodeStyles.suggestions.item}
                      title={`Value: ${value}`}
                    >
                      {varName}
                    </button>
                  );
                })}
                {filteredVariables.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No variables found
                  </div>
                )}
              </div>
            </div>
            {renderParameterSuggestions()}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">Returning: {data.returnValue}</div>
                </div>
              </div>
              <button
                onClick={() => handleReturnValueSelect('')}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Change
              </button>
            </div>
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});

ReturnNode.displayName = 'ReturnNode';

export default ReturnNode; 