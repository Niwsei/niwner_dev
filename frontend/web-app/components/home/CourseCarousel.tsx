import { useEffect, useRef } from 'react';
import type { Course } from '../../types';
import CourseCard from './CourseCard';

export default function CourseCarousel({ items }: { items: Course[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current; if (!el) return;
    const w = el.clientWidth; el.scrollBy({ left: dir * (w * 0.9), behavior: 'smooth' });
  };
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.scrollSnapType = 'x mandatory';
  }, []);
  return (
    <div className="carousel">
      <button className="btn btn-ghost" aria-label="Prev" onClick={() => scrollBy(-1)}>‹</button>
      <div ref={ref} className="carousel-track">
        {items.map((c) => (
          <div key={c.id} className="carousel-item">
            <CourseCard c={c} />
          </div>
        ))}
      </div>
      <button className="btn btn-ghost" aria-label="Next" onClick={() => scrollBy(1)}>›</button>
      <style jsx>{`
        .carousel { display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; gap: 8px; }
        .carousel-track { overflow: auto; display: grid; grid-auto-flow: column; gap: 12px; padding-bottom: 8px; }
        .carousel-item { width: 320px; scroll-snap-align: start; }
      `}</style>
    </div>
  );
}

