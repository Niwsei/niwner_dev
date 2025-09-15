import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const port = Number(process.env.PORT) || 3005;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// In-memory stores
type ID = number;
type ISODate = string;

type Project = {
  id: ID;
  title: string;
  description?: string;
  creator_id?: string | number | null;
  status?: 'active' | 'archived' | 'completed' | 'planning';
  startDate?: ISODate | null;
  endDate?: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
};

type Column = { id: ID; project_id: ID; name: string; order: number };
type Task = {
  id: ID; project_id: ID; title: string; description?: string; assigned_to?: string | number | null;
  status?: string; priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: ISODate | null; estimated_hours?: number | null; startDate?: ISODate | null; endDate?: ISODate | null; progress?: number;
  dependencies?: ID[]; column_id?: ID | null; sprint_id?: ID | null;
};
type Sprint = { id: ID; project_id: ID; name: string; startDate?: ISODate | null; endDate?: ISODate | null; goal?: string };
type TimeLog = { id: ID; task_id: ID; user_id: string | number; hours: number; date: ISODate; notes?: string };

let nextProjectId = 1;
let nextColumnId = 1;
let nextTaskId = 1;
let nextSprintId = 1;
let nextTimeLogId = 1;

const projects: Project[] = [];
const columns: Column[] = [];
const tasks: Task[] = [];
const sprints: Sprint[] = [];
const timelogs: TimeLog[] = [];

function nowISO(): ISODate { return new Date().toISOString(); }

// Helpers
function requireFields<T extends object>(obj: any, fields: (keyof T)[], res: Response): boolean {
  for (const f of fields) if (obj[f as string] == null || obj[f as string] === '') { res.status(400).json({ error: `Missing field: ${String(f)}` }); return false; }
  return true;
}

// Projects CRUD
app.get('/projects', (_req: Request, res: Response) => {
  res.json(projects);
});

app.post('/projects', (req: Request, res: Response) => {
  if (!requireFields<Project>(req.body, ['title'], res)) return;
  const p: Project = {
    id: nextProjectId++,
    title: String(req.body.title),
    description: req.body.description || '',
    creator_id: req.body.creator_id ?? null,
    status: req.body.status || 'planning',
    startDate: req.body.startDate || null,
    endDate: req.body.endDate || null,
    createdAt: nowISO(),
    updatedAt: nowISO()
  };
  projects.push(p);
  // bootstrap default columns
  const base = ['Backlog', 'In Progress', 'Review', 'Done'];
  base.forEach((name, idx) => columns.push({ id: nextColumnId++, project_id: p.id, name, order: idx + 1 }));
  res.status(201).json(p);
});

app.get('/projects/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const p = projects.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  const cols = columns.filter(c => c.project_id === id).sort((a,b) => a.order - b.order);
  const tks = tasks.filter(t => t.project_id === id);
  const sprs = sprints.filter(s => s.project_id === id);
  res.json({ ...p, columns: cols, tasks: tks, sprints: sprs });
});

app.patch('/projects/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = projects.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  projects[idx] = { ...projects[idx], ...req.body, updatedAt: nowISO() };
  res.json(projects[idx]);
});

app.delete('/projects/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = projects.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  // cascade delete
  for (let i = columns.length - 1; i >= 0; i--) if (columns[i].project_id === id) columns.splice(i, 1);
  for (let i = tasks.length - 1; i >= 0; i--) if (tasks[i].project_id === id) tasks.splice(i, 1);
  for (let i = sprints.length - 1; i >= 0; i--) if (sprints[i].project_id === id) sprints.splice(i, 1);
  projects.splice(idx, 1);
  res.json({ ok: true });
});

// Columns
app.get('/projects/:id/columns', (req: Request, res: Response) => {
  const project_id = Number(req.params.id);
  res.json(columns.filter(c => c.project_id === project_id).sort((a,b) => a.order - b.order));
});

app.post('/projects/:id/columns', (req: Request, res: Response) => {
  const project_id = Number(req.params.id);
  const p = projects.find(x => x.id === project_id);
  if (!p) return res.status(404).json({ error: 'project_not_found' });
  const name: string = req.body?.name || '';
  if (!name) return res.status(400).json({ error: 'name is required' });
  const order = (columns.filter(c => c.project_id === project_id).length) + 1;
  const col: Column = { id: nextColumnId++, project_id, name, order };
  columns.push(col);
  res.status(201).json(col);
});

app.post('/projects/:id/columns/reorder', (req: Request, res: Response) => {
  const project_id = Number(req.params.id);
  const order: ID[] = req.body?.order || [];
  const cols = columns.filter(c => c.project_id === project_id);
  const set = new Set(cols.map(c => c.id));
  if (!order.every(id => set.has(id))) return res.status(400).json({ error: 'invalid_order' });
  order.forEach((id, idx) => {
    const col = columns.find(c => c.id === id);
    if (col) col.order = idx + 1;
  });
  res.json(columns.filter(c => c.project_id === project_id).sort((a,b) => a.order - b.order));
});

// Tasks
app.get('/projects/:id/tasks', (req: Request, res: Response) => {
  const project_id = Number(req.params.id);
  res.json(tasks.filter(t => t.project_id === project_id));
});

app.post('/projects/:id/tasks', (req: Request, res: Response) => {
  const project_id = Number(req.params.id);
  if (!projects.find(p => p.id === project_id)) return res.status(404).json({ error: 'project_not_found' });
  const title: string = req.body?.title || '';
  if (!title) return res.status(400).json({ error: 'title is required' });
  const column_id: ID | null = req.body?.column_id ?? (columns.find(c => c.project_id === project_id)?.id || null);
  const t: Task = {
    id: nextTaskId++, project_id, title,
    description: req.body?.description || '',
    assigned_to: req.body?.assigned_to ?? null,
    status: req.body?.status || 'todo',
    priority: req.body?.priority || 'medium',
    due_date: req.body?.due_date || null,
    estimated_hours: req.body?.estimated_hours ?? null,
    startDate: req.body?.startDate || null,
    endDate: req.body?.endDate || null,
    progress: req.body?.progress ?? 0,
    dependencies: req.body?.dependencies || [],
    column_id,
    sprint_id: req.body?.sprint_id ?? null
  };
  tasks.push(t);
  res.status(201).json(t);
});

app.get('/tasks/:taskId', (req: Request, res: Response) => {
  const id = Number(req.params.taskId);
  const t = tasks.find(x => x.id === id);
  if (!t) return res.status(404).json({ error: 'not_found' });
  res.json(t);
});

app.patch('/tasks/:taskId', (req: Request, res: Response) => {
  const id = Number(req.params.taskId);
  const idx = tasks.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  tasks[idx] = { ...tasks[idx], ...req.body };
  res.json(tasks[idx]);
});

app.delete('/tasks/:taskId', (req: Request, res: Response) => {
  const id = Number(req.params.taskId);
  const idx = tasks.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  // cascade timelogs
  for (let i = timelogs.length - 1; i >= 0; i--) if (timelogs[i].task_id === id) timelogs.splice(i, 1);
  const deleted = tasks.splice(idx, 1)[0];
  res.json(deleted);
});

app.post('/tasks/:taskId/move', (req: Request, res: Response) => {
  const id = Number(req.params.taskId);
  const t = tasks.find(x => x.id === id);
  if (!t) return res.status(404).json({ error: 'not_found' });
  const column_id: ID = Number(req.body?.column_id);
  if (!columns.find(c => c.id === column_id)) return res.status(400).json({ error: 'invalid_column' });
  t.column_id = column_id;
  res.json(t);
});

// Sprints
app.get('/projects/:id/sprints', (req: Request, res: Response) => {
  const project_id = Number(req.params.id);
  res.json(sprints.filter(s => s.project_id === project_id));
});

app.post('/projects/:id/sprints', (req: Request, res: Response) => {
  const project_id = Number(req.params.id);
  if (!projects.find(p => p.id === project_id)) return res.status(404).json({ error: 'project_not_found' });
  const name: string = req.body?.name || '';
  if (!name) return res.status(400).json({ error: 'name is required' });
  const s: Sprint = { id: nextSprintId++, project_id, name, startDate: req.body?.startDate || null, endDate: req.body?.endDate || null, goal: req.body?.goal || '' };
  sprints.push(s);
  res.status(201).json(s);
});

app.patch('/sprints/:sprintId', (req: Request, res: Response) => {
  const id = Number(req.params.sprintId);
  const idx = sprints.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  sprints[idx] = { ...sprints[idx], ...req.body };
  res.json(sprints[idx]);
});

app.delete('/sprints/:sprintId', (req: Request, res: Response) => {
  const id = Number(req.params.sprintId);
  const idx = sprints.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  // unset sprint on tasks
  for (const t of tasks) if (t.sprint_id === id) t.sprint_id = null;
  const removed = sprints.splice(idx, 1)[0];
  res.json(removed);
});

// Time logs
app.get('/tasks/:taskId/timelogs', (req: Request, res: Response) => {
  const task_id = Number(req.params.taskId);
  res.json(timelogs.filter(l => l.task_id === task_id));
});

app.post('/tasks/:taskId/timelogs', (req: Request, res: Response) => {
  const task_id = Number(req.params.taskId);
  if (!tasks.find(t => t.id === task_id)) return res.status(404).json({ error: 'task_not_found' });
  const user_id = req.body?.user_id;
  const hours = Number(req.body?.hours || 0);
  const date: ISODate = req.body?.date || nowISO();
  if (user_id == null) return res.status(400).json({ error: 'user_id is required' });
  if (!(hours > 0)) return res.status(400).json({ error: 'hours must be > 0' });
  const log: TimeLog = { id: nextTimeLogId++, task_id, user_id, hours, date, notes: req.body?.notes || '' };
  timelogs.push(log);
  res.status(201).json(log);
});

// Reports
app.get('/reports/:projectId/kanban', (req: Request, res: Response) => {
  const project_id = Number(req.params.projectId);
  const cols = columns.filter(c => c.project_id === project_id).sort((a,b) => a.order - b.order);
  const data = cols.map(c => ({ column: c, tasks: tasks.filter(t => t.project_id === project_id && t.column_id === c.id) }));
  res.json({ project_id, board: data });
});

app.get('/reports/:projectId/gantt', (req: Request, res: Response) => {
  const project_id = Number(req.params.projectId);
  const data = tasks.filter(t => t.project_id === project_id).map(t => ({
    id: t.id, title: t.title, start: t.startDate, end: t.endDate, progress: t.progress ?? 0, dependencies: t.dependencies || []
  }));
  res.json({ project_id, tasks: data });
});

// Utilities
app.post('/projects/:id/clone', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const p = projects.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  const clone: Project = { ...p, id: nextProjectId++, title: `${p.title} (Copy)`, createdAt: nowISO(), updatedAt: nowISO() };
  projects.push(clone);
  const colMap = new Map<ID, ID>();
  columns.filter(c => c.project_id === id).forEach(c => {
    const newId = nextColumnId++;
    colMap.set(c.id, newId);
    columns.push({ ...c, id: newId, project_id: clone.id });
  });
  tasks.filter(t => t.project_id === id).forEach(t => {
    const newId = nextTaskId++;
    const deps = (t.dependencies || []).map(d => (d === t.id ? newId : d));
    tasks.push({ ...t, id: newId, project_id: clone.id, column_id: t.column_id ? colMap.get(t.column_id) || null : null, dependencies: deps });
  });
  sprints.filter(s => s.project_id === id).forEach(s => {
    sprints.push({ ...s, id: nextSprintId++, project_id: clone.id });
  });
  res.status(201).json(clone);
});

app.listen(port, () => {
  console.log('project-service listening on port ' + port);
});
