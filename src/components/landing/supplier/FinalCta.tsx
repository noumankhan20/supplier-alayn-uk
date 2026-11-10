import Link from "next/link";
import { Assemble } from "../motion/primitives";
import { PadSheet, PadStack } from "./pad/OrderPad";

/** The close: a fresh, blank sheet on the pad, waiting for your first order. */
export default function FinalCta() {
  return (
    <section aria-labelledby="cta-heading" className="bg-desk px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <Assemble as="div">
          <h2
            id="cta-heading"
            className="font-display text-balance text-[clamp(2.2rem,5vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.025em] text-[#1B2A4A]"
          >
            Ready to take restaurant orders?
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-[#46556C]">
            Create your supplier account, add your first products, and you’re ready for orders.
          </p>
        </Assemble>

        <Assemble as="div" delay={0.08} className="mx-auto w-full max-w-[27rem] -rotate-1">
          <PadStack tag="">
            <PadSheet>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-stamp text-[15px] font-bold uppercase tracking-[0.16em] text-[#1B2A4A]">
                  Purchase order
                </span>
                <span className="pad-mono text-[15px] font-semibold text-[#C41E2A]">Nº 0001</span>
              </div>
              <div className="mt-3 border-t border-[var(--pad-rule-strong)]">
                <p className="pad-hand border-b border-[var(--pad-rule)] py-2 text-[19px] leading-7 text-[#C41E2A]">
                  Your first order goes here
                </p>
                {[0, 1, 2].map((i) => (
                  <div key={i} aria-hidden className="h-9 border-b border-[var(--pad-rule)]" />
                ))}
              </div>

              <div className="mt-8 flex flex-col items-center gap-4">
                <Link
                  href="/signup"
                  className="stamp-button group relative inline-flex min-h-[56px] -rotate-3 items-center justify-center rounded-[5px] border-[3px] border-[#C41E2A] px-7 text-[#C41E2A] shadow-[inset_0_0_0_2px_var(--pad-paper),inset_0_0_0_4px_#C41E2A] transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:rotate-0 hover:bg-[#C41E2A] hover:text-white active:scale-[0.97]"
                >
                  <span className="font-stamp text-[22px] font-extrabold uppercase tracking-[0.1em]">Join as a supplier</span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-[44px] items-center text-[15px] font-semibold text-[#1B2A4A] underline decoration-[#1B2A4A]/25 decoration-2 underline-offset-[6px] transition-colors hover:decoration-[#C41E2A]"
                >
                  I already have an account
                </Link>
              </div>
            </PadSheet>
          </PadStack>
        </Assemble>
      </div>
    </section>
  );
}
