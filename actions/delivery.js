"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/utils/fetch";
import { handleError } from "@/utils/helper";
import { parseFee } from "@/utils/delivery";

const fail = (message) => ({ status: "error", message });
const ok = (message) => ({ status: "success", message });

const refresh = () => revalidatePath("/delivery-methods");

/** Form fields -> API payload, or { error } with a Persian message. Shared by create and update. */
function readMethodFields(formData) {
  const label = formData.get("label")?.toString().trim();
  const type = formData.get("type")?.toString();
  const baseFee = parseFee(formData.get("baseFee"));
  const perItemFee = parseFee(formData.get("perItemFee") || "0");

  if (!label) return { error: "عنوان روش ارسال الزامی است" };
  if (!type) return { error: "نوع روش ارسال الزامی است" };
  if (baseFee === null) return { error: "هزینه پایه نامعتبر است" };
  if (perItemFee === null) return { error: "هزینه هر قلم نامعتبر است" };

  return { payload: { label, type, baseFee, perItemFee, isActive: formData.get("isActive") === "on" } };
}

// Runs one API call. Success is decided by the HTTP status, not by the body, because the
// endpoints may answer 200/201 with an empty body.
async function call(method, path, body, successMessage, fallbackError) {
  try {
    const { ok: succeeded, data } = await apiRequest(method, path, body);

    if (succeeded) {
      refresh();
      return ok(successMessage);
    }

    return fail(handleError(data?.message) || fallbackError);
  } catch {
    return fail("ارتباط با سرور برقرار نشد");
  }
}

// POST /delivery-methods/admin
export async function createDeliveryMethod(state, formData) {
  const { payload, error } = readMethodFields(formData);
  if (error) return fail(error);

  return call("POST", "/delivery-methods/admin", payload, "روش ارسال با موفقیت ایجاد شد", "خطا در ایجاد روش ارسال");
}

// PATCH /delivery-methods/admin/:id
export async function updateDeliveryMethod(state, formData) {
  const id = formData.get("id");
  if (!id) return fail("شناسه روش ارسال الزامی است");

  const { payload, error } = readMethodFields(formData);
  if (error) return fail(error);

  return call("PATCH", `/delivery-methods/admin/${id}`, payload, "روش ارسال ویرایش شد", "خطا در ویرایش روش ارسال");
}

// PATCH /delivery-methods/admin/:id  { isActive }  (the quick switch in the table)
export async function toggleDeliveryMethod(state, formData) {
  const id = formData.get("id");
  if (!id) return fail("شناسه روش ارسال الزامی است");

  const isActive = formData.get("isActive") === "true";

  return call(
    "PATCH",
    `/delivery-methods/admin/${id}`,
    { isActive },
    isActive ? "روش ارسال فعال شد" : "روش ارسال غیرفعال شد",
    "تغییر وضعیت انجام نشد",
  );
}

// DELETE /delivery-methods/admin/:id
export async function deleteDeliveryMethod(state, formData) {
  const id = formData.get("id");
  if (!id) return fail("شناسه روش ارسال الزامی است");

  try {
    const { ok: succeeded, status, data } = await apiRequest("DELETE", `/delivery-methods/admin/${id}`);

    if (succeeded) {
      refresh();
      return ok("روش ارسال حذف شد");
    }

    // Past orders reference their delivery method, so the database may refuse the delete
    // (usually surfaces as a 409 or a 500). Point the admin at deactivating instead.
    if (status === 409 || status >= 500) {
      return fail("حذف انجام نشد. اگر این روش ارسال در سفارش‌ها استفاده شده باشد قابل حذف نیست؛ آن را غیرفعال کنید.");
    }

    return fail(handleError(data?.message) || "خطا در حذف روش ارسال");
  } catch {
    return fail("ارتباط با سرور برقرار نشد");
  }
}
