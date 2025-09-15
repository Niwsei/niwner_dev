import { useEffect, useRef } from 'react';
import { sendVideoAnalytics } from '../../lib/api';

type Track = { src: string; srclang: string; label: string; default?: boolean };
type Props = { src: string; poster?: string; playbackRate?: number; onReady?: (el: HTMLVideoElement) => void; analyticsVideoId?: string; tracks?: Track[]; watermarkText?: string; watermarkMoving?: boolean; watermarkOpacity?: number };

export default function Player({ src, poster, playbackRate, onReady, analyticsVideoId, tracks, watermarkText, watermarkMoving = true, watermarkOpacity = 0.2 }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wmRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hls: any;
    const isHls = src.endsWith('.m3u8');
    if (isHls) {
      import('hls.js')
        .then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          }
        })
        .catch(() => {});
    } else {
      video.src = src;
    }
    if (typeof playbackRate === 'number') video.playbackRate = playbackRate;
    onReady && onReady(video);
    // Analytics binding (basic)
    if (analyticsVideoId) {
      const handlerPlay = () => sendVideoAnalytics(analyticsVideoId, { event: 'play', ts: Date.now() }).catch(()=>{});
      const handlerPause = () => sendVideoAnalytics(analyticsVideoId, { event: 'pause', ts: Date.now(), time: video.currentTime, duration: video.duration }).catch(()=>{});
      const handlerEnded = () => sendVideoAnalytics(analyticsVideoId, { event: 'complete', ts: Date.now(), time: video.duration, duration: video.duration }).catch(()=>{});
      let lastSent = 0;
      const handlerTime = () => {
        const now = Date.now();
        if (now - lastSent > 3000) { // throttle every 3s
          lastSent = now;
          sendVideoAnalytics(analyticsVideoId, { event: 'timeupdate', ts: now, time: video.currentTime, duration: video.duration }).catch(()=>{});
        }
      };
      video.addEventListener('play', handlerPlay);
      video.addEventListener('pause', handlerPause);
      video.addEventListener('ended', handlerEnded);
      video.addEventListener('timeupdate', handlerTime);
      return () => {
        video.removeEventListener('play', handlerPlay);
        video.removeEventListener('pause', handlerPause);
        video.removeEventListener('ended', handlerEnded);
        video.removeEventListener('timeupdate', handlerTime);
      };
    }
    return () => { if (hls) hls.destroy(); };
  }, [src, analyticsVideoId]);

  useEffect(() => {
    if (!watermarkText) return;
    const el = wmRef.current;
    if (!el) return;
    let raf = 0;
    if (watermarkMoving) {
      let x = Math.random() * 70, y = Math.random() * 70;
      let dx = 0.08 + Math.random() * 0.12, dy = 0.08 + Math.random() * 0.12;
      const animate = () => {
        x += dx; y += dy;
        if (x < 0 || x > 80) dx = -dx;
        if (y < 0 || y > 80) dy = -dy;
        el.style.left = `${x}%`; el.style.top = `${y}%`;
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
    }
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [watermarkText, watermarkMoving]);

  return (
    <div className="card" style={{ position: 'relative' }}>
      <video ref={videoRef} poster={poster} controls style={{ width: '100%', borderRadius: 8 }}>
        {tracks?.map((t) => (<track key={t.srclang} kind="subtitles" srcLang={t.srclang} label={t.label} src={t.src} default={t.default} />))}
      </video>
      {watermarkText && (
        <div ref={wmRef} style={{ position: 'absolute', pointerEvents: 'none', left: '10%', top: '10%', opacity: watermarkOpacity, fontSize: 14, padding: '2px 6px', borderRadius: 6, background: 'rgba(0,0,0,0.4)', color: '#fff' }}>{watermarkText}</div>
      )}
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <a className="btn btn-ghost" href={src} download>
          Download
        </a>
      </div>
    </div>
  );
}
