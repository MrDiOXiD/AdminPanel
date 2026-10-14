"use server";

import { revalidatePath } from "next/cache";
import { postFetch } from "@/utils/fetch";
import { handleError } from "@/utils/helper";

export async function createBadge(state, formData) {
  const payload = {
    key: formData.get("key")?.toString().trim(),
    label: formData.get("label")?.toString().trim(),
    color: formData.get("color"),
    textColor: formData.get("textColor"),
  };

  if (!payload.key || !payload.label) {
    return { status: "error", message: "کلید و عنوان نشان الزامی است" };
  }

  try {
    const data = await postFetch("/badges", payload);

    if (data?.id) {
      revalidatePath("/badges");
      return { status: "success", message: "نشان با موفقیت ایجاد شد" };
    }

    // 400 (validation) and 409 (duplicate key) both arrive as { message }
    return { status: "error", message: handleError(data?.message) || "خطا در ایجاد نشان" };
  } catch {
    return { status: "error", message: "ارتباط با سرور برقرار نشد" };
  }
}
