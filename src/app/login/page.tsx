"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useLoginMutation } from "@/redux/slices/authApiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { setCredentials, logout } from "@/redux/slices/authSlice";
import { MAIN_APP_URL } from "@/lib/apiBase";
import { useShake } from "@/lib/useShake";
import { useHydrated } from "@/lib/useHydrated";
import { apiErrorMessage } from "@/lib/apiError";
import { formatRole } from "@/lib/utils";
import { safeNextPath, userFromResponse } from "@/lib/authSession";
import { writeUserHint } from "@/components/landing/landingSession";
import AuthShell from "@/components/auth/AuthShell";
import AuthField, { authInputClass } from "@/components/auth/AuthField";
import GuestGuard from "@/components/auth/GuestGuard";
import AuthLoader from "@/components/auth/AuthLoader";

function LoginFormContent() {
  const hydrated = useHydrated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((s) => s.auth.user);
  const currentStatus = useAppSelector((s) => s.auth.status);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  // Signed in fine, but with a restaurant account rather than a supplier one
  const [wrongPortalRole, setWrongPortalRole] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const credentialsRef = useShake<HTMLDivElement>(errorCount);

  const [login, { isLoading }] = useLoginMutation();

  const fail = (message: string) => {
    setError(message);
    setErrorCount((n) => n + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setWrongPortalRole(null);

    if (!email.trim() || !password) {
      fail("Enter your email and password.");
      return;
    }

    try {
      const response = await login({ email: email.trim(), password }).unwrap();
      const user = userFromResponse(response);

      // The server already refuses non-suppliers on this portal; this is a second line of defence.
      if (!user) {
        dispatch(logout());
        fail("Couldn’t sign you in. Please try again.");
        return;
      }
      if (user.role !== "SUPPLIER") {
        dispatch(logout());
        setWrongPortalRole(formatRole(user.role));
        setErrorCount((n) => n + 1);
        return;
      }

      dispatch(setCredentials({ user }));
      writeUserHint(user);
      router.replace(safeNextPath(searchParams.get("next")));
    } catch (err) {
      fail(apiErrorMessage(err, "That email and password don’t match. Try again."));
    }
  };

  const clearErrors = () => {
    if (error) setError("");
    if (wrongPortalRole) setWrongPortalRole(null);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see your orders and manage your price list."
      footer={
        <>
          New to Alayn?{" "}
          <Link href="/signup" className="font-semibold text-[#C41E2A] hover:underline">
            Join as a supplier
          </Link>
        </>
      }
    >
      {currentStatus === "authenticated" && currentUser && currentUser.role !== "SUPPLIER" && (
        <div className="mb-6 flex items-start justify-between gap-3 rounded-[5px] bg-[var(--carbon-yellow)] p-4 text-sm text-[#1B2A4A] shadow-[0_8px_16px_-12px_rgba(27,42,74,0.5)]">
          <p>
            You’re signed in to Alayn as <span className="font-semibold">{currentUser.name || currentUser.email}</span>{" "}
            ({formatRole(currentUser.role)}). Sign out to use a supplier account.
          </p>
          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="shrink-0 font-semibold underline underline-offset-2"
          >
            Sign out
          </button>
        </div>
      )}

      <form className="space-y-5" method="post" onSubmit={handleSubmit} noValidate>
        {(error || wrongPortalRole) && (
          <div role="alert" className="flex gap-3 rounded-[5px] bg-[var(--carbon-pink)] p-4 text-sm text-[#7A0F18] shadow-[0_8px_16px_-12px_rgba(27,42,74,0.5)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {wrongPortalRole ? (
              <div>
                <p className="font-semibold">This is a {wrongPortalRole.toLowerCase()} account.</p>
                <p className="mt-1">
                  The supplier portal is only for suppliers.{" "}
                  <a href={MAIN_APP_URL} className="font-semibold underline underline-offset-2">
                    Open Alayn for restaurants
                  </a>
                </p>
              </div>
            ) : (
              <p>{error}</p>
            )}
          </div>
        )}

        <div ref={credentialsRef} className="t-input space-y-5">
          <AuthField id="email" label="Email">
            {(describedBy) => (
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                autoFocus
                value={email}
                aria-invalid={!!error || undefined}
                aria-describedby={describedBy}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearErrors();
                }}
                placeholder="orders@yourbusiness.com"
                className={authInputClass(!!error, "h-12")}
              />
            )}
          </AuthField>

          <AuthField
            id="password"
            label="Password"
            labelAction={
              <a href={`${MAIN_APP_URL}/forgot-password`} className="text-sm font-medium text-[#C41E2A] hover:underline">
                Forgot password?
              </a>
            }
          >
            {(describedBy) => (
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  aria-invalid={!!error || undefined}
                  aria-describedby={describedBy}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearErrors();
                  }}
                  className={authInputClass(!!error, "h-12 pr-12")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-400 hover:text-[#1B2A4A]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            )}
          </AuthField>
        </div>

        <button
          type="submit"
          disabled={isLoading || !hydrated}
          className="btn-stamp h-[52px] w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <Suspense fallback={<AuthLoader message="Loading…" />}>
        <LoginFormContent />
      </Suspense>
    </GuestGuard>
  );
}
