const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export type ApiResponse<T> = { success: boolean; message: string; data: T };

/** Sends an authenticated JSON request to the backend API and returns the response data. */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message ?? "Request failed");
  return (payload as ApiResponse<T>).data;
}
