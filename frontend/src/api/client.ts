import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios'
import { API_CONFIG } from '@/config/api'

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
    const originalRequest = error.config

    // If 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        console.log('Attempting to refresh token...')

        const response = await axios.post<ApiResponse<AuthenticationResponse>>(
          `${API_CONFIG.BASE_URL}/api/auth/refresh`,
          {
            refreshToken: localStorage.getItem('refreshToken'),
          }
        )

        console.log('Refresh token response:', response.data)

        if (response.data.success && response.data.data) {
          const {
            accessToken,
            refreshToken: newRefreshToken,
            authenticated,
          } = response.data.data

          // Validate response
          if (!authenticated || !accessToken || !newRefreshToken) {
            throw new Error('Refresh token failed: Invalid response data')
          }

          // Lưu token mới
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          console.log('Token refreshed successfully')

          // Process queue và retry original request
          processQueue(null, accessToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        } else {
          throw new Error('Refresh token failed: Invalid response format')
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError)

        // Process queue với error
        processQueue(refreshError, null)

        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        // Chỉ redirect nếu không phải đang ở trang login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }

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
