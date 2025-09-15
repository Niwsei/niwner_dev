import express, { Request, Response } from 'express';
import cors from 'cors';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
app.use(cors());

const port = Number(process.env.PORT) || 3003;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/puzzles/random', (_req: Request, res: Response) => {
  const types = ['boolean-eval', 'truth-table', 'sequence'] as const;
  const type = types[Math.floor(Math.random() * types.length)];
  let puzzle: any;
  if (type === 'boolean-eval') {
    const variables = ['A', 'B', 'C'];
    const exprs = ['(A && B) || !C', 'A ^ B', '(!A && B) || (A && !B)', 'A && (B || C)'];
    puzzle = { type, expression: exprs[Math.floor(Math.random() * exprs.length)], variables };
  } else if (type === 'truth-table') {
    puzzle = { type, expression: 'P -> Q', variables: ['P', 'Q'] };
  } else {
    puzzle = { type, sequence: [1, 2, 4, 7, 11], task: 'Find the next number' };
  }
  res.json({ id: Date.now(), difficulty_level: 'beginner', puzzle });
});

app.post('/analyze', (req: Request, res: Response) => {
  const code: string = (req.body?.code ?? '') as string;
  const metrics = {
    length: code.length,
    lines: code.split(/\n/).length,
    branches: (code.match(/if\s*\(|else if\s*\(|switch\s*\(/g) || []).length,
    loops: (code.match(/for\s*\(|while\s*\(/g) || []).length,
    tryCatch: (code.match(/try\s*\{|catch\s*\(/g) || []).length
  } as any;
  metrics.cyclomatic = metrics.branches + metrics.loops + 1;
  const feedback: string[] = [];
  if (metrics.cyclomatic > 10) feedback.push('High complexity, consider refactoring.');
  if (metrics.lines > 200) feedback.push('Long function/module, consider splitting.');
  res.json({ metrics, feedback });
});

// Assessments (mock)
type Assessment = { id: string; title: string; questions: Array<{ id: string; prompt: string; choices: string[]; answer: number }> };
const assessments: Assessment[] = [
  { id: 'logic-basics', title: 'Logic Basics', questions: [ { id: 'q1', prompt: '(A && B) is true when...?', choices: ['A true, B false', 'Both true', 'Both false', 'A false'], answer: 1 } ] }
];

app.get('/assessments', (_req: Request, res: Response) => res.json(assessments));
app.get('/assessments/:id', (req: Request, res: Response) => {
  const a = assessments.find(x => x.id === String(req.params.id));
  if (!a) return res.status(404).json({ error: 'not_found' });
  res.json(a);
});
app.post('/assessments/:id/score', (req: Request, res: Response) => {
  const a = assessments.find(x => x.id === String(req.params.id));
  if (!a) return res.status(404).json({ error: 'not_found' });
  const answers: Record<string, number> = req.body?.answers || {};
  let score = 0; a.questions.forEach(q => { if (answers[q.id] === q.answer) score++; });
  res.json({ total: a.questions.length, correct: score, percentage: (score / a.questions.length) * 100 });
});

app.listen(port, () => {
  console.log('logic-service listening on port ' + port);
});
