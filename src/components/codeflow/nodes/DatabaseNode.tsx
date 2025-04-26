import { memo } from 'react';
import NodeWrapper from './NodeWrapper';
import { Database } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import { DatabaseNodeData, NodeComponentProps } from './types';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';

const DatabaseNode = memo(({ data, id, selected }: NodeComponentProps<DatabaseNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);

  return (
    <NodeWrapper 
      id={id}
      icon={Database}
      label="Database"
      selected={selected}
      category="core"
    >
      <div className="space-y-4">
        <div>
          <label className={nodeStyles.label}>SQL Query</label>
          <input
            value={data.query || ''}
            onChange={(e) => updateNode(id, { ...data, query: e.target.value })}
            placeholder="SELECT * FROM users"
            className={nodeStyles.input}
          />
        </div>
      </div>
    </NodeWrapper>
  );
});

DatabaseNode.displayName = 'DatabaseNode';

export default DatabaseNode; 