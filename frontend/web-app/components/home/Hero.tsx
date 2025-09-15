import Link from 'next/link';
import Button from '../../components/ui/Button';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1 className="text-gradient" style={{ margin: 0 }}>Learn. Build. Master.</h1>
        <p className="muted" style={{ maxWidth: 680, marginTop: 8 }}>
          ระบบขายคอร์สออนไลน์ครบครัน มากกว่าแค่ขายคอร์ส — แพลตฟอร์มพัฒนาทักษะแบบครบวงจร
          ด้วยคอร์สคุณภาพ เครื่องมือ Interactive และระบบ Gamification เพื่อผลลัพธ์การเรียนรู้ที่ดีกว่า
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <Link href="/courses"><Button>Browse Courses</Button></Link>
          <Link href="/lms/builder"><Button variant="ghost">Try Course Builder</Button></Link>
        </div>
      </div>
      <style jsx>{`
        .hero { position: relative; overflow: hidden; border: 1px solid var(--border); border-radius: 16px; background: radial-gradient(1200px 600px at 10% -10%, rgba(110,168,254,0.18), transparent), radial-gradient(800px 400px at 90% 10%, rgba(126,231,135,0.12), transparent), linear-gradient(180deg, var(--panel), var(--panel-2)); }
        .hero-inner { padding: 38px 20px; }
      `}</style>
    </section>
  );
}

