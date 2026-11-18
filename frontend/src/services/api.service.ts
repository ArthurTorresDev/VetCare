import { fetchAppointments } from './appointment.service';
import { fetchClients } from './client.service';
import { fetchServices } from './service.service';
import { fetchAuditLogs } from './audit.service';
import { fetchNotifications } from './notification.service';
import { fetchHolidays } from './holiday.service';

export async function loadInitialAppData() {
  const currentYear = new Date().getFullYear();
  const [
    appointmentsResult,
    clientesResult,
    servicesResult,
    auditLogsResult,
    notificationsResult,
    holidaysResult,
  ] = await Promise.allSettled([
    fetchAppointments(),
    fetchClients(),
    fetchServices(),
    fetchAuditLogs(),
    fetchNotifications(),
    fetchHolidays(currentYear),
  ]);

  return {
    appointments:
      appointmentsResult.status === 'fulfilled' ? appointmentsResult.value : [],
    clientes: clientesResult.status === 'fulfilled' ? clientesResult.value : [],
    services: servicesResult.status === 'fulfilled' ? servicesResult.value : [],
    auditLogs: auditLogsResult.status === 'fulfilled' ? auditLogsResult.value : [],
    notifications:
      notificationsResult.status === 'fulfilled' ? notificationsResult.value : [],
    holidays:
      holidaysResult.status === 'fulfilled' ? holidaysResult.value : [],
  };
}
