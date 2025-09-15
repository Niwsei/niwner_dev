import { useEffect, useState } from 'react';
import { getUserAchievements } from '../../lib/api';
import Card, { CardHeader } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

const DEMO_USER = 'demo-user-1';

export default function Achievements() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getUserAchievements(DEMO_USER).then(setRows).catch((e) => setError(String(e)));
  }, []);
  return (
    <main>
      <PageHeader title="Achievements" subtitle="Your badges and milestones" />
      <Card>
        <CardHeader title="Achievements" />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="grid">
          {rows.map((a) => (
            <div key={a.earned_date} className="col-3">
              <div className="card" style={{ padding: 12 }}>
                <strong>{a.badge_type}</strong>
                <div className="muted">{a.skill_category}</div>
                <div className="muted" style={{ fontSize: 12 }}>{new Date(a.earned_date).toLocaleDateString()}</div>
                {a.description && <div style={{ marginTop: 8 }}>{a.description}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
