"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Assemble } from "../motion/primitives";
import { introHoldSeconds } from "../introTiming";
import { PadSheet, PadStack } from "./pad/OrderPad";
import { PO_LINES, PurchaseOrderSheet } from "./pad/Sheets";

/**
 * Hero: the supplier's purchase-order pad. A restaurant's order types itself
 * onto the top sheet line by line, then a NEW ORDER stamp lands and the pad
 * takes the knock. All sample data; the pad's binding is tagged "Example".
 */

// Beat sheet (ms after the logo intro lifts)
const LINE_START = 450;
const LINE_GAP = 380;
const TOTAL_AT = LINE_START + LINE_GAP * PO_LINES.length + 80;
const STAMP_AT = TOTAL_AT + 420;

function useHeroBeats() {
  const reduce = useReducedMotion();
  const [lines, setLines] = useState(0);
  const [total, setTotal] = useState(false);
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const hold = introHoldSeconds() * 1000;
    const timers = [
      ...PO_LINES.map((_, i) => window.setTimeout(() => setLines(i + 1), hold + LINE_START + i * LINE_GAP)),
      window.setTimeout(() => setTotal(true), hold + TOTAL_AT),
      window.setTimeout(() => setStamped(true), hold + STAMP_AT),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [reduce]);

  // Reduced motion: show the finished, stamped order straight away
  if (reduce) return { lines: PO_LINES.length, total: true, stamped: true, reduce };
  return { lines, total, stamped, reduce };
}

function HeroPad() {
  const { lines, total, stamped, reduce } = useHeroBeats();
  return (
    <motion.div
      className="relative mx-auto w-full max-w-[26rem] lg:max-w-[28rem] lg:-rotate-2"
      // The pad takes the knock when the stamp lands
      animate={stamped && !reduce ? { y: [0, 4, 0] } : { y: 0 }}
      transition={{ duration: 0.24, delay: 0.06, ease: "easeOut" }}
    >
      <PadStack>
        <PadSheet>
          <PurchaseOrderSheet
            compact
            linesShown={lines}
            showTotal={total}
            stamps={[
              {
                label: "New order",
                sub: "Sea Breeze Café · just now",
                tone: "red",
                rotate: -7,
                at: "bottom-1 right-0 sm:right-2",
                show: stamped,
              },
            ]}
          />
        </PadSheet>
      </PadStack>
      <p className="pad-hand mt-6 text-center text-[15px] text-[#56657C] lg:rotate-2">
        Works on your phone · nothing to install · your rates
      </p>
    </motion.div>
  );
}

export default function SupplierHero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="hero-section bg-desk relative px-4 pb-16 pt-[5.5rem] sm:px-6 sm:pb-20 sm:pt-36"
    >
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-7 sm:gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <Assemble
            as="h1"
            visibleOnLoad
            id="hero-heading"
            className="font-display text-balance text-[clamp(2.35rem,6.4vw,4.25rem)] font-bold leading-[1.04] tracking-[-0.025em] text-[#1B2A4A]"
          >
            Get restaurant orders. <span className="text-[#C41E2A]">Skip the phone calls.</span>
          </Assemble>

          <Assemble
            as="p"
            delay={0.06}
            visibleOnLoad
            className="mt-4 max-w-[34rem] text-[clamp(1rem,1.6vw,1.125rem)] leading-relaxed text-[#46556C]"
          >
            List your products and rates once. Restaurants on Alayn find you, compare your prices and send purchase
            orders straight here. You pack, dispatch and keep them posted from one screen.
          </Assemble>

          <Assemble as="div" delay={0.12} className="mt-6 flex sm:mt-8 flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              id="cta-hero"
              className="btn-stamp group h-[52px] px-7 text-[20px]"
            >
              Join as a supplier
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="hidden h-[52px] items-center justify-center rounded-lg px-5 sm:inline-flex text-[15px] font-semibold text-[#1B2A4A] underline decoration-[#1B2A4A]/25 decoration-2 underline-offset-[6px] transition-colors hover:decoration-[#C41E2A]"
            >
              See how it works
            </a>
          </Assemble>
        </div>

        <Assemble as="div" delay={0.08}>
          <HeroPad />
        </Assemble>
      </div>
    </section>
  );
}
