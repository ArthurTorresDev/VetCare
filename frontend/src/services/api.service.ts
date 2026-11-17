import { fetchAppointments } from './appointment.service';
import { fetchClients } from './client.service';
import { fetchServices } from './service.service';
import { fetchAuditLogs } from './audit.service';
import { fetchNotifications } from './notification.service';
import { fetchGoogleCalendarStatus } from './google-calendar.service';

export async function loadInitialAppData() {
  const [
    appointmentsResult,
    clientsResult,
    servicesResult,
    auditLogsResult,
    notificationsResult,
    googleStatusResult,
  ] = await Promise.allSettled([
    fetchAppointments(),
    fetchClients(),
    fetchServices(),
    fetchAuditLogs(),
    fetchNotifications(),
    fetchGoogleCalendarStatus(),
  ]);

  return {
    appointments:
      appointmentsResult.status === 'fulfilled' ? appointmentsResult.value : [],
    clients: clientsResult.status === 'fulfilled' ? clientsResult.value : [],
    services: servicesResult.status === 'fulfilled' ? servicesResult.value : [],
    auditLogs: auditLogsResult.status === 'fulfilled' ? auditLogsResult.value : [],
    notifications:
      notificationsResult.status === 'fulfilled' ? notificationsResult.value : [],
    googleStatus:
      googleStatusResult.status === 'fulfilled' ? googleStatusResult.value : null,
  };
}
