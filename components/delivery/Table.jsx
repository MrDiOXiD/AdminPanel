import { getDeliveryMethods } from "@/utils/api/delivery";
import { handleError, numberFormat } from "@/utils/helper";
import { typeLabel } from "@/utils/delivery";
import RowActions from "./RowActions";


const money = (value, zeroLabel) => (Number(value) > 0 ? `${numberFormat(value)} تومان` : zeroLabel);

export default async function Table() {
  const methods = await getDeliveryMethods();

  // 401 / 403 / 500 arrive as { statusCode, message }, not as an array
  if (!Array.isArray(methods)) {
    return (
      <div className="alert alert-danger">
        دریافت روش‌های ارسال با خطا مواجه شد{methods?.message ? `: ${handleError(methods.message)}` : ""}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th>شناسه</th>
            <th>عنوان</th>
            <th>نوع</th>
            <th>هزینه پایه</th>
            <th>هزینه هر قلم</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {methods.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-muted py-5">
                هنوز روش ارسالی تعریف نشده است
              </td>
            </tr>
          ) : (
            methods.map((method) => (
              <tr key={method.id}>
                <td>{method.id}</td>
                <td className="fw-bold">{method.label}</td>
                <td>{typeLabel(method.type)}</td>
                <td>{money(method.baseFee, "رایگان")}</td>
                <td>{money(method.perItemFee, "—")}</td>
                <td>
                  <span className={`badge fw-normal ${method.isActive ? "bg-success" : "bg-secondary"}`}>
                    {method.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td>
                  <RowActions method={method} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
