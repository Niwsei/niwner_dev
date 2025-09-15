import { useState } from 'react';
import { analyzeCode } from '../../lib/api';
import PageHeader from '../../components/ui/PageHeader';

export default function Analyzer() {
  const [code, setCode] = useState<string>('function sum(a,b){ if(a>0 && b>0){ return a+b } return 0 }');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await analyzeCode(code);
      setResult(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <PageHeader title="Code Logic Analyzer" subtitle="Get instant complexity insights" />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <textarea style={{ width: '100%', height: 200 }} value={code} onChange={(e) => setCode(e.target.value)} />
      <div style={{ marginTop: 12 }}>
        <button onClick={run} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze'}</button>
      </div>
      {result && (
        <pre style={{ background: '#f7f7f7', padding: 12, marginTop: 12 }}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </main>
  );
}
