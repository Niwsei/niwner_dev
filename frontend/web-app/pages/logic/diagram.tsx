import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

const ReactFlow = dynamic(() => import('reactflow').then(m => m.default), { ssr: false, loading: () => <p>Loading canvas...</p> });
const Background = dynamic(() => import('reactflow').then(m => m.Background), { ssr: false });
const Controls = dynamic(() => import('reactflow').then(m => m.Controls), { ssr: false });

import 'reactflow/dist/style.css';
import PageHeader from '../../components/ui/PageHeader';

export default function Diagram() {
  const [nodes, setNodes] = useState<any[]>([
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'Start' } },
    { id: '2', position: { x: 300, y: 100 }, data: { label: 'End' } }
  ]);
  const [edges, setEdges] = useState<any[]>([{ id: 'e1-2', source: '1', target: '2' }]);
  const fitViewOptions = useMemo(() => ({ padding: 0.2 }), []);
  return (
    <main>
      <PageHeader title="Logic Flow Diagram" subtitle="Design and edit flow graphs" />
      <div className="card" style={{ height: 500 }}>
        <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={fitViewOptions} onNodesChange={setNodes as any} onEdgesChange={setEdges as any} />
        <Background />
        <Controls />
      </div>
    </main>
  );
}
