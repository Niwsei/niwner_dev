export default function Testimonials() {
  const quotes = [
    { name: 'Alice K.', role: 'Product Manager', text: 'SkillFlow เปลี่ยนวิธีเรียนของทีมเรา ทั้งสนุกและได้ผลจริง' },
    { name: 'Ben C.', role: 'Developer', text: 'ชอบ Logic Analyzer มาก ช่วยรีวิวโค้ดได้ไวขึ้น' },
    { name: 'Nina P.', role: 'Designer', text: 'Flow Builder ใช้งานง่าย สื่อสารกับทีมได้ชัดเจน' },
  ];
  return (
    <section>
      <div className="grid">
        {quotes.map((q) => (
          <div key={q.name} className="col-4">
            <div className="card" style={{ padding: 16 }}>
              <p style={{ marginTop: 0 }}>“{q.text}”</p>
              <div className="muted">— {q.name}, {q.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

