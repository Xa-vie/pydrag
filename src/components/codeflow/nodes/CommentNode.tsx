import { clsx } from "clsx";

import { nodeStyles } from "./nodeStyles";

import { Code } from "lucide-react";
import { useFlowStore } from "@/store/use-flow-store";
import NodeWrapper from "./NodeWrapper";
import { memo } from "react";
import { CommentNodeData } from "./types";

interface NodeComponentProps<T> {
  data: T;
  id: string;
  selected: boolean;
}

const CommentNode = memo(({ data, id, selected }: NodeComponentProps<CommentNodeData>) => {
    const updateNode = useFlowStore(state => state.updateNode);
    const deleteNode = useFlowStore(state => state.deleteNode);
  // New Else Node Component
  
    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNode(id, {
        ...data,
        label: e.target.value
      });
    };
  
    const toggleGenerateComment = () => {
      updateNode(id, {
        ...data,
        generateComment: !data.generateComment
      });
    };
  
    return (
      <NodeWrapper 
        id={id}
        icon={Code}
        label="Comment"
        selected={selected}
      >
        <div className="space-y-4">
          <div>
            <label className={nodeStyles.label}>Comment Text</label>
            <div className="relative">
              <Code className={nodeStyles.inputIcon} />
              <input
                value={data.label || ''}
                onChange={handleLabelChange}
                placeholder="Enter your comment..."
                className={clsx(nodeStyles.input, "pl-9")}
              />
            </div>
          </div>
  
          <div className="flex items-center justify-between">
            <label className={nodeStyles.label}>Generate in Code</label>
            <button
              onClick={toggleGenerateComment}
              className={clsx(
                "px-3 py-1 rounded-full text-xs transition-colors flex items-center gap-2",
                data.generateComment 
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              <div className={clsx(
                "w-3 h-3 rounded-full transition-colors",
                data.generateComment ? "bg-primary" : "bg-muted-foreground/30"
              )} />
              {data.generateComment ? 'Enabled' : 'Disabled'}
            </button>
          </div>
  
  
          <p className={nodeStyles.hint}>
            {data.generateComment 
              ? 'This comment will appear in the generated Python code'
              : 'This comment is only visible in the flow editor'}
          </p>
        </div>

      </NodeWrapper>
    );
  });
  CommentNode.displayName = 'CommentNode';

  export default CommentNode;