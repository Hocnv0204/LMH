import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useSearch, useParams } from '@tanstack/react-router'
import { Mail, Clock, RefreshCw, CheckCircle, Home } from 'lucide-react'
import { authService } from '@/api/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface EmailVerificationProps {
  email?: string
  mode?: 'pending' | 'verify'
}

export default function EmailVerificationPage({
  email: propEmail,
  mode = 'pending',
}: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [message, setMessage] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<
    'pending' | 'success' | 'error'
  >('pending')

  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as {
    email?: string
    token?: string
  }
  const params = useParams({ strict: false }) as { token?: string }
  const email = propEmail || search.email || ''
  const token = search.token || params.token

  // ✅ Sử dụng useRef để track verification
  const hasVerified = useRef(false)
  const isMounted = useRef(true)

  // ✅ Cleanup proper
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

  // ✅ Tách validation logic
  const validateToken = (
    token: string
  ): { isValid: boolean; error?: string } => {
    if (!token || token.trim() === '') {
      return {
        isValid: false,
        error: 'Token xác thực không hợp lệ. Vui lòng kiểm tra lại link.',
      }
    }

    if (token.length < 10) {
      return {
        isValid: false,
        error: 'Token xác thực không hợp lệ. Vui lòng kiểm tra lại link.',
      }
    }

    // ✅ Validation linh hoạt hơn - chấp nhận nhiều format
    const hasValidCharacters = /^[a-zA-Z0-9\-_]+$/.test(token)
    if (!hasValidCharacters) {
      return { isValid: false, error: 'Token xác thực không đúng định dạng.' }
    }

    return { isValid: true }
  }

  const handleVerifyEmail = useCallback(
    async (verificationToken: string) => {
      console.log('🔍 handleVerifyEmail called with token:', verificationToken)

      // ✅ Validation
      const validation = validateToken(verificationToken)
      if (!validation.isValid) {
        console.error('🔍 Invalid token:', validation.error)
        if (isMounted.current) {
          setVerificationStatus('error')
          setMessage(validation.error!)
        }
        return
      }

      try {
        if (isMounted.current) {
          setIsVerifying(true)
          setVerificationStatus('pending')
        }

        console.log('🔍 Making API call to verify email...')

        const response = await authService.verifyEmail({
          token: verificationToken,
        })

        console.log('🔍 Verification successful:', response)

        if (isMounted.current) {
          setVerificationStatus('success')
          setMessage(response.message || 'Email đã được xác nhận thành công!')

          // Redirect to login after 3 seconds
          setTimeout(() => {
            if (isMounted.current) {
              navigate({ to: '/auth/login' })
            }
          }, 3000)
        }
      } catch (error) {
        console.error('🔍 Verification failed:', error)

        if (!isMounted.current) return

        setVerificationStatus('error')

        // ✅ Improved error handling
        let errorMessage = 'Xác nhận email thất bại'

        if (error instanceof Error) {
          const errorText = error.message.toLowerCase()
          console.log('🔍 Error message:', errorText)

          if (
            errorText.includes('token_invalid') ||
            errorText.includes('invalid token')
          ) {
            errorMessage =
              'Token xác thực không hợp lệ. Vui lòng kiểm tra lại link hoặc yêu cầu gửi lại email.'
          } else if (
            errorText.includes('token_expired') ||
            errorText.includes('expired')
          ) {
            errorMessage =
              'Token xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.'
          } else if (
            errorText.includes('400') ||
            errorText.includes('bad request')
          ) {
            errorMessage =
              'Yêu cầu không hợp lệ. Token có thể đã được sử dụng hoặc không tồn tại.'
          } else if (
            errorText.includes('404') ||
            errorText.includes('not found')
          ) {
            errorMessage = 'Token không tồn tại hoặc đã được sử dụng.'
          } else if (
            errorText.includes('500') ||
            errorText.includes('internal server error')
          ) {
            errorMessage = 'Lỗi server. Vui lòng thử lại sau.'
          } else if (
            errorText.includes('already verified') ||
            errorText.includes('already used')
          ) {
            errorMessage =
              'Email này đã được xác thực trước đó. Bạn có thể đăng nhập ngay.'
            setTimeout(() => {
              if (isMounted.current) {
                navigate({ to: '/auth/login' })
              }
            }, 3000)
          } else {
            errorMessage = error.message
          }
        }

        setMessage(errorMessage)
      } finally {
        if (isMounted.current) {
          setIsVerifying(false)
        }
      }
    },
    [navigate] // ✅ Chỉ navigate trong deps
  )

  // ✅ Auto verify - logic được cải thiện
  useEffect(() => {
    console.log('🔍 Auto verify useEffect:', {
      mode,
      token: token ? `${token.substring(0, 10)}...` : 'null',
      hasVerified: hasVerified.current,
      isVerifying,
    })

    // ✅ Kiểm tra điều kiện chặt chẽ hơn
    if (
      mode === 'verify' &&
      token &&
      !hasVerified.current &&
      !isVerifying &&
      isMounted.current
    ) {
      console.log('🔍 Starting verification process...')
      hasVerified.current = true
      handleVerifyEmail(token)
    }
  }, [mode, token]) // ✅ Bỏ handleVerifyEmail và isVerifying khỏi deps

  const handleResendEmail = async () => {
    if (!email) return

    try {
      setIsResending(true)
      const response = await authService.resendVerification({ email })
      if (isMounted.current) {
        setMessage(response.message || 'Email xác nhận đã được gửi lại!')
        setResendCooldown(60)
      }
    } catch (error) {
      if (isMounted.current) {
        setMessage(
          error instanceof Error ? error.message : 'Gửi lại email thất bại'
        )
      }
    } finally {
      if (isMounted.current) {
        setIsResending(false)
      }
    }
  }

  const handleRetry = useCallback(() => {
    if (token && isMounted.current) {
      console.log('🔍 Retrying verification...')
      hasVerified.current = false // ✅ Reset flag để retry
      setVerificationStatus('pending')
      setMessage('')
      setIsVerifying(false)

      // ✅ Trigger lại verification
      setTimeout(() => {
        if (isMounted.current) {
          hasVerified.current = true
          handleVerifyEmail(token)
        }
      }, 100)
    }
  }, [token, handleVerifyEmail])

  // Rest of your JSX remains the same...
  if (mode === 'verify') {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <Link
              to='/'
              className='absolute top-4 left-4 flex items-center space-x-2 transition-opacity hover:opacity-80'
            >
              <Home className='text-primary h-5 w-5' />
              <span className='text-muted-foreground text-sm'>Trang chủ</span>
            </Link>

            {verificationStatus === 'pending' && (
              <>
                <RefreshCw
                  className={`mx-auto h-12 w-12 text-blue-500 ${isVerifying ? 'animate-spin' : ''}`}
                />
                <CardTitle>Đang xác nhận email...</CardTitle>
                <CardDescription>Vui lòng chờ trong giây lát</CardDescription>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <CheckCircle className='mx-auto h-12 w-12 text-green-500' />
                <CardTitle className='text-green-600'>
                  Xác nhận thành công!
                </CardTitle>
                <CardDescription>
                  Email của bạn đã được xác nhận. Đang chuyển hướng đến trang
                  đăng nhập...
                </CardDescription>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <Mail className='mx-auto h-12 w-12 text-red-500' />
                <CardTitle className='text-red-600'>
                  Xác nhận thất bại
                </CardTitle>
                <CardDescription>
                  Có lỗi xảy ra khi xác nhận email
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className='space-y-4 text-center'>
            {/* ✅ Debug info - chỉ hiển thị trong development */}
            {process.env.NODE_ENV === 'development' && (
              <div className='rounded bg-gray-100 p-2 text-xs text-gray-500'>
                <p>Debug Info:</p>
                <p>Token: {token ? `${token.substring(0, 20)}...` : 'null'}</p>
                <p>Token Length: {token ? token.length : 0}</p>
                <p>Mode: {mode}</p>
                <p>Status: {verificationStatus}</p>
                <p>Has Verified: {hasVerified.current ? 'true' : 'false'}</p>
                <p>Is Verifying: {isVerifying ? 'true' : 'false'}</p>
              </div>
            )}

            {message && (
              <Alert
                className={
                  verificationStatus === 'error'
                    ? 'border-red-200'
                    : 'border-green-200'
                }
              >
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {verificationStatus === 'error' && (
              <div className='space-y-2'>
                <Button
                  onClick={handleRetry}
                  className='w-full'
                  disabled={isVerifying}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`}
                  />
                  Thử lại
                </Button>
                <Button
                  onClick={() => navigate({ to: '/auth/register' })}
                  variant='outline'
                  className='w-full'
                >
                  Quay lại đăng ký
                </Button>
                <Button
                  onClick={() => navigate({ to: '/auth/login' })}
                  className='w-full'
                >
                  Đến trang đăng nhập
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default pending mode - JSX không thay đổi...
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <Link
            to='/'
            className='absolute top-4 left-4 flex items-center space-x-2 transition-opacity hover:opacity-80'
          >
            <Home className='text-primary h-5 w-5' />
            <span className='text-muted-foreground text-sm'>Trang chủ</span>
          </Link>

          <Mail className='mx-auto h-12 w-12 text-blue-500' />
          <CardTitle>Kiểm tra email của bạn</CardTitle>
          <CardDescription>
            Chúng tôi đã gửi link xác nhận đến email của bạn
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='space-y-2 text-center'>
            <p className='text-muted-foreground text-sm'>Email được gửi đến:</p>
            <p className='font-medium text-blue-600'>{email}</p>
          </div>

          <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-950'>
            <p className='text-sm text-blue-800 dark:text-blue-200'>
              📧 Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để tìm email
              xác nhận từ chúng tôi.
            </p>
          </div>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-3'>
            <Button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              variant='outline'
              className='w-full'
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

            <Button
              onClick={() => navigate({ to: '/auth/login' })}
              className='w-full'
            >
              Đến trang đăng nhập
            </Button>
          </div>

          <div className='text-muted-foreground text-center text-sm'>
            <p>Không nhận được email?</p>
            <p>Kiểm tra thư mục spam hoặc thử lại với email khác</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
