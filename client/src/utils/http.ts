const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  code?: string;
  message?: string;
}

interface Admin {
  adminId: string;
  email: string;
}

interface AuthData {
  admin: Admin;
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

function getAuthData(): AuthData | null {
  try {
    const stored = localStorage.getItem('quzzzz-auth');
    if (stored) {
      return JSON.parse(stored) as AuthData;
    }
  } catch (err) {
    // silently ignore parse errors
  }
  return null;
}

function setAuthData(authData: AuthData | null) {
  if (authData) {
    localStorage.setItem('quzzzz-auth', JSON.stringify(authData));
  } else {
    localStorage.removeItem('quzzzz-auth');
  }
}

function getHeaders(token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  const accessToken = token || getAuthData()?.accessToken;
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
}

async function refreshAccessToken(): Promise<string> {
  const authData = getAuthData();
  if (!authData?.refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: authData.refreshToken }),
  });

  const result: ApiResponse<AuthData> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || 'Token refresh failed');
  }

  // Update stored auth data
  setAuthData(result.data);
  return result.data.accessToken;
}

async function makeRequest<T>(
  url: string,
  options: RequestInit,
  isRetry: boolean = false
): Promise<ApiResponse<T>> {
  const response = await fetch(url, options);
  const result: ApiResponse<T> = await response.json();

  // If 401 and we haven't retried yet, attempt token refresh
  if (response.status === 401 && !isRetry && result.code === 'AUTH_TOKEN_EXPIRED') {
    
    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            const newOptions = {
              ...options,
              headers: { ...options.headers, ...getHeaders(token) }
            };
            makeRequest<T>(url, newOptions, true).then(resolve).catch(reject);
          },
          reject
        });
      });
    }

    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();
      
      // Process queued requests
      processQueue(null, newAccessToken);
      
      // Retry original request with new token
      const newOptions = {
        ...options,
        headers: { ...options.headers, ...getHeaders(newAccessToken) }
      };
      
      return makeRequest<T>(url, newOptions, true);
      
    } catch (refreshError) {
      // Refresh failed, clear auth and redirect to login
      processQueue(refreshError, null);
      setAuthData(null);
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
      
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }

  return result;
}

export async function get<T>(path: string): Promise<ApiResponse<T>> {
  return makeRequest<T>(`${BASE_URL}${path}`, { 
    method: 'GET',
    headers: getHeaders() 
  });
}

export async function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  return makeRequest<T>(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
}

export async function patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  return makeRequest<T>(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
}

export async function del<T>(path: string): Promise<ApiResponse<T>> {
  return makeRequest<T>(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
}
