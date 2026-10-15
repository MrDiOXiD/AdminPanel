import Link from "next/link";
import { getOrders } from "@/utils/api/orders";
import { handleError, numberFormat } from "@/utils/helper";
import { PAYMENT_METHOD, customerName, formatDate, itemsCount } from "@/utils/order";
import Paginate from "../Paginate";
import { OrderStatusBadge, PaymentBadge } from "./OrderBadges";
import StatusChips from "./StatusChips";

export default async function Table({ params }) {
  const query = new URLSearchParams(params);
  const data = await getOrders(query);

  // 400 / 401 / 403 / 500 arrive as { statusCode, message }, not as { items, meta }
  if (!Array.isArray(data?.items)) {
    return (
      <div className="alert alert-danger">
        دریافت سفارشات با خطا مواجه شد{data?.message ? `: ${handleError(data.message)}` : ""}
      </div>
    );
  }

  const { items, meta } = data;
  const statusCounts = meta.statusCounts ?? {};
  const totalAll = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <StatusChips counts={statusCounts} total={totalAll} status={query.get("status") ?? ""} query={query} />

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>شماره</th>
              <th>مشتری</th>
              <th>وضعیت</th>
              <th>پرداخت</th>
              <th>مبلغ کل</th>
              <th>تاریخ ثبت</th>
              <th>تحویل درخواستی</th>
              <th>اقلام</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-muted py-5">
                  سفارشی یافت نشد
                </td>
              </tr>
            ) : (
              items.map((order) => (
                <tr key={order.id}>
                  <td className="fw-bold">#{order.id}</td>
                  <td>
                    <div>{customerName(order.user)}</div>
                    <div className="small text-muted" dir="ltr">
                      {order.user?.phoneNumber}
                    </div>
                  </td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td>
                    <PaymentBadge order={order} />
                    <div className="small text-muted mt-1">{PAYMENT_METHOD[order.paymentMethod] ?? order.paymentMethod}</div>
                  </td>
                  <td>
                    <div>{numberFormat(order.total_price)} تومان</div>
                    {Number(order.deliveryFee) > 0 ? (
                      <div className="small text-muted">شامل ارسال: {numberFormat(order.deliveryFee)}</div>
                    ) : null}
                  </td>
                  <td>{formatDate(order.orderAt, { withTime: true })}</td>
                  <td>{formatDate(order.requestedDeliveryDate)}</td>
                  <td>{itemsCount(order)}</td>
                  <td>
                    <Link href={`/orders/${order.id}`} className="btn btn-sm btn-dark">
                      جزئیات
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-muted small">{meta.total} سفارش</div>

      <Paginate meta={meta} />
    </>
  );
}
