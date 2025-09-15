import { ReactNode } from 'react';
import Breadcrumbs, { Crumb } from './Breadcrumbs';

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <header style={{ marginBottom: 12 }}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>
          {subtitle && <div className="muted" style={{ marginTop: 4 }}>{subtitle}</div>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
      </div>
    </header>
  );
}

