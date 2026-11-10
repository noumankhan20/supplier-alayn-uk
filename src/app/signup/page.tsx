"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, AlertCircle, Check } from "lucide-react";
import { useRegisterSupplierMutation } from "@/redux/slices/authApiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { setCredentials, logout } from "@/redux/slices/authSlice";
import { passwordProblem, PASSWORD_HINT } from "@/lib/passwordPolicy";
import { useShake } from "@/lib/useShake";
import { useHydrated } from "@/lib/useHydrated";
import { apiErrorMessage } from "@/lib/apiError";
import { formatRole } from "@/lib/utils";
import { userFromResponse } from "@/lib/authSession";
import { writeUserHint } from "@/components/landing/landingSession";
import AuthShell from "@/components/auth/AuthShell";
import AuthField, { authInputClass } from "@/components/auth/AuthField";
import GuestGuard from "@/components/auth/GuestGuard";
import LetterheadPad from "@/components/auth/LetterheadPad";

const SUPPLY_CATEGORIES = [
  "Dairy & Eggs",
  "Vegetables & Fresh Produce",
  "Meat, Poultry & Seafood",
  "Dry Goods & Grains",
  "Oils & Condiments",
  "Spices & Seasonings",
  "Bakery & Bread",
  "Beverages & Syrups",
  "Packaging & Disposables",
  "Cleaning & Hygiene",
  "General Wholesale",
];

type Field =
  | "fullName"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword"
  | "supplierName"
  | "supplierCategory"
  | "supplierAddress"
  | "supplierDeliveryTerms"
  | "supplierGst";

const STEPS = ["Your account", "Your business"] as const;

function SignupFormContent({ onRegistered }: { onRegistered: () => void }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const currentStatus = useAppSelector((s) => s.auth.status);
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<Record<Field, string>>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    supplierName: "",
    supplierCategory: SUPPLY_CATEGORIES[0],
    supplierAddress: "",
    supplierDeliveryTerms: "",
    supplierGst: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [shakeKey, setShakeKey] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [registerSupplier, { isLoading }] = useRegisterSupplierMutation();
  const shakeRef = useShake<HTMLDivElement>(shakeKey);

  const handleChange =
    (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    };

  const report = (errors: Partial<Record<Field, string>>) => {
    setFieldErrors(errors);
    const first = Object.keys(errors)[0];
    if (first) {
      setShakeKey((k) => k + 1);
      document.getElementById(first)?.focus();
    }
    return !first;
  };

  const validateStep1 = () => {
    const errors: Partial<Record<Field, string>> = {};
    if (!formData.fullName.trim()) errors.fullName = "Enter your name.";
    if (!formData.email.trim()) errors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = "That email doesn’t look right.";
    if (!formData.phone.trim()) errors.phone = "Enter a phone number for orders.";
    else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.phone.trim())) errors.phone = "Enter a valid phone number.";
    const pw = passwordProblem(formData.password);
    if (pw) errors.password = pw;
    if (!formData.confirmPassword) errors.confirmPassword = "Type your password again.";
    else if (formData.confirmPassword !== formData.password) errors.confirmPassword = "The passwords don’t match.";
    return report(errors);
  };

  const validateStep2 = () => {
    const errors: Partial<Record<Field, string>> = {};
    if (!formData.supplierName.trim()) errors.supplierName = "Enter your business name.";
    if (!formData.supplierAddress.trim()) errors.supplierAddress = "Enter the address you dispatch from.";
    return report(errors);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validateStep2()) return;

    try {
      const res = await registerSupplier({
        user: {
          name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phoneNo: formData.phone.trim(),
        },
        supplier: {
          name: formData.supplierName.trim(),
          contactPerson: formData.fullName.trim(),
          address: formData.supplierAddress.trim(),
          category: formData.supplierCategory || "General Wholesale",
          deliveryTerms: formData.supplierDeliveryTerms.trim() || undefined,
          gstNumber: formData.supplierGst.trim() || undefined,
        },
      }).unwrap();

      // New suppliers start by adding products: restaurants can only order what's listed.
      // Tell the guard first, so it redirects to the catalog once the session is set.
      onRegistered();
      setSubmitSuccess(true);
      const user = userFromResponse(res);
      if (user) {
        dispatch(setCredentials({ user }));
        writeUserHint(user);
      } else {
        // No user in the response: the catalog page checks the session cookie itself
        router.replace("/catalog?welcome=1");
      }
    } catch (err) {
      setSubmitError(apiErrorMessage(err, "We couldn’t create your account. Please try again."));
      setShakeKey((k) => k + 1);
    }
  };

  const input = (field: Field, props: React.InputHTMLAttributes<HTMLInputElement> & { extra?: string } = {}) => {
    const { extra, ...rest } = props;
    return function renderInput(describedBy: string | undefined) {
      return (
      <input
        id={field}
        name={field}
        value={formData[field]}
        onChange={handleChange(field)}
        aria-invalid={!!fieldErrors[field] || undefined}
        aria-describedby={describedBy}
        className={authInputClass(!!fieldErrors[field], `h-12 ${extra ?? ""}`)}
        {...rest}
      />
      );
    };
  };

  return (
    <AuthShell
      aside={<LetterheadPad data={formData} done={submitSuccess} />}
      title={step === 1 ? "Join as a supplier" : "Tell restaurants who you are"}
      subtitle={
        step === 1
          ? "Create your account in two short steps. You can add products straight after."
          : "This is what restaurants see when they find you."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#C41E2A] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {/* Progress */}
      <ol className="mb-8 grid grid-cols-2 gap-2" aria-label="Sign-up progress">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n || submitSuccess;
          const current = step === n && !submitSuccess;
          return (
            <li key={label} aria-current={current ? "step" : undefined}>
              <div
                aria-hidden
                className={`h-1 rounded-full ${current ? "bg-[#C41E2A]" : done ? "bg-[#1B2A4A]" : "bg-[#1B2A4A]/15"}`}
              />
              <p className={`mt-2 flex items-center gap-1.5 text-[13px] font-semibold ${current || done ? "text-[#1B2A4A]" : "text-[#56657C]"}`}>
                {done && <Check className="h-3.5 w-3.5 text-[#1B2A4A]" strokeWidth={3} />}
                Step {n} · {label}
              </p>
            </li>
          );
        })}
      </ol>

      {currentStatus === "authenticated" && currentUser && currentUser.role !== "SUPPLIER" && (
        <div className="mb-6 flex items-start justify-between gap-3 rounded-[5px] bg-[var(--carbon-yellow)] p-4 text-sm text-[#1B2A4A] shadow-[0_8px_16px_-12px_rgba(27,42,74,0.5)]">
          <p>
            You’re signed in to Alayn as <span className="font-semibold">{currentUser.name || currentUser.email}</span>{" "}
            ({formatRole(currentUser.role)}). Sign out first to create a supplier account.
          </p>
          <button type="button" onClick={() => dispatch(logout())} className="shrink-0 font-semibold underline underline-offset-2">
            Sign out
          </button>
        </div>
      )}

      {submitError && (
        <div role="alert" className="mb-6 flex gap-3 rounded-[5px] bg-[var(--carbon-pink)] p-4 text-sm text-[#7A0F18] shadow-[0_8px_16px_-12px_rgba(27,42,74,0.5)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      {submitSuccess && (
        <div role="status" className="mb-6 flex items-center gap-3 rounded-[5px] bg-[var(--pad-paper)] p-4 text-sm font-semibold text-[#1B2A4A] shadow-[0_8px_16px_-12px_rgba(27,42,74,0.5)] ring-1 ring-[#1B2A4A]/10">
          <Check className="h-4 w-4 shrink-0" />
          Account created. Taking you to your catalog…
        </div>
      )}

      <div ref={shakeRef} className="t-input">
        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-5" noValidate>
            <AuthField id="fullName" label="Your name" error={fieldErrors.fullName}>
              {input("fullName", { type: "text", autoComplete: "name", placeholder: "Full name", autoFocus: true })}
            </AuthField>
            <AuthField id="email" label="Email" error={fieldErrors.email} hint="You’ll use this to sign in.">
              {input("email", { type: "email", autoComplete: "email", inputMode: "email", placeholder: "orders@yourbusiness.com" })}
            </AuthField>
            <AuthField id="phone" label="Phone for orders" error={fieldErrors.phone}>
              {input("phone", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "+91 98765 43210" })}
            </AuthField>
            <AuthField id="password" label="Password" error={fieldErrors.password} hint={PASSWORD_HINT}>
              {(describedBy) => (
                <div className="relative">
                  {input("password", {
                    type: showPassword ? "text" : "password",
                    autoComplete: "new-password",
                    extra: "pr-12",
                  })(describedBy)}
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
            <AuthField id="confirmPassword" label="Confirm password" error={fieldErrors.confirmPassword}>
              {input("confirmPassword", { type: showPassword ? "text" : "password", autoComplete: "new-password" })}
            </AuthField>

            <button
              type="submit"
              className="btn-stamp h-[52px] w-full"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <AuthField id="supplierName" label="Business name" error={fieldErrors.supplierName}>
              {input("supplierName", { type: "text", autoComplete: "organization", placeholder: "e.g. Fresh Dairy Wholesale", autoFocus: true })}
            </AuthField>

            <AuthField id="supplierCategory" label="What do you mainly supply?">
              {(describedBy) => (
                <select
                  id="supplierCategory"
                  value={formData.supplierCategory}
                  onChange={handleChange("supplierCategory")}
                  aria-describedby={describedBy}
                  className={authInputClass(false, "h-12 pr-10")}
                >
                  {SUPPLY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </AuthField>

            <AuthField
              id="supplierAddress"
              label="Dispatch address"
              error={fieldErrors.supplierAddress}
              hint="Where your deliveries leave from: street, city and PIN."
            >
              {(describedBy) => (
                <textarea
                  id="supplierAddress"
                  rows={3}
                  value={formData.supplierAddress}
                  onChange={handleChange("supplierAddress")}
                  autoComplete="street-address"
                  aria-invalid={!!fieldErrors.supplierAddress || undefined}
                  aria-describedby={describedBy}
                  className={authInputClass(!!fieldErrors.supplierAddress, "py-3 resize-none")}
                />
              )}
            </AuthField>

            <AuthField id="supplierDeliveryTerms" label="Delivery & payment terms" optional hint="Shown to restaurants, e.g. “Next day before 9 AM · Pay in 15 days”.">
              {input("supplierDeliveryTerms", { type: "text" })}
            </AuthField>

            <AuthField id="supplierGst" label="GSTIN" optional>
              {input("supplierGst", { type: "text", placeholder: "27AAACA1234A1Z5", extra: "uppercase", autoCapitalize: "characters" })}
            </AuthField>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setFieldErrors({});
                  setStep(1);
                }}
                className="link-ruled inline-flex h-[52px] items-center justify-center gap-2 px-3 text-[15px]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !hydrated || submitSuccess}
                className="btn-stamp h-[52px] flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  );
}

export default function SupplierSignupPage() {
  // Set once the account exists, so the guard sends the new supplier to the catalog instead of orders
  const [registered, setRegistered] = useState(false);
  return (
    <GuestGuard
      redirectTo={registered ? "/catalog?welcome=1" : undefined}
      redirectMessage={registered ? "Account created. Opening your catalog…" : undefined}
    >
      <SignupFormContent onRegistered={() => setRegistered(true)} />
    </GuestGuard>
  );
}
