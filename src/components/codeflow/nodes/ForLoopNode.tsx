import { memo, useState, useEffect, useCallback } from 'react';
import NodeWrapper from './NodeWrapper';
import { ForLoopNodeData, NodeComponentProps } from './types';
import { Repeat } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';
import { findParentFunctionNodeByPosition } from '../utils';

const ForLoopNode = memo(({ data, id, selected }: NodeComponentProps<ForLoopNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const getNodes = useFlowStore(state => state.getNodes);
  const getEdges = useFlowStore(state => state.getEdges);
  const [loopType, setLoopType] = useState<'range' | 'collection' | 'enumerate'>('range');
  const availableVariables = getAllVariables();
  const nodes = getNodes();
  const edges = getEdges();
  const parentFunctionNode = findParentFunctionNodeByPosition(id, nodes);
  const availableParameters: string[] = Array.isArray(parentFunctionNode?.data?.parameters) ? parentFunctionNode.data.parameters : [];

  // Loop type specific state
  const [rangeStart, setRangeStart] = useState('0');
  const [rangeEnd, setRangeEnd] = useState('10');
  const [rangeStep, setRangeStep] = useState('1');
  const [iterableVar, setIterableVar] = useState('');
  const [indexVar, setIndexVar] = useState('i');

  // Initialize state from data if it exists
  useEffect(() => {
    if (data.condition) {
      // Parse existing condition to set initial state
      const condition = data.condition;
      if (condition.includes('range')) {
        setLoopType('range');
        const matches = condition.match(/range\((.*?)\)/);
        if (matches) {
          const params = matches[1].split(',').map((p: string) => p.trim());
          if (params.length === 1) {
            setRangeStart('0');
            setRangeEnd(params[0]);
            setRangeStep('1');
          } else if (params.length === 2) {
            setRangeStart(params[0]);
            setRangeEnd(params[1]);
            setRangeStep('1');
          } else if (params.length === 3) {
            setRangeStart(params[0]);
            setRangeEnd(params[1]);
            setRangeStep(params[2]);
          }
        }
      } else if (condition.includes('enumerate')) {
        setLoopType('enumerate');
        const matches = condition.match(/(\w+),\s*(\w+)\s+in\s+enumerate\((\w+)\)/);
        if (matches) {
          setIndexVar(matches[2]);
          setIterableVar(matches[3]);
        }
      } else {
        setLoopType('collection');
        const matches = condition.match(/(\w+)\s+in\s+(\w+)/);
        if (matches) {
          setIndexVar(matches[1]);
          setIterableVar(matches[2]);
        }
      }
    }
  }, [data.condition]);

  // Update condition based on loop type and parameters
  const updateLoopCondition = useCallback(() => {
    let condition = '';
    switch (loopType) {
      case 'range':
        if (rangeStart === '0' && rangeStep === '1') {
          condition = `${indexVar} in range(${rangeEnd})`;
        } else if (rangeStep === '1') {
          condition = `${indexVar} in range(${rangeStart}, ${rangeEnd})`;
        } else {
          condition = `${indexVar} in range(${rangeStart}, ${rangeEnd}, ${rangeStep})`;
        }
        break;
      case 'collection':
        condition = `${indexVar} in ${iterableVar}`;
        break;
      case 'enumerate':
        condition = `i, ${indexVar} in enumerate(${iterableVar})`;
        break;
    }
    
    // Only update if the condition has actually changed
    if (condition !== data.condition) {
      updateNode(id, {
        ...data,
        condition
      });
    }
  }, [loopType, rangeStart, rangeEnd, rangeStep, iterableVar, indexVar, id, data.condition]);

  // Update condition when parameters change, but not when data changes
  useEffect(() => {
    updateLoopCondition();
  }, [loopType, rangeStart, rangeEnd, rangeStep, iterableVar, indexVar]);

  const handleLoopTypeChange = (type: 'range' | 'collection' | 'enumerate') => {
    setLoopType(type);
    // Reset index variable name based on type
    setIndexVar(type === 'enumerate' ? 'item' : 'i');
  };

  const renderLoopTypeSelector = () => (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      {[
        { type: 'range', label: 'Range', icon: '1..n' },
        { type: 'collection', label: 'Collection', icon: '[...]' },
        { type: 'enumerate', label: 'Enumerate', icon: '(i,x)' }
      ].map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => handleLoopTypeChange(type as any)}
          className={clsx(
            "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all",
            "flex items-center justify-center gap-2",
            loopType === type 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {/* <span className="font-mono">{icon}</span> */}
          {label}
        </button>
      ))}
    </div>
  );

  const renderRangeInputs = () => (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <label className={nodeStyles.label}>Start</label>
        <input
          value={rangeStart}
          onChange={(e) => setRangeStart(e.target.value)}
          placeholder="0"
          className={nodeStyles.input}
          type="number"
        />
      </div>
      <div>
        <label className={nodeStyles.label}>End</label>
        <input
          value={rangeEnd}
          onChange={(e) => setRangeEnd(e.target.value)}
          placeholder="10"
          className={nodeStyles.input}
          type="number"
        />
      </div>
      <div>
        <label className={nodeStyles.label}>Step</label>
        <input
          value={rangeStep}
          onChange={(e) => setRangeStep(e.target.value)}
          placeholder="1"
          className={nodeStyles.input}
          type="number"
        />
      </div>
    </div>
  );

  const renderCollectionInput = () => (
    <div className="space-y-2">
      <label className={nodeStyles.label}>Collection Variable</label>
      <div className="relative">
        <input
          value={iterableVar}
          onChange={(e) => setIterableVar(e.target.value)}
          placeholder="e.g., my_list"
          className={nodeStyles.input}
        />
      </div>
      {availableVariables.length > 0 && (
        <div className={nodeStyles.suggestions.container}>
          <p className={nodeStyles.suggestions.title}>Available variables:</p>
          <div className={nodeStyles.suggestions.list}>
            {availableVariables.map(varName => {
              const value = getVariable(varName);
              return (
                <button
                  key={varName}
                  onClick={() => setIterableVar(varName)}
                  className={nodeStyles.suggestions.item}
                  title={`Value: ${value}`}
                >
                  {varName}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderIndexVarInput = () => (
    <div className="space-y-2">
      <label className={nodeStyles.label}>
        {loopType === 'enumerate' ? 'Item Variable' : 'Iterator Variable'}
      </label>
      <input
        value={indexVar}
        onChange={(e) => setIndexVar(e.target.value)}
        placeholder={loopType === 'enumerate' ? 'e.g., item' : 'e.g., i'}
        className={nodeStyles.input}
      />
    </div>
  );

  const renderVariableSuggestions = () => {
    if (!availableVariables.length) return null;
    return (
      <div className={nodeStyles.suggestions.container}>
        <p className={nodeStyles.suggestions.title}>Available Variables:</p>
        <div className={nodeStyles.suggestions.list}>
          {availableVariables.map(varName => {
            const value = getVariable(varName);
            return (
              <button
                key={varName}
                onClick={() => setIterableVar(varName)}
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
              onClick={() => setIterableVar(param)}
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
      icon={Repeat}
      label="For Loop"
      selected={selected}
      category="loops"
    >
      {/* <Handle 
        type="target" 
        position={Position.Top} 
        className={nodeStyles.handle}
        id="in"
      /> */}
      <div className="space-y-6">
        {/* Loop Type Selector */}
        <div>
          <label className={nodeStyles.label}>Loop Type</label>
          {renderLoopTypeSelector()}
        </div>
        
        {/* Loop Configuration */}
        <div className="space-y-5">
          {loopType === 'range' && (
            <div className="space-y-4">
              <label className={nodeStyles.label}>Range Configuration</label>
              {renderRangeInputs()}
            </div>
          )}
          {(loopType === 'collection' || loopType === 'enumerate') && (
            <div className="space-y-4">
              <label className={nodeStyles.label}>Collection Configuration</label>
              {renderCollectionInput()}
            </div>
          )}
          <div className="pt-2">
            {renderIndexVarInput()}
          </div>
        </div>
      </div>

      {renderVariableSuggestions()}
      {renderParameterSuggestions()}

      {/* <Handle 
        type="source" 
        position={Position.Bottom} 
        className={clsx(nodeStyles.handle, "!bg-primary/50 hover:!bg-primary")}
        id="body"
        style={{ left: '25%' }}
      >
        <div className={clsx(nodeStyles.handleLabel, "-bottom-5 left-1/2 -translate-x-1/2")}>
          Body
        </div>
      </Handle>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={nodeStyles.handle}
        id="next"
        style={{ left: '75%' }}
      >
        <div className={clsx(nodeStyles.handleLabel, "-bottom-5 left-1/2 -translate-x-1/2")}>
          Next
        </div>
      </Handle> */}
    </NodeWrapper>
  );
});

ForLoopNode.displayName = 'ForLoopNode';

export default ForLoopNode; 