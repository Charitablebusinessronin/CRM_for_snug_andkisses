import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { redactObject } from '../utils/redact';
import { logger } from '../utils/logger';

// Minimal shape for user on request set by auth middleware
interface MaybeUser {
  id?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

function pickHeaders(headers: Request['headers']) {
  const allow = ['user-agent', 'x-forwarded-for', 'x-real-ip', 'accept', 'content-type'];
  const out: Record<string, any> = {};
  for (const k of allow) {
    const v = headers[k];
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export function hipaaAuditMiddleware(req: Request, res: Response, next: NextFunction) {
  // Gate via env flag
  if (String(process.env.HIPAA_AUDIT_LOGGING).toLowerCase() !== 'true') {
    return next();
  }

  const startedAt = Date.now();
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  // Expose correlation id
  res.setHeader('X-Correlation-Id', correlationId);
  (res.locals as any).correlationId = correlationId;

  const user = (req as any).user as MaybeUser | undefined;

  // Pre-request minimal audit event (do not log body until redacted)
  const requestMeta = {
    event: 'request_received',
    correlationId,
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
    user: user ? { id: user.id, email: user.email, role: user.role } : undefined,
    headers: pickHeaders(req.headers),
  };
  logger.info('HIPAA audit: request', requestMeta);

  // On response finish, log full redacted audit
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;

    const payload = {
      event: 'request_completed',
      correlationId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      user: user ? { id: user.id, email: user.email, role: user.role } : undefined,
      request: {
        params: redactObject(req.params),
        query: redactObject(req.query),
        body: redactObject(req.body),
        headers: pickHeaders(req.headers),
      },
    };

    // Use info level for success, warn for client errors, error for server errors
    if (res.statusCode >= 500) {
      logger.error('HIPAA audit: response', payload);
    } else if (res.statusCode >= 400) {
      logger.warn('HIPAA audit: response', payload);
    } else {
      logger.info('HIPAA audit: response', payload);
    }
  });

  next();
}
