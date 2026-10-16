// Delivery method helpers (no React, safe to import anywhere).

// `type` values the API accepts -> Persian label.
// The swagger only shows "courier": add the other values of your backend enum here.

export const DELIVERY_TYPES = {
  courier: "ارسال (تیپاکس، اسنپ و ...)",
  pickup: "تحویل حضوری",
};
export const isPickup = (type) => type === "pickup";
export const LABEL_PLACEHOLDERS = {
  courier: "ارسال با تیپاکس",
  pickup: "تحویل حضوری در فروشگاه",
};

export const typeLabel = (type) => DELIVERY_TYPES[type] ?? type;

// ۰-۹ and ٠-٩ -> 0-9, so a Persian keyboard works in the fee fields
const normalizeDigits = (text) =>
  text
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));

/**
 * "۶۵٬۰۰۰" / "65,000" / "65000" -> "65000" (the API takes fees as strings).
 * Returns null when it is not a valid non-negative amount with at most 2 decimals.
 */
export function parseFee(value) {
  const cleaned = normalizeDigits(String(value ?? ""))
    .replace(/[,\u066c\s]/g, "")
    .trim();

  return /^\d+(\.\d{1,2})?$/.test(cleaned) ? cleaned : null;
}
