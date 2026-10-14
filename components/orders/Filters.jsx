import Form from "next/form";
import Link from "next/link";

// GET form: submitting only changes the URL query, the server component below re-renders.
// `key` remounts the inputs when the URL changes, so "clear" really empties them.
export default function Filters({ q, status, payment }) {
  return (
    <Form action="/orders" key={`${q}|${status}|${payment}`} className="row g-2 mb-3 align-items-end">
      {status ? <input type="hidden" name="status" value={status} /> : null}

      <div className="col-md-5">
        <label className="form-label">جستجو</label>
        <input
          name="q"
          defaultValue={q}
          type="text"
          className="form-control"
          placeholder="شماره سفارش، نام، ایمیل یا موبایل"
        />
      </div>

      <div className="col-md-3">
        <label className="form-label">وضعیت پرداخت</label>
        <select name="payment" defaultValue={payment} className="form-select">
          <option value="">همه</option>
          <option value="paid">پرداخت شده</option>
          <option value="unpaid">پرداخت نشده</option>
          <option value="cod">پرداخت در محل</option>
        </select>
      </div>

      <div className="col-md-4 d-flex gap-2">
        <button type="submit" className="btn btn-dark">
          اعمال فیلتر
        </button>
        <Link href="/orders" className="btn btn-outline-secondary">
          پاک کردن
        </Link>
      </div>
    </Form>
  );
}
