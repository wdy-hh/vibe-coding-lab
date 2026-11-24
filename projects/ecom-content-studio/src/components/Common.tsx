import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Check, CheckCircle2, Circle, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import type { ProductItem, ToastItem } from '../types';

export function Spinner({ size = 16 }: { size?: number }) { return <LoaderCircle size={size} className="animate-spin" aria-hidden="true" />; }

export function StatusBadge({ status }: { status: ProductItem['status'] }) {
  const labels = { draft: '未生成', generating: '生成中', generated: '已生成', approved: '已定稿' };
  const Icon = status === 'generating' ? LoaderCircle : status === 'approved' ? CheckCircle2 : status === 'generated' ? Check : Circle;
  return <span className={`status-badge status-${status}`}><Icon size={12} className={status === 'generating' ? 'animate-spin' : ''} />{labels[status]}</span>;
}

export function Modal({ title, description, onClose, children, className = '' }: { title: string; description?: string; onClose: () => void; children: ReactNode; className?: string }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]') ?? []);
    const timer = setTimeout(() => (dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0])?.focus(), 10);
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key !== 'Tab') return;
      const elements = focusables();
      if (!elements.length) { event.preventDefault(); return; }
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keyHandler);
    return () => { clearTimeout(timer); document.removeEventListener('keydown', keyHandler); document.body.style.overflow = originalOverflow; previous?.focus(); };
  }, []);
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef}>
      <div className="modal-header"><div><h2 id={titleId}>{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" aria-label="关闭弹窗" onClick={onClose}><X size={19} /></button></div>
      {children}
    </div>
  </div>;
}

export function Toasts({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: string) => void }) {
  return <div className="toast-stack" aria-live="polite" aria-atomic="false">{toasts.map(toast => <div className={`toast toast-${toast.kind}`} key={toast.id} role={toast.kind === 'error' ? 'alert' : 'status'}>
    {toast.kind === 'success' ? <CheckCircle2 size={19} /> : toast.kind === 'error' ? <TriangleAlert size={19} /> : <Info size={19} />}
    <span>{toast.message}</span><button className="icon-button" aria-label="关闭提示" onClick={() => dismiss(toast.id)}><X size={15} /></button>
  </div>)}</div>;
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}
