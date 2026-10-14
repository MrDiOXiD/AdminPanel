// "use client";

// import { usePathname, useRouter, useSearchParams } from "next/navigation";

// export default function Paginate({ links }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   function handlePage(page) {
//     const params = new URLSearchParams(searchParams);
//     params.set("page", page);
//     router.replace(`${pathname}?${params.toString()}`);
//   }

//   return (
//     <nav className="d-flex justify-content-center mt-5">
//       <ul className="pagination">
//         {links?.slice(1, -1).map((link, index) => (
//           <li key={index} className={link.active ? "page-item active" : "page-item"}>
//             <button onClick={() => handlePage(link.label)} className="page-link">
//               {link.label}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </nav>
//   );
// }
/**
 * Client-side pagination for lists the API returns unpaginated.
 * `links` has the same shape as the Laravel `meta.links` array that <Paginate /> expects
 * ([prev, ...pages, next] - the component drops the first and last item), so that component is reused unchanged.
 */
export function paginateList(items, page, perPage = 15) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(Number(page) || 1, 1), totalPages);

  const links =
    totalPages > 1
      ? [
          { label: "prev" },
          ...Array.from({ length: totalPages }, (_, i) => ({
            label: String(i + 1),
            active: i + 1 === current,
          })),
          { label: "next" },
        ]
      : [];

  return {
    items: items.slice((current - 1) * perPage, current * perPage),
    links,
    page: current,
    totalPages,
  };
}
