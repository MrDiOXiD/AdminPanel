"use server";

import { revalidatePath } from "next/cache";
import { putFetch } from "@/utils/fetch";
import { handleError } from "@/utils/helper";

const ADVANCE_TO = ["shipped", "delivered"]; // what PUT /orders/:id accepts

const fail = (message) => ({ status: "error", message });

// Shared by both actions: call the API, treat a returned order (has an id) as success.
async function submit(path, body, id, successMessage) {
  try {
    const data = await putFetch(path, body);

    if (data?.id) {
      revalidatePath("/orders");
      revalidatePath(`/orders/${id}`);
      return { status: "success", message: successMessage };
    }

    return fail(handleError(data?.message) || "عملیات ناموفق بود");
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

  return submit(
    `/orders/${id}`,
    { status },
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
