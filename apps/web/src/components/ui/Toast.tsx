'use client';

import React from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isWarning = t.type === 'warning';

        return (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slideUp ${
              isSuccess
                ? 'bg-emerald-900/95 border-emerald-700 text-white'
                : isError
                ? 'bg-rose-900/95 border-rose-700 text-white'
                : isWarning
                ? 'bg-amber-900/95 border-amber-700 text-white'
                : 'bg-slate-900/95 border-slate-700 text-white'
            }`}
          >
            <div className="text-xl shrink-0 mt-0.5">
              {isSuccess && <i className="ph-fill ph-check-circle text-emerald-400"></i>}
              {isError && <i className="ph-fill ph-warning-circle text-rose-400"></i>}
              {isWarning && <i className="ph-fill ph-warning text-amber-400"></i>}
              {!isSuccess && !isError && !isWarning && (
                <i className="ph-fill ph-info text-sky-400"></i>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold leading-tight">{t.title}</h4>
              {t.message && <p className="text-xs text-slate-200 mt-1 leading-snug">{t.message}</p>}
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Fechar notificação"
            >
              <i className="ph ph-x text-sm"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
};
