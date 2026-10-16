"use server";

import { revalidatePath } from "next/cache";
import { putFetch } from "@/utils/fetch";
import { handleError } from "@/utils/helper";

const ADVANCE_TO = ["shipped", "delivered"]; // what PUT /orders/:id accepts

const fail = (message) => ({ status: "error", message });

// 409 = the order is no longer in a state that allows this (another admin or tab got there first),
// or stock ran out on delivery. Everything else just shows the API message.
function failureMessage(data) {
  const detail = handleError(data?.message);

  if (data?.statusCode === 409) {
    if (/insufficient stock/i.test(detail ?? "")) return `موجودی کالا کافی نیست: ${detail}`;
    return "این عملیات با وضعیت فعلی سفارش سازگار نیست؛ صفحه را تازه‌سازی کنید.";
  }

  return detail || "عملیات ناموفق بود";
}

// Shared by both actions: call the API, treat a returned order (has an id) as success.
async function submit(path, body, id, successMessage) {
  try {
    const data = await putFetch(path, body);

    if (data?.id) {
      revalidatePath("/orders");
      revalidatePath(`/orders/${id}`);
      return { status: "success", message: successMessage };
    }

    // The order changed under us: refresh so the page shows its real status and buttons
    if (data?.statusCode === 409) revalidatePath(`/orders/${id}`);

    return fail(failureMessage(data));
  } catch {
    return fail("ارتباط با سرور برقرار نشد");
  }
}

// PUT /orders/:id  { status: "shipped" | "delivered" }
export async function updateOrderStatus(state, formData) {
  const id = formData.get("id");
  const status = formData.get("status");

  if (!id) return fail("شناسه سفارش الزامی است");
  if (!ADVANCE_TO.includes(status)) return fail("وضعیت نامعتبر است");

  // Optional carrier tracking code (کد رهگیری): only meaningful when shipping
  const trackingCode = formData.get("trackingCode")?.toString().trim() ?? "";
  if (trackingCode.length > 50) return fail("کد رهگیری حداکثر ۵۰ کاراکتر است");
  const body = status === "shipped" && trackingCode ? { status, trackingCode } : { status };

  return submit(
    `/orders/${id}`,
    body,
    id,
    status === "shipped" ? "سفارش به وضعیت «ارسال شده» تغییر کرد" : "سفارش به وضعیت «تحویل داده شده» تغییر کرد",
  );
}

// PUT /orders/cancel/:id
export async function cancelOrder(state, formData) {
  const id = formData.get("id");
  if (!id) return fail("شناسه سفارش الزامی است");

  return submit(`/orders/cancel/${id}`, {}, id, "سفارش لغو شد");
}
