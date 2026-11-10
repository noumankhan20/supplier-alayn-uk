import type { PurchaseOrderApi } from "@/redux/slices/procurementApiSlice";

/** The restaurant has taken the goods in (fully, partly, or closed short). */
const DELIVERED = new Set<PurchaseOrderApi["status"]>(["RECEIVED", "PARTIALLY_RECEIVED", "CLOSED"]);
/** Still moving: new, being packed, or on the road. */
const IN_PROGRESS = new Set<PurchaseOrderApi["status"]>(["SENT", "PACKING", "PARTIALLY_DISPATCHED", "DISPATCHED"]);
/** Ended without a delivery. */
const NOT_FULFILLED = new Set<PurchaseOrderApi["status"]>(["OUT_OF_STOCK", "CANCELLED"]);

export interface RestaurantTotal {
  id: string;
  name: string;
  orders: number;
  earnedPaise: number;
}

export interface SupplierStats {
  totalOrders: number;
  deliveredOrders: number;
  inProgressOrders: number;
  notFulfilledOrders: number;
  /** Value of goods restaurants marked as received, at the price on the order. */
  earnedPaise: number;
  earnedThisMonthPaise: number;
  /** Value of orders that are still open. Not earned yet. */
  inProgressPaise: number;
  /** Share of finished orders (delivered + not fulfilled) that were delivered. 0–100, or null if none finished. */
  fulfilmentRate: number | null;
  firstOrderAt?: string;
  topRestaurants: RestaurantTotal[];
}

/** What a delivered order earned: received quantity × unit price. */
export function earnedOnOrder(po: PurchaseOrderApi): number {
  if (!DELIVERED.has(po.status)) return 0;
  const received = po.items.reduce(
    (sum, it) => sum + Number(it.receivedQuantity ?? 0) * it.unitCostPaise,
    0
  );
  // Older orders may be marked received without per-item quantities; fall back to the order total.
  if (received === 0 && po.status === "RECEIVED") return po.totalAmountPaise;
  return Math.round(received);
}

export function computeSupplierStats(orders: PurchaseOrderApi[], now?: Date | null): SupplierStats {
  const real = orders.filter((po) => po.status !== "DRAFT");
  const monthStart = now ? new Date(now.getFullYear(), now.getMonth(), 1).getTime() : null;

  let earnedPaise = 0;
  let earnedThisMonthPaise = 0;
  let inProgressPaise = 0;
  let deliveredOrders = 0;
  let inProgressOrders = 0;
  let notFulfilledOrders = 0;
  let firstOrderAt: string | undefined;
  const byRestaurant = new Map<string, RestaurantTotal>();

  for (const po of real) {
    const earned = earnedOnOrder(po);

    if (DELIVERED.has(po.status)) {
      deliveredOrders++;
      earnedPaise += earned;
      const doneAt = po.closedAt || po.updatedAt || po.createdAt;
      if (doneAt && monthStart !== null && new Date(doneAt).getTime() >= monthStart) earnedThisMonthPaise += earned;
    } else if (IN_PROGRESS.has(po.status)) {
      inProgressOrders++;
      inProgressPaise += po.totalAmountPaise;
    } else if (NOT_FULFILLED.has(po.status)) {
      notFulfilledOrders++;
    }

    if (po.createdAt && (!firstOrderAt || po.createdAt < firstOrderAt)) firstOrderAt = po.createdAt;

    const rid = po.outlet?.id || po.outletId;
    if (rid) {
      const row = byRestaurant.get(rid) ?? {
        id: rid,
        name: po.outlet?.restaurantName || po.outlet?.name || "Restaurant",
        orders: 0,
        earnedPaise: 0,
      };
      row.orders++;
      row.earnedPaise += earned;
      byRestaurant.set(rid, row);
    }
  }

  const finished = deliveredOrders + notFulfilledOrders;

  return {
    totalOrders: real.length,
    deliveredOrders,
    inProgressOrders,
    notFulfilledOrders,
    earnedPaise,
    earnedThisMonthPaise,
    inProgressPaise,
    fulfilmentRate: finished ? Math.round((deliveredOrders / finished) * 100) : null,
    firstOrderAt,
    topRestaurants: [...byRestaurant.values()]
      .sort((a, b) => b.earnedPaise - a.earnedPaise || b.orders - a.orders)
      .slice(0, 3),
  };
}
