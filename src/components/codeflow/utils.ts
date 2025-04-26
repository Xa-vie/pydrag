import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '@/store/use-flow-store';

export const INDENTATION_WIDTH = 100; // Width of each indentation level

export const calculateIndentationLevel = (x: number): number => {
  return Math.max(0, Math.floor(x / INDENTATION_WIDTH) -1);
};

export const snapToIndentation = (x: number): number => {
  const level = calculateIndentationLevel(x);
  return level * INDENTATION_WIDTH;
};

/**
 * Finds the nearest parent function node for a given node ID.
 * @param nodeId The node ID to start from (child node)
 * @param nodes The array of all nodes
 * @param edges The array of all edges
 * @returns The parent function node (or null if not found)
 */
export function findParentFunctionNode(
  nodeId: string,
  nodes: Node<NodeData>[],
  edges: Edge[]
): Node<NodeData> | null {
  let currentId = nodeId;
  while (true) {
    // Find incoming edge to current node
    const parentEdge = edges.find((edge) => edge.target === currentId);
    if (!parentEdge) return null;
    const parentNode = nodes.find((node) => node.id === parentEdge.source);
    if (!parentNode) return null;
    if (parentNode.type === 'function' || (parentNode.data && parentNode.data.type === 'function')) {
      return parentNode;
    }
    currentId = parentNode.id;
  }
}

/**
 * Finds the nearest parent function node by position/indentation.
 * A node is considered inside a function if it is visually below (y >) and indented at the same or greater level (x >=) as the function node.
 */
export function findParentFunctionNodeByPosition(
  nodeId: string,
  nodes: Node<NodeData>[]
): Node<NodeData> | null {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;
  const nodeIndent = calculateIndentationLevel(node.position.x);
  const nodeY = node.position.y;

  // Find all function nodes above this node, with indentation <= this node
  const candidateFunctions = nodes.filter(n =>
    n.type === 'function' &&
    n.position.y < nodeY &&
    calculateIndentationLevel(n.position.x) <= nodeIndent
  );

  // Get the closest one (max y)
  if (candidateFunctions.length === 0) return null;
  return candidateFunctions.reduce((prev, curr) =>
    curr.position.y > prev.position.y ? curr : prev
  );
} 