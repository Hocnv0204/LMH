// API Configuration
const isDevelopment = import.meta.env.DEV

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: 10000, // 10 seconds timeout
} as const

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_EMAIL: '/api/auth/verify',
    RESEND_VERIFICATION: '/api/auth/resend-register',
    RESET_PASSWORD: '/api/auth/reset-password',
    RESEND_RESET_PASSWORD: '/api/auth/resend-reset-password',
  },
} as const

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`
}
