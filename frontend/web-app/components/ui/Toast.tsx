import { createContext, useContext, useMemo, useState } from 'react';

export type ToastItem = { id: number; title: string; description?: string; variant?: 'default' | 'success' | 'error' | 'warning' };

type Ctx = {
  toasts: ToastItem[];
  show: (t: Omit<ToastItem, 'id'>) => void;
  remove: (id: number) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const show: Ctx['show'] = (t) => {
    const id = Date.now();
    setToasts((list) => [...list, { id, ...t }]);
    setTimeout(() => remove(id), 3500);
  };
  const remove: Ctx['remove'] = (id) => setToasts((list) => list.filter((x) => x.id !== id));
  const value = useMemo(() => ({ toasts, show, remove }), [toasts]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.variant || 'default'}`} onClick={() => remove(t.id)}>
            <strong>{t.title}</strong>
            {t.description && <div className="muted" style={{ fontSize: 12 }}>{t.description}</div>}
          </div>
        ))}
      </div>
      <style jsx>{`
        .toast-wrap { position: fixed; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 8px; z-index: 120; }
        .toast { background: var(--panel); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; min-width: 240px; cursor: pointer; }
        .toast.success { border-color: var(--success); }
        .toast.error { border-color: var(--danger); }
        .toast.warning { border-color: var(--warning); }
      `}</style>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

