"use client";
import React from "react";

export type UnifiedActionVariant = "primary" | "secondary";

export interface ActionButtonProps {
  title: string;
  icon?: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  variant?: UnifiedActionVariant;
  className?: string;
}

const base =
  "flex items-center justify-center gap-3 p-4 rounded-lg transition-all duration-200 font-medium min-h-[56px] w-full";
const primary = "bg-blue-600 hover:bg-blue-700 text-white";
const secondary = "bg-gray-100 hover:bg-gray-200 text-gray-700";

export default function UnifiedActionButton({
  title,
  icon,
  onClick,
  loading = false,
  variant = "primary",
  className = "",
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={[
        base,
        variant === "primary" ? primary : secondary,
        loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-md",
        className,
      ].join(" ")}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
      ) : (
        <>
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </>
      )}
    </button>
  );
}
