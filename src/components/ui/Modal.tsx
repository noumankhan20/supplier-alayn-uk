"use client";

import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Buttons along the bottom */
  footer?: React.ReactNode;
  size?: "md" | "lg";
}

/**
 * Dialog with a header, scrollable body and fixed footer. Closes on Escape or a
 * click on the backdrop; slides up from the bottom on phones.
 */
export default function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    // Focus the first field (or the panel) so keyboard users land inside the dialog
    requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        "[autofocus], input:not([type=hidden]), select, textarea"
      );
      (first ?? panelRef.current)?.focus();
    });
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B1221]/60 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl outline-none sm:rounded-2xl",
          size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold text-[#1B2A4A]">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-0.5 text-sm text-zinc-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Button styles shared by modal footers and pages. */
export const btn = {
  primary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#C41E2A] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#A81822] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C41E2A]/25 disabled:opacity-60",
  dark:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1B2A4A] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#121c33] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1B2A4A]/25 disabled:opacity-60",
  secondary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-[#1B2A4A] transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1B2A4A]/10 disabled:opacity-60",
  danger:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-600/25 disabled:opacity-60",
  ghostDanger:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60",
};
