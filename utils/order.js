// Shared order constants + display helpers (no React, safe to import anywhere).
// Filtering, searching and paging happen in the API: see utils/api/orders.js.

// Backend OrderStatus values -> Persian label + Bootstrap badge classes.
export const ORDER_STATUS = {
  processing: { label: "در حال پردازش", className: "bg-warning text-dark" },
  shipped: { label: "ارسال شده", className: "bg-info text-dark" },
  delivered: { label: "تحویل داده شده", className: "bg-success" },
  cancelled: { label: "لغو شده", className: "bg-danger" },
};

export const PAYMENT_METHOD = {
  online: "پرداخت آنلاین",
  cod: "پرداخت در محل",
};

// Payment state is derived: the API has no payment_status field, only paidAt + paymentMethod.
export const PAYMENT_STATE = {
  paid: { label: "پرداخت شده", className: "bg-success" },
  cod: { label: "پرداخت در محل", className: "bg-info text-dark" },
  unpaid: { label: "پرداخت نشده", className: "bg-warning text-dark" },
};

export const getPaymentKey = (order) => {
  if (order.paidAt) return "paid";
  return order.paymentMethod === "cod" ? "cod" : "unpaid";
};

export const customerName = (user) =>
  [user?.name, user?.familyName].filter(Boolean).join(" ") || user?.username || "—";

export const itemsCount = (order) =>
  (order.products ?? []).reduce((sum, item) => sum + Number(item.order_quantity || 0), 0);

/** Persian calendar. Date-only values ("2026-08-15") are formatted in UTC so they never shift a day. */
export function formatDate(value, { withTime = false } = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short", timeZone: "Asia/Tehran" } : { timeZone: "UTC" }),
  }).format(date);
}

// Values must match the backend OrderSort enum.
export const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "total_desc", label: "بیشترین مبلغ" },
  { value: "total_asc", label: "کمترین مبلغ" },
];
