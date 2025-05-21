import { memo } from 'react';
import NodeWrapper from './NodeWrapper';
import { NodeComponentProps, ContinueNodeData } from './types';
import { RotateCw } from 'lucide-react';

const ContinueNode = memo(({ data, id, selected }: NodeComponentProps<ContinueNodeData>) => {
  return (
    <NodeWrapper 
      id={id}
      icon={RotateCw}
      label="Continue"
      selected={selected}
      category="loops"
    >
      <div className="py-2 text-center text-sm text-muted-foreground">
        Skip to the next iteration of the loop
      </div>
    </NodeWrapper>
  );
});

ContinueNode.displayName = 'ContinueNode';

export default ContinueNode; 