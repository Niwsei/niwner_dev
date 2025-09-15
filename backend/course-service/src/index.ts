import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const app = express();
app.use(express.json());
app.use(cors());

const port = Number(process.env.PORT) || 3001;

let nextCourseId = 1;
let nextModuleId = 1;
let nextLessonId = 1;

type Course = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  difficulty_level?: string;
  duration?: number;
  price?: number; // base price
  discount_percent?: number; // optional percent discount (0-100)
  earlybird_price?: number; // special price during early bird window
  earlybird_end_at?: string | null; // ISO timestamp
  preorder_start_at?: string | null; // ISO timestamp
  preorder_end_at?: string | null; // ISO timestamp
  status?: 'draft' | 'published' | 'archived' | 'preorder';
  instructor_id?: number | null;
  rating: number;
  enrollment_count: number;
  course_type?: string;
};

type Module = {
  id: number;
  course_id: number;
  title: string;
  order: number;
  content_type?: string;
  content_url?: string;
  estimated_time?: number;
};

type Lesson = {
  id: number;
  module_id: number;
  title: string;
  content?: string;
  lesson_type?: string;
  duration?: number;
  resources?: any[];
  order: number;
};

const courses: Course[] = [];
const modules: Module[] = [];
const lessons: Lesson[] = [];

// Bundles
type Bundle = { id: number; title: string; description?: string; course_ids: number[]; price: number };
let nextBundleId = 1;
const bundles: Bundle[] = [];

// Extensions: versions, assessments, progress, uploads (mock)
type CourseVersion = { id: number; course_id: number; version: number; notes?: string; createdAt: string };
type Assessment = { id: number; course_id: number; title: string; questions: Array<{ id: string; prompt: string; choices: string[]; answer: number }>; passing_score?: number; time_limit?: number };
type Progress = { id: number; user_id: string; course_id: number; completion_percentage: number; current_lesson?: number | null; time_spent: number; last_accessed: string };

let nextVersionId = 1;
let nextAssessmentId = 1;
let nextProgressId = 1;
const versions: CourseVersion[] = [];
const assessments: Assessment[] = [];
const progresses: Progress[] = [];

// -----------------------------
// Video assets, transcode (mock), analytics
// -----------------------------
type Rendition = { resolution: string; format: 'hls' | 'dash' | 'mp4'; url: string };
type SubtitleTrack = { lang: string; label: string; url: string; default?: boolean };
type VideoAsset = {
  id: string;
  sourcePath: string;
  filename: string;
  size?: number;
  sha256?: string;
  mime?: string;
  renditions: Rendition[];
  thumbnails: string[];
  subtitles: SubtitleTrack[];
  watermark?: {
    type: 'burnin' | 'overlay';
    text?: string;
    imageUrl?: string;
    opacity?: number; // 0..1
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'random';
    moving?: boolean;
  };
  createdAt: string;
};
const videos = new Map<string, VideoAsset>();

type VideoEvent = { userId?: string; event: 'play' | 'pause' | 'timeupdate' | 'complete'; time?: number; duration?: number; ts: number };
const videoAnalytics = new Map<string, VideoEvent[]>();

app.post('/videos/import', (req: Request, res: Response) => {
  const { path: filePath, filename, size, sha256, mime } = req.body || {};
  if (!filePath || !fs.existsSync(filePath)) return res.status(400).json({ error: 'file_not_found' });
  const id = crypto.randomBytes(6).toString('hex');
  const asset: VideoAsset = { id, sourcePath: filePath, filename: filename || path.basename(filePath), size, sha256, mime, renditions: [], thumbnails: [], subtitles: [], createdAt: new Date().toISOString() };
  videos.set(id, asset);
  res.json(asset);
});

app.get('/videos', (_req: Request, res: Response) => {
  res.json(Array.from(videos.values()));
});
app.get('/videos/:id', (req: Request, res: Response) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  res.json(v);
});

// Start transcode (mock): immediately registers renditions and HLS/DASH manifests
app.post('/videos/:id/transcode', (req: Request, res: Response) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  const { preset = 'auto', resolutions = ['480p', '720p', '1080p', '2160p'], formats = ['hls'] } = req.body || {};
  const out: Rendition[] = [];
  for (const r of resolutions as string[]) {
    for (const f of formats as string[]) {
      if (f === 'hls') out.push({ resolution: r, format: 'hls', url: `/hls/${v.id}_${r}.m3u8` });
      else if (f === 'dash') out.push({ resolution: r, format: 'dash', url: `/dash/${v.id}_${r}.mpd` });
      else if (f === 'mp4') out.push({ resolution: r, format: 'mp4', url: `/files/${v.id}_${r}.mp4` });
    }
  }
  v.renditions = out;
  res.json({ id: v.id, renditions: v.renditions, preset });
});

// Generate thumbnails (mock)
app.post('/videos/:id/thumbnails', (req: Request, res: Response) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  const count = Number(req.body?.count ?? 4);
  v.thumbnails = Array.from({ length: Math.max(1, count) }).map((_, i) => `/thumbs/${v.id}_${i + 1}.jpg`);
  res.json({ id: v.id, thumbnails: v.thumbnails });
});

// Subtitles (multi-language)
app.get('/videos/:id/subtitles', (req: Request, res: Response) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  res.json(v.subtitles);
});
app.post('/videos/:id/subtitles', (req: Request, res: Response) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  const { lang, label, url, default: dflt } = req.body || {};
  if (!lang || !label || !url) return res.status(400).json({ error: 'lang_label_url_required' });
  if (dflt) v.subtitles.forEach(t => (t.default = false));
  v.subtitles.push({ lang, label, url, default: !!dflt });
  res.status(201).json(v.subtitles);
});
app.delete('/videos/:id/subtitles/:lang', (req: Request, res: Response) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  const lang = String(req.params.lang);
  const before = v.subtitles.length;
  v.subtitles = v.subtitles.filter(s => s.lang !== lang);
  res.json({ removed: before - v.subtitles.length, subtitles: v.subtitles });
});

// Watermark configuration (mock)
app.get('/videos/:id/watermark', (req: Request, res: Response) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  res.json(v.watermark || null);
});
app.post('/videos/:id/watermark', (req: Request, res: Response) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  const { type = 'overlay', text, imageUrl, opacity = 0.2, position = 'random', moving = true } = req.body || {};
  v.watermark = { type, text, imageUrl, opacity: Math.max(0, Math.min(1, Number(opacity))), position, moving: !!moving } as any;
  // In production, trigger transcode job for burn-in; overlay type used by player UI.
  res.json(v.watermark);
});

// Analytics ingestion
app.post('/videos/:id/analytics/events', (req: Request, res: Response) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  const events: VideoEvent[] = Array.isArray(req.body) ? req.body : [req.body];
  const list = videoAnalytics.get(v.id) || [];
  for (const e of events) list.push({ ...e, ts: e.ts || Date.now() });
  videoAnalytics.set(v.id, list);
  res.json({ ok: true, count: events.length });
});

// Analytics summary: watch time and drop-off histogram (percent buckets)
app.get('/videos/:id/analytics', (req: Request, res: Response) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  const list = videoAnalytics.get(v.id) || [];
  let watchTime = 0;
  const buckets = new Array(10).fill(0); // 0-10%, 10-20%, ..., 90-100%
  for (const e of list) {
    if (e.event === 'timeupdate' && typeof e.time === 'number' && typeof e.duration === 'number' && e.duration > 0) {
      watchTime += 1; // simplistic: 1 unit per timeupdate; in prod use delta time
      const ratio = Math.min(0.999, Math.max(0, e.time / e.duration));
      const b = Math.floor(ratio * 10);
      buckets[b] += 1;
    }
  }
  res.json({ videoId: v.id, events: list.length, watchTimeUnits: watchTime, dropoffHistogram: buckets });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/courses', (_req: Request, res: Response) => {
  res.json(courses);
});

app.post('/courses', (req: Request, res: Response) => {
  const {
    title,
    description = '',
    category = 'general',
    difficulty_level = 'beginner',
    duration = 0,
    price = 0,
    discount_percent = 0,
    earlybird_price = 0,
    earlybird_end_at = null,
    preorder_start_at = null,
    preorder_end_at = null,
    instructor_id = null,
    course_type = 'logic'
  } = (req.body || {}) as Partial<Course> & { title?: string };
  if (!title) return res.status(400).json({ error: 'title is required' });
  const course: Course = {
    id: nextCourseId++,
    title,
    description,
    category,
    difficulty_level,
    duration,
    price,
    discount_percent,
    earlybird_price,
    earlybird_end_at,
    preorder_start_at,
    preorder_end_at,
    instructor_id,
    rating: 0,
    enrollment_count: 0,
    course_type,
    status: 'draft'
  };
  courses.push(course);
  res.status(201).json(course);
});

app.get('/courses/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const course = courses.find(c => c.id === id);
  if (!course) return res.status(404).json({ error: 'not_found' });
  const courseModules = modules.filter(m => m.course_id === id).sort((a,b) => a.order - b.order);
  const courseLessons = lessons.filter(l => courseModules.some(m => m.id === l.module_id));
  res.json({ ...course, modules: courseModules, lessons: courseLessons });
});

app.patch('/courses/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = courses.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  courses[idx] = { ...courses[idx], ...(req.body as Partial<Course>) };
  res.json(courses[idx]);
});

app.delete('/courses/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = courses.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  const removedModuleIds = modules.filter(m => m.course_id === id).map(m => m.id);
  for (let i = modules.length - 1; i >= 0; i--) if (modules[i].course_id === id) modules.splice(i, 1);
  for (let i = lessons.length - 1; i >= 0; i--) if (removedModuleIds.includes(lessons[i].module_id)) lessons.splice(i, 1);
  const deleted = courses.splice(idx, 1)[0];
  res.json(deleted);
});

app.post('/courses/:id/modules', (req: Request, res: Response) => {
  const course_id = Number(req.params.id);
  const course = courses.find(c => c.id === course_id);
  if (!course) return res.status(404).json({ error: 'course_not_found' });
  const {
    title,
    order = modules.filter(m => m.course_id === course_id).length + 1,
    content_type = 'video',
    content_url = '',
    estimated_time = 0
  } = (req.body || {}) as Partial<Module> & { title?: string };
  if (!title) return res.status(400).json({ error: 'title is required' });
  const mod: Module = { id: nextModuleId++, course_id, title, order, content_type, content_url, estimated_time };
  modules.push(mod);
  res.status(201).json(mod);
});

app.get('/courses/:id/modules', (req: Request, res: Response) => {
  const course_id = Number(req.params.id);
  const list = modules.filter(m => m.course_id === course_id).sort((a,b) => a.order - b.order);
  res.json(list);
});

// Update module
app.patch('/modules/:moduleId', (req: Request, res: Response) => {
  const module_id = Number(req.params.moduleId);
  const idx = modules.findIndex(m => m.id === module_id);
  if (idx === -1) return res.status(404).json({ error: 'module_not_found' });
  modules[idx] = { ...modules[idx], ...(req.body as Partial<Module>) };
  res.json(modules[idx]);
});

// Reorder modules
app.post('/courses/:id/modules/reorder', (req: Request, res: Response) => {
  const course_id = Number(req.params.id);
  const order: number[] = (req.body?.order || []) as number[];
  const list = modules.filter(m => m.course_id === course_id);
  if (order.length !== list.length) return res.status(400).json({ error: 'bad_order_length' });
  const indexById = new Map(list.map(m => [m.id, m] as const));
  let pos = 1;
  for (const id of order) {
    const m = indexById.get(id);
    if (!m) return res.status(400).json({ error: 'invalid_id_in_order', id });
    m.order = pos++;
  }
  res.json(modules.filter(m => m.course_id === course_id).sort((a,b) => a.order - b.order));
});

app.post('/modules/:moduleId/lessons', (req: Request, res: Response) => {
  const module_id = Number(req.params.moduleId);
  const mod = modules.find(m => m.id === module_id);
  if (!mod) return res.status(404).json({ error: 'module_not_found' });
  const list = lessons.filter(l => l.module_id === module_id);
  const { title, content = '', lesson_type = 'video', duration = 0, resources = [], order = list.length + 1 } = (req.body || {}) as Partial<Lesson> & { title?: string };
  if (!title) return res.status(400).json({ error: 'title is required' });
  const lesson: Lesson = { id: nextLessonId++, module_id, title, content, lesson_type, duration, resources, order };
  lessons.push(lesson);
  res.status(201).json(lesson);
});

app.get('/modules/:moduleId/lessons', (req: Request, res: Response) => {
  const module_id = Number(req.params.moduleId);
  const list = lessons.filter(l => l.module_id === module_id).sort((a,b) => a.order - b.order);
  res.json(list);
});

// Update lesson
app.patch('/lessons/:lessonId', (req: Request, res: Response) => {
  const lesson_id = Number(req.params.lessonId);
  const idx = lessons.findIndex(l => l.id === lesson_id);
  if (idx === -1) return res.status(404).json({ error: 'lesson_not_found' });
  lessons[idx] = { ...lessons[idx], ...(req.body as Partial<Lesson>) };
  res.json(lessons[idx]);
});

// Reorder lessons
app.post('/modules/:moduleId/lessons/reorder', (req: Request, res: Response) => {
  const module_id = Number(req.params.moduleId);
  const order: number[] = (req.body?.order || []) as number[];
  const list = lessons.filter(l => l.module_id === module_id);
  if (order.length !== list.length) return res.status(400).json({ error: 'bad_order_length' });
  const indexById = new Map(list.map(l => [l.id, l] as const));
  let pos = 1;
  for (const id of order) {
    const l = indexById.get(id);
    if (!l) return res.status(400).json({ error: 'invalid_id_in_order', id });
    l.order = pos++;
  }
  res.json(lessons.filter(l => l.module_id === module_id).sort((a,b) => a.order - b.order));
});

app.get('/courses/:id/preview', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const course = courses.find(c => c.id === id);
  if (!course) return res.status(404).json({ error: 'not_found' });
  const sampleModules = modules.filter(m => m.course_id === id).sort((a,b) => a.order - b.order).slice(0, 1);
  const sampleLessons = lessons.filter(l => sampleModules.some(m => m.id === l.module_id)).slice(0, 1);
  res.json({
    id: course.id,
    title: course.title,
    description: (course.description || '').slice(0, 200),
    sampleModules,
    sampleLessons
  });
});

// Course versions
app.get('/courses/:id/versions', (req: Request, res: Response) => {
  const course_id = Number(req.params.id);
  res.json(versions.filter(v => v.course_id === course_id).sort((a,b) => b.version - a.version));
});
app.post('/courses/:id/versions', (req: Request, res: Response) => {
  const course_id = Number(req.params.id);
  const course = courses.find(c => c.id === course_id);
  if (!course) return res.status(404).json({ error: 'course_not_found' });
  const current = versions.filter(v => v.course_id === course_id).reduce((m,v) => Math.max(m, v.version), 0);
  const v: CourseVersion = { id: nextVersionId++, course_id, version: current + 1, notes: req.body?.notes || '', createdAt: new Date().toISOString() };
  versions.push(v);
  res.status(201).json(v);
});

// Bulk operations
app.post('/courses/bulk-update', (req: Request, res: Response) => {
  const items: Array<{ id: number; data: Partial<Course> }> = req.body?.items || [];
  const updated: Course[] = [];
  for (const it of items) {
    const idx = courses.findIndex(c => c.id === it.id);
    if (idx !== -1) {
      courses[idx] = { ...courses[idx], ...it.data };
      updated.push(courses[idx]);
    }
  }
  res.json({ count: updated.length, items: updated });
});

// Publish / Status
app.post('/courses/:id/publish', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const c = courses.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: 'not_found' });
  c.status = 'published';
  res.json({ id: c.id, status: c.status });
});
app.post('/courses/:id/unpublish', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const c = courses.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: 'not_found' });
  c.status = 'draft';
  res.json({ id: c.id, status: c.status });
});

// Upload placeholders (mock signed URLs)
app.post('/uploads/sign', (req: Request, res: Response) => {
  const { filename = 'file.bin', contentType = 'application/octet-stream' } = req.body || {};
  res.json({ uploadUrl: `https://upload.mock.local/${Date.now()}/${encodeURIComponent(filename)}`, contentType, expiresIn: 900 });
});

// -----------------------------
// Chunked Upload (resumable) + basic metadata
// -----------------------------
type UploadSession = {
  id: string;
  filename: string;
  mimeType?: string;
  size?: number;
  chunkSize?: number;
  totalChunks?: number;
  received: Set<number>;
};
const uploadSessions = new Map<string, UploadSession>();
const DATA_ROOT = path.resolve(__dirname, '../../data');
const TMP_ROOT = path.join(DATA_ROOT, 'tmp');
const FILES_ROOT = path.join(DATA_ROOT, 'files');
for (const p of [DATA_ROOT, TMP_ROOT, FILES_ROOT]) { try { fs.mkdirSync(p, { recursive: true }); } catch {} }

app.post('/uploads/session', (req: Request, res: Response) => {
  const { filename, mimeType, size, chunkSize, totalChunks } = req.body || {};
  if (!filename) return res.status(400).json({ error: 'filename_required' });
  const id = crypto.randomBytes(8).toString('hex');
  uploadSessions.set(id, { id, filename, mimeType, size: Number(size) || undefined, chunkSize: Number(chunkSize) || undefined, totalChunks: Number(totalChunks) || undefined, received: new Set() });
  res.json({ uploadId: id });
});

app.get('/uploads/:id/status', (req: Request, res: Response) => {
  const s = uploadSessions.get(String(req.params.id));
  if (!s) return res.status(404).json({ error: 'not_found' });
  res.json({ id: s.id, received: Array.from(s.received.values()), totalChunks: s.totalChunks, chunkSize: s.chunkSize, size: s.size, filename: s.filename });
});

// Upload a chunk as base64 to simplify demo (binary streaming can be added later)
app.post('/uploads/:id/chunk', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const s = uploadSessions.get(id);
  if (!s) return res.status(404).json({ error: 'not_found' });
  const { index, data } = req.body || {};
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0) return res.status(400).json({ error: 'invalid_index' });
  if (typeof data !== 'string') return res.status(400).json({ error: 'data_base64_required' });
  const buf = Buffer.from(data, 'base64');
  const partPath = path.join(TMP_ROOT, `${id}_${idx}.part`);
  fs.writeFileSync(partPath, buf);
  s.received.add(idx);
  res.json({ ok: true, index: idx });
});

app.post('/uploads/:id/complete', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const s = uploadSessions.get(id);
  if (!s) return res.status(404).json({ error: 'not_found' });
  // Validate all chunks present
  const total = s.totalChunks ?? s.received.size;
  for (let i = 0; i < total; i++) {
    if (!s.received.has(i)) return res.status(400).json({ error: 'missing_chunk', index: i });
  }
  // Assemble
  const outPath = path.join(FILES_ROOT, `${Date.now()}_${s.filename}`);
  const out = fs.createWriteStream(outPath);
  for (let i = 0; i < total; i++) {
    const partPath = path.join(TMP_ROOT, `${id}_${i}.part`);
    const data = fs.readFileSync(partPath);
    out.write(data);
  }
  out.end();
  await new Promise((r) => out.on('finish', r));
  // Cleanup parts
  for (let i = 0; i < total; i++) {
    const partPath = path.join(TMP_ROOT, `${id}_${i}.part`);
    try { fs.unlinkSync(partPath); } catch {}
  }
  uploadSessions.delete(id);

  // Metadata extraction (basic): size, sha256, mime by ext, image dims (png/jpeg)
  const stat = fs.statSync(outPath);
  const sizeBytes = stat.size;
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(outPath);
  await new Promise<void>((resolve, reject) => {
    stream.on('data', (d) => hash.update(d));
    stream.on('end', () => resolve());
    stream.on('error', reject);
  });
  const sha256 = hash.digest('hex');
  const ext = path.extname(outPath).toLowerCase();
  let mime = s.mimeType || 'application/octet-stream';
  if (!s.mimeType) {
    if (ext === '.png') mime = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
    else if (ext === '.mp4') mime = 'video/mp4';
    else if (ext === '.mov') mime = 'video/quicktime';
    else if (ext === '.mkv') mime = 'video/x-matroska';
    else if (ext === '.webm') mime = 'video/webm';
    else if (ext === '.avi') mime = 'video/x-msvideo';
    else if (ext === '.m4v') mime = 'video/x-m4v';
    else if (ext === '.ts') mime = 'video/mp2t';
  }
  let width: number | undefined;
  let height: number | undefined;
  try {
    if (mime === 'image/png') {
      const fd = fs.openSync(outPath, 'r');
      const header = Buffer.alloc(24);
      fs.readSync(fd, header, 0, 24, 0);
      fs.closeSync(fd);
      // Bytes 16-23 in PNG are width/height (big-endian)
      width = header.readUInt32BE(16);
      height = header.readUInt32BE(20);
    } else if (mime === 'image/jpeg') {
      const data = fs.readFileSync(outPath);
      // Minimal JPEG SOF parser
      let i = 2; // skip SOI
      while (i < data.length) {
        if (data[i] !== 0xFF) break; i++;
        const marker = data[i++];
        const len = (data[i++] << 8) | data[i++];
        if (marker === 0xC0 || marker === 0xC2) { // SOF0/2
          i++; // precision
          height = (data[i++] << 8) | data[i++];
          width  = (data[i++] << 8) | data[i++];
          break;
        } else {
          i += len - 2;
        }
      }
    }
  } catch {}

  res.json({ path: outPath, filename: path.basename(outPath), size: sizeBytes, sha256, mime, width, height });
});

// Assessments per course
app.get('/courses/:id/assessments', (req: Request, res: Response) => {
  const course_id = Number(req.params.id);
  res.json(assessments.filter(a => a.course_id === course_id));
});
app.post('/courses/:id/assessments', (req: Request, res: Response) => {
  const course_id = Number(req.params.id);
  if (!courses.find(c => c.id === course_id)) return res.status(404).json({ error: 'course_not_found' });
  const title: string = req.body?.title || '';
  if (!title) return res.status(400).json({ error: 'title is required' });
  const questions = req.body?.questions || [];
  const a: Assessment = { id: nextAssessmentId++, course_id, title, questions, passing_score: req.body?.passing_score ?? 0, time_limit: req.body?.time_limit ?? 0 };
  assessments.push(a);
  res.status(201).json(a);
});

// Progress tracking
app.get('/progress/:userId', (req: Request, res: Response) => {
  const uid = String(req.params.userId);
  res.json(progresses.filter(p => p.user_id === uid));
});
app.post('/progress', (req: Request, res: Response) => {
  const { user_id, course_id } = req.body || {};
  if (!user_id || !course_id) return res.status(400).json({ error: 'user_id and course_id required' });
  const p: Progress = { id: nextProgressId++, user_id, course_id: Number(course_id), completion_percentage: req.body?.completion_percentage ?? 0, current_lesson: req.body?.current_lesson ?? null, time_spent: req.body?.time_spent ?? 0, last_accessed: new Date().toISOString() };
  progresses.push(p);
  res.status(201).json(p);
});
app.patch('/progress/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = progresses.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  progresses[idx] = { ...progresses[idx], ...req.body, last_accessed: new Date().toISOString() };
  res.json(progresses[idx]);
});

// Bundles CRUD
app.get('/bundles', (_req: Request, res: Response) => {
  res.json(bundles);
});
app.post('/bundles', (req: Request, res: Response) => {
  const { title, description = '', course_ids = [], price = 0 } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title_required' });
  const b: Bundle = { id: nextBundleId++, title, description, course_ids: (course_ids as any[]).map((n) => Number(n)), price: Number(price) };
  bundles.push(b);
  res.status(201).json(b);
});
app.patch('/bundles/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = bundles.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  const data = req.body || {};
  bundles[idx] = { ...bundles[idx], ...data, course_ids: Array.isArray(data.course_ids) ? data.course_ids.map((n: any) => Number(n)) : bundles[idx].course_ids };
  res.json(bundles[idx]);
});
app.delete('/bundles/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = bundles.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  const del = bundles.splice(idx, 1)[0];
  res.json(del);
});


app.listen(port, () => {
  console.log(`course-service listening on port ${port}`);
});
