import type { AppointmentDetailedView } from '../models/types';
import { formatDateBR, formatTimeBR } from '../utils/date';

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrice(value: unknown): string {
  const price = Number(value);
  return Number.isFinite(price)
    ? price.toFixed(2)
    : '0.00';
}

function formatDateTime(value: unknown): string {
  if (value == null || value === '') return '';

  const date =
  value instanceof Date
    ? value
    : new Date(value as string | number);

  if (Number.isNaN(date.getTime())) return '';

  return `${formatDateBR(date)} ${formatTimeBR(date)}`;
}

function normalizeStatus(value: unknown): string {
  return String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function statusClass(value: unknown): string {
  switch (normalizeStatus(value)) {
    case 'CONFIRMADO': return 'confirmed';
    case 'PENDENTE': return 'pending';
    case 'CANCELADO': return 'canceled';
    default: return 'other';
  }
}

function generateAppointment(a: AppointmentDetailedView): string {
  return `  <agendamento id="${escapeXml(a.id)}">
    <status>${escapeXml(a.status)}</status>
    <tutor nome="${escapeXml(a.clientName)}" telefone="${escapeXml(a.clientPhone)}" email="${escapeXml(a.clientEmail)}" />
    <paciente nome="${escapeXml(a.petName)}" especie="${escapeXml(a.petSpecies)}" raca="${escapeXml(a.petBreed)}" />
    <servico nome="${escapeXml(a.serviceName)}" categoria="${escapeXml(a.serviceCategory)}" valor="${formatPrice(a.servicePrice)}" />
    <veterinario>${escapeXml(a.veterinarianName)}</veterinario>
    <horario inicio="${escapeXml(formatDateTime(a.startTime))}" termino="${escapeXml(formatDateTime(a.endTime))}" />
    <googleCalendar eventId="${escapeXml(a.googleEventId)}" status="${escapeXml(a.googleSyncStatus)}" />
    <observacoes>${escapeXml(a.notes)}</observacoes>
  </agendamento>`;
}

export function generateAppointmentsXml(
  appointments: AppointmentDetailedView[],
): string {
  if (!Array.isArray(appointments)) {
    throw new TypeError('A lista de agendamentos deve ser um array.');
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<relatorioAgendamentos total="${appointments.length}" geradoEm="${new Date().toISOString()}">`,
    appointments.map(generateAppointment).join('\n'),
    '</relatorioAgendamentos>',
  ].join('\n');
}

export function generateAppointmentsHtml(
  appointments: AppointmentDetailedView[],
): string {
  if (!Array.isArray(appointments)) {
    throw new TypeError('A lista de agendamentos deve ser um array.');
  }

  const counts = appointments.reduce(
    (acc, a) => {
      const status = normalizeStatus(a.status);

      if (status === 'CONFIRMADO') acc.confirmed++;
      else if (status === 'PENDENTE') acc.pending++;
      else if (status === 'CANCELADO') acc.canceled++;
      else acc.other++;

      return acc;
    },
    { confirmed: 0, pending: 0, canceled: 0, other: 0 },
  );

  const rows = appointments.map((a) => `
    <tr>
      <td class="id">${escapeHtml(a.id)}</td>
      <td><span class="status ${statusClass(a.status)}">${escapeHtml(a.status || 'Não informado')}</span></td>
      <td>
        <strong>${escapeHtml(a.clientName)}</strong>
        <small>${escapeHtml(a.clientPhone)}</small>
      </td>
      <td>
        <strong>${escapeHtml(a.petName)}</strong>
        <small>${escapeHtml(a.petSpecies)} · ${escapeHtml(a.petBreed)}</small>
      </td>
      <td>
        <strong>${escapeHtml(a.serviceName)}</strong>
        <small>${escapeHtml(a.serviceCategory)}</small>
      </td>
      <td class="price">R$ ${formatPrice(a.servicePrice)}</td>
      <td>${escapeHtml(a.veterinarianName)}</td>
      <td>
        <strong>${escapeHtml(formatDateTime(a.startTime))}</strong>
        <small>Até ${escapeHtml(formatDateTime(a.endTime))}</small>
      </td>
      <td>
        <span class="calendar ${normalizeStatus(a.googleSyncStatus) === 'SINCRONIZADO' ? 'synced' : 'unsynced'}">
          ${escapeHtml(a.googleSyncStatus || 'Não informado')}
        </span>
      </td>
      <td class="notes">${escapeHtml(a.notes || 'Sem observações')}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Relatório de Agendamentos</title>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 32px;
  background: #f1f5f9;
  color: #263445;
  font-family: Arial, sans-serif;
}

.container {
  max-width: 1700px;
  margin: auto;
}

.header {
  background: linear-gradient(135deg, #142d4e, #285785);
  color: white;
  padding: 30px 34px;
  border-radius: 12px;
  box-shadow: 0 5px 18px rgba(23,54,93,.15);
}

.header h1 {
  margin: 0;
  font-size: 25px;
  letter-spacing: 1px;
}

.header p {
  margin: 8px 0 0;
  color: #d9eaf7;
  font-size: 12px;
}

.summary {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;
  margin: 24px 0;
}

.card {
  padding: 22px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,.035);
}

.card-label {
  color: #718096;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
}

.total {
  display: block;
  margin-top: 10px;
  color: #17365d;
  font-size: 34px;
  font-weight: bold;
}

.status-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.status-count {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: bold;
}

.confirmed {
  background: #e2f0d9;
  color: #375623;
}

.pending {
  background: #fff2cc;
  color: #7f6000;
}

.canceled {
  background: #fce4d6;
  color: #c00000;
}

.other {
  background: #e7e6e6;
  color: #52606d;
}

.section-title {
  margin: 30px 0 14px;
  color: #17365d;
  font-size: 17px;
}

.table-container {
  overflow-x: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0,0,0,.04);
}

table {
  width: 100%;
  min-width: 1450px;
  border-collapse: collapse;
  font-size: 12px;
}

thead {
  background: #17365d;
  color: white;
}

th {
  padding: 16px 13px;
  text-align: left;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .4px;
  white-space: nowrap;
}

td {
  padding: 14px 13px;
  border-bottom: 1px solid #edf0f4;
  vertical-align: middle;
  line-height: 1.5;
}

tbody tr:nth-child(even) {
  background: #f8fafc;
}

tbody tr:hover {
  background: #edf4fb;
}

td strong, td small {
  display: block;
}

td small {
  margin-top: 3px;
  color: #718096;
  font-size: 11px;
}

.id {
  color: #718096;
  white-space: nowrap;
}

.status, .calendar {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
}

.price {
  color: #17365d;
  font-weight: bold;
  white-space: nowrap;
}

.synced {
  background: #e2f0d9;
  color: #375623;
}

.unsynced {
  background: #fff2cc;
  color: #7f6000;
}

.notes {
  max-width: 200px;
  color: #64748b;
}

.footer {
  margin-top: 20px;
  padding: 18px;
  text-align: center;
  color: #94a3b8;
  font-size: 11px;
}

@media(max-width: 800px) {
  body { padding: 14px; }
  .summary { grid-template-columns: 1fr; }
  .header { padding: 22px; }
}

@media print {
  @page { size: landscape; margin: 10mm; }

  body {
    padding: 0;
    background: white;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .container { max-width: none; }
  .table-container { overflow: visible; box-shadow: none; }
  table { min-width: 0; font-size: 9px; }
  th, td { padding: 7px 5px; }
  tr { break-inside: avoid; }
  .header, .card { box-shadow: none; }
}
</style>
</head>

<body>
<div class="container">

  <header class="header">
    <h1>MEDPET / VETCARE</h1>
    <p>RELATÓRIO DE AUDITORIA DE AGENDAMENTOS</p>
    <p>Gerado em ${escapeHtml(new Date().toLocaleString('pt-BR'))}</p>
  </header>

  <section class="summary">
    <div class="card">
      <div class="card-label">Total de agendamentos</div>
      <strong class="total">${appointments.length}</strong>
    </div>

    <div class="card">
      <div class="card-label">Status dos agendamentos</div>

      <div class="status-summary">
        <span class="status-count confirmed">Confirmados: ${counts.confirmed}</span>
        <span class="status-count pending">Pendentes: ${counts.pending}</span>
        <span class="status-count canceled">Cancelados: ${counts.canceled}</span>
        <span class="status-count other">Outros: ${counts.other}</span>
      </div>
    </div>
  </section>

  <h2 class="section-title">Registros detalhados</h2>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
          <th>Tutor</th>
          <th>Paciente</th>
          <th>Serviço</th>
          <th>Valor</th>
          <th>Veterinário</th>
          <th>Horário</th>
          <th>Google Calendar</th>
          <th>Observações</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="10" style="text-align:center;padding:30px">Nenhum agendamento encontrado.</td></tr>'}
      </tbody>
    </table>
  </div>

  <footer class="footer">
    Documento gerado automaticamente pelo sistema MedPet / VetCare.
    <br>Relatório de auditoria de agendamentos clínicos.
  </footer>

</div>
</body>
</html>`;
}
