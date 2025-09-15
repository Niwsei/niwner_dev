import { useEffect, useState } from 'react';
import { listGroups } from '../../lib/api';
import PageHeader from '../../components/ui/PageHeader';

export default function Groups() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { listGroups().then(setRows); }, []);
  return (
    <main>
      <PageHeader title="Study Groups" subtitle="Find your learning community" />
      <div className="grid">
        {rows.map((g) => (
          <div key={g.id} className="col-4">
            <div className="card" style={{ padding: 12 }}>
              <strong>{g.name}</strong>
              <div className="muted">{g.members} members</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
