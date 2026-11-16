/**
 * Serviço de Integração com a API do Google Calendar v3
 * Implementa o padrão Adapter:
 * - Se credenciais estiverem configuradas, conecta à API oficial.
 * - Caso contrário, utiliza o MockGoogleCalendarService para dev/test.
 */
import { env } from '../config/env.js';

export interface GoogleEventPayload {
  summary: string;
  description: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}

export interface GoogleEventResult {
  eventId: string;
  htmlLink: string;
  isMock: boolean;
}

export interface IGoogleCalendarService {
  createEvent(payload: GoogleEventPayload): Promise<GoogleEventResult>;
  updateEvent(eventId: string, payload: Partial<GoogleEventPayload>): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
  getStatus(): { isMock: boolean; calendarId: string };
}

export class RealGoogleCalendarService implements IGoogleCalendarService {
  private calendarId: string;
  private accessToken: string;
  private baseUrl = 'https://www.googleapis.com/calendar/v3/calendars';

  constructor(calendarId: string, accessToken: string) {
    this.calendarId = encodeURIComponent(calendarId);
    this.accessToken = accessToken;
  }

  async createEvent(payload: GoogleEventPayload): Promise<GoogleEventResult> {
    const response = await fetch(`${this.baseUrl}/${this.calendarId}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Calendar API Error [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    return {
      eventId: data.id,
      htmlLink: data.htmlLink || `https://calendar.google.com/calendar/event?eid=${data.id}`,
      isMock: false,
    };
  }

  async updateEvent(eventId: string, payload: Partial<GoogleEventPayload>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${this.calendarId}/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Falha ao atualizar evento no Google Agenda [${response.status}]: ${errText}`,
      );
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${this.calendarId}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const errText = await response.text();
      throw new Error(`Falha ao remover evento no Google Agenda [${response.status}]: ${errText}`);
    }
  }

  getStatus() {
    return {
      isMock: false,
      calendarId: decodeURIComponent(this.calendarId),
    };
  }
}

export class MockGoogleCalendarService implements IGoogleCalendarService {
  private events: Map<string, GoogleEventPayload> = new Map();

  async createEvent(payload: GoogleEventPayload): Promise<GoogleEventResult> {
    const eventId = `gcal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.events.set(eventId, payload);

    console.log(
      '\x1b[36m%s\x1b[0m',
      `[Google Calendar Mock] Evento criado com sucesso: "${payload.summary}" (${eventId})`,
    );

    return {
      eventId,
      htmlLink: `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(payload.summary)}`,
      isMock: true,
    };
  }

  async updateEvent(eventId: string, payload: Partial<GoogleEventPayload>): Promise<void> {
    const existing = this.events.get(eventId);
    if (existing) {
      this.events.set(eventId, { ...existing, ...payload });
      console.log('\x1b[33m%s\x1b[0m', `[Google Calendar Mock] Evento atualizado: ${eventId}`);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    this.events.delete(eventId);
    console.log('\x1b[31m%s\x1b[0m', `[Google Calendar Mock] Evento removido: ${eventId}`);
  }

  getStatus() {
    return {
      isMock: true,
      calendarId: 'mock-clinic-calendar@vetcare.local',
    };
  }
}

let calendarServiceInstance: IGoogleCalendarService | null = null;

export function getGoogleCalendarService(): IGoogleCalendarService {
  if (calendarServiceInstance) return calendarServiceInstance;

  if (env.googleCalendarId && env.googleCalendarAccessToken) {
    calendarServiceInstance = new RealGoogleCalendarService(
      env.googleCalendarId,
      env.googleCalendarAccessToken,
    );
  } else {
    calendarServiceInstance = new MockGoogleCalendarService();
  }
  return calendarServiceInstance;
}
