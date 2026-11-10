"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PadSheet, PadStack } from "@/components/landing/supplier/pad/OrderPad";
import Stamp from "@/components/landing/supplier/pad/Stamp";

/**
 * Signup's right-hand panel: the supplier's own price-list pad, filling in as
 * they type. Shows only what restaurants would see (never email or password).
 */

export type LetterheadData = {
  fullName: string;
  phone: string;
  supplierName: string;
  supplierCategory: string;
  supplierAddress: string;
  supplierDeliveryTerms: string;
  supplierGst: string;
};

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** One line of the letterhead: the typed value prints in, or a faint hint waits on a ruled blank. */
function Blank({ value, hint, className = "" }: { value: string; hint: string; className?: string }) {
  const reduce = useReducedMotion();
  const text = value.trim();
  return (
    <span className="relative block min-h-[1.6em]">
      <AnimatePresence initial={false} mode="wait">
        {text ? (
          <motion.span
            key="value"
            className={`block truncate ${className}`}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            {text}
          </motion.span>
        ) : (
          <motion.span
            key="hint"
            className="pad-hand block border-b border-dashed border-[var(--pad-rule-strong)] text-[15px] text-[#56657C]/70"
            initial={false}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
          >
            {hint}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56657C]">{children}</span>;
}

export default function LetterheadPad({ data, done }: { data: LetterheadData; done: boolean }) {
  const contact = [data.fullName.trim(), data.phone.trim()].filter(Boolean).join(" · ");
  // Whole first line (the sheet truncates it), not just the part before the first comma
  const firstAddressLine = data.supplierAddress.split("\n")[0] ?? "";

  return (
    <div className="flex h-full min-h-dvh flex-col justify-center px-12 py-16 xl:px-20">
      <div className="mx-auto w-full max-w-[28rem]">
        <p className="mb-6 text-[15px] leading-relaxed text-[#46556C]">
          This is how your listing looks to restaurants. It fills in as you type.
        </p>

        <div className="rotate-[1deg]" aria-hidden>
          <PadStack title="Price list" tag="Preview">
            <PadSheet>
              <div className="relative">
                {/* Letterhead */}
                <Blank
                  value={data.supplierName}
                  hint="your business name"
                  className="font-stamp text-[30px] font-extrabold uppercase leading-none tracking-[0.06em] text-[#1B2A4A]"
                />
                <div className="mt-2">
                  <Blank value={data.supplierCategory} hint="what you supply" className="pad-mono text-[13px] text-[#C41E2A]" />
                </div>

                <div className="mt-4 grid grid-cols-[1fr_auto] gap-x-5 gap-y-3 border-y border-[var(--pad-rule-strong)] py-3">
                  <div className="min-w-0">
                    <Label>Dispatch from</Label>
                    <Blank value={firstAddressLine} hint="your address" className="pad-mono text-[13px] text-[#1B2A4A]" />
                  </div>
                  <div className="min-w-0 text-right">
                    <Label>GSTIN</Label>
                    <Blank value={data.supplierGst.toUpperCase()} hint="optional" className="pad-mono text-[13px] text-[#1B2A4A]" />
                  </div>
                  <div className="col-span-2 min-w-0">
                    <Label>Orders</Label>
                    <Blank value={contact} hint="your name · phone" className="pad-mono text-[13px] text-[#1B2A4A]" />
                  </div>
                </div>

                <div className="mt-3">
                  <Blank
                    value={data.supplierDeliveryTerms}
                    hint="delivery & payment terms"
                    className="pad-hand text-[17px] font-bold text-[#C41E2A]"
                  />
                </div>

                {/* Empty price list, waiting for products */}
                <div className="mt-4 border-t border-[var(--pad-rule-strong)]">
                  <p className="pad-hand border-b border-[var(--pad-rule)] py-2 text-[16px] text-[#C41E2A]">
                    your first product goes here
                  </p>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-9 border-b border-[var(--pad-rule)]" />
                  ))}
                </div>

                <div className="h-20" />
                <div className="absolute bottom-1 right-1">
                  <Stamp label="Ready for orders" tone="navy" rotate={-6} show={done} />
                </div>
              </div>
            </PadSheet>
          </PadStack>
        </div>
      </div>
    </div>
  );
}
