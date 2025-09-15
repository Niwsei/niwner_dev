import { useState } from 'react';

export default function SearchBar({ placeholder = 'Search...', onChange }: { placeholder?: string; onChange: (q: string) => void }) {
  const [q, setQ] = useState('');
  return (
    <div className="card" style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); onChange(e.target.value); }}
        placeholder={placeholder}
        style={{ flex: 1, padding: 8, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)' }}
      />
      <span className="muted">⌘K</span>
    </div>
  );
}

