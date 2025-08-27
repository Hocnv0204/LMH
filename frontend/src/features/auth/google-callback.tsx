import { useEffect } from 'react'

export default function GoogleCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Lấy tokens từ URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('accessToken')
        const refreshToken = urlParams.get('refreshToken')
        const authenticated = urlParams.get('authenticated')

        if (accessToken && refreshToken) {
          // Nếu đây là popup window, gửi message về parent window
          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'GOOGLE_AUTH_SUCCESS',
                data: {
                  accessToken,
                  refreshToken,
                  authenticated: authenticated === 'true',
                },
              },
              window.location.origin
            )

            window.close()
          } else {
            // Nếu không phải popup, lưu tokens và redirect trực tiếp về trang chủ
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('authenticated', authenticated || 'true')

            window.location.href = '/'
          }
        } else {
          throw new Error('No tokens found in URL')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)

        // Nếu đây là popup window, gửi error về parent
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'GOOGLE_AUTH_ERROR',
              data: { message: 'Đăng nhập thất bại' },
            },
            window.location.origin
          )

          window.close()
        } else {
          // Nếu không phải popup, redirect về login page
          window.location.href = '/auth/login?error=oauth_failed'
        }
      }
    }

    handleCallback()
  }, [])

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
        <p className='mt-4 text-gray-600'>Đang xử lý đăng nhập...</p>
      </div>
    </div>
  )
}
