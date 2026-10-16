import Link from "next/link";
import { notFound } from "next/navigation";
import OrderActions from "@/components/orders/OrderActions";
import { OrderStatusBadge, PaymentBadge } from "@/components/orders/OrderBadges";
import { getOrder } from "@/utils/api/orders";
import { handleError, numberFormat } from "@/utils/helper";
import { PAYMENT_METHOD, customerName, formatDate } from "@/utils/order";
import { isPickup, typeLabel } from "@/utils/delivery";

function InfoRow({ label, children }) {
  return (
    <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
      <span className="text-muted">{label}</span>
      <span className="text-end">{children || "—"}</span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="card h-100">
      <div className="card-header fw-bold">{title}</div>
      <div className="card-body py-2">{children}</div>
    </div>
  );
}

export default async function OrderPage({ params }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (order?.statusCode === 404) notFound();

  if (!order?.id) {
    return (
      <div className="alert alert-danger mt-4">
        دریافت سفارش با خطا مواجه شد{order?.message ? `: ${handleError(order.message)}` : ""}
      </div>
    );
  }

  const address = order.shippingAddress;
  const lines = order.products ?? [];
  const pickup = isPickup(order.deliveryMethod?.type); // collected in person: no address

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap align-items-center pt-3 pb-2 mb-3 border-bottom gap-2">
        <div className="d-flex align-items-center gap-2">
          <h4 className="fw-bold mb-0">سفارش #{order.id}</h4>
          <OrderStatusBadge status={order.status} />
          <PaymentBadge order={order} />
        </div>
        <Link href="/orders" className="btn btn-sm btn-outline-dark">
          بازگشت به سفارشات
        </Link>
      </div>

      <div className="row gy-4">
        <div className="col-md-4">
          <Card title="مشتری">
            <InfoRow label="نام">{customerName(order.user)}</InfoRow>
            <InfoRow label="نام کاربری">{order.user?.username}</InfoRow>
            <InfoRow label="ایمیل">
              <span dir="ltr">{order.user?.email}</span>
            </InfoRow>
            <InfoRow label="موبایل">
              <span dir="ltr">{order.user?.phoneNumber}</span>
            </InfoRow>
          </Card>
        </div>

        <div className="col-md-4">
          <Card title={pickup ? "تحویل حضوری" : "آدرس ارسال"}>
            {address ? (
              <>
                <InfoRow label="گیرنده">{address.name}</InfoRow>
                <InfoRow label="موبایل">
                  <span dir="ltr">{address.phone}</span>
                </InfoRow>
                <InfoRow label="شهر">{address.city}</InfoRow>
                <InfoRow label="کد پستی">{address.postalCode}</InfoRow>
                <InfoRow label="آدرس">{address.address}</InfoRow>
              </>
            ) : (
              <p className="text-muted my-3">
                {pickup ? "این سفارش حضوری تحویل داده می‌شود و آدرس ندارد." : "برای این سفارش آدرسی ثبت نشده است."}
              </p>
            )}
          </Card>
        </div>

        <div className="col-md-4">
          <Card title="پرداخت و ارسال">
            <InfoRow label="روش ارسال">
              {order.deliveryMethod ? `${order.deliveryMethod.label} (${typeLabel(order.deliveryMethod.type)})` : null}
            </InfoRow>
            <InfoRow label="روش پرداخت">{PAYMENT_METHOD[order.paymentMethod] ?? order.paymentMethod}</InfoRow>
            <InfoRow label="تاریخ ثبت">{formatDate(order.orderAt, { withTime: true })}</InfoRow>
            <InfoRow label="تاریخ پرداخت">{order.paidAt ? formatDate(order.paidAt, { withTime: true }) : null}</InfoRow>
            <InfoRow label="تحویل درخواستی">{formatDate(order.requestedDeliveryDate)}</InfoRow>
            <InfoRow label="تاریخ ارسال">{order.shippedAt ? formatDate(order.shippedAt, { withTime: true }) : null}</InfoRow>
            <InfoRow label="کد رهگیری">{order.trackingCode ? <span dir="ltr">{order.trackingCode}</span> : null}</InfoRow>
            <InfoRow label="تاریخ تحویل">{order.deliveredAt ? formatDate(order.deliveredAt, { withTime: true }) : null}</InfoRow>
            {order.updatedBy ? <InfoRow label="آخرین تغییر توسط">{customerName(order.updatedBy)}</InfoRow> : null}
          </Card>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header fw-bold">محصولات سفارش</div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>محصول</th>
                    <th>قیمت واحد (فعلی)</th>
                    <th>تعداد</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        {item.product ? (
                          <Link href={`/products/${item.product.id}`}>{item.product.title}</Link>
                        ) : (
                          <span className="text-muted">محصول حذف شده</span>
                        )}
                      </td>
                      <td>{item.product ? `${numberFormat(item.product.price)} تومان` : "—"}</td>
                      <td>{item.order_quantity}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-end">
                      هزینه ارسال
                    </td>
                    <td>{numberFormat(order.deliveryFee)} تومان</td>
                  </tr>
                  <tr className="fw-bold">
                    <td colSpan={3} className="text-end">
                      مبلغ کل سفارش
                    </td>
                    <td>{numberFormat(order.total_price)} تومان</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="card-footer small text-muted">
              قیمت‌های واحد، قیمت فعلی محصول هستند و ممکن است با قیمت لحظه ثبت سفارش تفاوت داشته باشند؛ مبلغ کل همان مبلغ ثبت‌شده در سفارش است.
            </div>
          </div>
        </div>

        <div className="col-12 mb-5">
          <div className="card">
            <div className="card-header fw-bold">عملیات</div>
            <div className="card-body">
              <OrderActions
                id={order.id}
                allowedActions={order.allowedActions ?? []}
                paid={Boolean(order.paidAt)}
                deliveryType={order.deliveryMethod?.type}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
