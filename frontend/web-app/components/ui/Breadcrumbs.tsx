import Link from 'next/link';

export type Crumb = { href?: string; label: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ fontSize: 13, marginBottom: 8 }}>
      {items.map((c, i) => (
        <span key={i}>
          {c.href ? <Link href={c.href} className="muted">{c.label}</Link> : <span className="muted">{c.label}</span>}
          {i < items.length - 1 && <span className="muted"> {' / '} </span>}
        </span>
      ))}
    </nav>
  );
}

