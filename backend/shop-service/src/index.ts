import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const port = Number(process.env.PORT) || 3010;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

type Product = { id: number; type: 'course' | 'bundle' | 'subscription'; title: string; price: number };
type Order = { id: string; userId: string; items: Array<{ productId: number; qty: number }>; total: number; status: 'pending' | 'paid' | 'canceled'; createdAt: string };
const products: Product[] = [ { id: 1, type: 'course', title: 'Intro to Logic', price: 29 }, { id: 2, type: 'course', title: 'Workflow Basics', price: 39 } ];
const orders = new Map<string, Order>();

function oid() { return Math.random().toString(36).slice(2); }

app.get('/products', (_req: Request, res: Response) => res.json(products));
app.get('/orders/:id', (req: Request, res: Response) => {
  const o = orders.get(String(req.params.id));
  if (!o) return res.status(404).json({ error: 'not_found' });
  res.json(o);
});
app.post('/orders', (req: Request, res: Response) => {
  const userId = String(req.body?.userId || 'u1');
  const items: Array<{ productId: number; qty: number }> = req.body?.items || [];
  const total = items.reduce((s, it) => {
    const p = products.find(x => x.id === it.productId); return s + (p ? p.price * (it.qty || 1) : 0);
  }, 0);
  const id = oid();
  const order: Order = { id, userId, items, total, status: 'pending', createdAt: new Date().toISOString() };
  orders.set(id, order);
  res.status(201).json(order);
});

app.listen(port, () => {
  console.log('shop-service listening on port ' + port);
});
