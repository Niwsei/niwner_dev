import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
app.use(cors());

const port = Number(process.env.PORT) || 3004;

type Node = { id: string; type?: string; [key: string]: any };
type Connection = { from: string; to: string; [key: string]: any };
type Workflow = { id: number; title: string; description?: string; creator_id?: string | number | null; nodes: Node[]; connections: Connection[]; is_public: boolean; template_category: string; usage_count: number };

let nextWorkflowId = 1;
const workflows: Workflow[] = [];
type Template = { id: number; name: string; category: string; data: { nodes: Node[]; connections: Connection[] } };
let nextTemplateId = 1;
const templates: Template[] = [
  { id: nextTemplateId++, name: 'Onboarding', category: 'HR', data: { nodes: [{ id: 'start' }, { id: 'end' }], connections: [{ from: 'start', to: 'end' }] } }
];

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/workflows', (_req: Request, res: Response) => {
  res.json(workflows);
});

app.post('/workflows', (req: Request, res: Response) => {
  const { title, description = '', creator_id = null, nodes = [], connections = [], is_public = false, template_category = 'general' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const wf: Workflow = { id: nextWorkflowId++, title, description, creator_id, nodes, connections, is_public, template_category, usage_count: 0 };
  workflows.push(wf);
  res.status(201).json(wf);
});

app.get('/workflows/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const wf = workflows.find(w => w.id === id);
  if (!wf) return res.status(404).json({ error: 'not_found' });
  const validation = validateFlow(wf.nodes, wf.connections);
  res.json({ ...wf, validation });
});

app.patch('/workflows/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = workflows.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  workflows[idx] = { ...workflows[idx], ...req.body };
  const validation = validateFlow(workflows[idx].nodes, workflows[idx].connections);
  res.json({ ...workflows[idx], validation });
});

function validateFlow(nodes: Node[] = [], connections: Connection[] = []) {
  const nodeIds = new Set(nodes.map(n => n.id));
  const invalidConnections = connections.filter(c => !nodeIds.has(c.from) || !nodeIds.has(c.to));
  const adj = new Map<string, string[]>();
  for (const id of nodeIds) adj.set(id as string, []);
  for (const c of connections) if (adj.has(c.from)) adj.get(c.from)!.push(c.to);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  let hasCycle = false;
  function dfs(u: string) {
    if (visiting.has(u)) { hasCycle = true; return; }
    if (visited.has(u)) return;
    visiting.add(u);
    for (const v of adj.get(u) || []) dfs(v);
    visiting.delete(u);
    visited.add(u);
  }
  for (const id of nodeIds) {
    if (!visited.has(id as string)) dfs(id as string);
    if (hasCycle) break;
  }
  return { invalidConnections, hasCycle, nodeCount: nodes.length, connectionCount: connections.length };
}

// Templates
app.get('/templates', (_req: Request, res: Response) => res.json(templates));
app.post('/templates', (req: Request, res: Response) => {
  const { name, category = 'general', data = { nodes: [], connections: [] } } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const t: Template = { id: nextTemplateId++, name, category, data };
  templates.push(t);
  res.status(201).json(t);
});

// Simulation (mock)
app.post('/workflows/:id/simulate', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const wf = workflows.find(w => w.id === id);
  if (!wf) return res.status(404).json({ error: 'not_found' });
  const duration = (wf.nodes.length * 2) + (wf.connections.length);
  const cost = duration * 10;
  const bottlenecks = wf.connections.length > wf.nodes.length ? ['connection_overhead'] : [];
  res.json({ duration, cost, bottlenecks, steps: wf.nodes.length });
});

app.listen(port, () => {
  console.log('flow-service listening on port ' + port);
});
