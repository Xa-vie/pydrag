import { useEffect, useState } from 'react';
import { loadPyodide } from 'pyodide';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface PyodideRunnerProps {
  code: string;
}

export function PyodideRunner({ code }: PyodideRunnerProps) {
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);

  useEffect(() => {
    async function initPyodide() {
      setIsLoading(true);
      try {
        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
        });
        setPyodide(pyodideInstance);
      } catch (err) {
        setError('Failed to load Pyodide: ' + (err as Error).message);
      }
      setIsLoading(false);
    }
    initPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodide) return;
    setIsLoading(true);
    setOutput('');
    setError('');

    try {
      // Redirect stdout to capture print statements
      await pyodide.runPythonAsync(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      // Run the actual code
      await pyodide.runPythonAsync(code);

      // Get the captured output
      const stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()");
      setOutput(stdout);

      // Reset stdout
      await pyodide.runPythonAsync("sys.stdout = sys.__stdout__");
    } catch (err) {
      setError((err as Error).message);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Code Output</h3>
        <Button
          size="sm"
          onClick={runCode}
          disabled={isLoading || !pyodide}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            'Run Code'
          )}
        </Button>
      </div>
      <ScrollArea className="h-[200px] rounded-md border border-white/10 bg-slate-800/50 p-4">
        {output && (
          <pre className="text-sm text-green-400 font-mono">{output}</pre>
        )}
        {error && (
          <pre className="text-sm text-red-400 font-mono">{error}</pre>
        )}
        {!output && !error && (
          <div className="text-slate-400 text-sm">Output will appear here...</div>
        )}
      </ScrollArea>
    </div>
  );
} 