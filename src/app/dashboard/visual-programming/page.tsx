import { VisualProgramming } from '@/components/VisualProgramming/VisualProgramming';
import { ReactFlowProvider } from '@xyflow/react';

export default function VisualProgrammingPage() {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <VisualProgramming />
      </ReactFlowProvider>  
    </div>
  );
} 