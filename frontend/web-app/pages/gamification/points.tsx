import { useEffect, useState } from 'react';
import { addUserPoints, getUserPoints } from '../../lib/api';
import type { PointsState } from '../../types';

const DEMO_USER = 'demo-user-1';

export default function Points() {
  const [state, setState] = useState<PointsState>({ xp: 0, level: 1 });
  const [error, setError] = useState<string | null>(null);

  const refresh = () => getUserPoints(DEMO_USER).then(setState).catch((e) => setError(String(e)));

  useEffect(() => {
    refresh();
  }, []);

  const add = async (delta: number) => {
    try {
      await addUserPoints(DEMO_USER, delta);
      await refresh();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>XP Points</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        <strong>XP:</strong> {state.xp} • <strong>Level:</strong> {state.level}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => add(50)}>+50 XP</button>
        <button onClick={() => add(200)}>+200 XP</button>
        <button onClick={() => add(1000)}>+1000 XP</button>
      </div>
    </main>
  );
}
