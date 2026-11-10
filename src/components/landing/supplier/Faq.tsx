import { Plus } from "lucide-react";
import { Assemble } from "../motion/primitives";

const FAQS = [
  {
    q: "How do restaurants find me?",
    a: "Restaurants using Alayn have a marketplace inside their inventory screen. When an owner searches for a product or picks a category, suppliers who list it appear with their rate and delivery time, and the owner can order from you in a few clicks.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. The portal runs in the browser on your phone, tablet or computer. Sign in and your orders are there.",
  },
  {
    q: "Who decides the price?",
    a: "You do. Restaurants order at the rate on your catalog. Update a price any time and new orders use the new rate.",
  },
  {
    q: "What if I can’t send the whole order?",
    a: "Dispatch the quantities you have and set the date the rest will arrive. If you can’t fulfil it at all, mark it out of stock with a short reason so the restaurant can plan around it.",
  },
  {
    q: "What does the restaurant see?",
    a: "They see each status change (packing, dispatched, partly dispatched) along with your delivery notes, and they confirm the quantities they received when the delivery arrives.",
  },
];

/** The back pages of the pad: ruled paper with a margin line. */
export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="ruled-paper scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 pl-[calc(var(--margin-x)+1.25rem)] pr-4 sm:pr-6 lg:grid-cols-[1fr_1.6fr] lg:pl-[calc(var(--margin-x)+2rem)]">
        <Assemble as="div">
          <h2
            id="faq-heading"
            className="font-display text-balance text-[clamp(2rem,4.4vw,3.1rem)] font-bold leading-[1.08] tracking-[-0.02em] text-[#1B2A4A]"
          >
            Good to know before you join
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-[#46556C]">
            Something else on your mind? Write to{" "}
            <a
              href="mailto:info@alaynai.com"
              className="font-semibold text-[#1B2A4A] underline decoration-[#C41E2A]/50 decoration-2 underline-offset-4 hover:decoration-[#C41E2A]"
            >
              info@alaynai.com
            </a>
            .
          </p>
        </Assemble>

        <Assemble as="div" delay={0.06} className="border-t-2 border-[#1B2A4A]/80">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group border-b border-[#1B2A4A]/15">
              <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-[17px] font-semibold text-[#1B2A4A] transition-colors hover:text-[#C41E2A] [&::-webkit-details-marker]:hidden">
                {q}
                <Plus className="h-5 w-5 shrink-0 text-[#C41E2A] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-45" />
              </summary>
              <p className="max-w-[62ch] pb-6 pr-8 text-[16px] leading-[2rem] text-[#46556C]">{a}</p>
            </details>
          ))}
        </Assemble>
      </div>
    </section>
  );
}
