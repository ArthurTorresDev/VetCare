/**
 * Configuração centralizada de variáveis de ambiente
 */
export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID || '',
  googleCalendarAccessToken: process.env.GOOGLE_CALENDAR_ACCESS_TOKEN || '',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};
