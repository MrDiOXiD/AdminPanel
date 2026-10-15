"use client";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import SubmitButton from "@/components/SubmitButton";
import { cancelOrder, updateOrderStatus } from "@/actions/orders";

// How each API action looks in the UI. WHICH actions exist for an order is decided by the API
// (`allowedActions`), so the status rules live in one place, the backend.
const ACTIONS = {
  ship: {
    title: "ثبت ارسال سفارش",
    status: "shipped",
    confirm: "سفارش به عنوان «ارسال شده» ثبت شود؟",
    style: "btn btn-dark",
  },
  deliver: {
    title: "ثبت تحویل سفارش",
    status: "delivered",
    confirm: "سفارش به عنوان «تحویل داده شده» ثبت شود؟ موجودی کالاها از انبار کسر می‌شود.",
    style: "btn btn-dark",
  },
  cancel: {
    title: "لغو سفارش",
    style: "btn btn-outline-danger",
  },
};

function useToast(state) {
  useEffect(() => {
    if (state?.message) toast(state.message, { type: state.status });
  }, [state]);
}

// Cancels the submit (and therefore the server action) when the admin declines.
const confirmFirst = (message) => (event) => {
  if (!window.confirm(message)) event.preventDefault();
};

export default function OrderActions({ id, allowedActions = [], paid }) {
  const [advanceState, advanceAction] = useActionState(updateOrderStatus, {});
  const [cancelState, cancelAction] = useActionState(cancelOrder, {});
  useToast(advanceState);
  useToast(cancelState);

  // Unknown actions (a newer API) are skipped instead of rendering a broken button
  const actions = allowedActions.filter((action) => ACTIONS[action]);

  if (actions.length === 0) {
    return <p className="text-muted mb-0">برای این سفارش عملیاتی در دسترس نیست.</p>;
  }

  const cancelMessage = paid
    ? "این سفارش پرداخت شده است. با لغو سفارش، بازپرداخت وجه به صورت دستی انجام می‌شود. ادامه می‌دهید؟"
    : "سفارش لغو شود؟ این عملیات قابل بازگشت نیست.";

  return (
    <div className="d-flex flex-wrap gap-2">
      {actions.map((action) => {
        const config = ACTIONS[action];

        if (action === "cancel") {
          return (
            <form key={action} action={cancelAction} onSubmit={confirmFirst(cancelMessage)}>
              <input type="hidden" name="id" value={id} />
              <SubmitButton title={config.title} style={config.style} />
            </form>
          );
        }

        return (
          <form key={action} action={advanceAction} onSubmit={confirmFirst(config.confirm)}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value={config.status} />
            <SubmitButton title={config.title} style={config.style} />
          </form>
        );
      })}
    </div>
  );
}
