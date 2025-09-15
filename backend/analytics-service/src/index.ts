import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const port = Number(process.env.PORT) || 3007;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Learning analytics (mock)
app.get('/analytics/learning/:userId', (req: Request, res: Response) => {
  const uid = String(req.params.userId);
  res.json({ userId: uid, minutes: [30,42,28,60,90,120,75], labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] });
});

// Business analytics (mock)
app.get('/analytics/business', (_req: Request, res: Response) => {
  res.json({ revenue: { monthly: [1200, 1800, 2400, 3100, 4200, 5800] }, users: { active: 1520, new: 210 }, courses: { top: ['Intro to Logic','Workflow Basics'] } });
});

app.listen(port, () => {
  console.log('analytics-service listening on port ' + port);
});
