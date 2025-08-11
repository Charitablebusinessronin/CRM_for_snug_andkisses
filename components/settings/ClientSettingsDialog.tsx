"use client";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import LoadingButton from "@/components/common/loading-button";
import { formatDisplay } from "@/lib/date-utils";

export type ClientSettings = {
  notifications?: { email?: boolean; sms?: boolean; push?: boolean };
  timezone?: string;
  dateFormat?: string;
  language?: string;
  updatedAt?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string; // optional, will default to 'anonymous' on API
  onSaved?: (settings: ClientSettings) => void;
};

export default function ClientSettingsDialog({ open, onOpenChange, userId, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ClientSettings | null>(null);

  // Derived display values
  const lastUpdated = useMemo(() => (settings?.updatedAt ? formatDisplay(settings.updatedAt) : "Never"), [settings?.updatedAt]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/client/settings", {
          headers: userId ? { "x-user-id": userId } : undefined,
        });
        const json = await res.json();
        if (!res.ok || json?.ok === false) {
          throw new Error(json?.error || json?.message || "Failed to load settings");
        }
        if (!cancelled) setSettings(json.data ?? json);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, userId]);

  const updateSettings = (patch: Partial<ClientSettings>) => {
    setSettings(prev => ({ ...(prev || {}), ...patch }));
  };

  const onSubmit = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/client/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { "x-user-id": userId } : {}),
        },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || json?.message || "Failed to update settings");
      }
      setSettings(json.data ?? settings);
      toast.success("Settings updated");
      onSaved?.(json.data ?? settings);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-md bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Client Settings</h2>
          <button onClick={() => onOpenChange(false)} className="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Close">✕</button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading settings…</div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Notifications</legend>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!settings?.notifications?.email}
                  onChange={(e) => updateSettings({ notifications: { ...(settings?.notifications || {}), email: e.target.checked } })}
                />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!settings?.notifications?.sms}
                  onChange={(e) => updateSettings({ notifications: { ...(settings?.notifications || {}), sms: e.target.checked } })}
                />
                <span className="text-sm">SMS</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!settings?.notifications?.push}
                  onChange={(e) => updateSettings({ notifications: { ...(settings?.notifications || {}), push: e.target.checked } })}
                />
                <span className="text-sm">Push</span>
              </label>
            </fieldset>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm">Timezone</span>
                <input
                  className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={settings?.timezone || ""}
                  onChange={(e) => updateSettings({ timezone: e.target.value })}
                  placeholder="e.g. America/New_York"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Date Format</span>
                <input
                  className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={settings?.dateFormat || ""}
                  onChange={(e) => updateSettings({ dateFormat: e.target.value })}
                  placeholder="e.g. MMM d, yyyy"
                />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-sm">Language</span>
                <input
                  className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={settings?.language || ""}
                  onChange={(e) => updateSettings({ language: e.target.value })}
                  placeholder="e.g. en-US"
                />
              </label>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-neutral-500">
              <span>Last updated: {lastUpdated}</span>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => onOpenChange(false)} className="rounded border px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">Cancel</button>
              <LoadingButton loading={saving} type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60">
                Save Changes
              </LoadingButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
