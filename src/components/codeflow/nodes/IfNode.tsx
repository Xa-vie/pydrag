import { memo } from 'react';
import  NodeWrapper  from './NodeWrapper';
import { IfNodeData, NodeComponentProps } from './types';
import { GitBranch } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';
import { findParentFunctionNodeByPosition } from '../utils';


const IfNode = memo(({ data, id, selected }: NodeComponentProps<IfNodeData>) => {
    const updateNode = useFlowStore(state => state.updateNode);
    const getAllVariables = useFlowStore(state => state.getAllVariables);
    const getVariable = useFlowStore(state => state.getVariable);
    const getNodes = useFlowStore(state => state.getNodes);
    const getEdges = useFlowStore(state => state.getEdges);
    const nodes = getNodes();
    const edges = getEdges();
    const parentFunctionNode = findParentFunctionNodeByPosition(id, nodes);
    const availableVariables = getAllVariables();
    const availableParameters: string[] = Array.isArray(parentFunctionNode?.data?.parameters) ? parentFunctionNode.data.parameters : [];
  
    const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNode(id, {
        ...data,
        condition: e.target.value
      } as IfNodeData);
    };
  
    const handleElifConditionChange = (elifId: string, value: string) => {
      const newElifConditions = data.elifConditions?.map(elif => 
        elif.id === elifId ? { ...elif, condition: value } : elif
      ) || [];
      
      updateNode(id, {
        ...data,
        elifConditions: newElifConditions
      } as IfNodeData);
    };
  
    const addElifCondition = () => {
      const newElifConditions = [...(data.elifConditions || []), { 
        id: crypto.randomUUID(), 
        condition: '' 
      }];
      
      updateNode(id, {
        ...data,
        elifConditions: newElifConditions
      } as IfNodeData);
    };
  
    const removeElifCondition = (elifId: string) => {
      const newElifConditions = data.elifConditions?.filter(elif => elif.id !== elifId) || [];
      
      updateNode(id, {
        ...data,
        elifConditions: newElifConditions
      } as IfNodeData);
    };
  
    const toggleElse = () => {
      updateNode(id, {
        ...data,
        hasElse: !data.hasElse
      } as IfNodeData);
    };
  
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
  
    const renderParameterSuggestions = () => {
      if (!availableParameters.length) return null;
      return (
        <div className={nodeStyles.suggestions.container}>
          <p className={nodeStyles.suggestions.title}>Available Parameters:</p>
          <div className={nodeStyles.suggestions.list}>
            {availableParameters.map(param => (
              <button
                key={param}
                onClick={() => handleConditionChange({ target: { value: param } } as any)}
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
        icon={GitBranch}
        label="If Condition"
        selected={selected}
        category="logic"
      >
        {/* <Handle 
          type="target" 
          position={Position.Top} 
          className={nodeStyles.handle}
          id="in"
        /> */}
        <div className="space-y-4">
          {/* If condition */}
          <div>
            <label className={nodeStyles.label}>If Condition</label>
            <div className="relative">
              <GitBranch className={nodeStyles.inputIcon} />
            <input
              value={data.condition || ''}
                onChange={handleConditionChange}
                placeholder="x > 0"
                className={clsx(nodeStyles.input, "pl-9")}
              />
              {/* <Handle 
                type="source" 
                position={Position.Right} 
                className={clsx(nodeStyles.handle, "!bg-green-500/50 hover:!bg-green-500")}
                id="true"
              >
                <div className={clsx(nodeStyles.handleLabel, "left-full ml-1 -translate-y-1/2 top-1/2")}>
                    True
                </div>
              </Handle> */}
            </div>
            {renderVariableSuggestions()}
            {renderParameterSuggestions()}
          </div>
  
          {/* We're removing the Elif conditions and Add Elif/Else buttons */}
          <p className={nodeStyles.hint}>
            Use variables in conditions by clicking them below or typing their names
          </p>
        </div>
      </NodeWrapper>
    );
  });
  IfNode.displayName = 'IfNode';

  export default IfNode;