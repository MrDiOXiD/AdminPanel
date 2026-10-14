"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SubmitButton from "@/components/SubmitButton";
import BadgeSelector from "@/components/badges/BadgeSelector";
import ProductExtraAttributes from "./ProductExtraAttributes";
import { editProduct } from "@/actions/products";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";

// Date | DateObject -> ISO string (what the API stores); anything else -> ""
const toISO = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : value.toDate?.();
  return date ? date.toISOString() : "";
};

// Percent discount -> the sale price shown in the form
const toSalePrice = (price, discount) =>
  Number(discount) > 0 ? String(Number((Number(price) * (1 - Number(discount) / 100)).toFixed(2))) : "";

export default function EditProduct({ product, categories = [], badges = [] }) {
  const [state, formAction] = useActionState(editProduct, {});
  const router = useRouter();

  const [range, setRange] = useState(
    product.discountStartDate && product.discountEndDate
      ? [new Date(product.discountStartDate), new Date(product.discountEndDate)]
      : [],
  );
  const hasFullRange = range.length === 2;

  useEffect(() => {
    if (state?.message) toast(state.message, { type: state.status });
    if (state?.status === "success") router.push("/products");
  }, [state, router]);

  return (
    <form action={formAction} className="row gy-4">
      <div className="col-md-12 mb-3">
        <div className="row justify-content-center">
          <div className="col-md-4">
            <label className="form-label">تصویر اصلی</label>
            {product.productImage ? (
              <Image className="rounded" src={product.productImage} width={350} height={220} alt={product.title} />
            ) : null}
            <div className="form-text">ویرایش تصاویر هنوز توسط API پشتیبانی نمی‌شود.</div>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <label className="form-label">نام</label>
        <input name="name" defaultValue={product.title} type="text" className="form-control" />
      </div>

      <div className="col-md-3">
        <label className="form-label">دسته بندی</label>
        <select name="category_id" defaultValue={product.categoryId ?? ""} className="form-select">
          <option value="" disabled>
            انتخاب دسته بندی
          </option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-3">
        <label className="form-label">وضعیت</label>
        <select name="status" defaultValue={product.isActive ? "1" : "0"} className="form-select">
          <option value="1">فعال</option>
          <option value="0">غیر فعال</option>
        </select>
      </div>

      <div className="col-md-3">
        <label className="form-label">قیمت</label>
        <input name="price" defaultValue={product.price} type="text" className="form-control" />
      </div>

      <div className="col-md-3">
        <label className="form-label">تعداد</label>
        <input name="quantity" defaultValue={product.stock} type="text" className="form-control" />
      </div>

      <div className="col-md-3">
        <label className="form-label">قیمت حراجی</label>
        <input
          name="sale_price"
          defaultValue={toSalePrice(product.price, product.discount)}
          type="text"
          className="form-control"
        />
      </div>

      <div className="col-md-3">
        <label className="form-label">تاریخ شروع و پایان حراجی</label>
        <DatePicker
          inputClass="form-control"
          range
          value={range}
          onChange={setRange}
          calendar={persian}
          locale={persian_fa}
          format="YYYY-MM-DD HH:mm:ss"
          plugins={[
            <TimePicker key="time-picker" position="bottom" />,
            <DatePanel key="date-panel" markFocused />,
          ]}
        />
        {/* Empty value = clear the dates on the server */}
        <input type="hidden" name="discount_start" value={hasFullRange ? toISO(range[0]) : ""} readOnly />
        <input type="hidden" name="discount_end" value={hasFullRange ? toISO(range[1]) : ""} readOnly />
      </div>

      <div>
        <ProductExtraAttributes defaultBrand={product.brand} defaultAttributes={product.attributes} />
      </div>

      <div className="col-md-12">
        <label className="form-label">نشان‌ها (حداکثر ۱۰)</label>
        <BadgeSelector badges={badges} defaultSelected={product.badges ?? []} />
      </div>

      <div className="col-md-12">
        <label className="form-label">توضیحات</label>
        <textarea rows="5" defaultValue={product.description} name="description" className="form-control"></textarea>
      </div>

      <input type="hidden" name="id" value={product.id} readOnly />

      <div>
        <SubmitButton title="ویرایش محصول" style="btn btn-outline-dark mt-3 mb-5" />
      </div>
    </form>
  );
}
