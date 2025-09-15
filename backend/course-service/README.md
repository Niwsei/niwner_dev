# Course Service

Basic Express service for managing courses.

## Endpoints

- `GET /health` – health check.

## Scripts

- `npm start` – start the service on port 3001.
- `npm test` – placeholder for tests.
# Course Service

Chunked Upload + Metadata Extraction (demo)

## Upload API

- `POST /uploads/session` → create a session
  - body: `{ filename, mimeType?, size?, chunkSize?, totalChunks? }`
  - returns: `{ uploadId }`

- `POST /uploads/:id/chunk` → upload a chunk (base64 for demo)
  - body: `{ index, data }` where `data` is base64-encoded chunk

- `GET /uploads/:id/status` → session state
  - returns: `{ id, received: number[], totalChunks?, chunkSize?, size?, filename }`

- `POST /uploads/:id/complete` → assemble chunks, extract metadata, cleanup
  - returns: `{ path, filename, size, sha256, mime, width?, height? }`

Notes:
- Files are stored under `backend/course-service/data/files/`
- Demo extracts basic metadata: size, sha256, mime by extension, PNG/JPEG dimensions. For audio/video duration/codec, integrate ffprobe in production.
- Supported video extensions (inference): .mp4, .mov, .mkv, .webm, .avi, .m4v, .ts (extend as needed)

## Video Pipeline (mock)

- `POST /videos/import` → register uploaded file as a video asset
- `GET /videos` / `GET /videos/:id` → list/fetch video asset (+renditions, thumbnails)
- `POST /videos/:id/transcode` → create renditions (mock) for multiple resolutions and formats
  - body: `{ preset?: 'auto', resolutions?: ['480p','720p','1080p','2160p'], formats?: ['hls','dash','mp4'] }`
  - returns: `{ id, renditions: [{ resolution, format, url }...] }`
- `POST /videos/:id/thumbnails` → generate thumbnail URLs (mock)
  - body: `{ count?: number }`
- `POST /videos/:id/analytics/events` → ingest playback events
- `GET /videos/:id/analytics` → watch-time units + drop-off histogram (percent buckets)
- `GET /videos/:id/subtitles` → list subtitle tracks (multi-language)
- `POST /videos/:id/subtitles` → add a subtitle track `{ lang, label, url, default? }`
- `DELETE /videos/:id/subtitles/:lang` → remove a subtitle track by language
- `GET /videos/:id/watermark` → get watermark configuration
- `POST /videos/:id/watermark` → set watermark configuration `{ type: 'overlay'|'burnin', text?, imageUrl?, opacity?, position?, moving? }`

Notes:
- Transcoding/packaging is mocked by creating URLs; integrate FFmpeg/packager in production.
- Analytics model is simplified; in production, send deltas and aggregate server-side by time windows.
- Watermark: overlay mode is for player UI; burn-in requires re-transcoding with FFmpeg filters (drawtext/overlay) and per-user dynamic tokens if needed.
