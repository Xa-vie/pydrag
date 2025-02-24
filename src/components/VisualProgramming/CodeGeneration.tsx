import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { PythonProvider } from 'react-py';
import { usePython } from '@/hooks/usePython';

interface CodeGenerationProps {
  code: string;
}

const PythonRunner: React.FC<CodeGenerationProps> = ({ code }) => {
  const { runPython, output, error, isLoading, isRunning } = usePython();

  const handleRunCode = async () => {
    await runPython(code);
  };

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
              disabled={isLoading || isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : isLoading ? (
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

// Wrap the component with PythonProvider
export const CodeGeneration: React.FC<CodeGenerationProps> = (props) => {
  return (
    <PythonProvider>
      <PythonRunner {...props} />
    </PythonProvider>
  );
}; 