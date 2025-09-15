import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const port = Number(process.env.PORT) || 3008;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Recommendations (mock)
app.get('/recommendations/:userId', (req: Request, res: Response) => {
  const uid = String(req.params.userId);
  res.json({ userId: uid, courses: [1,2,4,3] });
});

app.listen(port, () => {
  console.log('ai-service listening on port ' + port);
});
