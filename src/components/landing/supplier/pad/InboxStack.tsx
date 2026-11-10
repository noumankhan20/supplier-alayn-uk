"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * A fanned stack of purchase orders under a "To do" tab. Shared by the
 * landing page ("One inbox for every order") and the login panel. Sample data.
 */

function usePlay<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });
  const reduce = useReducedMotion();
  return { ref, play: inView || !!reduce, reduce: !!reduce };
}

function Mono({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pad-mono ${className}`}>{children}</span>;
}

/* ---------- One inbox: a fanned stack of orders under a "To do" tab ---------- */
export default function InboxStack() {
  const { ref, play, reduce } = usePlay<HTMLDivElement>();
  const orders = [
    { po: "1042", who: "Sea Breeze Café", where: "Bandra", total: "₹4,250", state: "New" },
    { po: "1039", who: "Spice Route Kitchen", where: "Andheri", total: "₹3,780", state: "Packing" },
    { po: "1031", who: "The Corner Bakery", where: "Powai", total: "₹2,960", state: "2 of 3 sent" },
  ];
  return (
    <div ref={ref} className="relative pt-8">
      <span className="absolute left-5 top-0 z-10 rounded-t-md bg-[#1B2A4A] px-3 pb-2 pt-1.5 text-[12px] font-semibold text-white">
        To do · 2
      </span>
      <div className="relative">
        {orders.map((o, i) => (
          <motion.div
            key={o.po}
            className={`bg-[var(--pad-paper)] px-5 py-3.5 shadow-[0_10px_20px_-14px_rgba(27,42,74,0.5)] ring-1 ring-[#1B2A4A]/[0.06] ${i ? "-mt-2" : ""}`}
            style={{ zIndex: 3 - i, position: "relative" }}
            initial={false}
            animate={play ? { rotate: [-1.2, 0.8, -0.4][i], x: [0, 10, 4][i] } : { rotate: 0, x: 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 18, delay: i * 0.08 }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <Mono className="text-[13px] font-semibold text-[#C41E2A]">Nº {o.po}</Mono>
              <Mono className="text-[13px] font-semibold text-[#1B2A4A]">{o.total}</Mono>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-[14px] font-semibold text-[#1B2A4A]">
                {o.who} <span className="font-normal text-[#56657C]">· {o.where}</span>
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-[#56657C]">{o.state}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

