import { PropsWithChildren, useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number | string;
};

export default function Modal({ open, onClose, title, width = 640, children }: PropsWithChildren<Props>) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <strong>{title}</strong>
          <button aria-label="Close" className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; max-width: 95vw; max-height: 90vh; overflow: auto; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border); }
        .modal-body { padding: 16px; }
      `}</style>
    </div>
  );
}

