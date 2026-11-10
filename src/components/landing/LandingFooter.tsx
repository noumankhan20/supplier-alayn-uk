import Link from "next/link";
import Image from "next/image";
import { MAIN_APP_URL } from "@/lib/apiBase";

// Pages that live on this portal vs. the main Alayn site (legal pages and the restaurant product)
const PORTAL_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "What you get", href: "/#features" },
  { label: "Questions", href: "/#faq" },
  { label: "Join as a supplier", href: "/signup" },
  { label: "Log in", href: "/login" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", path: "/legal/privacy" },
  { label: "Terms of Service", path: "/legal/terms" },
  { label: "Security & Data Protection", path: "/legal/security" },
  { label: "Support & Grievances", path: "/legal/support" },
];

export default function LandingFooter() {
  return (
    <footer className="relative bg-[#1B2A4A] px-6 pt-20 pb-10 text-white" aria-label="Site footer">
      {/* The desk above tears off into the footer, like a sheet off the pad */}
      <div aria-hidden className="bg-desk absolute inset-x-0 top-0 h-[7px] [mask:var(--pad-torn)] [-webkit-mask:var(--pad-torn)]" />
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            {/* The trademarked logo is only used in its registered colours, so it sits on a white panel */}
            <Link href="/" className="inline-flex rounded-xl bg-white px-5 py-3.5" aria-label="Alayn Suppliers home">
              <Image src="/alayn-logo-tm.png" alt="Alayn" width={960} height={188} sizes="160px" className="h-7 w-auto" />
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#C9D3E5]">
              The supplier portal for Alayn. Take purchase orders from restaurants, keep your price list current,
              and track every delivery in one place.
            </p>
            <a
              href="https://www.instagram.com/alayn.si/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Alayn on Instagram"
              className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/[0.12] hover:text-[#FF8A8F]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
          </div>

          <nav aria-label="Supplier portal" className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9FAECB]">Suppliers</h3>
            <ul className="mt-5 space-y-3">
              {PORTAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[#C9D3E5] transition-colors hover:text-[#FF8A8F]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal and contact" className="md:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9FAECB]">Alayn</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={MAIN_APP_URL} className="text-sm text-[#C9D3E5] transition-colors hover:text-[#FF8A8F]">
                  Alayn for restaurants
                </a>
              </li>
              {LEGAL_LINKS.map((l) => (
                <li key={l.path}>
                  <a href={`${MAIN_APP_URL}${l.path}`} className="text-sm text-[#C9D3E5] transition-colors hover:text-[#FF8A8F]">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="mailto:info@alaynai.com" className="text-sm text-[#C9D3E5] transition-colors hover:text-[#FF8A8F]">
                  info@alaynai.com
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-xs text-[#9FAECB]">
          &copy; 2026 Alayn AI (BRAHM Global Holdings). All rights reserved.
        </div>
      </div>
    </footer>
  );
}
