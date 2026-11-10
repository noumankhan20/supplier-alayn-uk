"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { Building2, User, Lock, Pencil, Loader2, Eye, EyeOff, TrendingUp, ArrowRight } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import SupplierLayout, { PageHeader } from "@/components/layout/SupplierLayout";
import Field, { inputClass } from "@/components/ui/Field";
import { btn } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { setCredentials } from "@/redux/slices/authSlice";
import { useUpdateProfileMutation, useChangePasswordMutation } from "@/redux/slices/authApiSlice";
import { useGetMyProfileQuery, useUpdateMyProfileMutation, SupplierProfileApi } from "@/redux/slices/supplierApiSlice";
import { useGetSupplierPortalOrdersQuery } from "@/redux/slices/procurementApiSlice";
import { passwordProblem, PASSWORD_HINT } from "@/lib/passwordPolicy";
import { apiErrorMessage } from "@/lib/apiError";
import { computeSupplierStats, type SupplierStats } from "@/lib/supplierStats";
import { formatDate } from "@/lib/orderStatus";
import { cn, formatPrice } from "@/lib/utils";

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

type BusinessForm = {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  gstNumber: string;
  deliveryTerms: string;
};

const toBusinessForm = (p?: SupplierProfileApi): BusinessForm => ({
  name: p?.name || "",
  contactPerson: p?.contactPerson || "",
  phone: p?.phone || "",
  email: p?.email || "",
  address: p?.address || "",
  category: p?.category || "",
  gstNumber: p?.gstNumber || "",
  deliveryTerms: p?.deliveryTerms || "",
});

/** Card with a title row, an Edit button, and either a read view or a form. */
function Section({
  icon: Icon,
  title,
  description,
  editing,
  onEdit,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  editing?: boolean;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-zinc-200">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1B2A4A]/[0.06] text-[#1B2A4A]">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="font-semibold text-[#1B2A4A]">{title}</h2>
            <p className="text-sm text-zinc-500">{description}</p>
          </div>
        </div>
        {onEdit && !editing && (
          <button type="button" onClick={onEdit} className={cn(btn.secondary, "h-9 px-3.5 text-[13px]")}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

function ReadRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className={cn("mt-0.5 text-sm", value ? "text-[#1B2A4A]" : "text-zinc-400", mono && value && "font-mono")}>
        {value || "Not added"}
      </dd>
    </div>
  );
}

function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-4 py-3.5 ring-1 ring-zinc-100">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums text-[#1B2A4A]">{value}</dd>
      {note && <p className="mt-0.5 text-xs text-zinc-500">{note}</p>}
    </div>
  );
}

/** Orders and earnings from Alayn restaurants, so suppliers can check the numbers themselves. */
function AlaynActivity({ stats, loading, error }: { stats: SupplierStats; loading: boolean; error: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={84} borderRadius={12} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-zinc-500">Couldn’t load your order history right now. Refresh the page to try again.</p>;
  }

  if (stats.totalOrders === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No orders yet. When a restaurant on Alayn orders from you, your totals will show up here.
      </p>
    );
  }

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <div className="space-y-5">
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Orders from Alayn"
          value={stats.totalOrders.toLocaleString("en-IN")}
          note={stats.firstOrderAt ? `Since ${formatDate(stats.firstOrderAt)}` : undefined}
        />
        <StatTile
          label="Total earned"
          value={`₹${formatPrice(stats.earnedPaise)}`}
          note={`From ${plural(stats.deliveredOrders, "delivered order")}`}
        />
        <StatTile label="Earned this month" value={`₹${formatPrice(stats.earnedThisMonthPaise)}`} />
        <StatTile
          label="Open orders"
          value={`₹${formatPrice(stats.inProgressPaise)}`}
          note={`${plural(stats.inProgressOrders, "order")} not delivered yet`}
        />
      </dl>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
        {stats.fulfilmentRate !== null && (
          <span>
            <span className="font-semibold tabular-nums text-[#1B2A4A]">{stats.fulfilmentRate}%</span> of finished orders delivered
          </span>
        )}
        {stats.notFulfilledOrders > 0 && (
          <span>
            <span className="font-semibold tabular-nums text-[#1B2A4A]">{stats.notFulfilledOrders}</span> cancelled or couldn’t fulfil
          </span>
        )}
      </div>

      {stats.topRestaurants.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-zinc-500">Restaurants that order from you most</h3>
          <ul className="mt-2 divide-y divide-zinc-100 rounded-xl ring-1 ring-zinc-100">
            {stats.topRestaurants.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                <span className="truncate text-[#1B2A4A]">{r.name}</span>
                <span className="shrink-0 tabular-nums text-zinc-600">
                  {plural(r.orders, "order")} · <span className="font-medium text-[#1B2A4A]">₹{formatPrice(r.earnedPaise)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Earnings count goods the restaurant marked as received, at the price on the order.</p>
        <Link href="/orders" className="inline-flex items-center gap-1 font-medium text-[#1B2A4A] hover:underline">
          See all orders <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  hasError,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  hasError?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={inputClass(hasError, "h-11 pr-11")}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-400 hover:text-[#1B2A4A]"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SupplierProfilePage() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const { data: profile, isLoading: profileLoading } = useGetMyProfileQuery();
  const [updateBusiness, { isLoading: savingBusiness }] = useUpdateMyProfileMutation();
  const [updateAccount, { isLoading: savingAccount }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: changingPw }] = useChangePasswordMutation();
  const { data: orders, isLoading: ordersLoading, isError: ordersError } = useGetSupplierPortalOrdersQuery();
  const [mountedNow, setMountedNow] = useState<Date | null>(null);
  useEffect(() => {
    setMountedNow(new Date());
  }, []);
  const stats = useMemo(() => computeSupplierStats(orders ?? [], mountedNow), [orders, mountedNow]);

  // ---------- Business ----------
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [business, setBusiness] = useState<BusinessForm>(toBusinessForm());
  const [businessError, setBusinessError] = useState("");

  // Refill the form whenever a fresh copy of the profile arrives (done during render, not in an effect)
  const [syncedProfile, setSyncedProfile] = useState<SupplierProfileApi | undefined>(undefined);
  if (profile && profile !== syncedProfile) {
    setSyncedProfile(profile);
    setBusiness(toBusinessForm(profile));
  }

  const setB = (k: keyof BusinessForm, v: string) => {
    setBusiness((b) => ({ ...b, [k]: v }));
    if (businessError) setBusinessError("");
  };

  const saveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business.name.trim()) {
      setBusinessError("Enter your business name.");
      document.getElementById("biz-name")?.focus();
      return;
    }
    try {
      await updateBusiness({
        name: business.name.trim(),
        contactPerson: business.contactPerson.trim() || undefined,
        phone: business.phone.trim() || undefined,
        email: business.email.trim() || undefined,
        address: business.address.trim() || undefined,
        category: business.category.trim() || undefined,
        gstNumber: business.gstNumber.trim() || undefined,
        deliveryTerms: business.deliveryTerms.trim() || undefined,
      }).unwrap();
      toast.success("Business details saved. Restaurants see the update straight away.");
      setEditingBusiness(false);
    } catch (err) {
      setBusinessError(apiErrorMessage(err, "Couldn’t save your business details. Try again."));
    }
  };

  // ---------- Account ----------
  const [editingAccount, setEditingAccount] = useState(false);
  const [account, setAccount] = useState({ name: user?.name || "", phoneNo: user?.phoneNo || "" });
  const [accountError, setAccountError] = useState("");
  const [syncedUser, setSyncedUser] = useState(user);
  if (user !== syncedUser) {
    setSyncedUser(user);
    setAccount({ name: user?.name || "", phoneNo: user?.phoneNo || "" });
  }

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.name.trim()) {
      setAccountError("Enter your name.");
      return;
    }
    try {
      const res = await updateAccount({ name: account.name.trim(), phoneNo: account.phoneNo.trim() }).unwrap();
      dispatch(setCredentials({ user: res?.data || res }));
      toast.success("Your details are saved.");
      setEditingAccount(false);
    } catch (err) {
      setAccountError(apiErrorMessage(err, "Couldn’t save your details. Try again."));
    }
  };

  // ---------- Password ----------
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState<{ field?: keyof typeof pw; message: string } | null>(null);
  const setPwField = (k: keyof typeof pw, v: string) => {
    setPw((p) => ({ ...p, [k]: v }));
    if (pwError) setPwError(null);
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.oldPassword) return setPwError({ field: "oldPassword", message: "Enter your current password." });
    const problem = passwordProblem(pw.newPassword);
    if (problem) return setPwError({ field: "newPassword", message: problem });
    if (pw.newPassword !== pw.confirmPassword)
      return setPwError({ field: "confirmPassword", message: "The new passwords don’t match." });
    try {
      await changePassword({ oldPassword: pw.oldPassword, newPassword: pw.newPassword }).unwrap();
      toast.success("Password changed.");
      setPw({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError({ message: apiErrorMessage(err, "Couldn’t change your password. Check your current password.") });
    }
  };

  const formActions = (onCancel: () => void, saving: boolean, label: string) => (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} className={btn.secondary}>
        Cancel
      </button>
      <button type="submit" disabled={saving} className={btn.primary}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </button>
    </div>
  );

  return (
    <SupplierLayout>
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Business profile" description="Your orders and earnings on Alayn, what restaurants see about you, and your sign-in details." />

        <div className="space-y-5">
          {/* Orders & earnings from Alayn */}
          <Section
            icon={TrendingUp}
            title="Your business with Alayn"
            description="Every order Alayn restaurants have placed with you, and what you’ve earned."
          >
            <AlaynActivity stats={stats} loading={ordersLoading} error={ordersError} />
          </Section>

          {/* Business */}
          <Section
            icon={Building2}
            title="Your business"
            description="Shown to restaurants when they find you and order."
            editing={editingBusiness}
            onEdit={profile ? () => setEditingBusiness(true) : undefined}
          >
            {profileLoading ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <Skeleton height={12} width={80} />
                    <Skeleton height={16} width={180} className="mt-1" />
                  </div>
                ))}
              </div>
            ) : editingBusiness ? (
              <form onSubmit={saveBusiness} noValidate>
                {businessError && (
                  <p role="alert" className="mb-5 rounded-xl bg-rose-50 p-3.5 text-sm text-rose-700 ring-1 ring-rose-200">
                    {businessError}
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="biz-name" label="Business name" className="sm:col-span-2">
                    <input
                      id="biz-name"
                      value={business.name}
                      onChange={(e) => setB("name", e.target.value)}
                      autoComplete="organization"
                      className={inputClass(!!businessError && !business.name.trim(), "h-11")}
                      autoFocus
                    />
                  </Field>
                  <Field id="biz-category" label="What you mainly supply">
                    <input
                      id="biz-category"
                      list="biz-category-options"
                      value={business.category}
                      onChange={(e) => setB("category", e.target.value)}
                      className={inputClass(false, "h-11")}
                    />
                    <datalist id="biz-category-options">
                      {SUPPLY_CATEGORIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </Field>
                  <Field id="biz-contact" label="Contact person">
                    <input
                      id="biz-contact"
                      value={business.contactPerson}
                      onChange={(e) => setB("contactPerson", e.target.value)}
                      autoComplete="name"
                      className={inputClass(false, "h-11")}
                    />
                  </Field>
                  <Field id="biz-phone" label="Orders phone / WhatsApp">
                    <input
                      id="biz-phone"
                      type="tel"
                      inputMode="tel"
                      value={business.phone}
                      onChange={(e) => setB("phone", e.target.value)}
                      autoComplete="tel"
                      className={inputClass(false, "h-11")}
                    />
                  </Field>
                  <Field id="biz-email" label="Orders email">
                    <input
                      id="biz-email"
                      type="email"
                      inputMode="email"
                      value={business.email}
                      onChange={(e) => setB("email", e.target.value)}
                      autoComplete="email"
                      className={inputClass(false, "h-11")}
                    />
                  </Field>
                  <Field id="biz-address" label="Dispatch address" className="sm:col-span-2">
                    <textarea
                      id="biz-address"
                      rows={2}
                      value={business.address}
                      onChange={(e) => setB("address", e.target.value)}
                      autoComplete="street-address"
                      className={inputClass(false, "resize-none py-2.5")}
                    />
                  </Field>
                  <Field
                    id="biz-terms"
                    label="Delivery & payment terms"
                    optional
                    hint="e.g. Next day before 9 AM · Pay in 15 days"
                    className="sm:col-span-2"
                  >
                    <input
                      id="biz-terms"
                      value={business.deliveryTerms}
                      onChange={(e) => setB("deliveryTerms", e.target.value)}
                      className={inputClass(false, "h-11")}
                    />
                  </Field>
                  <Field id="biz-gst" label="GSTIN" optional>
                    <input
                      id="biz-gst"
                      value={business.gstNumber}
                      onChange={(e) => setB("gstNumber", e.target.value.toUpperCase())}
                      className={inputClass(false, "h-11 font-mono uppercase")}
                    />
                  </Field>
                </div>
                {formActions(
                  () => {
                    setEditingBusiness(false);
                    setBusiness(toBusinessForm(profile));
                    setBusinessError("");
                  },
                  savingBusiness,
                  "Save business details"
                )}
              </form>
            ) : (
              <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <ReadRow label="Business name" value={business.name} />
                <ReadRow label="What you mainly supply" value={business.category} />
                <ReadRow label="Contact person" value={business.contactPerson} />
                <ReadRow label="Orders phone / WhatsApp" value={business.phone} />
                <ReadRow label="Orders email" value={business.email} />
                <ReadRow label="GSTIN" value={business.gstNumber} mono />
                <div className="sm:col-span-2">
                  <ReadRow label="Dispatch address" value={business.address} />
                </div>
                <div className="sm:col-span-2">
                  <ReadRow label="Delivery & payment terms" value={business.deliveryTerms} />
                </div>
              </dl>
            )}
          </Section>

          {/* Account */}
          <Section
            icon={User}
            title="Your account"
            description="The person who signs in to this portal."
            editing={editingAccount}
            onEdit={() => setEditingAccount(true)}
          >
            {editingAccount ? (
              <form onSubmit={saveAccount} noValidate>
                {accountError && (
                  <p role="alert" className="mb-5 rounded-xl bg-rose-50 p-3.5 text-sm text-rose-700 ring-1 ring-rose-200">
                    {accountError}
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="acc-name" label="Your name">
                    <input
                      id="acc-name"
                      value={account.name}
                      onChange={(e) => {
                        setAccount((a) => ({ ...a, name: e.target.value }));
                        if (accountError) setAccountError("");
                      }}
                      autoComplete="name"
                      className={inputClass(!!accountError && !account.name.trim(), "h-11")}
                      autoFocus
                    />
                  </Field>
                  <Field id="acc-phone" label="Your phone">
                    <input
                      id="acc-phone"
                      type="tel"
                      inputMode="tel"
                      value={account.phoneNo}
                      onChange={(e) => setAccount((a) => ({ ...a, phoneNo: e.target.value }))}
                      autoComplete="tel"
                      className={inputClass(false, "h-11")}
                    />
                  </Field>
                  <Field id="acc-email" label="Sign-in email" hint="Contact support to change the email you sign in with." className="sm:col-span-2">
                    <input id="acc-email" value={user?.email || ""} disabled className={inputClass(false, "h-11")} />
                  </Field>
                </div>
                {formActions(
                  () => {
                    setEditingAccount(false);
                    setAccount({ name: user?.name || "", phoneNo: user?.phoneNo || "" });
                    setAccountError("");
                  },
                  savingAccount,
                  "Save my details"
                )}
              </form>
            ) : (
              <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <ReadRow label="Your name" value={user?.name} />
                <ReadRow label="Your phone" value={user?.phoneNo} />
                <div className="sm:col-span-2">
                  <ReadRow label="Sign-in email" value={user?.email} />
                </div>
              </dl>
            )}
          </Section>

          {/* Password */}
          <Section icon={Lock} title="Password" description="Use at least 8 characters, with a letter and a number.">
            <form onSubmit={savePassword} noValidate>
              {pwError && !pwError.field && (
                <p role="alert" className="mb-5 rounded-xl bg-rose-50 p-3.5 text-sm text-rose-700 ring-1 ring-rose-200">
                  {pwError.message}
                </p>
              )}
              <div className="grid gap-5 sm:grid-cols-3">
                <Field id="pw-old" label="Current password" error={pwError?.field === "oldPassword" ? pwError.message : undefined}>
                  <PasswordInput
                    id="pw-old"
                    value={pw.oldPassword}
                    onChange={(v) => setPwField("oldPassword", v)}
                    autoComplete="current-password"
                    hasError={pwError?.field === "oldPassword"}
                  />
                </Field>
                <Field
                  id="pw-new"
                  label="New password"
                  error={pwError?.field === "newPassword" ? pwError.message : undefined}
                  hint={PASSWORD_HINT}
                >
                  <PasswordInput
                    id="pw-new"
                    value={pw.newPassword}
                    onChange={(v) => setPwField("newPassword", v)}
                    autoComplete="new-password"
                    hasError={pwError?.field === "newPassword"}
                  />
                </Field>
                <Field
                  id="pw-confirm"
                  label="Confirm new password"
                  error={pwError?.field === "confirmPassword" ? pwError.message : undefined}
                >
                  <PasswordInput
                    id="pw-confirm"
                    value={pw.confirmPassword}
                    onChange={(v) => setPwField("confirmPassword", v)}
                    autoComplete="new-password"
                    hasError={pwError?.field === "confirmPassword"}
                  />
                </Field>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={changingPw || !pw.oldPassword || !pw.newPassword}
                  className={btn.dark}
                >
                  {changingPw && <Loader2 className="h-4 w-4 animate-spin" />}
                  Change password
                </button>
              </div>
            </form>
          </Section>
        </div>
      </div>
    </SupplierLayout>
  );
}

export default function SupplierProfilePageWrapper() {
  return (
    <Suspense fallback={null}>
      <SupplierProfilePage />
    </Suspense>
  );
}
