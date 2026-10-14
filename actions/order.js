// Shared order constants + pure helpers (no React, safe to import anywhere).

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

// ۰-۹ and ٠-٩ -> 0-9, so searching with a Persian keyboard works
const normalizeDigits = (text) =>
  text
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));

export function countByStatus(orders) {
  return orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});
}

/**
 * Search rules:
 *  - up to 6 digits  -> exact order id
 *  - 7+ digits       -> phone number contains it
 *  - anything else   -> name / username / email contains it
 */
export function filterOrders(orders, { status, payment, q }) {
  const needle = normalizeDigits(q ?? "").trim().toLowerCase().replace(/^#/, "");

  return orders.filter((order) => {
    if (status && order.status !== status) return false;
    if (payment && getPaymentKey(order) !== payment) return false;
    if (!needle) return true;

    if (/^\d+$/.test(needle)) {
      if (needle.length <= 6) return String(order.id) === needle;
      return [order.user?.phoneNumber, order.shippingAddress?.phone].some((phone) =>
        phone?.replace(/\D/g, "").includes(needle),
      );
    }

    return [
      order.user?.name,
      order.user?.familyName,
      order.user?.username,
      order.user?.email,
      order.shippingAddress?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
}
