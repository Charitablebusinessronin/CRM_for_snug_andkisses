"use client";
import { apiPost } from "@/lib/api-client";

export type QuickActionRequest = {
  action: string;
  params?: Record<string, any>;
};

export async function runQuickAction<T = any>(req: QuickActionRequest) {
  // Try the v1 quick-actions endpoint first
  try {
    return await apiPost<typeof req, T>(
      "/api/v1/quick-actions",
      req,
    );
  } catch (error) {
    // If that fails, try the v2 endpoint as fallback
    console.warn('V1 quick actions failed, trying V2:', error);
    return apiPost<typeof req, T>(
      "/api/v2/shared/quick-actions",
      req,
    );
  }
}

export async function ziaChat<T = any>(message: string, userId?: string) {
  return apiPost<{ message: string; userId?: string }, T>(
    "/api/v2/shared/zia/chat",
    { message, userId },
  );
}

export const ActionPhrases: Array<{ match: RegExp; to: QuickActionRequest | ((m: RegExpMatchArray) => QuickActionRequest) }> = [
  // Status updates
  { match: /update my status to available/i, to: { action: "updateAvailability", params: { status: "Available" } } },
  { match: /mark me as unavailable|set me as off[- ]duty|go off[- ]duty/i, to: { action: "updateAvailability", params: { status: "Unavailable" } } },

  // CRM quick updates
  { match: /mark client as contacted/i, to: { action: "updateStatus", params: { entity: "client", status: "Contacted" } } },

  // Reminders and follow-ups
  { match: /schedule follow (up)? for tomorrow/i, to: { action: "createQuickTask", params: { title: "Follow up", dueDate: new Date(Date.now() + 24*60*60*1000).toISOString() } } },
  { match: /remind me to call (.+) tomorrow/i, to: (m) => ({ action: "createQuickTask", params: { title: `Call ${m[1]}`.trim(), dueDate: new Date(Date.now() + 24*60*60*1000).toISOString() } }) },

  // Appointments
  { match: /what'?s my next appointment/i, to: { action: "getUpcomingAppointments", params: { days: 1 } } },
  { match: /send appointment reminder to (.+)/i, to: (m) => ({ action: "createQuickTask", params: { title: `Send appointment reminder to ${m[1]}`.trim(), dueDate: new Date().toISOString() } }) },
];

export function mapPhraseToAction(input: string): QuickActionRequest | null {
  for (const p of ActionPhrases) {
    const m = input.match(p.match);
    if (m) {
      return typeof p.to === "function" ? p.to(m) : p.to;
    }
  }
  return null;
}
