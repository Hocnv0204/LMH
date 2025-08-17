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

// Request interceptor - chỉ thêm token, không refresh
apiClient.interceptors.request.use(
  (config) => {
    // Skip token for auth endpoints
    if (
      config.url?.includes('/auth/') &&
      !config.url?.includes('/auth/refresh')
    ) {
      return config
    }

    // Chỉ thêm token hiện tại, không kiểm tra expiration
    const token = tokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
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

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiResponse = error.response?.data as ApiResponse
    return (
      apiResponse?.error?.message || error.message || 'Network error occurred'
    )
  }
  return (error as Error).message || 'An unexpected error occurred'
}
