import { Node, Edge } from '@xyflow/react';
import type { NodeData } from '../store/use-flow-store';

// Define the message types for worker communication
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

// Handle incoming messages
self.onmessage = (event: MessageEvent<WorkerRequestMessage>) => {
  const { type, payload } = event.data;
  
  if (type === 'GENERATE_CODE') {
    const startTime = performance.now();
    const { nodes, edges } = payload;
    
    // Generate code from the flow diagram
    const generatedCode = generateCodeFromFlow(nodes, edges);
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Send the result back to the main thread
    const response: WorkerResponseMessage = {
      type: 'CODE_GENERATED',
      payload: {
        code: generatedCode,
        executionTime
      }
    };
    
    self.postMessage(response);
  }
};

// Function to generate Python code from the flow diagram
function generateCodeFromFlow(nodes: Node<NodeData>[], edges: Edge[]): string {
  // Create a mapping of node connections
  const nodeConnections = createNodeConnectionsMap(edges);
  
  // Sort nodes to ensure proper execution order
  const sortedNodes = topologicalSort(nodes, nodeConnections);
  
  // Generate code for each node
  let code = "# Generated Python code\n\n";
  
  // Process sorted nodes
  for (const node of sortedNodes) {
    const nodeCode = generateNodeCode(node, nodeConnections);
    if (nodeCode) {
      code += nodeCode + "\n";
    }
  }
  
  return code;
}

// Create a map of node connections
function createNodeConnectionsMap(edges: Edge[]): Map<string, string[]> {
  const connections = new Map<string, string[]>();
  
  for (const edge of edges) {
    if (!connections.has(edge.source)) {
      connections.set(edge.source, []);
    }
    connections.get(edge.source)?.push(edge.target);
  }
  
  return connections;
}

// Perform a topological sort of nodes based on their connections
function topologicalSort(nodes: Node<NodeData>[], connections: Map<string, string[]>): Node<NodeData>[] {
  const visited = new Set<string>();
  const sorted: Node<NodeData>[] = [];
  
  function visit(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    const nextNodes = connections.get(nodeId) || [];
    for (const nextId of nextNodes) {
      visit(nextId);
    }
    
    const node = nodes.find(n => n.id === nodeId);
    if (node) sorted.unshift(node);
  }
  
  // Start with nodes that have no incoming edges
  const hasIncomingEdge = new Set<string>();
  
  // Fixed iteration over map entries
  Array.from(connections.entries()).forEach(([sourceId, targets]) => {
    for (const target of targets) {
      hasIncomingEdge.add(target);
    }
  });
  
  // Start with nodes that have no incoming edges
  const startNodes = nodes.filter(n => !hasIncomingEdge.has(n.id));
  for (const node of startNodes) {
    visit(node.id);
  }
  
  // Handle any remaining nodes (in case of cycles)
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      visit(node.id);
    }
  }
  
  return sorted;
}

// Generate code for a specific node
function generateNodeCode(node: Node<NodeData>, connections: Map<string, string[]>): string {
  const { data } = node;
  
  switch (data.type) {
    case 'variable':
      return generateVariableCode(data);
    case 'print':
      return generatePrintCode(data);
    case 'ifBlock':
      return generateIfBlockCode(node, connections);
    case 'forLoop':
      return generateForLoopCode(node, connections);
    case 'function':
      return generateFunctionCode(node, connections);
    case 'comment':
      return generateCommentCode(data);
    case 'database':
      return generateDatabaseCode(data);
    case 'operation':
      return generateOperationCode(data);
    default:
      return `# Unsupported node type: ${data.type}`;
  }
}

// Generate code for variable node
function generateVariableCode(data: NodeData): string {
  if (data.type !== 'variable') return '';
  
  const name = data.name || 'variable';
  const value = data.value || '""';
  
  return `${name} = ${value}`;
}

// Generate code for print node
function generatePrintCode(data: NodeData): string {
  if (data.type !== 'print') return '';
  
  const message = data.message || '""';
  return `print(${message})`;
}

// Generate code for if blocks
function generateIfBlockCode(node: Node<NodeData>, connections: Map<string, string[]>): string {
  if (node.data.type !== 'ifBlock') return '';
  
  const condition = node.data.condition || 'True';
  let code = `if ${condition}:\n`;
  code += '    # If block code here\n';
  
  return code;
}

// Generate code for for loops
function generateForLoopCode(node: Node<NodeData>, connections: Map<string, string[]>): string {
  if (node.data.type !== 'forLoop') return '';
  
  const condition = node.data.condition || 'range(10)';
  let code = `for i in ${condition}:\n`;
  code += '    # Loop code here\n';
  
  return code;
}

// Generate code for functions
function generateFunctionCode(node: Node<NodeData>, connections: Map<string, string[]>): string {
  if (node.data.type !== 'function') return '';
  
  const name = node.data.name || 'my_function';
  const parameters = node.data.parameters || [];
  const paramStr = parameters.join(', ');
  
  let code = `def ${name}(${paramStr}):\n`;
  code += '    # Function code here\n';
  
  if (node.data.returnValue) {
    code += '    return None\n';
  }
  
  return code;
}

// Generate code for comments
function generateCommentCode(data: NodeData): string {
  if (data.type !== 'comment') return '';
  
  const comment = data.label || '';
  return `# ${comment}`;
}

// Generate code for database operations
function generateDatabaseCode(data: NodeData): string {
  if (data.type !== 'database') return '';
  
  const query = data.query || 'SELECT * FROM table';
  let code = '# Database operation\n';
  code += `# Query: ${query}\n`;
  code += 'import sqlite3\n';
  code += 'conn = sqlite3.connect("database.db")\n';
  code += 'cursor = conn.cursor()\n';
  code += `cursor.execute("${query.replace(/"/g, '\\"')}")\n`;
  code += 'result = cursor.fetchall()\n';
  code += 'conn.close()\n';
  
  return code;
}

// Generate code for operations
function generateOperationCode(data: NodeData): string {
  if (data.type !== 'operation') return '';
  
  const targetVar = data.targetVariable || 'result';
  const operation = data.operation || '';
  const parameters = data.parameters || [];
  const resultVar = data.resultVariable || 'result';
  
  let code = `# Operation: ${operation}\n`;
  if (parameters.length > 0) {
    code += `${resultVar} = ${operation}(${parameters.join(', ')})\n`;
  } else {
    code += `${resultVar} = ${targetVar}.${operation}()\n`;
  }
  
  return code;
} 