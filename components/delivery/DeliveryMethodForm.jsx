"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import SubmitButton from "@/components/SubmitButton";
import { DELIVERY_TYPES, isPickup } from "@/utils/delivery";
// import { DELIVERY_TYPES, LABEL_PLACEHOLDERS, isPickup } from "@/utils/delivery";




const EMPTY = { label: "", type: "courier", baseFee: "", perItemFee: "", isActive: true };

// "65000.00" -> "65000", "12.50" -> "12.5"
const feeText = (value) => String(Number(value));

const toValues = (method) =>
  method
    ? {
      label: method.label,
      type: method.type,
      baseFee: feeText(method.baseFee),
      perItemFee: feeText(method.perItemFee),
      isActive: method.isActive,
    }
    : EMPTY;

/**
 * One form for both create and edit.
 *  - create: <DeliveryMethodForm action={createDeliveryMethod} />  (clears itself after success)
 *  - edit:   <DeliveryMethodForm action={updateDeliveryMethod} method={method} redirectTo="/delivery-methods" />
 */
export default function DeliveryMethodForm({ action, method = null, redirectTo = null }) {
  const [state, formAction] = useActionState(action, {});
  const router = useRouter();
  // Controlled fields: a validation error must not wipe what the admin typed
  const [values, setValues] = useState(() => toValues(method));
  
    // inside the component, before the useEffect:
    const setType = (event) => {
      const type = event.target.value;
      setValues((prev) => ({ ...prev, type, ...(isPickup(type) ? { baseFee: "0", perItemFee: "0" } : {}) }));
    };
    const pickup = isPickup(values.type);

  const set = (field) => (event) =>
    setValues((prev) => ({
      ...prev,
      [field]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));


  useEffect(() => {
    if (!state?.message) return;
    toast(state.message, { type: state.status });

    if (state.status !== "success") return;
    if (redirectTo) router.push(redirectTo);
    else setValues(EMPTY);
  }, [state, redirectTo, router]);

  // An existing method may have a type that is not in the constant yet: keep it selectable
  const types = method && !DELIVERY_TYPES[method.type] ? { ...DELIVERY_TYPES, [method.type]: method.type } : DELIVERY_TYPES;

  return (
    <form action={formAction} className="row gy-3 align-items-end mb-4">
      {method ? <input type="hidden" name="id" value={method.id} /> : null}

      <div className="col-md-3">
        <label className="form-label">عنوان</label>
        <input
          name="label"
          type="text"
          className="form-control"
          placeholder="ارسال با اسنپ پیک"
          value={values.label}
          onChange={set("label")}
        />
      </div>

      <div className="col-md-2">
        <label className="form-label">نوع</label>
        <select name="type" className="form-select" value={values.type} onChange={set("type")}>
          {Object.entries(types).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-2">
        <label className="form-label">هزینه پایه (تومان)</label>
        <input
          name="baseFee"
          type="text"
          inputMode="numeric"
          dir="ltr"
          className="form-control"
          placeholder="65000"
          value={values.baseFee}
          onChange={set("baseFee")}
        />
      </div>

      <div className="col-md-2">
        <label className="form-label">هزینه هر قلم (تومان)</label>
        <input
          name="perItemFee"
          type="text"
          inputMode="numeric"
          dir="ltr"
          className="form-control"
          placeholder="0"
          value={values.perItemFee}
          onChange={set("perItemFee")}
        />
      </div>

      <div className="col-md-1">
        <div className="form-check form-switch">
          <input
            id="delivery-active"
            name="isActive"
            type="checkbox"
            className="form-check-input"
            checked={values.isActive}
            onChange={set("isActive")}
          />
          <label htmlFor="delivery-active" className="form-check-label">
            فعال
          </label>
        </div>
      </div>

      <div className="col-md-2">
        <SubmitButton title={method ? "ذخیره تغییرات" : "ایجاد روش ارسال"} style="btn btn-outline-dark w-100" />
      </div>
    </form>
  );
}
