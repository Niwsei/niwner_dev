import { useEffect, useState } from 'react';
import { getLeaderboard } from '../../lib/api';
import Card, { CardHeader } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

export default function Leaderboards() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getLeaderboard().then(setRows).catch((e) => setError(String(e)));
  }, []);
  return (
    <main>
      <PageHeader title="Leaderboards" subtitle="Top learners by XP" />
      <Card>
        <CardHeader title="Leaderboards" />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr className="muted"><th align="left">Rank</th><th align="left">User</th><th align="right">XP</th><th align="right">Level</th></tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.userId}>
                <td>{idx + 1}</td>
                <td>{r.userId}</td>
                <td align="right">{r.xp}</td>
                <td align="right">{r.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </main>
  );
}
