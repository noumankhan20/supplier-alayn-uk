"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useHydrated } from "@/lib/useHydrated";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useMagnetic, springSnappy } from "./motion/primitives";
import { readStoredUser, verifyStoredUser, logoutFromLanding, type LandingUser } from "./landingSession";
import { formatRole } from "@/lib/utils";
import { LayoutGrid, User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SECTION_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "What you get", href: "/#features" },
  { label: "Questions", href: "/#faq" },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const mounted = useHydrated();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { ref: signupRef, x, y } = useMagnetic(0.2);
  // Show the remembered name straight away (after hydration, so server and browser render alike),
  // then let the server confirm it. If the session has ended the signed-in menu disappears; a
  // network hiccup leaves it alone.
  const hint = useMemo(() => (mounted ? readStoredUser() : null), [mounted]);
  const [confirmed, setConfirmed] = useState<LandingUser | null | undefined>(undefined);
  const user = confirmed !== undefined ? confirmed : hint;
  const isAuthenticated = user !== null;

  useEffect(() => {
    let cancelled = false;
    if (readStoredUser()) {
      verifyStoredUser().then((result) => {
        if (cancelled || result === "unknown") return;
        setConfirmed(result);
      });
    }

    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = mounted && user?.name ? user.name.charAt(0).toUpperCase() : "O";

  const handleLogout = async () => {
    try {
      await logoutFromLanding();
    } finally {
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      window.location.reload();
    }
  };

  return (
    <>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[45px] sm:hidden bg-zinc-900/20 backdrop-blur-sm z-[90]"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      <nav
        className={`landing-nav ${scrolled ? "scrolled" : ""}`}
        aria-label="Main navigation"
      >
      <div
        className="nav-inner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 16px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Brand logo */}
        <Link href="/" aria-label="Alayn supplier portal home" className="nav-brand flex items-center gap-3 overflow-visible shrink-0 sm:gap-3.5">
          <Image
            src="/gptlogo.webp"
            alt="Alayn Suppliers"
            width={480}
            height={111}
            sizes="120px"
            style={{ transformOrigin: "left center" }}
            className="w-[90px] sm:w-[115px] h-auto transform-gpu object-contain"
            loading="eager"
          />
          {/* Same label as login/signup, kept apart from the TM logo */}
          <span aria-hidden className="h-5 w-px bg-[#1B2A4A]/20" />
          <span className="text-[12px] font-semibold text-[#56657C] sm:text-[13px]">Supplier portal</span>
        </Link>

        {/* Section links */}
        <div className="hidden md:flex items-center gap-1">
          {SECTION_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 text-[14px] font-medium text-[#46556C] underline decoration-transparent decoration-2 underline-offset-[7px] transition-colors hover:text-[#1B2A4A] hover:decoration-[#C41E2A]"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop Nav Actions */}
        <div className="hidden sm:flex items-center gap-2">
          {!mounted ? (
            <Skeleton width={110} height={38} borderRadius={20} />
          ) : isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full bg-white/90 border border-zinc-200/80 px-3 py-1.5 shadow-sm hover:bg-zinc-50 transition-all duration-200 min-h-[44px]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C41E2A] text-xs font-bold text-white shadow-sm" suppressHydrationWarning>
                  {initial}
                </div>
                <span className="text-xs font-semibold text-zinc-800" suppressHydrationWarning>
                  {user.name || "Owner"}
                </span>
                <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                    <p className="text-xs font-bold text-zinc-900 truncate" suppressHydrationWarning>{user.name}</p>
                    <p className="text-[11px] text-zinc-400 font-medium truncate" suppressHydrationWarning>{user.email}</p>
                    <span className="inline-block mt-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-[#C41E2A]">
                      {formatRole(user.role)}
                    </span>
                  </div>

                  <Link
                    href="/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                  >
                    <LayoutGrid className="h-4 w-4 text-[#C41E2A]" />
                    Purchase Orders
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                  >
                    <User className="h-4 w-4 text-zinc-400" />
                    Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                id="nav-login"
                className="inline-flex min-h-[44px] items-center px-3 text-[14px] font-semibold text-[#1B2A4A] underline decoration-transparent decoration-2 underline-offset-[7px] transition-colors hover:decoration-[#C41E2A]"
              >
                Log in
              </Link>
              <motion.div
                ref={signupRef as React.Ref<HTMLDivElement>}
                transition={springSnappy}
                style={{ x, y, display: "inline-block" }}
              >
                <Link
                  href="/signup"
                  id="nav-join-supplier"
                  className="btn-stamp btn-stamp-sm"
                >
                  Join as a supplier
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="p-2.5 rounded-xl bg-white/90 border border-zinc-200/80 text-zinc-800 shadow-sm focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="sm:hidden relative z-10 bg-white px-5 py-6 space-y-4 overflow-hidden"
            >
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C41E2A] text-sm font-bold text-white shadow-sm">
                    {initial}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-zinc-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-zinc-500 font-medium truncate">{user.email}</p>
                  </div>
                </div>

                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#C41E2A] px-4 py-3 text-xs font-bold text-white shadow-sm transition-transform active:scale-95 min-h-[44px]"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Purchase Orders
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200/60 px-4 py-3 text-xs font-bold text-red-600 transition-colors min-h-[44px]"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-stamp mb-2 min-h-[52px] w-full"
                >
                  Join as a supplier
                </Link>

                <div className="flex flex-col gap-1 py-2 border-y border-zinc-100 mb-2">
                  {SECTION_LINKS.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-[44px] items-center px-3 text-[15px] font-semibold text-[#1B2A4A] transition-colors hover:text-[#C41E2A]"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>

                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center justify-center text-[15px] font-semibold text-[#1B2A4A] underline decoration-[#1B2A4A]/25 decoration-2 underline-offset-[6px]"
                >
                  Log in
                </Link>
              </div>
            )}
          </motion.div>
          </>
        )}
      </AnimatePresence>
      </nav>
    </>
  );
}

