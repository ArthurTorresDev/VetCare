'use client';

import React from 'react';
import { EmailNotification, formatDateTimeBR } from '@vetcare/shared';

interface NotificationsTabProps {
  notifications: EmailNotification[];
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ notifications }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
      <div className="p-4 bg-slate-50/70">
        <h3 className="font-bold text-slate-700 text-sm">
          Fila e Histórico de E-mails Disparados ({notifications.length})
        </h3>
        <p className="text-xs text-slate-500">
          Comunicações automatizadas: confirmações de agendamento, lembretes prévios, avisos de
          alteração e cancelamento.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          Nenhum e-mail disparado até o momento. Ao criar ou cancelar agendamentos, os envios
          aparecerão aqui.
        </div>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className="p-4 text-sm hover:bg-slate-50/40 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    n.type === 'CONFIRMACAO'
                      ? 'bg-emerald-50 text-emerald-700'
                      : n.type === 'CANCELAMENTO'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-sky-50 text-sky-700'
                  }`}
                >
                  {n.type}
                </span>
                <span className="font-bold text-slate-800">{n.subject}</span>
              </div>
              <span className="text-xs text-slate-400">{formatDateTimeBR(n.createdAt)}</span>
            </div>

            <p className="text-xs text-slate-500 mb-2">
              Destinatário: <strong className="text-slate-700">{n.recipientName}</strong> (
              {n.recipientEmail}) &bull; Status: <span className="text-emerald-600 font-semibold">{n.status}</span>
            </p>

            <pre className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 font-sans whitespace-pre-wrap">
              {n.body}
            </pre>
          </div>
        ))
      )}
    </div>
  );
};
