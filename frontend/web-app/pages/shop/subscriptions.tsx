import { useEffect, useState } from 'react';
import { listSubscriptions } from '../../lib/api';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useCart } from '../../store/cart';
import PageHeader from '../../components/ui/PageHeader';

export default function Subscriptions() {
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { add } = useCart();
  useEffect(() => { listSubscriptions().then(setPlans).catch((e) => setError(String(e))); }, []);
  return (
    <main>
      <PageHeader title="Subscriptions" subtitle="Choose a plan that fits you" />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="grid">
        {plans.map((p) => (
          <div key={p.id} className="col-4">
            <Card>
              <CardHeader title={p.name} />
              <h2 style={{ marginTop: 0 }}>${p.price}/mo</h2>
              <ul>
                {p.features.map((f: string) => (<li key={f} className="muted">{f}</li>))}
              </ul>
              <Button onClick={() => add({ id: Number(`1000${p.price}`), title: `${p.name} Plan`, price: p.price })}>Select</Button>
            </Card>
          </div>
        ))}
      </div>
    </main>
  );
}
