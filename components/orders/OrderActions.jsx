"use client";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import SubmitButton from "@/components/SubmitButton";
import { cancelOrder, updateOrderStatus } from "@/actions/orders";

// The only forward step from each status. delivered / cancelled are final.
const NEXT_STEP = {
  processing: { status: "shipped", title: "ثبت ارسال سفارش", confirm: "سفارش به عنوان «ارسال شده» ثبت شود؟" },
  shipped: { status: "delivered", title: "ثبت تحویل سفارش", confirm: "سفارش به عنوان «تحویل داده شده» ثبت شود؟" },
};

const CANCELLABLE = ["processing"];

function useToast(state) {
  useEffect(() => {
    if (state?.message) toast(state.message, { type: state.status });
  }, [state]);
}

// Cancels the submit (and therefore the server action) when the admin declines.
const confirmFirst = (message) => (event) => {
  if (!window.confirm(message)) event.preventDefault();
};

export default function OrderActions({ id, status, paid }) {
  const [advanceState, advanceAction] = useActionState(updateOrderStatus, {});
  const [cancelState, cancelAction] = useActionState(cancelOrder, {});
  useToast(advanceState);
  useToast(cancelState);

  const next = NEXT_STEP[status];
  const canCancel = CANCELLABLE.includes(status);

  if (!next && !canCancel) {
    return <p className="text-muted mb-0">برای این سفارش عملیاتی در دسترس نیست.</p>;
  }

  const cancelMessage = paid
    ? "این سفارش پرداخت شده است. با لغو سفارش، بازپرداخت وجه به صورت دستی انجام می‌شود. ادامه می‌دهید؟"
    : "سفارش لغو شود؟ این عملیات قابل بازگشت نیست.";

  return (
    <div className="d-flex flex-wrap gap-2">
      {next ? (
        <form action={advanceAction} onSubmit={confirmFirst(next.confirm)}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={next.status} />
          <SubmitButton title={next.title} style="btn btn-dark" />
        </form>
      ) : null}

      {canCancel ? (
        <form action={cancelAction} onSubmit={confirmFirst(cancelMessage)}>
          <input type="hidden" name="id" value={id} />
          <SubmitButton title="لغو سفارش" style="btn btn-outline-danger" />
        </form>
      ) : null}
    </div>
  );
}
