import { useEffect, useState } from 'react';
import { getKanban } from '../../lib/api';
import PageHeader from '../../components/ui/PageHeader';

export default function Kanban() {
  const [board, setBoard] = useState<{ columns: any[]; tasks: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getKanban().then(setBoard).catch((e) => setError(String(e))); }, []);
  return (
    <main>
      <PageHeader title="Kanban Board" subtitle="Track your project tasks" />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!board ? 'Loading...' : (
        <div className="grid">
          {board.columns.map((col) => (
            <div key={col.id} className="col-3">
              <div className="card" style={{ padding: 12 }}>
                <strong>{col.title}</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {board.tasks.filter(t => t.columnId === col.id).map(t => (
                    <div key={t.id} className="card" style={{ padding: 8 }}>
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
