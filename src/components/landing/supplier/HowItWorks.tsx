"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Assemble } from "../motion/primitives";
import { PadSheet, PadStack } from "./pad/OrderPad";
import { PurchaseOrderSheet, RateCardSheet, type StampSpec } from "./pad/Sheets";

/**
 * How it works, told on one pad. On desktop the pad stays pinned while the
 * three steps scroll past: the price list page tears off to reveal the
 * restaurant's purchase order, which then collects its stamps. On phones each
 * step carries its own sheet that stamps as it scrolls into view.
 */

const STEPS = [
  {
    title: "List what you sell",
    body:
      "Add each product with its price per unit, minimum order and how fast you deliver. Mark anything out of stock in one tap.",
  },
  {
    title: "Restaurants send orders",
    body:
      "Owners search Alayn for what they need, compare suppliers by price and delivery time, and send you a purchase order with exact quantities and the delivery address.",
  },
  {
    title: "Pack, dispatch, done",
    body:
      "Mark it packing, then dispatch the full order or what you have now, with a date for the rest. The restaurant sees every update and confirms when it arrives.",
  },
];

function stampsFor(step: number, play: boolean): StampSpec[] {
  if (step === 1) {
    return [{ label: "New order", sub: "Sea Breeze Café", tone: "red", rotate: -7, at: "bottom-1 right-1", show: play }];
  }
  return [
    // Laid out in the order they land: Packing, Part sent, then Delivered across the foot
    { label: "Packing", tone: "navy", rotate: -8, at: "bottom-16 left-0", show: play, delay: 0.1 },
    { label: "Part sent", tone: "red", rotate: 5, at: "bottom-16 right-0", show: play, delay: 0.7 },
    { label: "2 of 3 delivered", tone: "navy", rotate: -3, at: "bottom-1 left-1/2 -translate-x-1/2", show: play, delay: 1.3 },
  ];
}

function StepSheet({ step, play }: { step: number; play: boolean }) {
  if (step === 0) return <RateCardSheet play={play} />;
  return <PurchaseOrderSheet
      dispatch={step === 2 && play}
      dispatchDelay={0.6}
      stampRoom={step === 2 ? "h-32" : undefined}
      stamps={stampsFor(step, play)}
    />;
}

function StepText({
  index,
  active,
  onActive,
  children,
}: {
  index: number;
  active: boolean;
  onActive: (i: number) => void;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inMiddle = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inMiddle) onActive(index);
  }, [inMiddle, index, onActive]);

  const step = STEPS[index];
  return (
    <li>
      <div
      ref={ref}
      className={`lg:flex lg:min-h-[54vh] lg:items-center lg:transition-opacity lg:duration-500 ${active ? "lg:opacity-100" : "lg:opacity-35"}`}
    >
      <div className="max-w-md">
        <h3 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] font-bold leading-tight tracking-[-0.015em] text-[#1B2A4A]">
          <span className="mr-2 text-[#C41E2A]">{index + 1}.</span>
          {step.title}
        </h3>
        <p className="mt-3 text-[16px] leading-relaxed text-[#46556C]">{step.body}</p>
      </div>
      </div>
      {children}
    </li>
  );
}

function MobileStepSheet({ step }: { step: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const play = useInView(ref, { once: true, amount: 0.6 });
  return (
    <div ref={ref} className={`mt-7 ${step % 2 ? "rotate-[1deg]" : "-rotate-[1deg]"}`}>
      <PadStack carbon={step !== 1} title={step === 0 ? "Price list" : "Purchase orders"}>
        <PadSheet>
          <StepSheet step={step} play={play} />
        </PadSheet>
      </PadStack>
    </div>
  );
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const sheetKey = active === 0 ? "rate" : "po";

  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-20 bg-white px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Assemble as="div" className="max-w-2xl">
          <h2
            id="how-heading"
            className="font-display text-balance text-[clamp(2rem,4.4vw,3.1rem)] font-bold leading-[1.08] tracking-[-0.02em] text-[#1B2A4A]"
          >
            From your price list to their kitchen in three steps
          </h2>
        </Assemble>

        <div className="mt-14 grid gap-16 lg:mt-4 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          {/* Steps */}
          <ol className="space-y-20 lg:space-y-0">
            {STEPS.map((s, i) => (
              <StepText key={s.title} index={i} active={active === i} onActive={setActive}>
                <div className="lg:hidden">
                  <MobileStepSheet step={i} />
                </div>
              </StepText>
            ))}
          </ol>

          {/* Pinned pad (desktop) */}
          <div aria-hidden className="hidden lg:block">
            <div className="sticky top-[calc(50vh-15rem)]">
              <PadStack title={active === 0 ? "Price list" : "Purchase orders"} className="mx-auto max-w-[27rem] rotate-[1.5deg]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={sheetKey}
                    // The next sheet is already underneath; it doesn't fade in
                    initial={false}
                    animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                    // Tear the top sheet off the pad: it stays solid and on top while it
                    // rips away from the perforation, and only fades at the very end
                    exit={
                      reduce
                        ? { opacity: 0, transition: { duration: 0 } }
                        : {
                            zIndex: 2,
                            y: -70,
                            x: 120,
                            rotate: 11,
                            opacity: [1, 1, 0],
                            transition: { duration: 0.55, ease: [0.55, 0, 0.75, 0.2], opacity: { times: [0, 0.7, 1], duration: 0.55 } },
                          }
                    }
                    style={{ transformOrigin: "0% 0%", position: "relative" }}
                  >
                    <PadSheet>
                      <StepSheet step={active} play />
                    </PadSheet>
                  </motion.div>
                </AnimatePresence>
              </PadStack>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
