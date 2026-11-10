import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MAIN_APP_URL } from "@/lib/apiBase";
import { InkDefs } from "@/components/landing/supplier/pad/OrderPad";
import AuthShowcase from "./AuthShowcase";

/**
 * Two-pane layout shared by login and signup: the form on the left, a pad on
 * the right (desktop only, so phones go straight to the form).
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  aside,
}: {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  /** Line under the form, e.g. "New here? Join as a supplier" */
  footer?: React.ReactNode;
  /** Right-hand panel; defaults to the login panel */
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-white">
      <InkDefs />
      <div className="flex w-full flex-col lg:w-[46%] xl:w-[42%]">
        <div className="flex flex-1 flex-col px-5 py-6 sm:px-10">
          <div className="flex items-center justify-between">
            <Link href="/" aria-label="Alayn supplier portal home" className="inline-flex items-center gap-3.5">
              <Image src="/alayn-logo-tm.png" alt="Alayn" width={960} height={188} sizes="120px" className="h-6 w-auto" priority />
              {/* Kept apart from the TM logo so it reads as a label, not part of the mark */}
              <span aria-hidden className="h-5 w-px bg-[#1B2A4A]/20" />
              <span className="text-[13px] font-semibold text-[#56657C]">Supplier portal</span>
            </Link>
            <Link href="/" className="link-ruled inline-flex min-h-[44px] items-center gap-1.5 text-sm">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </div>

          <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
            <h1 className="font-display text-balance text-[clamp(2rem,4vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.02em] text-[#1B2A4A]">
              {title}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#46556C]">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-[#56657C]">{footer}</div>}
          </main>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#56657C]">
            <span>© 2026 Alayn AI</span>
            <div className="flex gap-4">
              <a href={`${MAIN_APP_URL}/legal/privacy`} className="hover:text-[#1B2A4A]">Privacy</a>
              <a href={`${MAIN_APP_URL}/legal/terms`} className="hover:text-[#1B2A4A]">Terms</a>
              <a href="mailto:info@alaynai.com" className="hover:text-[#1B2A4A]">Help</a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-desk hidden flex-1 lg:sticky lg:top-0 lg:block lg:h-dvh">{aside ?? <AuthShowcase />}</div>
    </div>
  );
}
