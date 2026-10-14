import { ORDER_STATUS, PAYMENT_STATE, getPaymentKey } from "@/utils/order";

export function OrderStatusBadge({ status }) {
  const config = ORDER_STATUS[status] ?? { label: status ?? "—", className: "bg-secondary" };
  return <span className={`badge fw-normal ${config.className}`}>{config.label}</span>;
}

export function PaymentBadge({ order }) {
  const config = PAYMENT_STATE[getPaymentKey(order)];
  return <span className={`badge fw-normal ${config.className}`}>{config.label}</span>;
}
