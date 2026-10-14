import Link from "next/link";
import { ORDER_STATUS } from "@/utils/order";

/**
 * Status filter chips with counts.
 * `query` is the current URLSearchParams (or its string) so other filters survive a chip click.
 * `counts` is { processing: 4, shipped: 2, ... }, `total` is the count for the "all" chip.
 */
export default function StatusChips({ counts = {}, total = 0, status = "", query }) {
  const href = (value) => {
    const next = new URLSearchParams(query);
    next.delete("page"); // a new filter always starts at page 1
    if (value) next.set("status", value);
    else next.delete("status");
    const qs = next.toString();
    return qs ? `/orders?${qs}` : "/orders";
  };

  const chipClass = (active) => `btn btn-sm ${active ? "btn-dark" : "btn-outline-dark"}`;

  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      <Link href={href("")} className={chipClass(!status)}>
        همه ({total})
      </Link>

      {Object.entries(ORDER_STATUS).map(([key, config]) => (
        <Link key={key} href={href(key)} className={chipClass(status === key)}>
          {config.label} ({counts[key] ?? 0})
        </Link>
      ))}
    </div>
  );
}
