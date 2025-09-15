import { useEffect, useState } from 'react';
import { listThreads } from '../../lib/api';
import PageHeader from '../../components/ui/PageHeader';

export default function Forums() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { listThreads().then(setRows); }, []);
  return (
    <main>
      <PageHeader title="Discussion Forums" subtitle="Ask questions and share knowledge" />
      <div className="grid">
        {rows.map((t) => (
          <div key={t.id} className="col-6">
            <div className="card" style={{ padding: 12 }}>
              <strong>{t.title}</strong>
              <div className="muted">by {t.author} • {t.replies} replies</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
