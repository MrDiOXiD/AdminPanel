"use server";

import { cookies } from "next/headers";
import { handleError } from "@/utils/helper";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteFetch, putFetch } from "@/utils/fetch";


async function createProduct(state, formData) {
  // 1. Create a fresh payload for the NestJS API
  const apiFormData = new FormData();

  // 2. Map HTML names -> NestJS DTO keys
  apiFormData.append("title", formData.get("name"));
  apiFormData.append("description", formData.get("description") || "");
  apiFormData.append("productImage", formData.get("primary_image"));


  // The hidden input sends this as a stringified JSON object!
  // 🌟 Check if you added these lines in actions/products.js!
  const brand = formData.get("brand");
  if (brand && brand.trim() !== "") {
    apiFormData.append("brand", brand);
  }

  // BadgeSelector sends a JSON array of badge ids, e.g. "[1,3]"
  const badges = formData.get("badges");
  if (badges && badges !== "[]") {
    apiFormData.append("badges", badges);
  }

  const attributes = formData.get("attributes");
  if (attributes && attributes !== "{}" && attributes.trim() !== "") {
    apiFormData.append("attributes", attributes);
  }

  // 3. Handle Numbers safely (skip empty strings to avoid validation bugs)
  const price = formData.get("price");
  if (price && price.trim() !== "") {
    apiFormData.append("price", price);
  }

  const quantity = formData.get("quantity"); // HTML "quantity" -> NestJS "stock"
  if (quantity && quantity.trim() !== "") {
    apiFormData.append("stock", quantity);
  }

  const categoryId = formData.get("category_id"); // HTML "category_id" -> NestJS "categoryId"
  if (categoryId && categoryId.trim() !== "") {
    apiFormData.append("categoryId", categoryId);
  }

  // 4. Map Status selection ("1" or "0") to NestJS Boolean String ("true" or "false")
  const status = formData.get("status");
  apiFormData.append("isActive", status === "1" ? "true" : "false");

  // 5. Calculate Discount Percentage dynamically from sale_price
  const originalPrice = parseFloat(price) || 0;
  const salePrice = parseFloat(formData.get("sale_price")) || 0;
  
  let discountPercentage = 0;
  if (salePrice > 0 && salePrice < originalPrice) {
    discountPercentage = ((originalPrice - salePrice) / originalPrice) * 100;
  }
  apiFormData.append("discount", discountPercentage.toFixed(2));

  // 6. Format Persian-converted Gregorian dates to ISO timestamps for PostgreSQL
  const dateFrom = formData.get("date_on_sale_from");
  const dateTo = formData.get("date_on_sale_to");

  if (dateFrom && dateFrom.trim() !== "") {
    apiFormData.append("discountStartDate", new Date(dateFrom.replace(" ", "T")).toISOString());
  }
  if (dateTo && dateTo.trim() !== "") {
    apiFormData.append("discountEndDate", new Date(dateTo.replace(" ", "T")).toISOString());
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return {
        status: "error",
        message: "نشست شما منقضی شده است، لطفا دوباره وارد شوید",
      };
    }

    // 7. Send the cleanly mapped payload to the backend
    const res = await fetch(`${process.env.API_URL}/products`, {
      cache: "no-store",
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: apiFormData, // 🌟 Sends the translated form data
    });

    const data = await res.json();

    if (res.ok) {
      revalidatePath("/products");
      return {
        status: "success",
        message: "محصول مورد نظر با موفقیت ایجاد شد",
      };
    } else {
      // Combines array validation strings into a scannable message
      const parsedError = Array.isArray(data.message) 
        ? data.message.join(" | ") 
        : data.message;

      return {
        status: "error",
        message: parsedError || "خطایی در ایجاد محصول رخ داد",
      };
    }
  } catch (error) {
    console.error("Server Action Network Error:", error);
    return {
      status: "error",
      message: "ارتباط با سرور برقرار نشد، لطفا دوباره تلاش کنید",
    };
  }
}
async function deleteProduct(state, formData) {
  const id = formData.get("id");

  if (id === "" || id === null) {
    return {
      status: "error",
      message: "شناسه محصول الزامی است",
    };
  }

  const data = await deleteFetch(`/products/${id}`);

  if (data.status === "success") {
    revalidatePath("/products");
    redirect("/products");
  } else {
    return {
      status: data.status,
      message: handleError(data.message),
    };
  }
}

const fail = (message) => ({ status: "error", message });

function parseObject(raw) {
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

// Backend: PUT /products/:id (JSON). null clears brand / discount dates.
async function editProduct(state, formData) {
  const id = formData.get("id");
  const title = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("quantity"));
  const categoryId = Number(formData.get("category_id"));
  const salePrice = Number(formData.get("sale_price")) || 0;

  if (!id) return fail("شناسه محصول الزامی است");
  if (!title) return fail("نام الزامی است");
  if (!categoryId) return fail("دسته بندی الزامی است");
  if (!(price > 0)) return fail("قیمت معتبر الزامی است");
  if (!Number.isInteger(stock) || stock < 0) return fail("تعداد معتبر الزامی است");

  const discount =
    salePrice > 0 && salePrice < price ? Number((((price - salePrice) / price) * 100).toFixed(2)) : 0;

  const body = {
    title,
    description,
    price,
    stock,
    categoryId,
    isActive: formData.get("status") === "1",
    brand: formData.get("brand")?.toString().trim() || null,
    discount,
    discountStartDate: formData.get("discount_start")?.toString() || null,
    discountEndDate: formData.get("discount_end")?.toString() || null,
    attributes: parseObject(formData.get("attributes")),
    badges: parseIds(formData.get("badges")),
  };

  try {
    const data = await putFetch(`/products/${id}`, body);

    if (data?.id) {
      revalidatePath("/products");
      revalidatePath(`/products/${id}`);
      return { status: "success", message: "محصول مورد نظر ویرایش شد" };
    }

    return fail(handleError(data?.message) || "خطا در ویرایش محصول");
  } catch {
    return fail("ارتباط با سرور برقرار نشد");
  }
}

function parseIds(raw) {
  try {
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids.map(Number) : [];
  } catch {
    return [];
  }
}

async function setProductBadges(state, formData) {
  const id = formData.get("id");
  const badgeIds = parseIds(formData.get("badges"));

  try {
    const data = await putFetch(`/products/${id}/badges`, { badgeIds });

    if (data?.id) {
      revalidatePath("/products");
      revalidatePath(`/products/${id}`);
      return { status: "success", message: "نشان‌های محصول ذخیره شد" };
    }

    return { status: "error", message: handleError(data?.message) || "خطا در ذخیره نشان‌ها" };
  } catch {
    return { status: "error", message: "ارتباط با سرور برقرار نشد" };
  }
}

export { createProduct, deleteProduct, editProduct, setProductBadges };
