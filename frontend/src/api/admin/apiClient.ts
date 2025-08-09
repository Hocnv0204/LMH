const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Lớp lỗi tùy chỉnh để chứa status code từ API.
 */
export class ApiError extends Error {
  public status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Hàm gọi API chung, xử lý cả JSON và FormData.
 * @param endpoint Đường dẫn API (ví dụ: /admin/topics)
 * @param options Cấu hình của fetch (method, body, headers, ...)
 * @returns Promise chứa dữ liệu trả về từ API
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers = new Headers(options?.headers)

  // Nếu body là FormData, không set 'Content-Type'.
  // Trình duyệt sẽ tự động làm điều đó với boundary phù hợp.
  if (!(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    // Cố gắng đọc lỗi từ body nếu có
    const errorData = await response.json().catch(() => null)
    const errorMessage =
      errorData?.message || `HTTP error! status: ${response.status}`
    throw new ApiError(response.status, errorMessage)
  }

  return response.json()
}
