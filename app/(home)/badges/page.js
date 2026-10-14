import CreateBadge from "@/components/badges/CreateBadge";
import { getFetch } from "@/utils/fetch";

export default async function BadgesPage() {
  let badges = [];

  try {
    const data = await getFetch("/badges");
    if (Array.isArray(data)) badges = data;
  } catch {
    badges = [];
  }

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h4 className="fw-bold">نشان‌ها</h4>
      </div>

      <CreateBadge />

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>شناسه</th>
              <th>کلید</th>
              <th>نمایش</th>
            </tr>
          </thead>
          <tbody>
            {badges.map((badge) => (
              <tr key={badge.id}>
                <td>{badge.id}</td>
                <td dir="ltr" className="text-end">{badge.key}</td>
                <td>
                  <span className="badge fs-6 fw-normal" style={{ backgroundColor: badge.color, color: badge.textColor }}>
                    {badge.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
