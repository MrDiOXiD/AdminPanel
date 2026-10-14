"use client";

import { useState } from "react";

/**
 * Clickable badge chips. Submits the chosen ids as a JSON array in a hidden input,
 * e.g. name="badges" value="[1,3]" — exactly what the NestJS API expects.
 */
export default function BadgeSelector({ badges = [], defaultSelected = [], name = "badges", max = 10 }) {
  const [selected, setSelected] = useState(defaultSelected);

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : prev.length < max ? [...prev, id] : prev,
    );

  return (
    <>
      <div className="d-flex flex-wrap gap-2">
        {badges.length === 0 && <span className="text-muted small">هنوز نشانی تعریف نشده است</span>}

        {badges.map((badge) => {
          const active = selected.includes(badge.id);

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => toggle(badge.id)}
              aria-pressed={active}
              className="badge border-0 fs-6 fw-normal"
              style={{
                backgroundColor: badge.color,
                color: badge.textColor,
                opacity: active ? 1 : 0.35,
                boxShadow: active ? "0 0 0 2px #212529" : "none",
              }}
            >
              {active && <i className="bi bi-check me-1"></i>}
              {badge.label}
            </button>
          );
        })}
      </div>

      <input type="hidden" name={name} value={JSON.stringify(selected)} />
    </>
  );
}
