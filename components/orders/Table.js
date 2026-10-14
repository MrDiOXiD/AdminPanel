import Link from "next/link";
import { getFetch } from "@/utils/fetch";
import { handleError, numberFormat } from "@/utils/helper";
import {
  PAYMENT_METHOD,
  countByStatus,
  customerName,
  filterOrders,
  formatDate,
  itemsCount,
} from "@/utils/order";
import { paginateList } from "@/utils/paginate";
import Paginate from "../Paginate";
import { OrderStatusBadge, PaymentBadge } from "./OrderBadges";
import StatusChips from "./StatusChips";

const PER_PAGE = 15;

export default async function Table({ params }) {
  const query = new URLSearchParams(params);
  const data = await getFetch("/orders");

  // 401 / 403 / 500 arrive as an object, not an array
  if (!Array.isArray(data)) {
    return (
      <div className="alert alert-danger">
        دریافت سفارشات با خطا مواجه شد{data?.message ? `: ${handleError(data.message)}` : ""}
      </div>
    );
  }

  const status = query.get("status") ?? "";
  const payment = query.get("payment") ?? "";
  const q = query.get("q") ?? "";

  const newestFirst = [...data].sort((a, b) => new Date(b.orderAt) - new Date(a.orderAt));
  const filtered = filterOrders(newestFirst, { status, payment, q });
  const { items, links } = paginateList(filtered, query.get("page"), PER_PAGE);
  const counts = countByStatus(data);

  return (
    <>
      <StatusChips counts={counts} total={data.length} status={status} query={query} />

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

      <div className="text-muted small">{filtered.length} سفارش</div>

      {links.length > 0 ? <Paginate links={links} /> : null}
    </>
  );
}
