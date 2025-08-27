import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  authService,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
} from '@/api/auth'
import { tokenManager } from '@/utils/token-manager'

interface User {
  username: string
  role: string
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<RegisterResponse>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  refreshUserState: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Kiểm tra authentication khi component mount
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        const isAuth = await authService.isAuthenticated()
        if (currentUser && isAuth) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        // Clear invalid tokens
        localStorage.removeItem('accessToken')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Lắng nghe token refresh event từ response interceptor
    const handleTokenRefreshed = (event: CustomEvent) => {
      setUser(event.detail.user)
    }

    window.addEventListener(
      'tokenRefreshed',
      handleTokenRefreshed as EventListener
    )

    return () => {
      window.removeEventListener(
        'tokenRefreshed',
        handleTokenRefreshed as EventListener
      )
    }
  }, [])

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true)
      const response: AuthResponse = await authService.login(credentials)
      setUser(response.user as User)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    userData: RegisterRequest
  ): Promise<RegisterResponse> => {
    try {
      setIsLoading(true)
      const response: RegisterResponse = await authService.register(userData)
      return response
    } catch (error) {
      console.error('Register error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Continue with logout even if API call fails
    } finally {
      // Clear user state
      setUser(null)

      // Clear tokens và redirect về trang đăng nhập
      tokenManager.logoutAndRedirect()
    }
  }

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await authService.forgotPassword({ email })
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  }

  const refreshUserState = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser && (await authService.isAuthenticated())) {
        setUser(currentUser)
      } else {
        // If no user returned, clear user state
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing user state:', error)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    refreshUserState,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
