import { memo } from 'react';
import NodeWrapper from './NodeWrapper';
import { KeyRound } from 'lucide-react';
import { FinallyNodeData, NodeComponentProps } from './types';

const FinallyBlockNode = memo(({ data, id, selected }: NodeComponentProps<FinallyNodeData>) => {
  return (
    <NodeWrapper 
      id={id}
      icon={KeyRound}
      label="Finally Block"
      selected={selected}
    >
      <div className="space-y-4">
        <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          Code in this block will always execute
        </div>
      </div>
    </NodeWrapper>
  );
});

FinallyBlockNode.displayName = 'FinallyBlockNode';

export default FinallyBlockNode; 