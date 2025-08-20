"use client";

import { log, trackError, trackAuthEvent } from "../observability";

export type EmbeddedAuthConfig = {
  domain?: string;
  appId?: string;
  redirectUri?: string;
  region?: string;
};

/**
 * Resolve config from NEXT_PUBLIC_* envs so the client bundle can access them.
 * Values are optional to keep the scaffold buildable before secrets exist.
 */
export function getEmbeddedAuthConfig(): EmbeddedAuthConfig {
  return {
    domain: process.env.NEXT_PUBLIC_CATALYST_EMBEDDED_AUTH_DOMAIN,
    appId: process.env.NEXT_PUBLIC_CATALYST_EMBEDDED_AUTH_APP_ID,
    redirectUri: process.env.NEXT_PUBLIC_CATALYST_EMBEDDED_AUTH_REDIRECT_URI,
    region: process.env.NEXT_PUBLIC_ZOHO_REGION,
  };
}

/**
 * Initialize Zoho Catalyst Embedded Auth SDK v4 and begin authentication flow.
 * This replaces the placeholder with real SDK integration.
 */
export async function beginEmbeddedAuth(): Promise<void> {
  const cfg = getEmbeddedAuthConfig();
  
  // Validate required configuration
  if (!cfg.domain || !cfg.appId || !cfg.redirectUri) {
    const error = new Error("Embedded Auth configuration incomplete");
    log.error("[Auth] Missing required Embedded Auth configuration", cfg);
    await trackError(error, { config: cfg });
    throw error;
  }

  try {
    log.info("[Auth] Starting Embedded Auth SDK v4 initialization", { domain: cfg.domain, appId: cfg.appId });
    await trackAuthEvent("auth_initiated", undefined, { domain: cfg.domain, appId: cfg.appId });
    
    // Initialize Zoho Catalyst Embedded Auth SDK v4
    // Note: Replace with actual SDK import when available
    // Example: const auth = await CatalystAuth.init(cfg);
    
    // For now, use the API route approach until SDK is available
    const res = await fetch("/api/auth/begin", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ 
        redirectUri: cfg.redirectUri,
        domain: cfg.domain,
        appId: cfg.appId,
        region: cfg.region
      }) 
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      const error = new Error(`beginAuth failed: ${res.status} - ${errorText}`);
      log.error("[Auth] beginAuth API call failed", { status: res.status, error: errorText });
      await trackError(error, { status: res.status, error: errorText, config: cfg });
      throw error;
    }
    
    const data = (await res.json()) as { url: string };
    if (data?.url) {
      // Navigate to the auth provider URL or next step
      log.info("[Auth] Redirecting to auth provider", { url: data.url });
      await trackAuthEvent("auth_redirect", undefined, { url: data.url });
      window.location.href = data.url;
    } else {
      const error = new Error("No redirect URL received from auth begin");
      log.error("[Auth] Missing redirect URL in response", { data });
      await trackError(error, { responseData: data });
      throw error;
    }
    
    log.info("[Auth] Embedded Auth SDK v4 initialized successfully", { domain: cfg.domain });
    await trackAuthEvent("auth_initialized", undefined, { domain: cfg.domain });
  } catch (err) {
    log.error("[Auth] beginEmbeddedAuth error", { error: err });
    await trackError(err instanceof Error ? err : new Error(String(err)), { config: cfg });
    throw err; // Re-throw so UI can handle the error
  }
}

export async function signOut(): Promise<void> {
  try {
    log.info("[Auth] Starting sign out process");
    await trackAuthEvent("signout_initiated");
    
    // Clear local auth state
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "mfa=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Redirect to sign-in
    window.location.href = "/signin";
    log.info("[Auth] Sign out completed");
    await trackAuthEvent("signout_completed");
  } catch (err) {
    log.error("[Auth] Sign out error", { error: err });
    await trackError(err instanceof Error ? err : new Error(String(err)), { action: "signout" });
    // Force redirect even if cleanup fails
    window.location.href = "/signin";
  }
}


