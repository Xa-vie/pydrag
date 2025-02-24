'use client';

import React, { useCallback } from 'react';
import  {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Input' },
    type: 'input'
  },
  {
    id: '2',
    position: { x: 300, y: 100 },
    data: { label: 'Process' }
  },
  {
    id: '3',
    position: { x: 500, y: 100 },
    data: { label: 'Output' },
    type: 'output'
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' }
];

export function FlowGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = React.useCallback(
    (connection: Connection) => {
      setEdges((eds) => [...eds, { ...connection, id: `e${connection.source}-${connection.target}` }]);
    },
    [setEdges]
  );

  return (

      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

  );
}