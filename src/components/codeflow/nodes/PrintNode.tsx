import { memo } from 'react';
import NodeWrapper from './NodeWrapper';
import { Terminal } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import { PrintNodeData, NodeComponentProps } from './types';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';

const PrintNode = memo(({ data, id, selected }: NodeComponentProps<PrintNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const availableVariables = getAllVariables();

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData: PrintNodeData = {
      ...data,
      message: e.target.value
    };
    updateNode(id, newData);
  };

  // Insert variable at cursor position
  const insertVariable = (varName: string) => {
    const input = document.getElementById(`print-input-${id}`) as HTMLInputElement;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentMessage = data.message || '';
    
    // Insert {varName} at cursor position
    const newMessage = currentMessage.slice(0, start) + `{${varName}}` + currentMessage.slice(end);
    
    updateNode(id, {
      ...data,
      message: newMessage
    });

    // Reset cursor position after the inserted variable
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + varName.length + 2, start + varName.length + 2);
    }, 0);
  };

  return (
    <NodeWrapper 
      id={id}
      icon={Terminal}
      label="Print"
      selected={selected}
    >
      <div className="space-y-4">
        <div>
          <label className={nodeStyles.label}>Message</label>
          <div className="relative">
            <Terminal className={nodeStyles.inputIcon} />
            <input
              id={`print-input-${id}`}
              value={data.message || ''}
              onChange={handleMessageChange}
              placeholder="Enter text or click variables below to insert them"
              className={clsx(nodeStyles.input, "pl-9")}
            />
          </div>

          {/* Available Variables */}
          {availableVariables.length > 0 && (
            <div className={nodeStyles.suggestions.container}>
              <p className={nodeStyles.suggestions.title}>Click to insert variable:</p>
              <div className={nodeStyles.suggestions.list}>
                {availableVariables.map(varName => {
                  const value = getVariable(varName);
                  return (
                    <button
                      key={varName}
                      onClick={() => insertVariable(varName)}
                      className={nodeStyles.suggestions.item}
                      title={`Current value: ${value}`}
                    >
                      {varName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className={nodeStyles.hint}>
            Type text and click variables to insert them. Variables will appear as {'{variable_name}'}
          </p>
        </div>
      </div>
    </NodeWrapper>
  );
});

PrintNode.displayName = 'PrintNode';

export default PrintNode; 