import { useEffect, useState } from "react";

const PYODIDE_VERSION = "0.25.0";

let globalPyodide: any = null;

export default function usePyodide() {
  const [pyodide, setPyodide] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPyodide = async () => {
      if (globalPyodide) {
        setPyodide(globalPyodide);
        setLoading(false);
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;
        document.head.appendChild(script);

        script.onload = async () => {
          try {
            globalPyodide = await (window as any).loadPyodide({
              indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
            });
            setPyodide(globalPyodide);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initialize Pyodide');
          } finally {
            setLoading(false);
          }
        };

        script.onerror = () => {
          setError('Failed to load Pyodide script');
          setLoading(false);
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Pyodide');
        setLoading(false);
      }
    };

    loadPyodide();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return { pyodide, loading, error };
} 