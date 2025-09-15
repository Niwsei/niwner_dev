import { ReactNode } from 'react';

export default function Empty({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {description && <p className="muted" style={{ marginTop: 0 }}>{description}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

