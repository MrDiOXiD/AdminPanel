"use client";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import BadgeSelector from "@/components/badges/BadgeSelector";
import SubmitButton from "@/components/SubmitButton";
import { setProductBadges } from "@/actions/products";

export default function ProductBadgesForm({ productId, badges, selected }) {
  const [state, formAction] = useActionState(setProductBadges, {});

  useEffect(() => {
    if (state?.message) toast(state.message, { type: state.status });
  }, [state]);

  return (
    <form action={formAction} className="col-md-12">
      <label className="form-label">نشان‌ها</label>
      <BadgeSelector badges={badges} defaultSelected={selected} />
      <input type="hidden" name="id" value={productId} />
      <SubmitButton title="ذخیره نشان‌ها" style="btn btn-sm btn-outline-dark mt-3" />
    </form>
  );
}
