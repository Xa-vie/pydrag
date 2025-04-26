import { memo } from 'react';
import NodeWrapper from './NodeWrapper';
import { GitBranch } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import { ElifNodeData, NodeComponentProps } from './types';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';

const ElifNode = memo(({ data, id, selected }: NodeComponentProps<ElifNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const availableVariables = getAllVariables();

  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      ...data,
      condition: e.target.value
    });
  };

  // Helper to show variable suggestions
  const renderVariableSuggestions = () => {
    if (availableVariables.length === 0) return null;
    return (
      <div className={nodeStyles.suggestions.container}>
        <p className={nodeStyles.suggestions.title}>Available Variables:</p>
        <div className={nodeStyles.suggestions.list}>
          {availableVariables.map(varName => {
            const value = getVariable(varName);
            return (
              <button
                key={varName}
                onClick={() => handleConditionChange({ target: { value: varName } } as any)}
                className={nodeStyles.suggestions.item}
                title={`Value: ${value}`}
              >
                {varName}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <NodeWrapper 
      id={id}
      icon={GitBranch}
      label="Elif Condition"
      selected={selected}
      category="logic"
    >
      <div className="space-y-4">
        <div>
          <label className={nodeStyles.label}>Elif Condition</label>
          <div className="relative">
            <GitBranch className={nodeStyles.inputIcon} />
            <input
              value={data.condition || ''}
              onChange={handleConditionChange}
              placeholder="x < 0"
              className={clsx(nodeStyles.input, "pl-9")}
            />
          </div>
          {renderVariableSuggestions()}
        </div>

        <p className={nodeStyles.hint}>
          Use variables in conditions by clicking them below or typing their names
        </p>
      </div>
    </NodeWrapper>
  );
});

ElifNode.displayName = 'ElifNode';

export default ElifNode; 