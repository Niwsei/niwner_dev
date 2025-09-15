import { useEffect, useState } from 'react';
import { getCoursePreview, listCourses } from '../../lib/api';
import type { Course } from '../../types';
import Link from 'next/link';
import Card, { CardHeader, CardMeta } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { useCart } from '../../store/cart';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';

export default function Index() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const { show } = useToast();
  const { add } = useCart();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [sort, setSort] = useState<string>('popularity');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    listCourses()
      .then((data) => setCourses(data))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const openPreview = async (id: number) => {
    setPreviewId(id);
    try { setPreview(await getCoursePreview(id)); } catch (e) { setError(String(e)); }
  };
  const closePreview = () => { setPreviewId(null); setPreview(null); };

  return (
    <main>
      <PageHeader title="Courses" subtitle="Browse our catalog" actions={<Badge>{courses.length} items</Badge>} />

      <div className="grid" style={{ alignItems: 'center', marginBottom: 8 }}>
        <div className="col-6"><SearchBar placeholder="Search courses..." onChange={(v) => { setQ(v); setPage(1); }} /></div>
        <div className="col-2"><Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}><option value="all">All Categories</option>{Array.from(new Set(courses.map(c => c.category))).map(c => (<option key={c} value={c}>{c}</option>))}</Select></div>
        <div className="col-2"><Select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}><option value="all">All Levels</option>{Array.from(new Set(courses.map(c => c.difficulty_level))).map(l => (<option key={l} value={l}>{l}</option>))}</Select></div>
        <div className="col-2"><Select value={sort} onChange={(e) => setSort(e.target.value)}><option value="popularity">Most Popular</option><option value="rating">Top Rated</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></Select></div>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <div className="grid" style={{ marginTop: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-4">
              <div className="card" style={{ padding: 16 }}>
                <Skeleton height={20} width={'70%'} />
                <div style={{ height: 8 }} />
                <Skeleton height={12} width={'40%'} />
                <div style={{ height: 16 }} />
                <Skeleton height={32} width={'100%'} />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardHeader title="No courses yet" />
          <CardMeta>Use the API to create your first course.</CardMeta>
        </Card>
      ) : (
        <div>
          <div className="grid" style={{ marginTop: 12 }}>
          {courses
            .filter(c => (!q || (c.title + ' ' + (c.description || '')).toLowerCase().includes(q.toLowerCase())))
            .filter(c => category === 'all' || c.category === category)
            .filter(c => difficulty === 'all' || c.difficulty_level === difficulty)
            .sort((a, b) => {
              if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
              if (sort === 'price-asc') return (a.price || 0) - (b.price || 0);
              if (sort === 'price-desc') return (b.price || 0) - (a.price || 0);
              return (b.enrollment_count || 0) - (a.enrollment_count || 0);
            })
            .slice((page - 1) * pageSize, page * pageSize)
            .map((c) => (
            <div key={c.id} className="col-4">
              <Card>
                <CardHeader
                  title={<Link href={`/courses/${c.id}`}>{c.title}</Link>}
                  extra={<Badge>{c.difficulty_level}</Badge>}
                />
                <CardMeta>{c.category}</CardMeta>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button variant="ghost" onClick={() => openPreview(c.id)}>Preview</Button>
                  <Button onClick={() => { add({ id: c.id, title: c.title, price: c.price }); show({ title: 'Added to cart', description: c.title, variant: 'success' }); }}>Add to Cart</Button>
                </div>
              </Card>
            </div>
          ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="ghost" onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Modal open={!!previewId} onClose={closePreview} title={preview?.title || 'Course Preview'}>
        {!preview ? (
          <div>
            <Skeleton height={20} width={'50%'} />
            <div style={{ height: 10 }} />
            <Skeleton height={12} width={'90%'} />
            <div style={{ height: 10 }} />
            <Skeleton height={12} width={'80%'} />
          </div>
        ) : (
          <div>
            <p className="muted">{preview.description}</p>
            <h4>Sample</h4>
            <ul>
              {preview.sampleModules?.map((m: any) => (
                <li key={m.id}>{m.title}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </main>
  );
}
