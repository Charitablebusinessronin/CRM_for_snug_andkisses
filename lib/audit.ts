// This utility provides a simple way to log audit events from anywhere in the application.

interface LogEventOptions {
  action: string;
  userId: string;
  details?: Record<string, any>;
}

export async function logAuditEvent(options: LogEventOptions): Promise<void> {
  const { action, userId, details = {} } = options;

  try {
    // We use a 'fire-and-forget' approach for audit logging.
    // We don't want to block the user's action waiting for the log to complete.
    fetch('/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        userId,
        details,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // In a production environment, you might want to log this failure to a separate monitoring service.
    // For now, we'll just log it to the console.
    console.error('Failed to log audit event:', error);
  }
}
