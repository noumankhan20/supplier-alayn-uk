"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Check, Search } from "lucide-react";
import { Assemble } from "../motion/primitives";
import Stamp from "./pad/Stamp";
import InboxStack from "./pad/InboxStack";

/**
 * What you get: six features, each shown as the slip of paper (or screen) it
 * replaces in a supplier's day, never as an icon tile. Sample data throughout.
 */

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const TORN = "[mask:var(--pad-torn)] [-webkit-mask:var(--pad-torn)]";

function usePlay<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });
  const reduce = useReducedMotion();
  return { ref, play: inView || !!reduce, reduce: !!reduce };
}

function FeatureText({ title, body, id }: { title: string; body: string; id: string }) {
  return (
    <div className="mt-6 max-w-sm">
      <h3 id={id} className="text-[18px] font-bold leading-snug text-[#1B2A4A]">
        {title}
      </h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-[#46556C]">{body}</p>
    </div>
  );
}

function Mono({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pad-mono ${className}`}>{children}</span>;
}

/* ---------- Part now, rest later ---------- */
function PartDispatchSlip() {
  const { ref, play, reduce } = usePlay<HTMLDivElement>();
  const lines = [
    { item: "Butter", qty: "4 kg", sent: true },
    { item: "Cream", qty: "6 L", sent: true },
    { item: "Cheese", qty: "3 kg", sent: false },
  ];
  return (
    <div ref={ref} className={`relative bg-[var(--pad-paper)] px-5 pb-10 pt-4 ${TORN}`}>
      <div className="flex items-baseline justify-between">
        <span className="font-stamp text-[14px] font-bold uppercase tracking-[0.16em] text-[#1B2A4A]">Dispatch</span>
        <Mono className="text-[13px] font-semibold text-[#C41E2A]">Nº 1031</Mono>
      </div>
      <ul className="mt-2 border-t border-[var(--pad-rule-strong)]">
        {lines.map((l, i) => (
          <li key={l.item} className="flex items-center justify-between border-b border-[var(--pad-rule)] py-2">
            <span className="flex items-center gap-2.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-[3px] ring-1 ring-[#1B2A4A]/30">
                {l.sent ? (
                  <motion.span
                    initial={false}
                    animate={{ opacity: play ? 1 : 0, scale: play ? 1 : 0.3 }}
                    transition={reduce ? { duration: 0 } : { delay: 0.2 + i * 0.2, type: "spring", stiffness: 500, damping: 22 }}
                  >
                    <Check className="h-3 w-3 text-[#1B2A4A]" strokeWidth={3.5} />
                  </motion.span>
                ) : null}
              </span>
              <Mono className="text-[14px] text-[#1B2A4A]">{l.item}</Mono>
            </span>
            {l.sent ? (
              <Mono className="text-[14px] text-[#1B2A4A]">{l.qty}</Mono>
            ) : (
              <motion.span
                className="pad-hand -rotate-2 text-[16px] font-bold text-[#C41E2A]"
                initial={false}
                animate={{ opacity: play ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { delay: 0.75, duration: 0.3 }}
              >
                rest on 14 Nov
              </motion.span>
            )}
          </li>
        ))}
      </ul>
      <div className="absolute bottom-3 right-4">
        <Stamp label="Part sent" tone="red" rotate={-6} show={play} delay={1} size={0.8} />
      </div>
    </div>
  );
}

/* ---------- Say no clearly ---------- */
function OutOfStockSlip() {
  const { ref, play } = usePlay<HTMLDivElement>();
  return (
    <div ref={ref} className={`relative bg-[var(--carbon-pink)] px-5 pb-12 pt-4 ${TORN}`}>
      <div className="flex items-baseline justify-between">
        {/* Darker inks on the pink carbon so small text keeps 4.5:1 */}
        <Mono className="text-[13px] font-semibold text-[#9E1620]">Nº 1047</Mono>
        <span className="text-[12px] font-semibold text-[#3E4C63]">Hotel Saffron</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between border-y border-[#1B2A4A]/15 py-2">
        <Mono className="text-[14px] text-[#1B2A4A]">Mutton</Mono>
        <Mono className="text-[14px] text-[#1B2A4A]">8 kg</Mono>
      </div>
      <p className="pad-hand mt-2 text-[16px] leading-snug text-[#1B2A4A]">Mandi short today. Back on Friday.</p>
      <div className="absolute bottom-3 right-3">
        <Stamp label="Out of stock" tone="navy" rotate={-9} show={play} delay={0.25} size={0.85} />
      </div>
    </div>
  );
}

/* ---------- Your price list, always current: a shop price tag, corrected ---------- */
function RateTag() {
  const { ref, play, reduce } = usePlay<HTMLDivElement>();
  return (
    <div ref={ref} className="flex justify-center pt-2">
      <div className="relative w-[15rem] rotate-[-3deg]">
        {/* string */}
        <span aria-hidden className="absolute -top-6 left-7 h-8 w-px origin-bottom rotate-[18deg] bg-[#1B2A4A]/40" />
        <div className="relative rounded-[10px] rounded-tl-[34px] bg-[var(--carbon-yellow)] px-6 pb-5 pt-6 shadow-[0_14px_24px_-16px_rgba(27,42,74,0.55)]">
          <span aria-hidden className="absolute left-5 top-4 h-3 w-3 rounded-full bg-[var(--desk)] ring-2 ring-[#1B2A4A]/15" />
          <p className="pl-6 text-[14px] font-semibold text-[#1B2A4A]">Fresh Paneer</p>
          <div className="mt-3 flex items-end gap-4">
            <span className="relative">
              <Mono className="text-[22px] font-semibold text-[#1B2A4A]/55">₹340</Mono>
              <motion.span
                aria-hidden
                className="absolute left-[-4px] right-[-4px] top-1/2 h-[2.5px] origin-left -rotate-6 bg-[#C41E2A]"
                initial={false}
                animate={{ scaleX: play ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { delay: 0.3, duration: 0.4, ease: EASE_OUT }}
              />
            </span>
            <motion.span
              className="pad-hand text-[30px] font-bold leading-none text-[#C41E2A]"
              initial={false}
              animate={{ opacity: play ? 1 : 0, y: play ? 0 : 4 }}
              transition={reduce ? { duration: 0 } : { delay: 0.75, duration: 0.4, ease: EASE_OUT }}
            >
              ₹320
            </motion.span>
            <span className="pb-1 text-[12px] font-semibold text-[#56657C]">/ kg</span>
          </div>
          <p className="mt-2 text-[12px] text-[#56657C]">New orders use the new rate</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Delivery details: the slip your driver carries ---------- */
function DeliverySlip() {
  return (
    <div className={`relative bg-[var(--pad-paper)] px-5 pb-8 pt-4 ${TORN}`}>
      <span className="font-stamp text-[14px] font-bold uppercase tracking-[0.16em] text-[#1B2A4A]">Deliver to</span>
      <dl className="mt-2 space-y-2 border-t border-[var(--pad-rule-strong)] pt-2.5 text-[14px]">
        {[
          ["Outlet", "Sea Breeze Café"],
          ["Branch", "Bandra West"],
          ["Address", "Shop 4, Carter Road"],
          ["Contact", "+91 98XXX XX210"],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[4.75rem_1fr] items-baseline gap-2">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#56657C]">{k}</dt>
            <dd className="pad-mono text-[13.5px] text-[#1B2A4A]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ---------- Found when it matters: what the restaurant sees ---------- */
function SearchResults() {
  const { ref, play, reduce } = usePlay<HTMLElement>();
  const rows = [
    { name: "You", rate: "₹320 / kg", eta: "24h", min: "Min 2 kg", you: true },
    { name: "Another supplier", rate: "₹340 / kg", eta: "48h", min: "Min 5 kg", you: false },
  ];
  return (
    <figure ref={ref} className="mx-auto w-full max-w-[24rem]">
    <div className="rounded-[34px] bg-[#1B2A4A] p-2.5 shadow-[0_30px_50px_-28px_rgba(27,42,74,0.7)]">
    <div className="rounded-[26px] bg-white px-4 pb-5 pt-3">
      <div aria-hidden className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-[#1B2A4A]/15" />
      <p className="text-[13px] font-semibold text-[#1B2A4A]">Inventory · Order stock</p>
      <div className="mt-3 flex h-11 items-center gap-2.5 rounded-lg bg-[#F4F5F8] px-3.5 ring-1 ring-[#1B2A4A]/10">
        <Search className="h-4 w-4 text-[#56657C]" />
        <span className="text-[15px] text-[#1B2A4A]">paneer</span>
        <motion.span
          aria-hidden
          className="h-5 w-px bg-[#1B2A4A]"
          animate={reduce ? { opacity: 1 } : { opacity: [1, 0, 1] }}
          transition={reduce ? { duration: 0 } : { duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <ul className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <motion.li
            key={r.name}
            className={`flex items-center justify-between gap-3 rounded-lg px-3.5 py-3 ${
              r.you ? "bg-[#FBF1F2] ring-2 ring-[#C41E2A]" : "ring-1 ring-[#1B2A4A]/10"
            }`}
            initial={false}
            animate={{ opacity: play ? 1 : 0, y: play ? 0 : 8 }}
            transition={reduce ? { duration: 0 } : { delay: 0.2 + i * 0.15, type: "spring", stiffness: 220, damping: 24 }}
          >
            <span>
              <span className="block text-[14px] font-semibold text-[#1B2A4A]">
                {r.name} {r.you ? <span className="ml-1 text-[12px] font-semibold text-[#C41E2A]">your listing</span> : null}
              </span>
              <span className="text-[12px] text-[#56657C]">
                {r.min} · delivers in {r.eta}
              </span>
            </span>
            <Mono className="shrink-0 text-[14px] font-semibold text-[#1B2A4A]">{r.rate}</Mono>
          </motion.li>
        ))}
      </ul>
    </div>
    </div>
      <figcaption className="mt-3 text-center text-[13px] text-[#56657C]">What a restaurant owner sees in Alayn</figcaption>
    </figure>
  );
}

export default function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="bg-desk scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Assemble as="div" className="max-w-2xl">
          <h2
            id="features-heading"
            className="font-display text-balance text-[clamp(2rem,4.4vw,3.1rem)] font-bold leading-[1.08] tracking-[-0.02em] text-[#1B2A4A]"
          >
            Built for how supply actually runs
          </h2>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[#46556C]">
            Short stock, split deliveries and changing rates are normal. The portal handles them instead of fighting them.
          </p>
        </Assemble>

        <div className="mt-16 grid gap-x-10 gap-y-16 md:grid-cols-12">
          <Assemble as="article" className="md:col-span-7">
            <InboxStack />
            <FeatureText
              id="f-inbox"
              title="One inbox for every order"
              body="New orders land in a “to do” list, so nothing gets lost in a chat thread or a missed call."
            />
          </Assemble>

          <Assemble as="article" delay={0.06} className="md:col-span-5 md:pt-10">
            <div className="pad"><PartDispatchSlip /></div>
            <FeatureText
              id="f-part"
              title="Send part now, the rest later"
              body="Short on one item? Dispatch what you have and give the restaurant a date for the remainder."
            />
          </Assemble>

          <Assemble as="article" className="md:col-span-4">
            <div className="pad"><OutOfStockSlip /></div>
            <FeatureText
              id="f-no"
              title="Say no clearly"
              body="If you can’t fulfil an order, mark it out of stock with a reason. The restaurant knows straight away."
            />
          </Assemble>

          <Assemble as="article" delay={0.06} className="md:col-span-4 md:pt-14">
            <RateTag />
            <FeatureText
              id="f-rate"
              title="Your price list, always current"
              body="Change a rate or a minimum order and new orders use it. No reprinting, no forwarding PDFs."
            />
          </Assemble>

          <Assemble as="article" delay={0.12} className="md:col-span-4 md:pt-4">
            <div className="pad"><DeliverySlip /></div>
            <FeatureText
              id="f-deliver"
              title="Delivery details on every order"
              body="Each order shows the outlet, branch, delivery address and a contact number for your driver."
            />
          </Assemble>

          <Assemble as="article" className="grid items-center gap-8 md:col-span-12 md:grid-cols-[1.2fr_1fr] md:gap-14 md:pt-6">
            <SearchResults />
            <FeatureText
              id="f-found"
              title="Found when it matters"
              body="When an owner searches for “paneer” or “chicken”, your rate and delivery time sit right next to the others."
            />
          </Assemble>
        </div>

        <p className="mt-16 text-[13px] text-[#56657C]">Orders, names, addresses and rates shown on this page are examples.</p>
      </div>
    </section>
  );
}
