import { useEffect, useMemo, useState } from 'react';
import { getUserStreak } from '../../lib/api';
import Card, { CardHeader } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

const DEMO_USER = 'demo-user-1';

export default function Streaks() {
  const [data, setData] = useState<{ current: number; longest: number; days: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getUserStreak(DEMO_USER).then(setData).catch((e) => setError(String(e)));
  }, []);
  const boxes = useMemo(() => {
    const n = 14; // show two weeks
    return Array.from({ length: n }).map((_, i) => ({ day: i, active: !!data?.days?.[data.days.length - 1 - i] }));
  }, [data]);
  return (
    <main>
      <PageHeader title="Learning Streak" subtitle="Keep your daily momentum" />
      <Card>
        <CardHeader title="Learning Streak" />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!data ? 'Loading...' : (
          <div>
            <p>Current: <strong>{data.current}</strong> days • Longest: <strong>{data.longest}</strong> days</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 6, maxWidth: 560 }}>
              {boxes.map((b, idx) => (
                <div key={idx} style={{ height: 20, borderRadius: 4, background: b.active ? 'var(--accent)' : '#0f1628', border: '1px solid var(--border)' }} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
