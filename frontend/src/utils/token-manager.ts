import { API_CONFIG } from '@/config/api'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  authenticated: boolean
}

export interface RefreshTokenRequest {
  refreshToken: string
  userId: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    message: string
    status: number
  }
}

class TokenManager {
  private static instance: TokenManager
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value: string | PromiseLike<string>) => void
    reject: (reason?: unknown) => void
  }> = []

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  private processQueue(error: unknown, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token || '')
      }
    })
    this.failedQueue = []
  }

  async refreshToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject })
      })
    }

    this.isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refreshToken')
      const accessToken = localStorage.getItem('accessToken')

      if (!refreshToken || !accessToken) {
        throw new Error('No tokens available')
      }

      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const userId = payload.id

      if (!userId) {
        throw new Error('Cannot determine user ID')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken, userId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Backend error:', errorData)
        throw new Error(errorData.error?.message || 'Failed to refresh token')
      }

      const data: ApiResponse<TokenResponse> = await response.json()

      if (!data.success || !data.data) {
        throw new Error('Invalid refresh response')
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        data.data

      localStorage.setItem('accessToken', newAccessToken)
      localStorage.setItem('refreshToken', newRefreshToken)

      this.processQueue(null, newAccessToken)

      return newAccessToken
    } catch (error) {
      this.processQueue(error, null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  /**
   * Clear tokens và redirect về trang login
   */
  logoutAndRedirect(): void {
    this.clearTokens()
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login'
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return !!token
  }
}

export const tokenManager = TokenManager.getInstance()
