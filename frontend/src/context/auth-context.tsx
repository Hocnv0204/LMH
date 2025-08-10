import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  authService,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
} from '@/api/auth'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Kiểm tra authentication khi component mount
    const checkAuth = () => {
      try {
        const currentUser = authService.getCurrentUser()
        if (currentUser && authService.isAuthenticated()) {
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
  }, [])

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true)
      const response: AuthResponse = await authService.login(credentials)
      console.log('Login successful:', response)
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
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Clear user state even if API call fails
      setUser(null)
    } finally {
      setIsLoading(false)
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

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
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
