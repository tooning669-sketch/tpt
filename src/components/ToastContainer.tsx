'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; type: string; message: string };
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icon =
    toast.type === 'success' ? (
      <CheckCircle size={18} className="text-green-400 shrink-0" />
    ) : toast.type === 'error' ? (
      <XCircle size={18} className="text-red-400 shrink-0" />
    ) : (
      <Info size={18} className="text-blue-400 shrink-0" />
    );

  return (
    <div
      className="toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border max-w-sm"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {icon}
      <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
        {toast.message}
      </span>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X size={14} style={{ color: 'var(--text-muted)' }} />
      </button>
    </div>
  );
}
