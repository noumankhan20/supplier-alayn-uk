"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import Stamp, { type StampTone } from "./Stamp";

/* Sample data. Every order, name and rate on the landing is an example. */

export const PO_LINES = [
  { item: "Paneer", qty: "5 kg", rate: "₹320", amount: "₹1,600" },
  { item: "Curd", qty: "10 kg", rate: "₹95", amount: "₹950" },
  { item: "Milk", qty: "20 L", rate: "₹85", amount: "₹1,700" },
] as const;

export const PO_TOTAL = "₹4,250";

export type StampSpec = {
  label: string;
  sub?: string;
  tone: StampTone;
  rotate: number;
  /** Tailwind position classes inside the sheet. */
  at: string;
  show: boolean;
  delay?: number;
};

const COLS = "grid grid-cols-[minmax(0,1fr)_3.6rem_3.4rem_5.2rem] gap-x-2";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

function PrintedLabel({ children }: { children: React.ReactNode }) {
  return <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56657C]">{children}</span>;
}

/**
 * The purchase order a restaurant sends. Lines can "type" in one by one
 * (linesShown), dispatch ticks can be marked (dispatch), and stamps land on top.
 */
export function PurchaseOrderSheet({
  linesShown = PO_LINES.length,
  showTotal = true,
  dispatch = false,
  dispatchDelay = 0,
  stamps = [],
  compact = false,
  stampRoom = "h-20 sm:h-24",
}: {
  /** Hide the from/date/deliver-to block on phones so the lines and stamp fit the first screen. */
  compact?: boolean;
  /** Height class for the empty foot of the sheet where stamps land. */
  stampRoom?: string;
  linesShown?: number;
  showTotal?: boolean;
  /** Show the partial-dispatch marks: first two sent, milk later. */
  dispatch?: boolean;
  dispatchDelay?: number;
  stamps?: StampSpec[];
}) {
  const reduce = useReducedMotion();
  return (
    <div className="relative">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-stamp text-[15px] font-bold uppercase tracking-[0.16em] text-[#1B2A4A]">Purchase order</span>
        <span className="pad-mono text-[15px] font-semibold text-[#C41E2A]">Nº 1042</span>
      </div>

      <div className={`mt-3 ${compact ? "hidden sm:grid" : "grid"} grid-cols-[1.4fr_1fr] gap-x-4 gap-y-2 border-y border-[var(--pad-rule-strong)] py-2.5`}>
        <div>
          <PrintedLabel>From</PrintedLabel>
          <span className="pad-mono text-[13px] text-[#1B2A4A]">Sea Breeze Café</span>
        </div>
        <div>
          <PrintedLabel>Date</PrintedLabel>
          <span className="pad-mono text-[13px] text-[#1B2A4A]">12 Nov</span>
        </div>
        <div className="col-span-2">
          <PrintedLabel>Deliver to</PrintedLabel>
          <span className="pad-mono text-[13px] text-[#1B2A4A]">Bandra West outlet</span>
        </div>
      </div>

      <p className="sr-only">
        Example purchase order from Sea Breeze Café: paneer 5 kg, curd 10 kg and milk 20 litres, total {PO_TOTAL}.
      </p>
      <div aria-hidden className="mt-2">
        <div className={`${COLS} border-b border-[var(--pad-rule-strong)] py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56657C]`}>
          <span>Item</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="pad-mono text-[13px] text-[#1B2A4A] sm:text-[14px]">
          {PO_LINES.map((l, i) => {
            const shown = i < linesShown;
            const later = dispatch && i === 2;
            return (
              <motion.div
                key={l.item}
                className={`${COLS} border-b border-[var(--pad-rule)] py-2`}
                initial={false}
                animate={{ clipPath: shown ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
                transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE_OUT }}
              >
                <span className="flex items-center gap-1.5">
                  {dispatch && !later ? (
                    <motion.span
                      aria-label="sent"
                      className="text-[#1B2A4A]"
                      initial={reduce ? false : { opacity: 0, scale: 0.3 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: dispatchDelay + i * 0.18, type: "spring", stiffness: 500, damping: 22 }}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </motion.span>
                  ) : null}
                  {l.item}
                </span>
                <span className="text-right">{l.qty}</span>
                <span className="text-right">{l.rate}</span>
                <span className="text-right">
                  {later ? (
                    <motion.span
                      className="pad-hand inline-block -rotate-3 text-[15px] font-bold leading-none text-[#C41E2A]"
                      initial={reduce ? false : { opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dispatchDelay + 0.45, duration: 0.35, ease: EASE_OUT }}
                    >
                      rest 14 Nov
                    </motion.span>
                  ) : (
                    l.amount
                  )}
                </span>
              </motion.div>
            );
          })}
        </div>
        <motion.div
          initial={false}
          animate={{ opacity: showTotal ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.3 }}
          className="mt-[3px] flex items-baseline justify-between border-t-[3px] border-double border-[var(--pad-rule-strong)] pt-2.5"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#56657C]">Total</span>
          <span className="pad-mono text-[15px] font-semibold text-[#1B2A4A]">{PO_TOTAL}</span>
        </motion.div>
      </div>

      {/* Room at the foot of the sheet for stamps */}
      <div className={stampRoom} />
      {stamps.map((s) => (
        <div key={s.label} className={`absolute ${s.at}`}>
          <Stamp label={s.label} sub={s.sub} tone={s.tone} rotate={s.rotate} show={s.show} delay={s.delay} />
        </div>
      ))}
    </div>
  );
}

export const RATE_ROWS = [
  { item: "Fresh Paneer", rate: "₹320 / kg", min: "Min 2 kg", eta: "24h", out: false },
  { item: "Curd", rate: "₹95 / kg", min: "Min 5 kg", eta: "24h", out: false },
  { item: "Milk", rate: "₹85 / L", min: "Min 10 L", eta: "24h", out: false },
  { item: "Ghee", rate: "₹640 / kg", min: "Min 1 kg", eta: "48h", out: true },
] as const;

/** The supplier's own price list page. */
export function RateCardSheet({ play = true }: { play?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-stamp text-[15px] font-bold uppercase tracking-[0.16em] text-[#1B2A4A]">Price list</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#56657C]">Your catalog</span>
      </div>
      <ul className="mt-3 border-t border-[var(--pad-rule-strong)]">
        {RATE_ROWS.map((r) => (
          <li key={r.item} className="relative grid grid-cols-[1fr_auto] items-baseline gap-x-3 border-b border-[var(--pad-rule)] py-2.5">
            <span className={`text-[14px] font-semibold text-[#1B2A4A] ${r.out ? "text-[#1B2A4A]/45" : ""}`}>{r.item}</span>
            <span className={`pad-mono text-[14px] font-semibold text-[#1B2A4A] ${r.out ? "opacity-45" : ""}`}>{r.rate}</span>
            <span className={`pad-mono col-span-2 text-[11.5px] text-[#56657C] ${r.out ? "opacity-60" : ""}`}>
              {r.min} · Delivers in {r.eta}
            </span>
            {r.out ? (
              <motion.span
                aria-hidden
                className="absolute left-0 right-0 top-1/2 h-[2px] origin-left bg-[#C41E2A]/80"
                initial={false}
                animate={{ scaleX: play ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { delay: 0.5, duration: 0.45, ease: EASE_OUT }}
              />
            ) : null}
            {r.out ? (
              <motion.span
                className="pad-hand absolute -right-1 -top-1.5 rotate-[-4deg] text-[15px] font-bold text-[#C41E2A]"
                initial={false}
                animate={{ opacity: play ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { delay: 0.85, duration: 0.3 }}
              >
                out of stock
              </motion.span>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="h-6" />
    </div>
  );
}
