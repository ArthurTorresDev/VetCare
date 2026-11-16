import type { Request, Response, NextFunction } from 'express';
export type {
  Appointment,
  AppointmentDetailedView,
  AppointmentStatus,
  Client,
  Pet,
  ClinicService,
  AuditLogEntry,
  EmailNotification,
  User,
  PublicUser,
  UserRole,
  AuthResponse,
  LoginDTO,
  RegisterUserDTO,
  UpdateUserDTO,
  TokenPayload,
} from '@vetcare/shared';

export type RouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
