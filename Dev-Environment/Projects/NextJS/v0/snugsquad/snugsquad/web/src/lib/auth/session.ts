import { log, trackError, trackAuthEvent } from "../observability";

export interface SessionData {
  userId: string;
  email: string;
  role: "admin" | "client" | "employee" | "contractor";
  mfaComplete: boolean;
  issuedAt: number;
  expiresAt: number;
  refreshToken?: string;
}

export interface SessionConfig {
  maxAge: number; // Session max age in milliseconds
  refreshThreshold: number; // Refresh when this much time is left
  secure: boolean; // Use secure cookies in production
}

const DEFAULT_CONFIG: SessionConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  refreshThreshold: 5 * 60 * 1000, // 5 minutes
  secure: process.env.NODE_ENV === "production"
};

export class SessionManager {
  private config: SessionConfig;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create a new session with proper lifecycle management
   */
  createSession(sessionData: Omit<SessionData, "issuedAt" | "expiresAt">): SessionData {
    const now = Date.now();
    const session: SessionData = {
      ...sessionData,
      issuedAt: now,
      expiresAt: now + this.config.maxAge
    };

    this.setSessionCookie(session);
    log.info("Session created", { userId: session.userId, role: session.role });
    trackAuthEvent("session_created", session.userId, { role: session.role });
    
    return session;
  }

  /**
   * Validate and refresh session if needed
   */
  validateSession(): SessionData | null {
    try {
      const session = this.getSessionFromCookie();
      if (!session) {
        return null;
      }

      const now = Date.now();
      
      // Check if session is expired
      if (now > session.expiresAt) {
        this.destroySession();
        log.warn("Session expired", { userId: session.userId });
        trackAuthEvent("session_expired", session.userId);
        return null;
      }

      // Check if session needs refresh
      if (session.expiresAt - now < this.config.refreshThreshold) {
        log.info("Refreshing session", { userId: session.userId });
        this.refreshSession(session);
      }

      return session;
    } catch (error) {
      log.error("Session validation error", { error });
      trackError(error instanceof Error ? error : new Error(String(error)), {
        action: "session_validation"
      });
      return null;
    }
  }

  /**
   * Refresh session by extending expiration time
   */
  private refreshSession(session: SessionData): void {
    const now = Date.now();
    const refreshedSession: SessionData = {
      ...session,
      issuedAt: now,
      expiresAt: now + this.config.maxAge
    };

    this.setSessionCookie(refreshedSession);
    log.info("Session refreshed", { userId: session.userId });
    trackAuthEvent("session_refreshed", session.userId);
  }

  /**
   * Destroy session and clear cookies
   */
  destroySession(): void {
    // Clear all auth-related cookies
    const cookies = ["session", "role", "mfa", "refreshToken"];
    cookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${this.config.secure ? 'secure; ' : ''}samesite=strict`;
    });

    // Also clear from localStorage if used
    if (typeof window !== "undefined") {
      localStorage.removeItem("session_data");
      sessionStorage.clear();
    }

    log.info("Session destroyed");
    trackAuthEvent("session_destroyed");
  }

  /**
   * Set session data in secure HTTP-only cookie
   */
  private setSessionCookie(session: SessionData): void {
    const cookieValue = JSON.stringify(session);
    const cookieOptions = [
      `path=/`,
      `max-age=${Math.floor(this.config.maxAge / 1000)}`,
      `samesite=strict`,
      `httponly`
    ];

    if (this.config.secure) {
      cookieOptions.push("secure");
    }

    // Note: In production, this should be set server-side via Set-Cookie header
    // This is a client-side fallback for development
    if (typeof document !== "undefined") {
      document.cookie = `session=${encodeURIComponent(cookieValue)}; ${cookieOptions.join("; ")}`;
    }
  }

  /**
   * Get session data from cookie
   */
  private getSessionFromCookie(): SessionData | null {
    try {
      if (typeof document === "undefined") return null;
      
      const cookies = document.cookie.split(";");
      const sessionCookie = cookies.find(cookie => cookie.trim().startsWith("session="));
      
      if (!sessionCookie) return null;
      
      const sessionValue = sessionCookie.split("=")[1];
      const session: SessionData = JSON.parse(decodeURIComponent(sessionValue));
      
      return session;
    } catch (error) {
      log.error("Failed to parse session cookie", { error });
      return null;
    }
  }

  /**
   * Check if session is about to expire
   */
  isSessionExpiringSoon(session: SessionData): boolean {
    const now = Date.now();
    return session.expiresAt - now < this.config.refreshThreshold;
  }

  /**
   * Get session age in milliseconds
   */
  getSessionAge(session: SessionData): number {
    return Date.now() - session.issuedAt;
  }

  /**
   * Get time until session expires in milliseconds
   */
  getTimeUntilExpiry(session: SessionData): number {
    return session.expiresAt - Date.now();
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Export utility functions for easy use
export const {
  createSession,
  validateSession,
  destroySession,
  isSessionExpiringSoon,
  getSessionAge,
  getTimeUntilExpiry
} = sessionManager;
