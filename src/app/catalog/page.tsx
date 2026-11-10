"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, X, Pencil, Trash2, Clock, Loader2, Layers, Tag, Inbox, Truck, RotateCcw } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import SupplierLayout, { PageHeader } from "@/components/layout/SupplierLayout";
import Modal, { btn } from "@/components/ui/Modal";
import Field, { inputClass } from "@/components/ui/Field";
import NumberInput from "@/components/ui/NumberInput";
import { useToast } from "@/components/ui/Toast";
import {
  useGetMyCatalogQuery,
  useCreateSupplierItemMutation,
  useUpdateSupplierItemMutation,
  useDeleteSupplierItemMutation,
  SupplierItemApi,
} from "@/redux/slices/supplierApiSlice";
import { cn, formatPrice } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/apiError";

const COMMON_CATEGORIES = [
  "Dairy",
  "Vegetables & Produce",
  "Meat & Poultry",
  "Dry Goods & Grains",
  "Oils & Condiments",
  "Spices & Seasonings",
  "Packaging & Disposables",
  "Bakery & Bread",
  "Beverages",
  "Cleaning & Hygiene",
];
const COMMON_UNITS = ["kg", "gram", "litre", "ml", "pcs", "dozen", "tray", "box", "pack", "bag", "carton", "can", "bottle"];
const LEAD_TIMES = [6, 12, 24, 48, 72];

type StockFilter = "ALL" | "IN" | "OUT";

interface FormState {
  name: string;
  category: string;
  unit: string;
  price: number | "";
  minOrderQty: number | "";
  leadTimeHours: number | "";
  inStock: boolean;
  sku: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "",
  unit: "kg",
  price: "",
  minOrderQty: 1,
  leadTimeHours: 24,
  inStock: true,
  sku: "",
  description: "",
};

function StockSwitch({
  item,
  pending,
  onToggle,
}: {
  item: SupplierItemApi;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={item.inStock}
      aria-label={`${item.name} in stock`}
      onClick={onToggle}
      disabled={pending}
      className="group inline-flex items-center gap-2.5 disabled:opacity-60"
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          item.inStock ? "bg-emerald-600" : "bg-zinc-300"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
            item.inStock ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </span>
      <span className={cn("text-sm font-medium", item.inStock ? "text-emerald-700" : "text-zinc-500")}>
        {pending ? "Saving…" : item.inStock ? "In stock" : "Out of stock"}
      </span>
    </button>
  );
}

function CatalogContent() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";

  const { data: catalog = [], isLoading, isError, refetch } = useGetMyCatalogQuery();
  const [createItem, { isLoading: isCreating }] = useCreateSupplierItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateSupplierItemMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteSupplierItemMutation();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stock, setStock] = useState<StockFilter>("ALL");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierItemApi | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "form", string>>>({});
  const [toDelete, setToDelete] = useState<SupplierItemApi | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(catalog.map((i) => i.category).filter(Boolean))).sort()],
    [catalog]
  );
  const categorySuggestions = useMemo(
    () => Array.from(new Set([...COMMON_CATEGORIES, ...catalog.map((i) => i.category)])).sort(),
    [catalog]
  );
  const inStockCount = catalog.filter((i) => i.inStock).length;

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return catalog
      .filter((i) => category === "All" || i.category === category)
      .filter((i) => (stock === "ALL" ? true : stock === "IN" ? i.inStock : !i.inStock))
      .filter(
        (i) =>
          !q ||
          i.name.toLowerCase().includes(q) ||
          (i.sku ?? "").toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog, search, category, stock]);

  const filtersActive = search || category !== "All" || stock !== "ALL";

  // ---------- Form ----------
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key] || errors.form) setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category: category !== "All" ? category : catalog[0]?.category ?? "" });
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (item: SupplierItemApi) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      price: item.pricePaise / 100,
      minOrderQty: Number(item.minOrderQty) || 1,
      leadTimeHours: item.leadTimeHours,
      inStock: item.inStock,
      sku: item.sku ?? "",
      description: item.description ?? "",
    });
    setErrors({});
    setFormOpen(true);
  };

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Enter the product name.";
    if (!form.category.trim()) errs.category = "Choose or type a category.";
    if (!form.unit.trim()) errs.unit = "Enter the unit you sell in.";
    if (form.price === "" || form.price <= 0) errs.price = "Enter a price above ₹0.";
    if (form.leadTimeHours === "" || form.leadTimeHours < 1) errs.leadTimeHours = "Enter how many hours delivery takes.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      document.getElementById(`item-${Object.keys(errs)[0]}`)?.focus();
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      unit: form.unit.trim(),
      pricePaise: Math.round(Number(form.price) * 100),
      minOrderQty: Math.max(0.001, Number(form.minOrderQty) || 1),
      leadTimeHours: Math.max(1, Math.round(Number(form.leadTimeHours))),
      inStock: form.inStock,
      sku: form.sku.trim() || undefined,
      description: form.description.trim() || undefined,
    };

    try {
      if (editing) {
        await updateItem({ id: editing.id, data: payload }).unwrap();
        toast.success(`${payload.name} updated.`);
      } else {
        await createItem(payload).unwrap();
        toast.success(`${payload.name} added. Restaurants can order it now.`);
        if (isWelcome) router.replace("/catalog");
      }
      setFormOpen(false);
    } catch (err) {
      setErrors({ form: apiErrorMessage(err, "Couldn’t save the product. Check the details and try again.") });
    }
  };

  const toggleStock = async (item: SupplierItemApi) => {
    setTogglingId(item.id);
    try {
      await updateItem({ id: item.id, data: { inStock: !item.inStock } }).unwrap();
      toast.success(item.inStock ? `${item.name} marked out of stock.` : `${item.name} is back in stock.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn’t update stock. Try again."));
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteItem(toDelete.id).unwrap();
      toast.success(`${toDelete.name} removed from your catalog.`);
      setToDelete(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn’t remove the product. Try again."));
    }
  };

  const saving = isCreating || isUpdating;

  return (
    <>
      <PageHeader
        title="Catalog"
        description={
          catalog.length > 0
            ? `${catalog.length} ${catalog.length === 1 ? "product" : "products"} · ${inStockCount} in stock. Restaurants order at these rates.`
            : "The products and rates restaurants can order from you."
        }
        action={
          catalog.length > 0 && (
            <button type="button" onClick={openAdd} className={btn.primary}>
              <Plus className="h-4 w-4" />
              Add product
            </button>
          )
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-5 ring-1 ring-zinc-200">
              <Skeleton height={18} width={240} />
              <Skeleton height={14} width={160} className="mt-2" />
            </div>
          ))}
        </div>
      ) : isError && catalog.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-zinc-200">
          <h3 className="font-semibold text-[#1B2A4A]">Couldn’t load your catalog</h3>
          <p className="mt-1 text-sm text-zinc-500">Check your connection and try again.</p>
          <button type="button" onClick={() => refetch()} className={cn(btn.secondary, "mt-5")}>
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      ) : catalog.length === 0 ? (
        /* First run: nothing listed yet */
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200">
          <div className="px-6 py-10 sm:px-10 sm:py-12">
            {isWelcome && (
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                Account created
              </p>
            )}
            <h2 className="text-xl font-extrabold tracking-[-0.01em] text-[#1B2A4A] sm:text-2xl">Add your first product</h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-zinc-600">
              Restaurants on Alayn can only order what’s in your catalog. Add each product with its price, minimum order
              and delivery time. It takes about a minute each.
            </p>
            <button type="button" onClick={openAdd} className={cn(btn.primary, "mt-6")}>
              <Plus className="h-4 w-4" />
              Add a product
            </button>
          </div>
          <ol className="grid gap-px border-t border-zinc-100 bg-zinc-100 sm:grid-cols-3">
            {[
              { icon: Tag, title: "Set your rate", body: "Price per kg, litre, box or piece. Change it whenever you like." },
              { icon: Truck, title: "Say how fast you deliver", body: "Owners compare delivery times when choosing a supplier." },
              { icon: Inbox, title: "Orders arrive here", body: "You’ll see each new order under Orders, ready to pack." },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="bg-white px-6 py-5 sm:px-8">
                <Icon className="h-5 w-5 text-[#C41E2A]" />
                <p className="mt-3 text-sm font-semibold text-[#1B2A4A]">{title}</p>
                <p className="mt-1 text-sm text-zinc-500">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                aria-label="Search products"
                placeholder="Search products or SKU"
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
            <div className="flex gap-3">
              {categories.length > 2 && (
                <select
                  aria-label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass(false, "h-11 w-auto min-w-44 pr-9")}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "All categories" : c}
                    </option>
                  ))}
                </select>
              )}
              <div role="radiogroup" aria-label="Stock" className="flex shrink-0 gap-1 rounded-xl bg-zinc-200/60 p-1">
                {(
                  [
                    ["ALL", "All"],
                    ["IN", "In stock"],
                    ["OUT", "Out of stock"],
                  ] as [StockFilter, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={stock === id}
                    onClick={() => setStock(id)}
                    className={cn(
                      "h-9 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors",
                      stock === id ? "bg-white text-[#1B2A4A] shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-zinc-200">
              <Layers className="mx-auto h-8 w-8 text-zinc-300" />
              <h3 className="mt-3 font-semibold text-[#1B2A4A]">No products match these filters</h3>
              {filtersActive && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setStock("ALL");
                  }}
                  className="mt-2 text-sm font-semibold text-[#C41E2A] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200">
              {/* Column labels (desktop) */}
              <div className="hidden grid-cols-[minmax(0,2.2fr)_1fr_1fr_0.8fr_1.2fr_auto] gap-4 border-b border-zinc-100 bg-zinc-50 px-5 py-3 text-xs font-medium text-zinc-500 md:grid">
                <span>Product</span>
                <span>Price</span>
                <span>Min. order</span>
                <span>Delivery</span>
                <span>Stock</span>
                <span className="w-20" />
              </div>
              <ul className="divide-y divide-zinc-100">
                {visible.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,2.2fr)_1fr_1fr_0.8fr_1.2fr_auto]",
                      !item.inStock && "bg-zinc-50/60"
                    )}
                  >
                    <div className="min-w-0">
                      <p className={cn("truncate font-semibold", item.inStock ? "text-[#1B2A4A]" : "text-zinc-500")}>{item.name}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {item.category}
                        {item.sku && <span className="font-mono"> · {item.sku}</span>}
                      </p>
                    </div>
                    <p className="text-right font-semibold tabular-nums text-[#1B2A4A] md:text-left">
                      ₹{formatPrice(item.pricePaise)}
                      <span className="font-normal text-zinc-500"> / {item.unit}</span>
                    </p>
                    <p className="hidden text-sm text-zinc-600 md:block">
                      {Number(item.minOrderQty)} {item.unit}
                    </p>
                    <p className="hidden items-center gap-1.5 text-sm text-zinc-600 md:flex">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      {item.leadTimeHours}h
                    </p>
                    {/* Phone: secondary facts under the name */}
                    <p className="col-span-2 -mt-1 text-xs text-zinc-500 md:hidden">
                      Min {Number(item.minOrderQty)} {item.unit} · Delivers in {item.leadTimeHours}h
                    </p>
                    <div className="md:col-auto">
                      <StockSwitch item={item} pending={togglingId === item.id} onToggle={() => toggleStock(item)} />
                    </div>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        aria-label={`Edit ${item.name}`}
                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#1B2A4A]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(item)}
                        aria-label={`Remove ${item.name}`}
                        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Floating add button on phones */}
          <button
            type="button"
            onClick={openAdd}
            aria-label="Add product"
            className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#C41E2A] text-white shadow-lg shadow-[#C41E2A]/30 md:hidden"
          >
            <Plus className="h-6 w-6" />
          </button>
        </>
      )}

      {/* ─── Add / edit ────────────────────────────────────────────── */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="lg"
        title={editing ? `Edit ${editing.name}` : "Add a product"}
        description={editing ? "Changes apply to new orders straight away." : "Restaurants can order it as soon as you save."}
        footer={
          <>
            <button type="button" onClick={() => setFormOpen(false)} className={btn.secondary}>
              Cancel
            </button>
            <button type="submit" form="product-form" disabled={saving} className={btn.primary}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Add product"}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={save} noValidate className="space-y-5">
          {errors.form && (
            <p role="alert" className="rounded-xl bg-rose-50 p-3.5 text-sm text-rose-700 ring-1 ring-rose-200">
              {errors.form}
            </p>
          )}

          <Field id="item-name" label="Product name" error={errors.name}>
            <input
              id="item-name"
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Fresh Paneer"
              className={inputClass(!!errors.name, "h-11")}
              autoFocus
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="item-category" label="Category" error={errors.category}>
              <input
                id="item-category"
                type="text"
                list="category-options"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="Pick or type one"
                className={inputClass(!!errors.category, "h-11")}
              />
              <datalist id="category-options">
                {categorySuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field id="item-unit" label="Sold per" error={errors.unit}>
              <input
                id="item-unit"
                type="text"
                list="unit-options"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="kg, litre, box…"
                className={inputClass(!!errors.unit, "h-11")}
              />
              <datalist id="unit-options">
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="item-price" label={`Price per ${form.unit || "unit"}`} error={errors.price}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">₹</span>
                <NumberInput
                  id="item-price"
                  allowEmpty
                  min={0}
                  value={form.price}
                  onChange={(v) => set("price", v)}
                  placeholder="0.00"
                  className={inputClass(!!errors.price, "h-11 pl-8 font-semibold")}
                />
              </div>
            </Field>
            <Field id="item-minOrderQty" label="Minimum order" hint={`Smallest amount a restaurant can order, in ${form.unit || "units"}.`}>
              <NumberInput
                id="item-minOrderQty"
                allowEmpty
                min={0}
                value={form.minOrderQty}
                onChange={(v) => set("minOrderQty", v)}
                placeholder="1"
                className={inputClass(false, "h-11")}
              />
            </Field>
          </div>

          <Field id="item-leadTimeHours" label="Delivers within" error={errors.leadTimeHours}>
            <div className="flex flex-wrap items-center gap-2">
              {LEAD_TIMES.map((h) => (
                <button
                  key={h}
                  type="button"
                  aria-pressed={form.leadTimeHours === h}
                  onClick={() => set("leadTimeHours", h)}
                  className={cn(
                    "h-10 rounded-lg px-3.5 text-sm font-medium ring-1 transition-colors",
                    form.leadTimeHours === h
                      ? "bg-[#1B2A4A] text-white ring-[#1B2A4A]"
                      : "bg-white text-zinc-700 ring-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  {h}h
                </button>
              ))}
              <div className="flex items-center gap-2">
                <NumberInput
                  id="item-leadTimeHours"
                  allowEmpty
                  integer
                  min={1}
                  value={form.leadTimeHours}
                  onChange={(v) => set("leadTimeHours", v)}
                  aria-label="Delivery time in hours"
                  className={inputClass(!!errors.leadTimeHours, "h-10 w-20 text-center")}
                />
                <span className="text-sm text-zinc-500">hours</span>
              </div>
            </div>
          </Field>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4">
            <div>
              <p className="text-sm font-medium text-[#1B2A4A]">Available to order</p>
              <p className="text-[13px] text-zinc-500">Turn off when you run out. You can switch it back any time.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.inStock}
              aria-label="Available to order"
              onClick={() => set("inStock", !form.inStock)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                form.inStock ? "bg-emerald-600" : "bg-zinc-300"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                  form.inStock ? "translate-x-[22px]" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          <details className="group rounded-xl ring-1 ring-zinc-200" open={!!(form.sku || form.description)}>
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-[#1B2A4A] [&::-webkit-details-marker]:hidden">
              More details <span className="font-normal text-zinc-400">SKU, description</span>
            </summary>
            <div className="space-y-5 border-t border-zinc-100 p-4">
              <Field id="item-sku" label="Your product code (SKU)" optional>
                <input
                  id="item-sku"
                  type="text"
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value.toUpperCase())}
                  placeholder="e.g. PAN-001"
                  className={inputClass(false, "h-11 font-mono uppercase")}
                />
              </Field>
              <Field id="item-description" label="Description" optional hint="Grade, brand, pack size, anything that helps a restaurant choose.">
                <textarea
                  id="item-description"
                  rows={2}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className={inputClass(false, "resize-none py-2.5")}
                />
              </Field>
            </div>
          </details>
        </form>
      </Modal>

      {/* ─── Remove ────────────────────────────────────────────────── */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Remove ${toDelete?.name ?? "product"}?`}
        footer={
          <>
            <button type="button" onClick={() => setToDelete(null)} className={btn.secondary}>
              Keep it
            </button>
            <button type="button" onClick={confirmDelete} disabled={isDeleting} className={btn.danger}>
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Remove product
            </button>
          </>
        }
      >
        <p className="text-sm text-zinc-600">
          Restaurants won’t be able to order it any more. Orders already placed aren’t affected. If you’ve only run out for
          now, switch it to <span className="font-medium text-zinc-800">out of stock</span> instead.
        </p>
      </Modal>
    </>
  );
}

export default function SupplierCatalogPage() {
  return (
    <SupplierLayout>
      <Suspense fallback={null}>
        <CatalogContent />
      </Suspense>
    </SupplierLayout>
  );
}
