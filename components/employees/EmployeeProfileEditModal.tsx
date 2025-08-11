"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingButton from "@/components/common/loading-button";

export type EmployeeProfile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  initial?: EmployeeProfile; // optional prefilled data
  onSaved?: (profile: EmployeeProfile) => void;
};

export default function EmployeeProfileEditModal({ open, onOpenChange, employeeId, initial, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<EmployeeProfile>({
    firstName: initial?.firstName || "",
    lastName: initial?.lastName || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    title: initial?.title || "",
    department: initial?.department || "",
  });

  useEffect(() => {
    if (open && initial) setProfile({ ...initial });
  }, [open, initial?.firstName, initial?.lastName, initial?.email, initial?.phone, initial?.title, initial?.department]);

  const update = (patch: Partial<EmployeeProfile>) => setProfile(prev => ({ ...(prev || {}), ...patch }));

  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/hr/employees/${encodeURIComponent(employeeId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || json?.message || "Failed to update profile");
      }
      toast.success("Employee profile updated");
      onSaved?.(json.data ?? profile);
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
      <div className="w-full max-w-xl rounded-md bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Employee Profile</h2>
          <button onClick={() => onOpenChange(false)} className="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Close">✕</button>
        </div>

        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <label className="space-y-1">
            <span className="text-sm">First Name</span>
            <input className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" value={profile.firstName || ""} onChange={(e) => update({ firstName: e.target.value })} />
          </label>
          <label className="space-y-1">
            <span className="text-sm">Last Name</span>
            <input className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" value={profile.lastName || ""} onChange={(e) => update({ lastName: e.target.value })} />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm">Email</span>
            <input type="email" className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" value={profile.email || ""} onChange={(e) => update({ email: e.target.value })} />
          </label>
          <label className="space-y-1">
            <span className="text-sm">Phone</span>
            <input className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" value={profile.phone || ""} onChange={(e) => update({ phone: e.target.value })} />
          </label>
          <label className="space-y-1">
            <span className="text-sm">Title</span>
            <input className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" value={profile.title || ""} onChange={(e) => update({ title: e.target.value })} />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm">Department</span>
            <input className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" value={profile.department || ""} onChange={(e) => update({ department: e.target.value })} />
          </label>

          <div className="sm:col-span-2 mt-4 flex items-center justify-end gap-3">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded border px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">Cancel</button>
            <LoadingButton loading={saving} type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60">Save</LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
