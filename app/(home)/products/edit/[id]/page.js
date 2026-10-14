import EditProduct from "@/components/products/Edit";
import { getFetch } from "@/utils/fetch";

async function fetchList(url) {
  try {
    const data = await getFetch(url);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function EditProductPage({ params }) {
  const { id } = await params; // Next 15: params is a Promise

  const [product, categories, badges] = await Promise.all([
    getFetch(`/products/${id}`),
    fetchList("/categories"),
    fetchList("/badges"),
  ]);

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h4 className="fw-bold">ویرایش محصول: {product.title}</h4>
      </div>

      <EditProduct product={product} categories={categories} badges={badges} />
    </>
  );
}
