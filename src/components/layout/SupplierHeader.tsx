"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Inbox, Layers, Building2, LogOut, ChevronDown, ExternalLink } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { useLogoutMutation } from "@/redux/slices/authApiSlice";
import { logout } from "@/redux/slices/authSlice";
import { baseApi } from "@/redux/store/baseApi";
import { useGetSupplierPortalOrdersQuery } from "@/redux/slices/procurementApiSlice";
import { MAIN_APP_URL } from "@/lib/apiBase";
import { clearUserHint } from "@/components/landing/landingSession";
import { cn } from "@/lib/utils";
import { needsAction } from "@/lib/orderStatus";

export const NAV_LINKS = [
  { label: "Orders", href: "/orders", icon: Inbox },
  { label: "Catalog", href: "/catalog", icon: Layers },
  { label: "Business profile", href: "/profile", icon: Building2, short: "Profile" },
] as const;

/** Orders waiting on the supplier, for the nav badge (shares the orders page's cached query). */
function useActionCount() {
  const { data = [] } = useGetSupplierPortalOrdersQuery(undefined, { pollingInterval: 60_000 });
  return data.filter((po) => needsAction(po.status)).length;
}

function Badge({ count, active }: { count: number; active?: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold leading-5 tabular-nums",
        active ? "bg-[#C41E2A] text-white" : "bg-[#C41E2A]/10 text-[#C41E2A]"
      )}
      aria-label={`${count} need action`}
    >
      {count}
    </span>
  );
}

export default function SupplierHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();
  const user = useAppSelector((state) => state.auth.user);
  const actionCount = useActionCount();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "S";
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const signOut = async () => {
    setMenuOpen(false);
    try {
      await logoutApi(undefined).unwrap();
    } catch {
      // Signing out locally is enough if the server can't be reached
    } finally {
      dispatch(baseApi.util.resetApiState());
      dispatch(logout());
      clearUserHint();
      router.replace("/login");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/orders" className="flex items-center gap-2.5" aria-label="Alayn Suppliers, orders">
              <Image src="/alayn-logo-tm.png" alt="Alayn" width={960} height={188} sizes="110px" className="h-6 w-auto" priority />
              <span className="rounded-md bg-[#1B2A4A] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                Suppliers
              </span>
            </Link>

            <nav aria-label="Portal" className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                      active ? "bg-[#1B2A4A]/[0.06] text-[#1B2A4A]" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-[#C41E2A]" : "text-zinc-400")} />
                    {label}
                    {href === "/orders" && <Badge count={actionCount} active={active} />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2.5 rounded-xl p-1.5 pr-2 transition-colors hover:bg-zinc-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B2A4A] text-xs font-semibold text-white">
                {initial}
              </span>
              <span className="hidden max-w-[160px] truncate text-sm font-medium text-[#1B2A4A] sm:block">
                {user?.name || "Supplier"}
              </span>
              <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform", menuOpen && "rotate-180")} />
            </button>

            {menuOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5">
                <div className="border-b border-zinc-100 px-3 pb-3 pt-2">
                  <p className="truncate text-sm font-semibold text-[#1B2A4A]">{user?.name || "Supplier"}</p>
                  <p className="truncate text-xs text-zinc-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    role="menuitem"
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                  >
                    <Building2 className="h-4 w-4 text-zinc-400" />
                    Business profile & password
                  </Link>
                  <a
                    role="menuitem"
                    href={MAIN_APP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                  >
                    <span className="flex items-center gap-2.5">
                      <ExternalLink className="h-4 w-4 text-zinc-400" />
                      Alayn for restaurants
                    </span>
                  </a>
                </div>
                <div className="border-t border-zinc-100 pt-1">
                  <button
                    role="menuitem"
                    type="button"
                    onClick={signOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom tab bar on phones */}
      <nav
        aria-label="Portal"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAV_LINKS.map((link) => {
          const { label, href, icon: Icon } = link;
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-[#1B2A4A]" : "text-zinc-500"
              )}
            >
              <span className="relative">
                <Icon className={cn("h-5 w-5", active && "text-[#C41E2A]")} />
                {href === "/orders" && actionCount > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 min-w-4 rounded-full bg-[#C41E2A] px-1 text-center text-[10px] font-semibold leading-4 text-white">
                    {actionCount}
                  </span>
                )}
              </span>
              {"short" in link ? link.short : label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
