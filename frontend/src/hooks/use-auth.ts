import { LoginRequest, RegisterRequest, RegisterResponse } from '@/api/auth'
import { useAuth } from '@/context/auth-context'

export const useAuthHook = () => {
  const auth = useAuth()

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      await auth.login(credentials)
      return { success: true }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Đăng nhập thất bại'
      const status = (error as Error & { status?: number })?.status
      return {
        success: false,
        error: errorMessage,
        status: status,
      }
    }
  }

  const handleRegister = async (userData: RegisterRequest) => {
    try {
      const response: RegisterResponse = await auth.register(userData)
      return {
        success: true,
        data: response,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Đăng ký thất bại',
      }
    }
  }

  const handleLogout = async () => {
    try {
      await auth.logout()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Đăng xuất thất bại',
      }
    }
  }

  const handleForgotPassword = async (email: string) => {
    try {
      await auth.forgotPassword(email)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Gửi email thất bại',
      }
    }
  }

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
  }
}
