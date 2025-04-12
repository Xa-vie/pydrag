import { useCallback, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Terminal, Code2, Copy, Download, Loader2 } from 'lucide-react';
import CodeEditor from './CodeEditor';
import dynamic from 'next/dynamic';
import { usePython } from '@/hooks/usePython';

const PythonProvider = dynamic(
  () => import('react-py').then((mod) => mod.PythonProvider),
  { ssr: false }
);

interface PythonRunnerProps {
  code: string;
}

const PythonRunner = ({ code }: PythonRunnerProps) => {
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'code.py';
    link.click();
  }, [code]);

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900">
      <PythonProvider>
        <Suspense fallback={<LoadingState />}>
          <PythonContent code={code} onCopy={handleCopy} onDownload={handleDownload} />
        </Suspense>
      </PythonProvider>
    </div>
  );
};

interface PythonContentProps {
  code: string;
  onCopy: (text: string) => void;
  onDownload: () => void;
}

const PythonContent = ({ code, onCopy, onDownload }: PythonContentProps) => {
  const { runPython, output, error, isRunning } = usePython();

  const handleRunCode = useCallback(async () => {
    await runPython(code);
  }, [code, runPython]);

  return (
    <div className="flex-1 flex flex-col min-h-0 border rounded-lg dark:border-gray-800 bg-white dark:bg-gray-800">
      {/* Header with Icons */}
      <div className="flex items-center justify-between p-2 border-b dark:border-gray-800">
        <Button
          onClick={handleRunCode}
          disabled={isRunning}
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="text-lg">▶</span>
          )}
        </Button>
        script
        <div className="flex items-center gap-3">
          
        
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCopy(code)}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Code Editor Section (70%) */}
      <div className="flex-[7] min-h-0 p-1">
        <CodeEditor code={code} />
      </div>

      {/* Output Section (30%) */}
      <div className="flex-[3] flex flex-col border-t dark:border-gray-800 min-h-0">
        <div className="flex items-center justify-between p-2 border-b dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span className="text-sm">Output</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => output && onCopy(output)}
            disabled={!output}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 p-4 overflow-auto font-mono text-sm bg-gray-50 dark:bg-gray-900">
          {error ? (
            <div className="text-red-600 dark:text-red-400 whitespace-pre-wrap">{error}</div>
          ) : output ? (
            <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{output}</div>
          ) : (
            <div className="text-gray-400 p-1">Output will appear here after execution</div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center h-full text-blue-600">
    <Loader2 className="w-8 h-8 animate-spin" />
    <span className="ml-3 text-lg">Initializing Python Environment...</span>
  </div>
);

export default PythonRunner; 