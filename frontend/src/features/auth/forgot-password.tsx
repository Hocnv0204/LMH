import React, { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { authService, TypeToken } from '@/api/auth'
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [message, setMessage] = useState('')

  const isMounted = useRef(true)

  // Cleanup proper
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setResendCooldown(resendCooldown - 1)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await authService.forgotPassword({ email })
      if (isMounted.current) {
        setSuccess(true)
        setMessage('Email đặt lại mật khẩu đã được gửi!')
        setResendCooldown(60)
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error)
      if (isMounted.current) {
        if (error instanceof Error) {
          if (error.message.includes('EMAIL_NOT_EXISTS')) {
            setError('Email này không tồn tại trong hệ thống')
          } else {
            setError(error.message)
          }
        } else {
          setError('Có lỗi xảy ra. Vui lòng thử lại')
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleResendEmail = async () => {
    if (!email) return

    try {
      setIsResending(true)
      setError('')

      // Thử gọi API resend-reset-password trước
      try {
        const response = await authService.resendResetPassword({
          email,
          typeToken: TypeToken.RESET_PASSWORD_TOKEN,
        })
        if (isMounted.current) {
          setMessage(
            response.message || 'Email đặt lại mật khẩu đã được gửi lại!'
          )
          setResendCooldown(60)
        }
        return
      } catch (resendError) {
        // Nếu resend-reset-password thất bại, fallback về forgot-password
        if (
          resendError instanceof Error &&
          (resendError.message.includes('500') ||
            resendError.message.includes('Internal Server Error'))
        ) {
          try {
            await authService.forgotPassword({ email })
            if (isMounted.current) {
              setMessage(
                'Email đặt lại mật khẩu đã được gửi lại! (sử dụng phương thức dự phòng)'
              )
              setResendCooldown(60)
            }
            return
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError)
            // Nếu fallback cũng thất bại, throw error để xử lý bên dưới
            throw fallbackError
          }
        }

        // Nếu không phải lỗi 500, throw lại để xử lý error handling bên dưới
        throw resendError
      }
    } catch (error) {
      if (isMounted.current) {
        let errorMessage = 'Gửi lại email thất bại'

        if (error instanceof Error) {
          const errorText = error.message.toLowerCase()

          if (
            errorText.includes('user_not_exists') ||
            errorText.includes('email_not_exists')
          ) {
            errorMessage = 'Email này không tồn tại trong hệ thống'
          } else if (errorText.includes('token_not_exists')) {
            errorMessage =
              'Không tìm thấy yêu cầu đặt lại mật khẩu. Vui lòng thử gửi yêu cầu mới.'
          } else if (errorText.includes('token_exists')) {
            errorMessage =
              'Email đặt lại mật khẩu vẫn còn hiệu lực. Vui lòng kiểm tra hộp thư của bạn.'
          } else if (errorText.includes('500')) {
            errorMessage = 'Lỗi server tạm thời. Vui lòng thử lại sau.'
          } else {
            errorMessage = error.message
          }
        }

        setError(errorMessage)
      }
    } finally {
      if (isMounted.current) {
        setIsResending(false)
      }
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
              Email đã được gửi!
            </CardTitle>
            <CardDescription className='text-center'>
              Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng
              kiểm tra hộp thư (bao gồm cả thư mục spam).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='rounded-md bg-blue-50 p-4 dark:bg-blue-950'>
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  <strong>Email:</strong> {email}
                </p>
                <p className='mt-2 text-sm text-blue-600 dark:text-blue-400'>
                  Link sẽ hết hạn sau 1 giờ. Nếu không nhận được email, vui lòng
                  kiểm tra thư mục spam.
                </p>
              </div>

              {/* Success Message */}
              {message && (
                <div className='rounded-md bg-green-50 p-3 dark:bg-green-950'>
                  <p className='text-sm text-green-700 dark:text-green-300'>
                    {message}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className='flex items-center space-x-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'>
                  <AlertCircle className='h-4 w-4 flex-shrink-0' />
                  <span className='text-sm'>{error}</span>
                </div>
              )}

              <div className='flex space-x-2'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldown > 0}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                      Đang gửi lại...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock className='mr-2 h-4 w-4' />
                      Gửi lại sau {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4' />
                      Gửi lại email
                    </>
                  )}
                </Button>
                <Link to='/auth/login' className='flex-1'>
                  <Button className='w-full'>Quay lại đăng nhập</Button>
                </Link>
              </div>
            </div>
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
            Quên mật khẩu?
          </CardTitle>
          <CardDescription className='text-center'>
            Nhập email của bạn để nhận link đặt lại mật khẩu
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

            {/* Email Input */}
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <div className='relative'>
                <Mail className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='Nhập email của bạn'
                  value={email}
                  onChange={handleInputChange}
                  className='pl-10'
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              className='w-full'
              size='lg'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                  Đang gửi...
                </>
              ) : (
                'Gửi link đặt lại mật khẩu'
              )}
            </Button>
          </form>

          <div className='mt-6 text-center text-sm'>
            <span className='text-gray-600 dark:text-gray-400'>
              Nhớ mật khẩu?{' '}
            </span>
            <Link
              to='/auth/login'
              className='text-primary font-medium hover:underline'
            >
              Đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
