import { API_ENDPOINTS } from '@/config/api'
import { api, handleApiError, handleApiErrorMessage } from './client'

// Types
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  phoneNumber: string
  name: string
  school: string
  dateOfBirth: string
}

export interface RegisterResponse {
  message: string
  email: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  authenticated: boolean
  user?: {
    username: string
    name: string
    role: string
    id: string
    email: string
  }
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export const TypeToken = {
  VERIFICATION_TOKEN: 'VERIFICATION_TOKEN',
  RESET_PASSWORD_TOKEN: 'RESET_PASSWORD_TOKEN',
} as const

export type TypeToken = (typeof TypeToken)[keyof typeof TypeToken]

export interface ResendTokenRequest {
  email: string
  typeToken: TypeToken
}

// Auth service
export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      )
      // Store tokens
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)

      return response.data
    } catch (error) {
      const errorInfo = handleApiError(error)
      const errorWithStatus = new Error(errorInfo.message) as Error & {
        status?: number
      }
      errorWithStatus.status = errorInfo.status
      throw errorWithStatus
    }
  },

  // Register user
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      )

      return response.data
    } catch (error) {
      throw new Error(handleApiErrorMessage(error))
    }
  },

  // Verify email
  async verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
    try {
      const response = await api.get<{ message: string }>(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        {
          params: { token: data.token },
        }
      )

      return response.data
    } catch (error) {
      throw new Error(handleApiErrorMessage(error))
    }
  },

  // Resend verification email
  async resendVerification(
    data: ResendVerificationRequest
  ): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        data
      )

      return response.data
    } catch (error) {
      throw new Error(handleApiErrorMessage(error))
    }
  },

  // Resend reset password email
  async resendResetPassword(
    data: ResendTokenRequest
  ): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        API_ENDPOINTS.AUTH.RESEND_RESET_PASSWORD,
        data
      )

      return response.data
    } catch (error) {
      throw new Error(handleApiErrorMessage(error))
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken')
      await api.post(API_ENDPOINTS.AUTH.LOGOUT, {
        token,
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data)
    } catch (error) {
      throw new Error(handleApiErrorMessage(error))
    }
  },

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)
    } catch (error) {
      throw new Error(handleApiErrorMessage(error))
    }
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp * 1000 // Convert to milliseconds
      const now = Date.now()

      // Check if token expires in next 2 minutes (buffer time)
      return now >= exp - 2 * 60 * 1000
    } catch (error) {
      console.error('Error checking token expiration:', error)
      return true
    }
  },

  // Check if user is authenticated (with token expiration check and auto-refresh)
  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('accessToken')
    if (!token) return false

    try {
      if (this.isTokenExpired(token)) {
        console.log(
          'Token expired in isAuthenticated, attempting to refresh...'
        )

        // Import tokenManager dynamically to avoid circular dependency
        const { tokenManager } = await import('@/utils/token-manager')

        try {
          // Attempt to refresh token
          const newToken = await tokenManager.refreshToken()
          return !!newToken
        } catch (refreshError) {
          console.error(
            'Failed to refresh token in isAuthenticated:',
            refreshError
          )
          // Clear tokens if refresh fails
          tokenManager.clearTokens()
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  },

  // Get current user from token (improved implementation)
  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    const token = localStorage.getItem('accessToken')
    if (!token) return null

    try {
      // Check if token is expired
      if (this.isTokenExpired(token)) {
        console.log('Token expired, attempting to refresh...')

        // Import tokenManager dynamically to avoid circular dependency
        const { tokenManager } = await import('@/utils/token-manager')

        try {
          // Attempt to refresh token
          const newToken = await tokenManager.refreshToken()
          if (newToken) {
            console.log('Token refreshed successfully, decoding new token...')
            // Decode the new refreshed token
            const payload = JSON.parse(atob(newToken.split('.')[1]))
            return {
              username: payload.sub,
              name: payload.fullName || 'Student',
              role: payload.scope,
              id: payload.id?.toString() || '',
              email: payload.email || '',
            }
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError)
          // Clear tokens if refresh fails
          tokenManager.clearTokens()
          return null
        }
      }

      // Decode JWT token (matching backend structure)
      const payload = JSON.parse(atob(token.split('.')[1]))

      return {
        username: payload.sub,
        name: payload.fullName || 'Student',
        role: payload.scope,
        id: payload.id?.toString() || '',
        email: payload.email || '',
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  },
}
