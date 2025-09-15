import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const port = Number(process.env.PORT) || 3011;

type ID = string;
type ISO = string;
type Video = {
  id: ID;
  title: string;
  sourceUrl?: string;
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  renditions: string[]; // e.g., ['480p','720p']
  hlsUrl?: string;
  captions: Array<{ lang: string; url: string }>;
  thumbnailUrl?: string;
  createdAt: ISO;
  updatedAt: ISO;
  analytics: { watchTime: number; plays: number; drops: number };
};

const videos = new Map<ID, Video>();
function vid(): ID { return Math.random().toString(36).slice(2); }
function now(): ISO { return new Date().toISOString(); }

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Upload init (signed URL mock)
app.post('/uploads/sign', (req: Request, res: Response) => {
  const { filename = 'video.mp4', contentType = 'video/mp4' } = req.body || {};
  res.json({ uploadUrl: `https://upload.mock.local/${Date.now()}/${encodeURIComponent(filename)}`, contentType, expiresIn: 900 });
});

// Create video record
app.post('/videos', (req: Request, res: Response) => {
  const { title, sourceUrl } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const v: Video = { id: vid(), title, sourceUrl, status: 'uploaded', renditions: [], captions: [], createdAt: now(), updatedAt: now(), analytics: { watchTime: 0, plays: 0, drops: 0 } };
  videos.set(v.id, v);
  res.status(201).json(v);
});

app.get('/videos', (_req, res) => res.json(Array.from(videos.values())));
app.get('/videos/:id', (req, res) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  res.json(v);
});

// Transcoding
app.post('/videos/:id/transcode', (req, res) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  v.status = 'processing'; v.updatedAt = now();
  setTimeout(() => {
    v.status = 'ready';
    v.renditions = req.body?.renditions || ['480p','720p','1080p'];
    v.hlsUrl = `https://cdn.mock.local/hls/${v.id}/index.m3u8`;
    v.thumbnailUrl = `https://cdn.mock.local/thumb/${v.id}.jpg`;
    v.updatedAt = now();
  }, 1000);
  res.json({ ok: true, status: v.status });
});

// Captions
app.post('/videos/:id/captions', (req, res) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  const { lang = 'en', url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  v.captions.push({ lang, url }); v.updatedAt = now();
  res.status(201).json(v.captions);
});

// Analytics
app.post('/videos/:id/analytics', (req, res) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  const { watch = 0, play = 0, drop = 0 } = req.body || {};
  v.analytics.watchTime += Number(watch || 0);
  v.analytics.plays += Number(play || 0);
  v.analytics.drops += Number(drop || 0);
  res.json(v.analytics);
});

// DRM/Download placeholders
app.get('/videos/:id/download', (req, res) => {
  const v = videos.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not_found' });
  res.json({ url: `https://download.mock.local/${v.id}.mp4?token=${vid()}`, expiresIn: 600 });
});

app.listen(port, () => {
  console.log('video-service listening on port ' + port);
});

