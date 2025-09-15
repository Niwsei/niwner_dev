import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Link from 'next/link';
import { listCourses } from '../../lib/api';

type Item = { type: 'route' | 'course'; label: string; href: string };

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  useEffect(() => { if (open) listCourses().then(setCourses); }, [open]);
  const items = useMemo<Item[]>(() => {
    const routes: Item[] = [
      { type: 'route', label: 'Home', href: '/' },
      { type: 'route', label: 'Courses', href: '/courses' },
      { type: 'route', label: 'Course Builder', href: '/lms/builder' },
      { type: 'route', label: 'Player', href: '/lms/player' },
      { type: 'route', label: 'Logic Analyzer', href: '/logic/analyzer' },
      { type: 'route', label: 'Flow Diagram', href: '/logic/diagram' },
      { type: 'route', label: 'Leaderboards', href: '/gamification/leaderboards' },
      { type: 'route', label: 'Cart', href: '/shop/cart' }
    ];
    const courseItems = courses.map((c) => ({ type: 'course', label: c.title, href: `/courses/${c.id}` }));
    const all = [...routes, ...courseItems];
    if (!q) return all.slice(0, 12);
    const qq = q.toLowerCase();
    return all.filter(i => i.label.toLowerCase().includes(qq)).slice(0, 20);
  }, [q, courses]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose(); // parent toggles open; here we just request close to re-open by parent
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <Modal open={open} onClose={onClose} title="Quick Search (⌘K)" width={720}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Input placeholder="Type to search..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div style={{ maxHeight: 420, overflow: 'auto' }}>
          {items.map((i) => (
            <Link key={i.href + i.label} href={i.href} onClick={onClose}>
              <div className="card" style={{ padding: 10, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>{i.label}</span>
                <span className="badge">{i.type}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Modal>
  );
}

