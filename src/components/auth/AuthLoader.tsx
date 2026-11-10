"use client";

import React from "react";
import Image from "next/image";

/**
 * Full-screen loading state for the auth pages and guard redirects: the logo
 * over the pad's perforated tear line, its dots inking in one by one.
 */
export default function AuthLoader({ message = "Loading Supplier Portal..." }: { message?: string }) {
  return (
    <div className="bg-desk fixed inset-0 z-50 flex flex-col items-center justify-center" role="status" aria-live="polite">
      <Image src="/alayn-logo-tm.png" alt="Alayn" width={960} height={188} sizes="160px" className="h-8 w-auto" priority />
      <div aria-hidden className="mt-6 flex gap-[7px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="auth-loader-dot h-[5px] w-[5px] rounded-full" style={{ animationDelay: `${i * 0.11}s` }} />
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold text-[#46556C]">{message}</p>
    </div>
  );
}
