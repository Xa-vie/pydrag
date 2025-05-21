import { Node, Edge } from '@xyflow/react';
import type { NodeData } from './use-flow-store';

// Define the state slice for code generation
interface CodeGenerationSlice {
  code: string;
  isGenerating: boolean;
  error: string | null;
  executionTime: number;
  generateCode: () => void;
}

// Define message types for worker communication
type WorkerRequestMessage = {
  type: 'GENERATE_CODE';
  payload: {
    nodes: Node<NodeData>[];
    edges: Edge[];
  };
};

type WorkerResponseMessage = {
  type: 'CODE_GENERATED';
  payload: {
    code: string;
    executionTime: number;
  };
};

// Create the code generation slice
export const createCodeGenerationSlice = (set: any, get: any): CodeGenerationSlice => {
  // Create the worker instance
  let worker: Worker | null = null;
  
  // Initialize the worker
  const initWorker = () => {
    if (typeof window === 'undefined') return null;
    
    if (!worker) {
      worker = new Worker(new URL('../workers/codeGenerationWorker.ts', import.meta.url), { type: 'module' });
      
      // Set up the message handler
      worker.onmessage = (event: MessageEvent<WorkerResponseMessage>) => {
        const { type, payload } = event.data;
        
        if (type === 'CODE_GENERATED') {
          set({
            code: payload.code,
            isGenerating: false,
            executionTime: payload.executionTime
          });
        }
      };
      
      worker.onerror = (error) => {
        set({
          isGenerating: false,
          error: error.message || 'Worker error occurred'
        });
      };
    }
    
    return worker;
  };

  return {
    code: '',
    isGenerating: false,
    error: null,
    executionTime: 0,
    generateCode: () => {
      set({ isGenerating: true, error: null });
      
      try {
        const workerInstance = initWorker();
        
        if (!workerInstance) {
          throw new Error('Failed to initialize Web Worker');
        }
        
        const nodes = get().nodes;
        const edges = get().edges;
        
        const message: WorkerRequestMessage = {
          type: 'GENERATE_CODE',
          payload: { nodes, edges }
        };
        
        workerInstance.postMessage(message);
      } catch (error) {
        set({
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };
}; 