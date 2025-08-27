import React, { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Lock, User, Home, AlertCircle } from 'lucide-react'
import { useAuthHook } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const { login } = useAuthHook()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
      })

      if (result.success) {
        console.log('✅ Login successful', result)
        // Sử dụng window.location để force reload
        window.location.href = '/'
      } else {
        console.error(
          '❌ Login failed:',
          result.error,
          'Status:',
          result.status
        )
        // Handle different error types based on HTTP status codes
        if (result.status === 401) {
          setError('Tên đăng nhập hoặc mật khẩu không chính xác')
        } else if (result.status === 404) {
          setError('Tài khoản không tồn tại')
        } else if (!result.status || result.status >= 500) {
          setError('Không thể kết nối đến server. Vui lòng thử lại')
        } else {
          setError(result.error || 'Có lỗi xảy ra. Vui lòng thử lại')
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setError('Không thể kết nối đến server. Vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL ||
        'https://api-lmh-writting-practice.id.vn'

      // Mở popup window cho Google OAuth
      const popup = window.open(
        `${API_BASE_URL}/oauth2/authorization/google`,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('Popup bị chặn. Vui lòng cho phép popup và thử lại')
      }

      // Lắng nghe message từ popup
      const handleMessage = (event: MessageEvent) => {
        // Kiểm tra origin để bảo mật
        if (event.origin !== window.location.origin) return

        const { type, data } = event.data

        if (type === 'GOOGLE_AUTH_SUCCESS' && data) {
          const { accessToken, refreshToken, authenticated } = data

          if (accessToken && refreshToken) {
            // Lưu tokens trực tiếp vào localStorage
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('authenticated', authenticated.toString())

            console.log('✅ Google login successful - tokens saved')

            // Đóng popup
            popup.close()

            // Redirect trực tiếp về trang chủ mà không gọi API login
            window.location.href = '/'
          }
        } else if (type === 'GOOGLE_AUTH_ERROR') {
          setError(data?.message || 'Đăng nhập Google thất bại')
          popup.close()
        }

        // Cleanup
        window.removeEventListener('message', handleMessage)
        setIsLoading(false)
      }

      // Lắng nghe message từ popup
      window.addEventListener('message', handleMessage)

      // Kiểm tra nếu popup bị đóng manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          setIsLoading(false)
        }
      }, 1000)
    } catch (error) {
      console.error('Google login error:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể đăng nhập bằng Google. Vui lòng thử lại'
      )
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center justify-between'>
            <Link
              to='/'
              className='flex items-center space-x-2 transition-opacity hover:opacity-80'
            >
              <Home className='text-primary h-5 w-5' />
              <span className='text-muted-foreground text-sm'>Trang chủ</span>
            </Link>
          </div>
          <CardTitle className='text-center text-2xl font-bold'>
            Đăng nhập
          </CardTitle>
          <CardDescription className='text-center'>
            Chào mừng bạn quay trở lại! Vui lòng đăng nhập để tiếp tục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Error Alert */}
            {error && (
              <div className='flex items-center space-x-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'>
                <AlertCircle className='h-4 w-4 flex-shrink-0' />
                <span className='text-sm'>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className='space-y-2'>
              <Label htmlFor='username'>Tên đăng nhập</Label>
              <div className='relative'>
                <User className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='username'
                  name='username'
                  type='text'
                  placeholder='Nhập tên đăng nhập hoặc email'
                  value={formData.username}
                  onChange={handleInputChange}
                  className='pl-10'
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className='space-y-2'>
              <Label htmlFor='password'>Mật khẩu</Label>
              <div className='relative'>
                <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Nhập mật khẩu'
                  value={formData.password}
                  onChange={handleInputChange}
                  className='pr-10 pl-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute top-1/2 right-3 -translate-y-1/2 transform'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className='text-right'>
              <Link
                to='/auth/forgot-password'
                className='text-primary text-sm hover:underline'
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type='submit'
              className='w-full'
              size='lg'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>

            {/* Divider */}
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background text-muted-foreground px-2'>
                  Hoặc
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
              </svg>
              {isLoading ? 'Đang chuyển hướng...' : 'Đăng nhập với Google'}
            </Button>
          </form>

          <div className='mt-6 text-center text-sm'>
            <span className='text-gray-600 dark:text-gray-400'>
              Chưa có tài khoản?{' '}
            </span>
            <Link
              to='/auth/register'
              className='text-primary font-medium hover:underline'
            >
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
