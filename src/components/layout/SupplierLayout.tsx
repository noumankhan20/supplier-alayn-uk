"use client";

import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import SupplierHeader from "./SupplierHeader";

interface SupplierLayoutProps {
  children: React.ReactNode;
}

export default function SupplierLayout({ children }: SupplierLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex min-h-dvh flex-col bg-[#F6F7F9]">
        <SupplierHeader />
        {/* Bottom padding clears the phone tab bar */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 md:pb-12">{children}</main>
      </div>
    </AuthGuard>
  );
}

/** Page title row: heading, one-line description, and an optional action on the right. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-[#1B2A4A] sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
