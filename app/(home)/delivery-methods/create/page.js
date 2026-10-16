import CreateProduct from "@/components/products/Create";
import { getFetch } from "@/utils/fetch";

async function fetchList(url) {
  try {
    const data = await getFetch(url);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function CreateProductPage() {
  const [categories, badges] = await Promise.all([fetchList("/categories"), fetchList("/badges")]);

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h4 className="fw-bold">ایجاد محصول</h4>
      </div>

      <CreateProduct categories={categories} badges={badges} />
    </>
  );
}
