import Loading from "@/components/Loading";
import DeliveryMethodForm from "@/components/delivery/DeliveryMethodForm";
import Table from "@/components/delivery/Table";
import { createDeliveryMethod } from "@/actions/delivery";
import { Suspense } from "react";

export default function DeliveryMethodsPage() {
  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h4 className="fw-bold">روش‌های ارسال</h4>
      </div>

      <DeliveryMethodForm action={createDeliveryMethod} />   
      <Suspense fallback={<Loading />}>
        <Table />
      </Suspense>
    </>
  );
}
