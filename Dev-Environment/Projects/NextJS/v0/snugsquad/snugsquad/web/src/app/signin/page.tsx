"use client";

import { beginEmbeddedAuth } from "@/lib/auth/client";
import { log, trackError, trackUserAction } from "@/lib/observability";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [step, setStep] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("step");
    if (s) setStep(s);
    
    // Track page view
    trackUserAction("signin_page_viewed");
  }, []);

  async function handleBeginAuth() {
    setLoading(true);
    setError(null);
    
    try {
      await beginEmbeddedAuth();
      await trackUserAction("auth_initiated");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      log.error("Sign-in failed", { error: err });
      await trackError(err instanceof Error ? err : new Error(String(err)), { action: "begin_auth" });
    } finally {
      setLoading(false);
    }
  }

  async function startMfa() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/auth/mfa/begin", { method: "POST" });
      if (!res.ok) {
        throw new Error(`MFA start failed: ${res.status}`);
      }
      
      const data = (await res.json()) as { challengeId: string };
      setChallengeId(data.challengeId);
      setStep("mfa-verify");
      await trackUserAction("mfa_initiated");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "MFA start failed";
      setError(errorMessage);
      log.error("MFA start failed", { error: err });
      await trackError(err instanceof Error ? err : new Error(String(err)), { action: "mfa_start" });
    } finally {
      setLoading(false);
    }
  }

  async function verifyMfa() {
    if (code.length !== 6) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/auth/mfa/verify", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, code })
      });
      
      if (!res.ok) {
        throw new Error(`MFA verification failed: ${res.status}`);
      }
      
      await trackUserAction("mfa_verified");
      const next = new URLSearchParams(window.location.search).get("next") || "/client-dashboard";
      window.location.href = next;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "MFA verification failed";
      setError(errorMessage);
      log.error("MFA verification failed", { error: err });
      await trackError(err instanceof Error ? err : new Error(String(err)), { action: "mfa_verify" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {!step && (
        <>
          <p className="mb-4 text-sm text-gray-600">
            This is a placeholder sign-in flow for Zoho Catalyst Embedded Auth SDK v4.
          </p>
          <button 
            className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            onClick={handleBeginAuth}
            disabled={loading}
          >
            {loading ? "Starting..." : "Continue with Zoho"}
          </button>
        </>
      )}
      
      {step === "mfa" && (
        <>
          <p className="mb-4 text-sm text-gray-600">Start MFA challenge to continue.</p>
          <button 
            className="rounded-md bg-blue-600 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            onClick={startMfa}
            disabled={loading}
          >
            {loading ? "Starting MFA..." : "Start MFA"}
          </button>
        </>
      )}
      
      {step === "mfa-verify" && (
        <>
          <p className="mb-2 text-sm text-gray-600">Enter the 6-digit code from your authenticator.</p>
          <input
            className="border px-3 py-2 rounded w-full mb-3"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-label="MFA code"
            disabled={loading}
          />
          <button 
            className="rounded-md bg-green-600 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            onClick={verifyMfa} 
            disabled={code.length !== 6 || loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
          {challengeId && (
            <p className="text-xs text-gray-500 mt-2">Challenge: {challengeId}</p>
          )}
        </>
      )}
    </div>
  );
}


