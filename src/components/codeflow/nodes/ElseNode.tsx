import { memo } from 'react';
import NodeWrapper from './NodeWrapper';
import { GitBranch } from 'lucide-react';
import { ElseNodeData, NodeComponentProps } from './types';

const ElseNode = memo(({ data, id, selected }: NodeComponentProps<ElseNodeData>) => {
  return (
    <NodeWrapper 
      id={id}
      icon={GitBranch}
      label="Else"
      selected={selected}
      category="logic"
    >
      <div className="space-y-4">
        <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          Else block
        </div>
      </div>
    </NodeWrapper>
  );
});

ElseNode.displayName = 'ElseNode';

export default ElseNode; 