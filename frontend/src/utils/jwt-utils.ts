export interface JwtPayload {
  sub: string // username (subject)
  iss: string // issuer (LMH)
  iat: number // issued at
  exp: number // expiration
  jti: string // JWT ID (UUID)
  scope: string // role
  id?: number // userId (chỉ có trong accessToken)
  fullName?: string // full name (chỉ có trong accessToken)
  email?: string // email (chỉ có trong accessToken)
  [key: string]: any
}

/**
 * Decode JWT token và trả về payload
 * @param token JWT token string
 * @returns JWT payload hoặc null nếu invalid
 */
export const decodeJwtToken = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return null
  }
}

/**
 * Lấy userId từ JWT access token
 * @param token JWT access token string
 * @returns userId hoặc null nếu không thể decode
 */
export const getUserIdFromToken = (token: string): number | null => {
  const payload = decodeJwtToken(token)
  return payload?.id || null
}

/**
 * Lấy username từ JWT token
 * @param token JWT token string
 * @returns username hoặc null nếu không thể decode
 */
export const getUsernameFromToken = (token: string): string | null => {
  const payload = decodeJwtToken(token)
  return payload?.sub || null
}

/**
 * Lấy role từ JWT token
 * @param token JWT token string
 * @returns role hoặc null nếu không thể decode
 */
export const getRoleFromToken = (token: string): string | null => {
  const payload = decodeJwtToken(token)
  return payload?.scope || null
}

/**
 * Kiểm tra token có expired chưa
 * @param token JWT token string
 * @returns true nếu expired, false nếu còn hiệu lực
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtToken(token)
  if (!payload) return true

  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

/**
 * Kiểm tra token có expired chưa (với buffer time)
 * @param token JWT token string
 * @param bufferMinutes Số phút buffer trước khi hết hạn
 * @returns true nếu expired hoặc sắp hết hạn, false nếu còn lâu
 */
export const isTokenExpiredWithBuffer = (
  token: string,
  bufferMinutes: number = 2
): boolean => {
  const payload = decodeJwtToken(token)
  if (!payload) return true

  const now = Math.floor(Date.now() / 1000)
  const bufferSeconds = bufferMinutes * 60
  return payload.exp < now + bufferSeconds
}

/**
 * Kiểm tra token sắp hết hạn (trong vòng buffer time)
 * @param token JWT token string
 * @param bufferMinutes Số phút buffer trước khi hết hạn
 * @returns true nếu sắp hết hạn, false nếu còn lâu
 */
export const isTokenExpiringSoon = (
  token: string,
  bufferMinutes: number = 5
): boolean => {
  const payload = decodeJwtToken(token)
  if (!payload) return true

  const now = Math.floor(Date.now() / 1000)
  const bufferSeconds = bufferMinutes * 60
  return payload.exp < now + bufferSeconds
}
