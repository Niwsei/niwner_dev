import { useEffect, useState } from 'react';

const accents = [
  { name: 'Blue', value: '#6ea8fe' },
  { name: 'Emerald', value: '#34d399' },
  { name: 'Violet', value: '#a78bfa' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#fb7185' }
];

export default function AccentPicker() {
  const [accent, setAccent] = useState<string>(() => (typeof localStorage !== 'undefined' && localStorage.getItem('accent')) || '#6ea8fe');
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', accent);
    if (typeof localStorage !== 'undefined') localStorage.setItem('accent', accent);
  }, [accent]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {accents.map(a => (
        <button key={a.value} aria-label={a.name} className="badge" style={{ width: 20, height: 20, padding: 0, background: a.value, borderColor: accent === a.value ? '#fff' : 'var(--border)' }} onClick={() => setAccent(a.value)} />
      ))}
    </div>
  );
}

