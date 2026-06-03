/** Builds a standardized successful API response envelope. */
export function success<T>(data: T, message = "Request successful") {
  return { success: true, message, data };
}
