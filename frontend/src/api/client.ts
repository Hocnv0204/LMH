import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios'
import { API_CONFIG } from '@/config/api'
import { tokenManager } from '@/utils/token-manager'

// Extended config interface
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Add a flag to prevent infinite retry loops
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

// Types for API responses (matching backend structure)
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  error?: ApiError
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

export interface AuthenticationResponse {
  authenticated: boolean
  accessToken: string
  refreshToken: string
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
})

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Skip token for auth endpoints
    if (
      config.url?.includes('/auth/') &&
      !config.url?.includes('/auth/refresh')
    ) {
      return config
    }

    try {
      // Get current token from localStorage (don't auto-refresh on every request)
      const token = localStorage.getItem('accessToken')

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Failed to get access token:', error)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig

    // If 401 and we haven't already tried to refresh
    // BUT skip refresh for auth login/register endpoints (they should fail naturally)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      console.log('🚨 401 Unauthorized detected, attempting token refresh...')
      originalRequest._retry = true

      try {
        console.log('🔄 Calling tokenManager.refreshToken()...')
        const newToken = await tokenManager.refreshToken()

        // Cập nhật user state sau khi refresh thành công
        if (newToken) {
          try {
            const payload = JSON.parse(atob(newToken.split('.')[1]))
            const userData = {
              id: payload.id?.toString() || '',
              username: payload.sub || '',
              role: payload.scope || '',
              name: payload.fullName || '',
              email: payload.email || '',
            }

            // Dispatch custom event để AuthContext cập nhật user state
            window.dispatchEvent(
              new CustomEvent('tokenRefreshed', {
                detail: { user: userData, token: newToken },
              })
            )

            console.log('✅ User state updated after token refresh:', userData)
          } catch (error) {
            console.error('Error updating user state:', error)
          }
        }

        if (originalRequest) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return apiClient(originalRequest)
        }
        return Promise.reject(new Error('Original request not found'))
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError)
        tokenManager.clearTokens()

        // Redirect về trang login
        tokenManager.logoutAndRedirect()

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Log API errors
    if (error.response) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response.status,
        message: error.response.data?.message || error.message,
      })
    }

    return Promise.reject(error)
  }
)

// Helper functions for common HTTP methods
export const api = {
  get: <T = unknown>(url: string, config?: unknown) =>
    apiClient
      .get<ApiResponse<T>>(url, config as AxiosRequestConfig)
      .then((res) => {
        if (res.data.success) {
          return { data: res.data.data }
        } else {
          throw new Error(res.data.error?.message || 'API request failed')
        }
      }),

  post: <T = unknown>(url: string, data?: unknown, config?: unknown) =>
    apiClient
      .post<ApiResponse<T>>(url, data, config as AxiosRequestConfig)
      .then((res) => {
        if (res.data.success) {
          return { data: res.data.data }
        } else {
          throw new Error(res.data.error?.message || 'API request failed')
        }
      }),

  put: <T = unknown>(url: string, data?: unknown, config?: unknown) =>
    apiClient
      .put<ApiResponse<T>>(url, data, config as AxiosRequestConfig)
      .then((res) => {
        if (res.data.success) {
          return { data: res.data.data }
        } else {
          throw new Error(res.data.error?.message || 'API request failed')
        }
      }),

  patch: <T = unknown>(url: string, data?: unknown, config?: unknown) =>
    apiClient
      .patch<ApiResponse<T>>(url, data, config as AxiosRequestConfig)
      .then((res) => {
        if (res.data.success) {
          return { data: res.data.data }
        } else {
          throw new Error(res.data.error?.message || 'API request failed')
        }
      }),

  delete: <T = unknown>(url: string, config?: unknown) =>
    apiClient
      .delete<ApiResponse<T>>(url, config as AxiosRequestConfig)
      .then((res) => {
        if (res.data.success) {
          return { data: res.data.data }
        } else {
          throw new Error(res.data.error?.message || 'API request failed')
        }
      }),
}

// Error handling utility - trả về object chứa cả message và status
export const handleApiError = (
  error: unknown
): { message: string; status?: number } => {
  if (axios.isAxiosError(error)) {
    const apiResponse = error.response?.data as ApiResponse
    const message =
      apiResponse?.error?.message || error.message || 'Network error occurred'
    const status = error.response?.status
    return { message, status }
  }
  return { message: (error as Error).message || 'An unexpected error occurred' }
}

// Backward compatibility - trả về string như cũ
export const handleApiErrorMessage = (error: unknown): string => {
  const result = handleApiError(error)
  return result.message
}
