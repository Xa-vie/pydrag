import { memo } from 'react';
import NodeWrapper from './NodeWrapper';
import { Braces } from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import { TryNodeData, NodeComponentProps } from './types';
import { nodeStyles } from './nodeStyles';

const TryBlockNode = memo(({ data, id, selected }: NodeComponentProps<TryNodeData>) => {
  return (
    <NodeWrapper 
      id={id}
      icon={Braces}
      label="Try Block"
      selected={selected}
      category="errorHandling"
    >
      <div className="text-xs text-muted-foreground italic p-2">Place the code you want to try under this block.</div>
    </NodeWrapper>
  );
});

TryBlockNode.displayName = 'TryBlockNode';

export default TryBlockNode; 