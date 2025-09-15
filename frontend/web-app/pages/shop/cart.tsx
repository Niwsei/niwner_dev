import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import { useCart } from '../../store/cart';
import PageHeader from '../../components/ui/PageHeader';

export default function Cart() {
  const { items, remove, clear } = useCart();
  const total = items.reduce((s, i) => s + (i.price || 0), 0);
  return (
    <main>
      <PageHeader title="Shopping Cart" actions={items.length > 0 ? <Button variant="ghost" onClick={clear}>Clear</Button> : null} />
      {items.length === 0 ? (
        <Card>
          <CardHeader title="Your cart is empty" />
          <p className="muted">Browse courses and add to cart.</p>
        </Card>
      ) : (
        <div className="grid">
          <div className="col-8">
            {items.map((i) => (
              <div key={i.id} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <strong>{i.title}</strong>
                  <div className="muted">${i.price || 0}</div>
                </div>
                <Button variant="ghost" onClick={() => remove(i.id)}>Remove</Button>
              </div>
            ))}
          </div>
          <div className="col-4">
            <div className="card" style={{ padding: 16 }}>
              <CardHeader title="Summary" />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <div style={{ height: 8 }} />
              <Button>Checkout</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
