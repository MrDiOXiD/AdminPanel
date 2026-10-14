"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import SubmitButton from "@/components/SubmitButton";
import { createBadge } from "@/actions/badges";

export default function CreateBadge() {
  const [state, formAction] = useActionState(createBadge, {});
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [textColor, setTextColor] = useState("#ffffff");

  useEffect(() => {
    if (state?.message) toast(state.message, { type: state.status });
  }, [state]);

  return (
    <form action={formAction} className="row gy-3 align-items-end mb-4">
      <div className="col-md-3">
        <label className="form-label">کلید (انگلیسی)</label>
        <input name="key" type="text" dir="ltr" className="form-control" placeholder="bestseller" maxLength={30} />
      </div>

      <div className="col-md-3">
        <label className="form-label">عنوان</label>
        <input
          name="label"
          type="text"
          className="form-control"
          placeholder="پرفروش"
          maxLength={50}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      <div className="col-md-2">
        <label className="form-label">رنگ پس‌زمینه</label>
        <input
          name="color"
          type="color"
          className="form-control form-control-color w-100"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      <div className="col-md-2">
        <label className="form-label">رنگ متن</label>
        <input
          name="textColor"
          type="color"
          className="form-control form-control-color w-100"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
        />
      </div>

      <div className="col-md-2 d-flex align-items-center gap-3">
        <span className="badge fs-6 fw-normal" style={{ backgroundColor: color, color: textColor }}>
          {label || "پیش‌نمایش"}
        </span>
      </div>

      <div className="col-12">
        <SubmitButton title="ایجاد نشان" style="btn btn-outline-dark" />
      </div>
    </form>
  );
}
