"use client"

import { loadPyodide, type PyodideInterface } from 'pyodide';

// Add type definition for window.loadPyodide
declare global {
  interface Window {
    loadPyodide: typeof loadPyodide;
  }
}

let pyodide: PyodideInterface | null = null;

export async function initializePyodide() {
  if (!pyodide) {
    try {
      // Use window.loadPyodide instead of the imported version
      pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.2/full"
      });
    } catch (error) {
      console.error('Failed to initialize Pyodide:', error);
      throw new Error('Failed to initialize Python environment');
    }
  }
  return pyodide;
}

export async function runPythonCode(code: string): Promise<{ output: string; error: string | null }> {
  try {
    const py = await initializePyodide();
    if (!py) {
      throw new Error('Python environment not initialized');
    }

    // Capture stdout
    let output = '';
    py.setStdout({
      write: (buffer: Uint8Array) => {
        output += new TextDecoder().decode(buffer);
        return buffer.length;
      },
    });

    // Run the code
    await py.runPythonAsync(code);
    return { output, error: null };
  } catch (error) {
    console.error('Python execution error:', error);
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export function isPyodideReady(): boolean {
  return pyodide !== null;
} 