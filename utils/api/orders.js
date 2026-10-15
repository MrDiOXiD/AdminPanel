import { getFetch } from "@/utils/fetch";

// The only place that knows the orders URLs and query params.

// URL params the UI may forward to GET /orders as-is. Anything else is dropped.
const FORWARDED = ["status", "q", "sort"];
const NUMERIC = ["page", "limit"];

// The single "payment" dropdown maps onto two API params.
const PAYMENT_FILTERS = {
  paid: { paid: "true" },
  unpaid: { paymentMethod: "online", paid: "false" },
  cod: { paymentMethod: "cod", paid: "false" },
};

/** Admin page URL params -> GET /orders params. */
export function buildOrdersQuery(searchParams) {
  const source = new URLSearchParams(searchParams);
  const api = new URLSearchParams();

  for (const key of FORWARDED) {
    const value = source.get(key)?.trim();
    if (value) api.set(key, value);
  }

  for (const key of NUMERIC) {
    const value = source.get(key);
    if (value && /^\d+$/.test(value)) api.set(key, value);
  }

  const payment = source.get("payment");
  if (payment && Object.hasOwn(PAYMENT_FILTERS, payment)) {
    for (const [key, value] of Object.entries(PAYMENT_FILTERS[payment])) api.set(key, value);
  }

  return api;
}

/** -> { items, meta: { total, page, limit, totalPages, statusCounts } } (or { statusCode, message } on error) */
export const getOrders = (searchParams) => getFetch(`/orders?${buildOrdersQuery(searchParams)}`);

/** -> order with allowedActions (or { statusCode, message } on error) */
export const getOrder = (id) => getFetch(`/orders/${encodeURIComponent(id)}`);
