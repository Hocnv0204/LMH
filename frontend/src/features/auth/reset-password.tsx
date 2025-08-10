import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearch, useParams } from '@tanstack/react-router'
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { authService } from '@/api/auth'
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

export default function ResetPasswordPage() {
  // Lấy token từ URL params
  const params = useParams({ from: '/auth/reset-password/$token' })
  const token = params.token
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    console.log('Token from URL:', token)
    if (!token) {
      setError('Token không hợp lệ')
    }
  }, [token])

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

  const validatePasswords = () => {
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return false
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!validatePasswords()) {
      setIsLoading(false)
      return
    }

    try {
      await authService.resetPassword({
        token: token!,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })
      setSuccess(true)
      console.log('✅ Password reset successfully')
    } catch (error) {
      console.error('❌ Reset password error:', error)
      if (error instanceof Error) {
        if (error.message.includes('TOKEN_INVALID')) {
          setError('Token không hợp lệ hoặc đã được sử dụng')
        } else if (error.message.includes('TOKEN_EXPIRED')) {
          setError('Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới')
        } else {
          setError(error.message)
        }
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900'>
              <CheckCircle className='h-6 w-6 text-green-600 dark:text-green-400' />
            </div>
            <CardTitle className='text-2xl font-bold text-green-600 dark:text-green-400'>
              Đặt lại mật khẩu thành công!
            </CardTitle>
            <CardDescription className='text-center'>
              Mật khẩu của bạn đã được cập nhật. Bây giờ bạn có thể đăng nhập
              với mật khẩu mới.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className='w-full'
              onClick={() => navigate({ to: '/auth/login' })}
            >
              Đăng nhập ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center justify-between'>
            <Link
              to='/auth/login'
              className='flex items-center space-x-2 transition-opacity hover:opacity-80'
            >
              <ArrowLeft className='h-4 w-4' />
              <span className='text-muted-foreground text-sm'>Quay lại</span>
            </Link>
          </div>
          <CardTitle className='text-center text-2xl font-bold'>
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription className='text-center'>
            Nhập mật khẩu mới cho tài khoản của bạn
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

            {/* New Password */}
            <div className='space-y-2'>
              <Label htmlFor='newPassword'>Mật khẩu mới</Label>
              <div className='relative'>
                <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='newPassword'
                  name='newPassword'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Nhập mật khẩu mới'
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className='px-10'
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

            {/* Confirm Password */}
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Xác nhận mật khẩu</Label>
              <div className='relative'>
                <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Nhập lại mật khẩu mới'
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className='px-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute top-1/2 right-3 -translate-y-1/2 transform'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className='rounded-md bg-gray-50 p-3 dark:bg-gray-800'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Mật khẩu phải có:
              </p>
              <ul className='mt-1 list-inside list-disc text-sm text-gray-600 dark:text-gray-400'>
                <li>Ít nhất 6 ký tự</li>
                <li>Bao gồm chữ và số</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              className='w-full'
              size='lg'
              disabled={isLoading || !token}
            >
              {isLoading ? (
                <>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật mật khẩu'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
