import { getFetch } from "@/utils/fetch";

// The only place that knows the delivery-methods URLs.

/** All methods, inactive ones included -> array (or { statusCode, message } on error) */
export const getDeliveryMethods = () => getFetch("/delivery-methods/admin");

/**
 * One method by id. The API has no GET-by-id for the admin side, so it is picked from the list.
 * -> the method, null when it does not exist, or { statusCode, message } when the request failed
 */
export async function getDeliveryMethod(id) {
  const methods = await getDeliveryMethods();
  if (!Array.isArray(methods)) return methods;

  return methods.find((method) => String(method.id) === String(id)) ?? null;
}
