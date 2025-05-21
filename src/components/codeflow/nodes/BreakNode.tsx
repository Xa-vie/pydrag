import { memo } from 'react';
import NodeWrapper from './NodeWrapper';
import { NodeComponentProps, BreakNodeData } from './types';
import { SkipForward } from 'lucide-react';

const BreakNode = memo(({ data, id, selected }: NodeComponentProps<BreakNodeData>) => {
  return (
    <NodeWrapper 
      id={id}
      icon={SkipForward}
      label="Break"
      selected={selected}
      category="loops"
    >
      <div className="py-2 text-center text-sm text-muted-foreground">
        Exit the current loop
      </div>
    </NodeWrapper>
  );
});

BreakNode.displayName = 'BreakNode';

export default BreakNode; 