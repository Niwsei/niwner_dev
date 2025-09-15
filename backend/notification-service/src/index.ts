import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const port = Number(process.env.PORT) || 3012;

type Pref = { userId: string; channels: { email: boolean; sms: boolean; push: boolean } };
const prefs = new Map<string, Pref>();

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/preferences/:userId', (req: Request, res: Response) => {
  const uid = String(req.params.userId);
  res.json(prefs.get(uid) || { userId: uid, channels: { email: true, sms: false, push: true } });
});
app.patch('/preferences/:userId', (req: Request, res: Response) => {
  const uid = String(req.params.userId);
  const current = prefs.get(uid) || { userId: uid, channels: { email: true, sms: false, push: true } };
  const next = { ...current, channels: { ...current.channels, ...(req.body?.channels || {}) } };
  prefs.set(uid, next);
  res.json(next);
});

// Mock senders
app.post('/notify/email', (req: Request, res: Response) => {
  const { to, subject } = req.body || {};
  if (!to || !subject) return res.status(400).json({ error: 'to and subject required' });
  res.json({ queued: true, id: Math.random().toString(36).slice(2) });
});
app.post('/notify/sms', (req: Request, res: Response) => {
  const { to, message } = req.body || {};
  if (!to || !message) return res.status(400).json({ error: 'to and message required' });
  res.json({ queued: true, id: Math.random().toString(36).slice(2) });
});
app.post('/notify/push', (req: Request, res: Response) => {
  const { to, title } = req.body || {};
  if (!to || !title) return res.status(400).json({ error: 'to and title required' });
  res.json({ queued: true, id: Math.random().toString(36).slice(2) });
});

app.listen(port, () => {
  console.log('notification-service listening on port ' + port);
});

