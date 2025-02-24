import { memo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Terminal, Code2, Copy, Download } from 'lucide-react';
import CodeEditor from './CodeEditor';
import { usePython } from '@/hooks/usePython';
import { PythonProvider } from 'react-py';

interface RunCodeSidebarProps {
  code: string;
}

const RunCodeSidebar = memo(({ code }: RunCodeSidebarProps) => {
  const { runPython, output, error, isRunning } = usePython();

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

  const handleRunCode = useCallback(async () => {
    await runPython(code);
  }, [code, runPython]);

  return (
    <PythonProvider>
      <div className="w-1/4 h-full border-l border-gray-200 dark:border-gray-800">
        <Tabs defaultValue="code" className="h-full flex flex-col">
          <TabsList className="h-12 px-3 bg-transparent border-b rounded-none">
            <TabsTrigger
              value="code"
              className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800"
            >
              <Code2 className="w-4 h-4 mr-2" />
              Code
            </TabsTrigger>
            <TabsTrigger
              value="output"
              className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Output
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="flex-1 mt-0 p-2">
            <div className="flex flex-col h-full border rounded-lg dark:border-gray-800">
              <div className="flex items-center justify-between p-2 border-b dark:border-gray-800">
                <span className="text-sm font-mono text-gray-500">script.py</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(code)}
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    title="Download code"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isRunning ? 'Running...' : 'Run'}
                  </Button>
                </div>
              </div>
              <CodeEditor code={code} />
            </div>
          </TabsContent>

          <TabsContent value="output" className="flex-1 mt-0 p-2">
            <div className="flex flex-col h-full border rounded-lg dark:border-gray-800">
              <div className="flex items-center justify-between p-2 border-b dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span className="text-sm">Output</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => output && handleCopy(output)}
                  disabled={!output}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 p-2 overflow-auto font-mono text-sm bg-gray-50 dark:bg-gray-900">
                {error ? (
                  <div className="text-red-600 dark:text-red-400">{error}</div>
                ) : output ? (
                  <div className="text-gray-800 dark:text-gray-200">{output}</div>
                ) : (
                  <div className="text-gray-400">No output yet</div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PythonProvider>
  );
});

RunCodeSidebar.displayName = 'RunCodeSidebar';
export default RunCodeSidebar; 