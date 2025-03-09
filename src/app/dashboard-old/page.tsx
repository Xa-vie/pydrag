import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import { VisualProgramming } from '@/components/VisualProgramming/VisualProgramming';

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    return redirect('/signin');
  } else {
    return (
      <div className="h-full w-full">
        <ReactFlowProvider>
          <VisualProgramming />
        </ReactFlowProvider>
      </div>
    );
  }
}
