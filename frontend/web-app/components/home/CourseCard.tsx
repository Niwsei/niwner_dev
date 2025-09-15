import Link from 'next/link';
import Card, { CardHeader, CardMeta } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useCart } from '../../store/cart';
import { useToast } from '../../components/ui/Toast';
import type { Course } from '../../types';
import Stars from '../../components/ui/Stars';

export default function CourseCard({ c }: { c: Course }) {
  const { add } = useCart();
  const { show } = useToast();
  return (
    <Card>
      <CardHeader title={<Link href={`/courses/${c.id}`}>{c.title}</Link>} extra={<Badge>{c.difficulty_level}</Badge>} />
      <CardMeta>{c.category}</CardMeta>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <Stars value={c.rating || 0} />
        <span className="muted" style={{ fontSize: 12 }}>({c.enrollment_count || 0} learners)</span>
      </div>
      <div className="muted" style={{ marginTop: 6, minHeight: 36 }}>{c.description?.slice(0, 90)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
        <strong>${c.price}</strong>
        <Button onClick={() => { add({ id: c.id, title: c.title, price: c.price }); show({ title: 'Added to cart', description: c.title, variant: 'success' }); }}>Add to Cart</Button>
      </div>
    </Card>
  );
}
