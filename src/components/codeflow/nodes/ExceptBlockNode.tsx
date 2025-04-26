import { memo, useState } from 'react';
import NodeWrapper from './NodeWrapper';
import { AlertTriangle } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import { ExceptNodeData, NodeComponentProps } from './types';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';

// Common Python exceptions for suggestions
const PYTHON_EXCEPTIONS = [
  { type: 'Exception', description: 'Base class for all built-in exceptions' },
  { type: 'ValueError', description: 'Invalid value for operation' },
  { type: 'TypeError', description: 'Invalid operation for data type' },
  { type: 'NameError', description: 'Name not found in scope' },
  { type: 'IndexError', description: 'Sequence index out of range' },
  { type: 'KeyError', description: 'Dictionary key not found' },
  { type: 'FileNotFoundError', description: 'File or directory not found' },
  { type: 'ZeroDivisionError', description: 'Division by zero' },
  { type: 'AttributeError', description: 'Attribute not found' },
  { type: 'ImportError', description: 'Import failed' },
];

const ExceptBlockNode = memo(({ data, id, selected }: NodeComponentProps<ExceptNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleExceptionTypeChange = (type: string) => {
    updateNode(id, {
      ...data,
      exceptionType: type
    });
    setShowSuggestions(false);
  };

  return (
    <NodeWrapper 
      id={id}
      icon={AlertTriangle}
      label="Except Block"
      selected={selected}
      category="errorHandling"
    >
      <div className="space-y-4">
        <div>
          <label className={nodeStyles.label}>Exception Type</label>
          <input
            value={data.exceptionType || ''}
            onChange={(e) => handleExceptionTypeChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="e.g., ValueError"
            className={nodeStyles.input}
          />
          {showSuggestions && (
            <div className={nodeStyles.suggestions.container}>
              <div className={nodeStyles.suggestions.title}>Common Exceptions</div>
              <div className={nodeStyles.suggestions.list}>
                {PYTHON_EXCEPTIONS.map(exception => (
                  <button
                    key={exception.type}
                    onClick={() => handleExceptionTypeChange(exception.type)}
                    className={clsx(
                      nodeStyles.suggestions.item,
                      data.exceptionType === exception.type && "bg-primary/10 text-primary"
                    )}
                    title={exception.description}
                  >
                    {exception.type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});

ExceptBlockNode.displayName = 'ExceptBlockNode';

export default ExceptBlockNode; 