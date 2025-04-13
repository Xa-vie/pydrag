import { memo } from 'react';
import NodeWrapper from './NodeWrapper';
import { Braces } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import { TryNodeData, NodeComponentProps } from './types';
import { nodeStyles } from './nodeStyles';

const TryBlockNode = memo(({ data, id, selected }: NodeComponentProps<TryNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      ...data,
      code: e.target.value
    });
  };

  return (
    <NodeWrapper 
      id={id}
      icon={Braces}
      label="Try Block"
      selected={selected}
    >
      <div className="space-y-4">
        <div>
          <label className={nodeStyles.label}>Code to Try</label>
          <input
            value={data.code || ''}
            onChange={handleCodeChange}
            placeholder="Code that might raise an exception..."
            className={nodeStyles.input}
          />
        </div>
      </div>
    </NodeWrapper>
  );
});

TryBlockNode.displayName = 'TryBlockNode';

export default TryBlockNode; 