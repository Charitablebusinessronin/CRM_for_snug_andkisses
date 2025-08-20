export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  ts: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

function format(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  const ts = new Date().toISOString();
  return { 
    ts, 
    level, 
    message, 
    meta,
    // TODO: Extract from context when available
    userId: undefined,
    sessionId: undefined,
    requestId: undefined
  };
}

export const log = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    const entry = format("debug", message, meta);
    console.debug("[DEBUG]", entry);
    return entry;
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    const entry = format("info", message, meta);
    console.info("[INFO]", entry);
    return entry;
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    const entry = format("warn", message, meta);
    console.warn("[WARN]", entry);
    return entry;
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    const entry = format("error", message, meta);
    console.error("[ERROR]", entry);
    return entry;
  },
};

export async function audit(action: string, meta?: Record<string, unknown>) {
  try {
    // Log locally for development
    log.info(`[audit] ${action}`, meta);
    
    // Avoid network calls from Middleware/Edge runtime to prevent URL parsing
    // errors and infinite recursion through the middleware matcher.
    const isEdgeRuntime = typeof (globalThis as unknown as { EdgeRuntime?: string }).EdgeRuntime !== "undefined";
    if (isEdgeRuntime) {
      return;
    }

    // Resolve absolute base URL for server/client environments
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`);

    // POST to audit endpoint (will forward to Catalyst in production)
    const res = await fetch(`${baseUrl}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...meta }),
    });
    
    if (!res.ok) {
      log.warn("Audit endpoint failed", { action, status: res.status });
    }
  } catch (err) {
    log.error("Audit logging failed", { action, error: err });
  }
}

export async function trackError(error: Error, context?: Record<string, unknown>) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  };
  
  log.error("Application error", errorInfo);
  await audit("error_occurred", errorInfo);
}

export async function trackUserAction(action: string, userId?: string, meta?: Record<string, unknown>) {
  const auditData = { action, userId, ...meta };
  log.info(`User action: ${action}`, auditData);
  await audit("user_action", auditData);
}

export async function trackAuthEvent(event: string, userId?: string, meta?: Record<string, unknown>) {
  const auditData = { event, userId, ...meta };
  log.info(`Auth event: ${event}`, auditData);
  await audit("auth_event", auditData);
}


