import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getCourse } from '../../lib/api';
import type { CourseDetail } from '../../types';
import Badge from '../../components/ui/Badge';
import Progress from '../../components/ui/Progress';
import Button from '../../components/ui/Button';
import { useCart } from '../../store/cart';
import { useToast } from '../../components/ui/Toast';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import PageHeader from '../../components/ui/PageHeader';

export default function CourseDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { add } = useCart();
  const { show } = useToast();

  useEffect(() => {
    if (!id) return;
    getCourse(id)
      .then(setCourse)
      .catch((e) => setError(String(e)));
  }, [id]);

  if (!id) return null;
  return (
    <main>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!course ? (
        <p>Loading...</p>
      ) : (
        <div>
          <PageHeader
            breadcrumbs={[{ href: '/courses', label: 'Courses' }, { label: course.title }]}
            title={<span>{course.title}</span>}
            actions={<Badge>{course.difficulty_level}</Badge>}
          />
          {course.description && <p className="muted">{course.description}</p>}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span className="badge">{course.category}</span>
            <span className="badge">Duration: {course.duration}m</span>
            <span className="badge">Price: ${course.price}</span>
            <Button onClick={() => { add({ id: course.id, title: course.title, price: course.price }); show({ title: 'Added to cart', description: course.title, variant: 'success' }); }}>Add to Cart</Button>
          </div>
          <h2 style={{ marginTop: 16 }}>Modules</h2>
          {course.modules.length === 0 ? (
            <p>No modules yet.</p>
          ) : (
            <ol style={{ paddingLeft: 18 }}>
              {course.modules.map((m) => (
                <li key={m.id}>
                  {m.order}. {m.title} <small>({m.content_type})</small>
                </li>
              ))}
            </ol>
          )}
          <h2>Progress</h2>
          <Progress value={0} />
        </div>
      )}
    </main>
  );
}
