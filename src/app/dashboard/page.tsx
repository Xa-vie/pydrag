import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
const ReactFlowProvider = dynamic(() => import('@xyflow/react').then(mod => mod.ReactFlowProvider));
const CodeFlow = dynamic(() => import('@/components/codeflow/code-flow').then(mod => mod.CodeFlow));

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    return redirect('/signin');
  } else {
    return (
      <div className="h-full w-full" suppressHydrationWarning>
        <ReactFlowProvider>
          <CodeFlow />
        </ReactFlowProvider>
      </div>
    );
  }
}
