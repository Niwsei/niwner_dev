import Player from '../../components/video/Player';
import Progress from '../../components/ui/Progress';
import { useEffect, useRef, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Select from '../../components/ui/Select';
import { getCourse } from '../../lib/api';

export default function CoursePlayer() {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [course, setCourse] = useState<any | null>(null);
  const [current, setCurrent] = useState<{ title: string; src: string; poster?: string } | null>(null);
  const videoEl = useRef<HTMLVideoElement | null>(null);

  useEffect(() => { getCourse(1).then((c) => { setCourse(c); const first = c.lessons[0]; setCurrent({ title: first?.title || 'Lesson', src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }); }); }, []);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (videoEl.current) videoEl.current.playbackRate = speed;
  }, [speed]);

  return (
    <main>
      <PageHeader title="Course Player" subtitle={current?.title || 'Watch and track your progress'} actions={
        <Select value={String(speed)} onChange={(e) => setSpeed(Number(e.target.value))}><option value="0.75">0.75x</option><option value="1">1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option></Select>
      } />
      <div className="layout">
        <aside className="card" style={{ padding: 10 }}>
          <strong style={{ display: 'block', marginBottom: 6 }}>{course?.title || 'Loading...'}</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {course?.modules?.map((m: any) => (
              <div key={m.id}>
                <div className="muted" style={{ fontSize: 12 }}>{m.order}. {m.title}</div>
                {course.lessons.filter((l: any) => l.module_id === m.id).map((l: any) => (
                  <button key={l.id} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => setCurrent({ title: l.title, src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' })}>{l.title}</button>
                ))}
              </div>
            ))}
          </div>
        </aside>
        <section>
          <Player src={current?.src || ''} poster={current?.poster} playbackRate={speed} onReady={(el) => (videoEl.current = el)} />
          <h3>Progress</h3>
          <Progress value={progress} />
          <div className="card" style={{ padding: 12, marginTop: 12 }}>
            <strong>Notes</strong>
            <textarea
              style={{ width: '100%', minHeight: 120, marginTop: 8 }}
              placeholder="Write your notes here..."
              defaultValue={typeof window !== 'undefined' ? localStorage.getItem('notes-1') || '' : ''}
              onChange={(e) => localStorage.setItem('notes-1', e.target.value)}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
