import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const port = Number(process.env.PORT) || 3009;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

type Forum = { id: string; title: string };
type Thread = { id: string; forumId: string; title: string; author: string; createdAt: string };
type Post = { id: string; threadId: string; author: string; content: string; createdAt: string };
const forums: Forum[] = [ { id: 'general', title: 'General Discussion' }, { id: 'logic', title: 'Logic Q&A' } ];
const threads: Thread[] = [];
const posts: Post[] = [];
function nid() { return Math.random().toString(36).slice(2); }

app.get('/forums', (_req: Request, res: Response) => res.json(forums));
app.get('/forums/:id/threads', (req: Request, res: Response) => res.json(threads.filter(t => t.forumId === String(req.params.id))));
app.post('/forums/:id/threads', (req: Request, res: Response) => {
  const t: Thread = { id: nid(), forumId: String(req.params.id), title: String(req.body?.title || 'Untitled'), author: String(req.body?.author || 'anon'), createdAt: new Date().toISOString() };
  threads.push(t);
  res.status(201).json(t);
});
app.get('/threads/:threadId/posts', (req: Request, res: Response) => res.json(posts.filter(p => p.threadId === String(req.params.threadId))));
app.post('/threads/:threadId/posts', (req: Request, res: Response) => {
  const p: Post = { id: nid(), threadId: String(req.params.threadId), author: String(req.body?.author || 'anon'), content: String(req.body?.content || ''), createdAt: new Date().toISOString() };
  posts.push(p);
  res.status(201).json(p);
});

app.listen(port, () => {
  console.log('community-service listening on port ' + port);
});
