import React from "react";
import InboxStack from "@/components/landing/supplier/pad/InboxStack";

/**
 * Right-hand panel on login: the returning supplier's order book, a stack of
 * purchase orders waiting under the "To do" tab (sample data, labelled).
 */
export default function AuthShowcase() {
  return (
    <div className="flex h-full min-h-dvh flex-col justify-center px-12 py-16 xl:px-20">
      <div className="max-w-lg">
        <h2 className="font-display text-balance text-[clamp(2rem,3.2vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.02em] text-[#1B2A4A]">
          Your restaurant orders, all in one place.
        </h2>
        <p className="mt-4 max-w-md text-[16px] leading-relaxed text-[#46556C]">
          Purchase orders land in one inbox. Dispatch in full or in part, and change a rate once for every new order.
        </p>

        <div className="mt-12 max-w-md" aria-hidden>
          <InboxStack />
        </div>
        <p className="mt-6 text-[13px] text-[#56657C]">Example orders.</p>
      </div>
    </div>
  );
}
