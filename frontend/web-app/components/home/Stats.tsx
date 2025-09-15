export default function Stats() {
  const items = [
    { label: 'Courses', value: '120+' },
    { label: 'Learners', value: '25k+' },
    { label: 'Projects', value: '1.2k+' },
    { label: 'XP Earned', value: '8M+' }
  ];
  return (
    <section className="card" style={{ padding: 16 }}>
      <div className="grid">
        {items.map((s) => (
          <div key={s.label} className="col-3" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{s.value}</div>
            <div className="muted">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

