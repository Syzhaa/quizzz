const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  code?: string;
  message?: string;
}

function getHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const auth = JSON.parse(localStorage.getItem('quzzzz-auth') || '{}');
    if (auth.accessToken) {
      headers['Authorization'] = `Bearer ${auth.accessToken}`;
    }
  } catch (err) {
    // silently ignore parse errors
  }
  return headers;
}

export async function get<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: getHeaders() });
  return res.json();
}

export async function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function del<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
}
