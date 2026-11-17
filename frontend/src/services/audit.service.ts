import { AuditLogEntry } from '@vetcare/shared';
import { API_URL } from '../config/constants';

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_URL}/audit-logs`);
  if (!res.ok) throw new Error('Falha ao carregar logs de auditoria');
  return res.json();
}
