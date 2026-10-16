import Link from "next/link";
import { notFound } from "next/navigation";
import DeliveryMethodForm from "@/components/delivery/DeliveryMethodForm";
import { updateDeliveryMethod } from "@/actions/delivery";
import { getDeliveryMethod } from "@/utils/api/delivery";
import { handleError } from "@/utils/helper";

export default async function EditDeliveryMethodPage({ params }) {
  const { id } = await params; // Next 15: params is a Promise
  const method = await getDeliveryMethod(id);

  if (method === null) notFound();

  // 401 / 403 / 500 come back as { statusCode, message }
  if (!method?.id) {
    return (
      <div className="alert alert-danger mt-4">
        دریافت روش ارسال با خطا مواجه شد{method?.message ? `: ${handleError(method.message)}` : ""}
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap align-items-center pt-3 pb-2 mb-3 border-bottom gap-2">
        <h4 className="fw-bold mb-0">ویرایش روش ارسال: {method.label}</h4>
        <Link href="/delivery-methods" className="btn btn-sm btn-outline-dark">
          بازگشت به روش‌های ارسال
        </Link>
      </div>

      <DeliveryMethodForm action={updateDeliveryMethod} method={method} redirectTo="/delivery-methods" />
    </>
  );
}
