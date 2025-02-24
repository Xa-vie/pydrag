import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import usePyodide from '@/hooks/usePyodide';

interface CodeGenerationProps {
  code: string;
}

export const CodeGeneration: React.FC<CodeGenerationProps> = ({ code }) => {
  const [output, setOutput] = useState<string>('');
  const [runError, setRunError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { pyodide, loading: isInitializing, error: initError } = usePyodide();

  const handleRunCode = async () => {
    if (!pyodide) return;

    setIsRunning(true);
    setRunError(null);
    setOutput('');

    try {
      // Capture stdout
      let capturedOutput = '';
      pyodide.setStdout({
        write: (text: string) => {
          capturedOutput += text;
          return text.length;
        },
      });

      await pyodide.runPythonAsync(code);
      setOutput(capturedOutput);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const error = initError || runError;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Generated Python Code</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{code}</code>
          </pre>
          <div className="mt-4">
            <Button 
              onClick={handleRunCode} 
              disabled={isRunning || isInitializing || !pyodide}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing Python...
                </>
              ) : (
                'Run Code'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(output || error) && (
        <Card>
          <CardHeader>
            <CardTitle>{error ? 'Error' : 'Output'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg overflow-x-auto ${error ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
              <pre className="font-mono text-sm">
                {error || output || 'No output'}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 