'use client';

import { memo, useMemo } from 'react';
import { useFlowStore } from '@/store/use-flow-store';
import { cn } from '@/lib/utils';
import { AlertTriangle, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VariableReferenceProps {
  variableName: string;
  nodeY: number;
  inNodeId: string;
  className?: string;
}

/**
 * Component for displaying variable references with scope validation
 * Shows a warning if the variable is used before it's defined (out of scope)
 */
const VariableReference = memo(({ variableName, nodeY, inNodeId, className }: VariableReferenceProps) => {
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getNodes = useFlowStore(state => state.getNodes);
  // Using variables map to trigger re-renders when variables change
  const variables = useFlowStore(state => state.variables);
  
  // Check if the variable exists at all
  const allVariables = getAllVariables();
  const variableExists = allVariables.includes(variableName);
  
  // Check if the variable is in scope (defined above this node)
  const isInScope = useMemo(() => {
    if (!variableExists) return false;
    
    const nodes = getNodes();
    // Find all variable definition nodes (including loop nodes)
    const variableNodes = nodes.filter(node => {
      if (node.type === 'variable' && node.data.name === variableName) {
        return true;
      }
      if (node.type === 'forLoop') {
        const loopScope = node.data.loopScope as { variables: string[] } | undefined;
        return loopScope?.variables?.includes(variableName);
      }
      return false;
    });
    
    if (variableNodes.length === 0) return false;
    
    // For loop variables, they should only be visible to nodes below the loop
    const currentNode = nodes.find(node => node.id === inNodeId);
    if (!currentNode) return false;
    
    return variableNodes.some(node => {
      // For regular variables, check if they're above
      if (node.type === 'variable') {
        return node.position.y < currentNode.position.y;
      }
      // For loop variables, check if the loop node is above but not the same node
      if (node.type === 'forLoop') {
        return node.position.y < currentNode.position.y && node.id !== inNodeId;
      }
      return false;
    });
  }, [variableName, inNodeId, getNodes, variableExists, variables]);

  return (
    <TooltipProvider>
      {isInScope ? (
        <span className={cn(
          "font-mono text-xs flex items-center gap-1",
          "text-foreground",
          className
        )}>
          {variableName}
        </span>
      ) : (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <span className={cn(
              "font-mono text-xs flex items-center gap-1 text-red-500 cursor-help",
              className
            )}>
              {variableName}
              <X className="h-3 w-3 text-red-500" />
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            className="rounded-md border border-red-400 bg-white dark:bg-zinc-900 text-red-600 px-3 py-2 text-xs shadow-md min-w-[160px] max-w-[220px]"
          >
            Variable not accessible: must be defined above where it&apos;s used.
          </TooltipContent>
        </Tooltip>
      )}
    </TooltipProvider>
  );
});

VariableReference.displayName = 'VariableReference';

export default VariableReference; 