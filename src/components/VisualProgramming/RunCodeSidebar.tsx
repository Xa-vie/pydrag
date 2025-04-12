import { memo, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Terminal, Code2, Copy, Download } from 'lucide-react';
import CodeEditor from './CodeEditor';
import dynamic from 'next/dynamic';
import PythonRunner from './PythonRunner';

interface RunCodeSidebarProps {
  code: string;
}

const RunCodeSidebar = memo(({ code }: RunCodeSidebarProps) => {
  // const PythonRunner = dynamic(
  //   () => import('./PythonRunner').then((mod) => mod.default),
  //   { ssr: false }
  // );

  return (
    <Suspense fallback={<div>Loading Python environment...</div>}>
      <div className="w-1/3 h-full border-l border-gray-200 dark:border-gray-800">
        <PythonRunner code={code} />
      </div>
    </Suspense>
  );
});

RunCodeSidebar.displayName = 'RunCodeSidebar';
export default RunCodeSidebar; 