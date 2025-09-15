import { useQuery } from '@tanstack/react-query';
import { getRandomPuzzle } from '../../lib/api';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';

export default function Games() {
  const { data, refetch, isFetching, error } = useQuery({ queryKey: ['puzzle'], queryFn: getRandomPuzzle });
  return (
    <main>
      <PageHeader title="Logic Puzzle" subtitle="Train your logical thinking" />
      {error && <p style={{ color: 'red' }}>{String(error)}</p>}
      <pre className="card" style={{ padding: 16 }}>{JSON.stringify(data, null, 2)}</pre>
      <Button onClick={() => refetch()} disabled={isFetching}>{isFetching ? 'Loading...' : 'New Puzzle'}</Button>
    </main>
  );
}
