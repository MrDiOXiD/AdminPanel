"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// [1, 2, null, 9, 10] - null is rendered as an ellipsis. Always shows first, last and current +/- radius.
function pageWindow(current, total, radius = 2) {
  const pages = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= radius) pages.push(p);
  }
  return pages.flatMap((p, i) => (i > 0 && p - pages[i - 1] > 1 ? [null, p] : [p]));
}

/**
 * Pass `meta` ({ page, totalPages }, what the NestJS API returns) for previous/next + a page window.
 * `links` (Laravel-style) is still supported so tables that have not been migrated keep working.
 */
export default function Paginate({ meta, links }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function goTo(page) {
    const params = new URLSearchParams(searchParams);
    params.set("page", page);
    router.replace(`${pathname}?${params.toString()}`);
  }

  if (!meta) {
    return (
      <nav className="d-flex justify-content-center mt-5">
        <ul className="pagination">
          {links?.slice(1, -1).map((link, index) => (
            <li key={index} className={link.active ? "page-item active" : "page-item"}>
              <button onClick={() => goTo(link.label)} className="page-link">
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  const { page, totalPages } = meta;
  if (totalPages <= 1) return null;

  return (
    <nav className="d-flex justify-content-center mt-5">
      <ul className="pagination">
        <li className={page <= 1 ? "page-item disabled" : "page-item"}>
          <button className="page-link" disabled={page <= 1} onClick={() => goTo(page - 1)}>
            قبلی
          </button>
        </li>

        {pageWindow(page, totalPages).map((p, index) =>
          p === null ? (
            <li key={`gap-${index}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li key={p} className={p === page ? "page-item active" : "page-item"}>
              <button className="page-link" onClick={() => goTo(p)}>
                {p}
              </button>
            </li>
          ),
        )}

        <li className={page >= totalPages ? "page-item disabled" : "page-item"}>
          <button className="page-link" disabled={page >= totalPages} onClick={() => goTo(page + 1)}>
            بعدی
          </button>
        </li>
      </ul>
    </nav>
  );
}
