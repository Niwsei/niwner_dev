import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';

const Monaco = dynamic(() => import('@monaco-editor/react'), { ssr: false, loading: () => <p>Loading editor...</p> });

export default function Solver() {
  const [code, setCode] = useState<string>('function solve(input){\n  // TODO\n  return input\n}');
  const editorRef = useRef<any>(null);
  const run = () => alert('Run with input: 42 => ' + 42);
  return (
    <main>
      <PageHeader title="Interactive Coding" subtitle="Write and run code snippets" />
      <div className="card">
        <Monaco height="300px" defaultLanguage="javascript" value={code} onChange={(v) => setCode(v || '')} onMount={(_, ed) => (editorRef.current = ed)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <Button onClick={run}>Run</Button>
      </div>
    </main>
  );
}
