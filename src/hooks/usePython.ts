import { useState } from 'react';
import { PythonProvider, usePython as useReactPy } from 'react-py';

export function usePython() {
  const [isReady, setIsReady] = useState(false);
  const { runPython, stdout, stderr, isLoading, isRunning } = useReactPy();

  const handleRunCode = async (code: string) => {
    try {
      await runPython(code);
    } catch (error) {
      console.error('Python execution error:', error);
    }
  };

  return {
    runPython: handleRunCode,
    output: stdout,
    error: stderr,
    isLoading,
    isRunning,
    isReady
  };
} 