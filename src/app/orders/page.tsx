"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Inbox,
  Package,
  Send,
  Truck,
  Loader2,
  MapPin,
  Phone,
  CalendarClock,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import SupplierLayout, { PageHeader } from "@/components/layout/SupplierLayout";
import Modal, { btn } from "@/components/ui/Modal";
import NumberInput from "@/components/ui/NumberInput";
import { inputClass } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  useGetSupplierPortalOrdersQuery,
  useUpdateSupplierPOStatusMutation,
  PurchaseOrderApi,
} from "@/redux/slices/procurementApiSlice";
import { useAppSelector } from "@/redux/store/hooks";
import { cn, formatPrice } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/apiError";
import {
  STATUS_META,
  OrderTab,
  tabOf,
  needsAction,
  formatOrderNo,
  timeAgo,
  formatDate,
} from "@/lib/orderStatus";

const TABS: { id: OrderTab; label: string }[] = [
  { id: "TODO", label: "To do" },
  { id: "ON_THE_WAY", label: "On the way" },
  { id: "DONE", label: "Done" },
  { id: "ALL", label: "All" },
];

const EMPTY_COPY: Record<OrderTab, { title: string; body: string }> = {
  TODO: { title: "You’re all caught up", body: "New orders from restaurants will show up here." },
  ON_THE_WAY: { title: "Nothing on the way", body: "Orders you dispatch appear here until the restaurant receives them." },
  DONE: { title: "No finished orders yet", body: "Delivered and closed orders are kept here for reference." },
  ALL: { title: "No orders yet", body: "When a restaurant orders from your catalog, it lands here." },
};

const restaurantName = (po: PurchaseOrderApi) => po.outlet?.restaurantName || po.outlet?.name || "Restaurant";
const branchName = (po: PurchaseOrderApi) => (po.outlet?.restaurantName ? po.outlet?.name : undefined);
const unitOf = (it: PurchaseOrderApi["items"][number]) => it.item?.unit || "units";

function StatusPill({ status }: { status: PurchaseOrderApi["status"] }) {
  const meta = STATUS_META[status] ?? STATUS_META.DRAFT;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", meta.tone)}>
      {meta.label}
    </span>
  );
}

function itemsSummary(po: PurchaseOrderApi, max = 3) {
  const parts = po.items.slice(0, max).map((it) => `${it.item?.name || "Item"} ${Number(it.orderedQuantity)} ${unitOf(it)}`);
  const more = po.items.length - max;
  return parts.join(" · ") + (more > 0 ? ` · +${more} more` : "");
}

function SupplierOrdersPage() {
  const toast = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const { data: orders = [], isLoading, isError, refetch } = useGetSupplierPortalOrdersQuery(undefined, {
    pollingInterval: 60_000,
  });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateSupplierPOStatusMutation();

  const [now, setNow] = useState<number | null>(null);
  const [todayMinDate, setTodayMinDate] = useState("");

  useEffect(() => {
    setNow(Date.now());
    setTodayMinDate(new Date().toISOString().split("T")[0]);
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<OrderTab>("TODO");

  // Dialogs
  const [viewing, setViewing] = useState<PurchaseOrderApi | null>(null);
  const [dispatching, setDispatching] = useState<PurchaseOrderApi | null>(null);
  const [declining, setDeclining] = useState<PurchaseOrderApi | null>(null);
  const [packingId, setPackingId] = useState<string | null>(null);

  // Dispatch form
  const [qty, setQty] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [formError, setFormError] = useState("");

  const counts = useMemo(() => {
    const c: Record<OrderTab, number> = { TODO: 0, ON_THE_WAY: 0, DONE: 0, ALL: orders.length };
    orders.forEach((po) => c[tabOf(po.status)]++);
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders
      .filter((po) => tab === "ALL" || tabOf(po.status) === tab)
      .filter(
        (po) =>
          !q ||
          formatOrderNo(po).toLowerCase().includes(q) ||
          restaurantName(po).toLowerCase().includes(q) ||
          (po.outlet?.name ?? "").toLowerCase().includes(q) ||
          po.items.some((it) => (it.item?.name ?? "").toLowerCase().includes(q))
      )
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [orders, search, tab]);

  // ---------- Actions ----------
  const startPacking = async (po: PurchaseOrderApi) => {
    setPackingId(po.id);
    try {
      await updateStatus({ id: po.id, status: "PACKING", supplierNotes: "Order is being packed" }).unwrap();
      toast.success(`${formatOrderNo(po)} marked as packing. ${restaurantName(po)} can see it.`);
      setViewing(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn’t update the order. Try again."));
    } finally {
      setPackingId(null);
    }
  };

  const openDispatch = (po: PurchaseOrderApi) => {
    const initial: Record<string, number> = {};
    po.items.forEach((it) => {
      initial[it.itemId] = Number(it.dispatchedQuantity || it.orderedQuantity);
    });
    setQty(initial);
    setNotes(po.status === "SENT" || po.status === "PACKING" ? "" : po.supplierNotes || "");
    setNextDate(po.expectedNextDeliveryDate ? po.expectedNextDeliveryDate.split("T")[0] : "");
    setFormError("");
    setViewing(null);
    setDispatching(po);
  };

  const shortItems = dispatching
    ? dispatching.items.filter((it) => (qty[it.itemId] ?? Number(it.orderedQuantity)) < Number(it.orderedQuantity))
    : [];
  const isPartial = shortItems.length > 0;

  const confirmDispatch = async () => {
    if (!dispatching) return;
    setFormError("");
    const items = dispatching.items.map((it) => ({
      itemId: it.itemId,
      dispatchedQuantity: Math.max(0, Number(qty[it.itemId] ?? it.orderedQuantity) || 0),
    }));
    if (items.every((i) => i.dispatchedQuantity <= 0)) {
      setFormError("Enter a quantity for at least one item. If you can’t send anything, use “Can’t fulfil”.");
      return;
    }
    if (isPartial && !nextDate) {
      setFormError("You’re sending less than ordered. Pick the date the rest will arrive.");
      return;
    }
    try {
      await updateStatus({
        id: dispatching.id,
        status: isPartial ? "PARTIALLY_DISPATCHED" : "DISPATCHED",
        supplierNotes: notes.trim() || undefined,
        expectedNextDeliveryDate: isPartial ? nextDate : undefined,
        items,
      }).unwrap();
      toast.success(
        isPartial
          ? `Part of ${formatOrderNo(dispatching)} sent. The rest is due ${formatDate(nextDate)}.`
          : `${formatOrderNo(dispatching)} is on its way to ${restaurantName(dispatching)}.`
      );
      setDispatching(null);
    } catch (err) {
      setFormError(apiErrorMessage(err, "Couldn’t record the dispatch. Try again."));
    }
  };

  const openDecline = (po: PurchaseOrderApi) => {
    setNotes("");
    setFormError("");
    setDispatching(null);
    setViewing(null);
    setDeclining(po);
  };

  const confirmDecline = async () => {
    if (!declining) return;
    if (!notes.trim()) {
      setFormError("Add a short reason so the restaurant knows what happened.");
      return;
    }
    try {
      await updateStatus({ id: declining.id, status: "OUT_OF_STOCK", supplierNotes: notes.trim() }).unwrap();
      toast.success(`${restaurantName(declining)} has been told you can’t fulfil ${formatOrderNo(declining)}.`);
      setDeclining(null);
    } catch (err) {
      setFormError(apiErrorMessage(err, "Couldn’t update the order. Try again."));
    }
  };

  /** The one thing to do next with this order, if anything. */
  const primaryAction = (po: PurchaseOrderApi, size: "sm" | "md" = "sm") => {
    const cls = size === "sm" ? "h-9 px-3.5 text-[13px]" : "";
    if (po.status === "SENT")
      return (
        <button type="button" onClick={() => startPacking(po)} disabled={packingId === po.id} className={cn(btn.dark, cls)}>
          {packingId === po.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
          Start packing
        </button>
      );
    if (po.status === "PACKING")
      return (
        <button type="button" onClick={() => openDispatch(po)} className={cn(btn.primary, cls)}>
          <Send className="h-4 w-4" />
          Dispatch
        </button>
      );
    if (po.status === "PARTIALLY_DISPATCHED")
      return (
        <button type="button" onClick={() => openDispatch(po)} className={cn(btn.secondary, cls)}>
          <Truck className="h-4 w-4" />
          Send the rest
        </button>
      );
    return null;
  };

  const firstName = user?.name?.split(" ")[0];

  return (
    <SupplierLayout>
      <PageHeader
        title="Orders"
        description={
          isLoading
            ? "Loading your orders…"
            : counts.TODO > 0
            ? `${firstName ? `Hi ${firstName}. ` : ""}${counts.TODO} ${counts.TODO === 1 ? "order needs" : "orders need"} you.`
            : `${firstName ? `Hi ${firstName}. ` : ""}You’re all caught up.`
        }
      />

      {/* Tabs + search */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Order status" className="grid grid-cols-[1fr_1.5fr_1fr_0.8fr] gap-1 rounded-xl bg-zinc-200/60 p-1 sm:flex">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex h-9 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1 text-[13px] font-medium transition-colors sm:gap-2 sm:px-3.5 sm:text-sm",
                  active ? "bg-white text-[#1B2A4A] shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] font-semibold leading-5 tabular-nums",
                    t.id === "TODO" && counts.TODO > 0
                      ? "bg-[#C41E2A] text-white"
                      : active
                      ? "bg-zinc-100 text-zinc-600"
                      : "text-zinc-500"
                  )}
                >
                  {counts[t.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            aria-label="Search orders"
            placeholder="Search restaurant, PO or item"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass(false, "h-11 pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden")}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-5 ring-1 ring-zinc-200">
              <Skeleton height={18} width={220} />
              <Skeleton height={14} width={320} className="mt-2" />
            </div>
          ))}
        </div>
      ) : isError && orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-zinc-200">
          <h3 className="font-semibold text-[#1B2A4A]">Couldn’t load your orders</h3>
          <p className="mt-1 text-sm text-zinc-500">Check your connection and try again.</p>
          <button type="button" onClick={() => refetch()} className={cn(btn.secondary, "mt-5")}>
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-zinc-200">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            <Inbox className="h-6 w-6" />
          </span>
          {search ? (
            <>
              <h3 className="mt-4 font-semibold text-[#1B2A4A]">No orders match “{search}”</h3>
              <button type="button" onClick={() => setSearch("")} className="mt-2 text-sm font-semibold text-[#C41E2A] hover:underline">
                Clear search
              </button>
            </>
          ) : (
            <>
              <h3 className="mt-4 font-semibold text-[#1B2A4A]">{EMPTY_COPY[tab].title}</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">{EMPTY_COPY[tab].body}</p>
              {orders.length === 0 && (
                <Link href="/catalog" className={cn(btn.secondary, "mt-5")}>
                  Check your catalog
                </Link>
              )}
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((po) => {
            const action = primaryAction(po);
            const branch = branchName(po);
            return (
              <li
                key={po.id}
                className={cn(
                  "rounded-2xl bg-white ring-1 transition-shadow hover:shadow-md",
                  needsAction(po.status) ? "ring-zinc-300" : "ring-zinc-200"
                )}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  <button
                    type="button"
                    onClick={() => setViewing(po)}
                    className="min-w-0 flex-1 text-left"
                    aria-label={`Open ${formatOrderNo(po)} from ${restaurantName(po)}`}
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <StatusPill status={po.status} />
                      <span className="font-mono text-xs text-zinc-500">{formatOrderNo(po)}</span>
                      <span className="text-xs text-zinc-400">· {timeAgo(po.createdAt, now)}</span>
                    </div>
                    <p className="mt-1.5 truncate text-base font-semibold text-[#1B2A4A]">
                      {restaurantName(po)}
                      {branch && <span className="font-normal text-zinc-500"> · {branch}</span>}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-zinc-600">{itemsSummary(po)}</p>
                    {po.status === "PARTIALLY_DISPATCHED" && po.expectedNextDeliveryDate && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-violet-700">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Rest due {formatDate(po.expectedNextDeliveryDate)}
                      </p>
                    )}
                    {po.status === "OUT_OF_STOCK" && po.supplierNotes && (
                      <p className="mt-1.5 truncate text-xs text-rose-700">Reason: {po.supplierNotes}</p>
                    )}
                  </button>

                  <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-5">
                    <span className="text-base font-semibold tabular-nums text-[#1B2A4A]">₹{formatPrice(po.totalAmountPaise)}</span>
                    {action ?? (
                      <button
                        type="button"
                        onClick={() => setViewing(po)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-100"
                      >
                        Details
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ─── Order details ─────────────────────────────────────────── */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        size="lg"
        title={viewing ? restaurantName(viewing) : ""}
        description={
          viewing && (
            <span className="inline-flex flex-wrap items-center gap-2">
              <StatusPill status={viewing.status} />
              <span className="font-mono">{formatOrderNo(viewing)}</span>
              <span>· Placed {formatDate(viewing.createdAt)}</span>
            </span>
          )
        }
        footer={
          viewing && (
            <>
              {needsAction(viewing.status) && (
                <button type="button" onClick={() => openDecline(viewing)} className={cn(btn.ghostDanger, "sm:mr-auto")}>
                  Can’t fulfil
                </button>
              )}
              <button type="button" onClick={() => setViewing(null)} className={btn.secondary}>
                Close
              </button>
              {viewing.status === "SENT" && (
                <button type="button" onClick={() => openDispatch(viewing)} className={btn.secondary}>
                  Dispatch now
                </button>
              )}
              {primaryAction(viewing, "md")}
            </>
          )
        }
      >
        {viewing && (
          <div className="space-y-6">
            {(viewing.outlet?.address || viewing.outlet?.phone || branchName(viewing)) && (
              <div className="grid gap-4 rounded-xl bg-zinc-50 p-4 text-sm sm:grid-cols-2">
                <div className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Deliver to</p>
                    <p className="text-[#1B2A4A]">
                      {branchName(viewing) && <span className="font-medium">{branchName(viewing)}</span>}
                      {branchName(viewing) && viewing.outlet?.address && <br />}
                      {viewing.outlet?.address}
                      {viewing.outlet?.city ? `, ${viewing.outlet.city}` : ""}
                    </p>
                  </div>
                </div>
                {viewing.outlet?.phone && (
                  <div className="flex gap-2.5">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <div>
                      <p className="text-xs text-zinc-500">Contact</p>
                      <a href={`tel:${viewing.outlet.phone}`} className="font-medium text-[#1B2A4A] hover:underline">
                        {viewing.outlet.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#1B2A4A]">Items</h3>
              <ul className="divide-y divide-zinc-100 rounded-xl ring-1 ring-zinc-200">
                {viewing.items.map((it, idx) => {
                  const sent = Number(it.dispatchedQuantity ?? 0);
                  return (
                    <li key={it.id ?? idx} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-[#1B2A4A]">{it.item?.name || "Item"}</p>
                        <p className="text-xs text-zinc-500">
                          {Number(it.orderedQuantity)} {unitOf(it)} × ₹{formatPrice(it.unitCostPaise)}
                          {sent > 0 && ` · ${sent} sent`}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold tabular-nums text-[#1B2A4A]">
                        ₹{formatPrice(Number(it.orderedQuantity) * it.unitCostPaise)}
                      </span>
                    </li>
                  );
                })}
                <li className="flex items-center justify-between bg-zinc-50 px-4 py-3 text-sm">
                  <span className="font-medium text-zinc-600">Total</span>
                  <span className="text-base font-bold tabular-nums text-[#1B2A4A]">₹{formatPrice(viewing.totalAmountPaise)}</span>
                </li>
              </ul>
            </div>

            {viewing.expectedNextDeliveryDate && viewing.status === "PARTIALLY_DISPATCHED" && (
              <p className="flex items-center gap-2 text-sm text-violet-700">
                <CalendarClock className="h-4 w-4" />
                Rest of this order due {formatDate(viewing.expectedNextDeliveryDate)}
              </p>
            )}

            {viewing.supplierNotes && (
              <div className="rounded-xl bg-amber-50 p-4 text-sm ring-1 ring-amber-200">
                <p className="text-xs font-medium text-amber-800">Your note to the restaurant</p>
                <p className="mt-1 text-amber-900">{viewing.supplierNotes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ─── Dispatch ──────────────────────────────────────────────── */}
      <Modal
        open={!!dispatching}
        onClose={() => setDispatching(null)}
        size="lg"
        title={dispatching?.status === "PARTIALLY_DISPATCHED" ? "Send the rest" : "Dispatch order"}
        description={dispatching && `${formatOrderNo(dispatching)} · ${restaurantName(dispatching)}`}
        footer={
          dispatching && (
            <>
              {dispatching.status !== "PARTIALLY_DISPATCHED" && (
                <button type="button" onClick={() => openDecline(dispatching)} className={cn(btn.ghostDanger, "sm:mr-auto")}>
                  Can’t fulfil
                </button>
              )}
              <button type="button" onClick={() => setDispatching(null)} className={btn.secondary}>
                Cancel
              </button>
              <button type="button" onClick={confirmDispatch} disabled={isUpdating} className={btn.primary}>
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isPartial ? "Send part of order" : "Confirm dispatch"}
              </button>
            </>
          )
        }
      >
        {dispatching && (
          <div className="space-y-6">
            {formError && (
              <p role="alert" className="flex gap-2 rounded-xl bg-rose-50 p-3.5 text-sm text-rose-700 ring-1 ring-rose-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {formError}
              </p>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1B2A4A]">How much are you sending?</h3>
                {isPartial && (
                  <button
                    type="button"
                    onClick={() => {
                      const full: Record<string, number> = {};
                      dispatching.items.forEach((it) => (full[it.itemId] = Number(it.orderedQuantity)));
                      setQty(full);
                    }}
                    className="text-sm font-medium text-[#C41E2A] hover:underline"
                  >
                    Send everything
                  </button>
                )}
              </div>
              <ul className="divide-y divide-zinc-100 rounded-xl ring-1 ring-zinc-200">
                {dispatching.items.map((it) => {
                  const ordered = Number(it.orderedQuantity);
                  const value = qty[it.itemId] ?? ordered;
                  const short = ordered - value;
                  return (
                    <li key={it.itemId} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#1B2A4A]">{it.item?.name || "Item"}</p>
                        <p className="text-xs text-zinc-500">
                          Ordered {ordered} {unitOf(it)}
                          {short > 0 && (
                            <span className="ml-1.5 font-medium text-amber-700">
                              · {Math.round(short * 1000) / 1000} {unitOf(it)} short
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <NumberInput
                          value={value}
                          min={0}
                          max={ordered}
                          aria-label={`${it.item?.name || "Item"} quantity to send, in ${unitOf(it)}`}
                          onChange={(n) => setQty((prev) => ({ ...prev, [it.itemId]: n }))}
                          className={inputClass(false, "h-10 w-20 text-center font-semibold")}
                        />
                        <span className="w-10 text-xs text-zinc-500">{unitOf(it)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {isPartial && (
              <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
                <label htmlFor="next-delivery" className="block text-sm font-semibold text-amber-900">
                  When will the rest arrive?
                </label>
                <p className="mt-0.5 text-[13px] text-amber-800">
                  {shortItems.length === 1 ? "1 item is" : `${shortItems.length} items are`} short. The restaurant will see this date.
                </p>
                <input
                  id="next-delivery"
                  type="date"
                  value={nextDate}
                  min={todayMinDate || undefined}
                  onChange={(e) => setNextDate(e.target.value)}
                  className={inputClass(!!formError && !nextDate, "mt-3 h-11 sm:w-56")}
                />
              </div>
            )}

            <div>
              <label htmlFor="dispatch-notes" className="mb-1.5 block text-sm font-medium text-[#1B2A4A]">
                Note for the restaurant <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <textarea
                id="dispatch-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Vehicle MH-12-AB-1234, driver Ramesh +91 98765 43210"
                className={inputClass(false, "resize-none py-2.5")}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Can't fulfil ──────────────────────────────────────────── */}
      <Modal
        open={!!declining}
        onClose={() => setDeclining(null)}
        title="Can’t fulfil this order?"
        description={declining && `${formatOrderNo(declining)} · ${restaurantName(declining)}`}
        footer={
          <>
            <button type="button" onClick={() => setDeclining(null)} className={btn.secondary}>
              Keep order
            </button>
            <button type="button" onClick={confirmDecline} disabled={isUpdating} className={btn.danger}>
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
              Mark as can’t fulfil
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            The restaurant will be told straight away so they can order elsewhere. This can’t be undone.
          </p>
          {formError && (
            <p role="alert" className="rounded-xl bg-rose-50 p-3.5 text-sm text-rose-700 ring-1 ring-rose-200">
              {formError}
            </p>
          )}
          <div>
            <label htmlFor="decline-reason" className="mb-1.5 block text-sm font-medium text-[#1B2A4A]">
              Reason
            </label>
            <textarea
              id="decline-reason"
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="e.g. Paneer stock ran out today, next batch on Friday"
              className={inputClass(!!formError, "resize-none py-2.5")}
            />
          </div>
        </div>
      </Modal>
    </SupplierLayout>
  );
}


export default function SupplierOrdersPageWrapper() {
  return (
    <Suspense fallback={null}>
      <SupplierOrdersPage />
    </Suspense>
  );
}
