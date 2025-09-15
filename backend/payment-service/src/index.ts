import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const port = Number(process.env.PORT) || 3006;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// In-memory payment data
type Currency = 'USD' | 'THB';
type Checkout = { id: string; amount: number; currency: Currency; status: 'open' | 'paid' | 'failed'; createdAt: string };
type Subscription = { id: string; userId: string; planId: string; status: 'active' | 'past_due' | 'canceled'; currentPeriodEnd: string };
type Coupon = { code: string; type: 'percent' | 'amount'; value: number; active: boolean };

const checkouts = new Map<string, Checkout>();
const subscriptions = new Map<string, Subscription>();
const coupons = new Map<string, Coupon>([
  ['WELCOME10', { code: 'WELCOME10', type: 'percent', value: 10, active: true }],
  ['SAVE50', { code: 'SAVE50', type: 'amount', value: 50, active: true }]
]);

function id() { return Math.random().toString(36).slice(2); }

// Checkout
app.post('/checkout', (req: Request, res: Response) => {
  const amount = Number(req.body?.amount || 0);
  const currency: Currency = (req.body?.currency || 'USD') as Currency;
  const couponCode: string | undefined = req.body?.coupon;
  if (couponCode) {
    const c = coupons.get(couponCode);
    if (!c || !c.active) return res.status(400).json({ error: 'invalid_coupon' });
  }
  const co: Checkout = { id: id(), amount, currency, status: 'open', createdAt: new Date().toISOString() };
  checkouts.set(co.id, co);
  res.status(201).json(co);
});

app.post('/checkout/:id/pay', (req: Request, res: Response) => {
  const idp = String(req.params.id);
  const co = checkouts.get(idp);
  if (!co) return res.status(404).json({ error: 'not_found' });
  // simulate payment success
  co.status = 'paid';
  res.json(co);
});

// Subscriptions
app.post('/subscriptions', (req: Request, res: Response) => {
  const s: Subscription = {
    id: id(), userId: String(req.body?.userId || 'u1'), planId: String(req.body?.planId || 'basic'), status: 'active', currentPeriodEnd: new Date(Date.now() + 30*24*3600*1000).toISOString()
  };
  subscriptions.set(s.id, s);
  res.status(201).json(s);
});

app.get('/subscriptions/:id', (req: Request, res: Response) => {
  const s = subscriptions.get(String(req.params.id));
  if (!s) return res.status(404).json({ error: 'not_found' });
  res.json(s);
});

// Coupons
app.get('/coupons/:code', (req: Request, res: Response) => {
  const c = coupons.get(String(req.params.code));
  if (!c) return res.status(404).json({ error: 'not_found' });
  res.json(c);
});

app.listen(port, () => {
  console.log('payment-service listening on port ' + port);
});
