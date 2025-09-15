import express, { Request, Response } from 'express';
import cors from 'cors';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
app.use(cors());

const port = Number(process.env.PORT) || 3002;

type PointsState = { xp: number; level: number };
type Achievement = { badge_type: string; description: string; skill_category: string; earned_date: string };

const userPoints = new Map<string, PointsState>();
const userAchievements = new Map<string, Achievement[]>();
type Challenge = { id: string; title: string; description?: string; start: string; end: string; rewardXP: number };
const challenges: Challenge[] = [
  { id: 'weekly-logic', title: 'Weekly Logic Challenge', description: 'Solve 5 puzzles this week', start: new Date().toISOString(), end: new Date(Date.now()+7*86400000).toISOString(), rewardXP: 500 }
];

function recalcLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/users/:id/points', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const state = userPoints.get(id) || { xp: 0, level: 1 };
  res.json(state);
});

app.post('/users/:id/points', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const delta = Number((req.body?.delta ?? 0) as number);
  const prev = userPoints.get(id) || { xp: 0, level: 1 };
  const xp = Math.max(0, prev.xp + (Number.isFinite(delta) ? delta : 0));
  const level = recalcLevel(xp);
  const updated: PointsState = { xp, level };
  userPoints.set(id, updated);
  res.json(updated);
});

app.get('/users/:id/achievements', (req: Request, res: Response) => {
  const id = String(req.params.id);
  res.json(userAchievements.get(id) || []);
});

app.post('/users/:id/achievements', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { badge_type, description = '', skill_category = 'general' } = req.body || {};
  if (!badge_type) return res.status(400).json({ error: 'badge_type is required' });
  const entry: Achievement = { badge_type, description, skill_category, earned_date: new Date().toISOString() };
  const list = userAchievements.get(id) || [];
  list.push(entry);
  userAchievements.set(id, list);
  res.status(201).json(entry);
});

app.get('/leaderboard', (_req: Request, res: Response) => {
  const top = Array.from(userPoints.entries())
    .map(([userId, v]) => ({ userId, ...v }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 50);
  res.json(top);
});

// Challenges
app.get('/challenges', (_req: Request, res: Response) => {
  res.json(challenges);
});

app.post('/users/:id/challenges/:challengeId/complete', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const ch = challenges.find(c => c.id === String(req.params.challengeId));
  if (!ch) return res.status(404).json({ error: 'not_found' });
  const prev = userPoints.get(id) || { xp: 0, level: 1 };
  const xp = prev.xp + ch.rewardXP;
  const level = recalcLevel(xp);
  const updated: PointsState = { xp, level };
  userPoints.set(id, updated);
  res.json({ ok: true, reward: ch.rewardXP, state: updated });
});

app.listen(port, () => {
  console.log('gamification-service listening on port ' + port);
});
