import React from "react";
import { cn } from "@/lib/utils";

/** Text input / select / textarea styling used inside the portal. */
export function inputClass(hasError?: boolean, extra?: string) {
  return cn(
    "block w-full rounded-xl border bg-white px-3.5 text-sm text-[#1B2A4A] placeholder:text-zinc-400 transition-colors",
    "focus:outline-none focus:ring-4 disabled:bg-zinc-50 disabled:text-zinc-500",
    hasError
      ? "border-[#C41E2A] focus:border-[#C41E2A] focus:ring-[#C41E2A]/10"
      : "border-zinc-300 hover:border-zinc-400 focus:border-[#1B2A4A] focus:ring-[#1B2A4A]/10",
    extra
  );
}

/** Label + control + hint/error. */
export default function Field({
  id,
  label,
  optional,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#1B2A4A]">
        {label}
        {optional && <span className="ml-1 font-normal text-zinc-400">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] font-medium text-[#C41E2A]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
