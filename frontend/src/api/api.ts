// Giả định bạn có file này để lấy token
import { tokenManager } from '@/utils/token-manager';
import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {} // <-- Đặt giá trị mặc định để không cần check undefined
): Promise<T> {
  const token = tokenManager.getAccessToken();
  const headers = new Headers(options.headers);

  // 1. TỰ ĐỘNG THÊM AUTHENTICATION HEADER
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 2. XỬ LÝ CONTENT-TYPE
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage =
      errorData?.message || `HTTP error! status: ${response.status}`;
    throw new ApiError(response.status, errorMessage);
  }

  // 3. XỬ LÝ TRƯỜNG HỢP RESPONSE KHÔNG CÓ BODY (ví dụ: 204 No Content)
  if (response.status === 204) {
    return Promise.resolve(null as T);
  }

  return response.json();
}