import { useEffect, useState } from 'react';
import { createWorkflow, listWorkflows } from '../../lib/api';

export default function Builder() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [title, setTitle] = useState('My First Flow');
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try { setWorkflows(await listWorkflows()); } catch (e) { setError(String(e)); }
  };
  useEffect(() => { refresh(); }, []);

  const create = async () => {
    try {
      await createWorkflow({ title, nodes: [{ id: 'start' }, { id: 'end' }], connections: [{ from: 'start', to: 'end' }] });
      await refresh();
    } catch (e) { setError(String(e)); }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Visual Logic Builder</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={create}>Create Workflow</button>
      </div>
      <h2 style={{ marginTop: 16 }}>Existing</h2>
      <ul>
        {workflows.map((w) => (
          <li key={w.id}>{w.id}. {w.title}</li>
        ))}
      </ul>
    </main>
  );
}
