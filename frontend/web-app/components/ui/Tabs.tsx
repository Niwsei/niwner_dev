import { ReactNode, useState } from 'react';

export type Tab = { key: string; label: string; content: ReactNode };

export default function Tabs({ tabs, defaultActive }: { tabs: Tab[]; defaultActive?: string }) {
  const [active, setActive] = useState(defaultActive ?? tabs[0]?.key);
  const current = tabs.find(t => t.key === active) ?? tabs[0];
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {tabs.map(t => (
          <button key={t.key} className={"btn " + (t.key === active ? 'btn-primary' : 'btn-ghost')} onClick={() => setActive(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="card">{current?.content}</div>
    </div>
  );
}

