"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import SubmitButton from "@/components/SubmitButton";
import { deleteDeliveryMethod, toggleDeliveryMethod } from "@/actions/delivery";

function useToast(state) {
  useEffect(() => {
    if (state?.message) toast(state.message, { type: state.status });
  }, [state]);
}

export default function RowActions({ method }) {
  const [toggleState, toggleAction] = useActionState(toggleDeliveryMethod, {});
  const [deleteState, deleteAction] = useActionState(deleteDeliveryMethod, {});
  useToast(toggleState);
  useToast(deleteState);

  // Cancels the submit (and therefore the server action) when the admin declines
  const confirmDelete = (event) => {
    if (!window.confirm(`روش ارسال «${method.label}» حذف شود؟ این عملیات قابل بازگشت نیست.`)) {
      event.preventDefault();
    }
  };

  return (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      <Link href={`/delivery-methods/edit/${method.id}`} className="btn btn-sm btn-dark">
        ویرایش
      </Link>

      <form action={toggleAction}>
        <input type="hidden" name="id" value={method.id} />
        <input type="hidden" name="isActive" value={String(!method.isActive)} />
        <SubmitButton
          title={method.isActive ? "غیرفعال کردن" : "فعال کردن"}
          style={method.isActive ? "btn btn-sm btn-outline-secondary" : "btn btn-sm btn-outline-success"}
        />
      </form>

      <form action={deleteAction} onSubmit={confirmDelete}>
        <input type="hidden" name="id" value={method.id} />
        <SubmitButton title="حذف" style="btn btn-sm btn-outline-danger" />
      </form>
    </div>
  );
}
