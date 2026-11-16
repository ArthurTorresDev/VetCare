'use client';

import React from 'react';
import { AuditLogEntry, formatDateTimeBR } from '@vetcare/shared';

interface AuditTabProps {
  logs: AuditLogEntry[];
}

export const AuditTab: React.FC<AuditTabProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
      <div className="p-4 bg-slate-50/70">
        <h3 className="font-bold text-slate-700 text-sm">
          Trilha de Auditoria & Segurança ({logs.length} registros)
        </h3>
        <p className="text-xs text-slate-500">
          Registro imutável de todas as ações de criação, atualização, cancelamento e sincronização.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          Nenhum log registrado até o momento.
        </div>
      ) : (
        logs.map((log) => (
          <div
            key={log.id}
            className="p-4 flex items-center justify-between text-sm hover:bg-slate-50/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  log.action === 'CREATE'
                    ? 'bg-emerald-500'
                    : log.action === 'CANCEL'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
              ></span>
              <div>
                <p className="font-semibold text-slate-800">{log.details}</p>
                <p className="text-xs text-slate-400">
                  Responsável: <strong className="text-slate-600">{log.user}</strong> &bull;
                  Ação: {log.action}
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
              {formatDateTimeBR(log.timestamp)}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
