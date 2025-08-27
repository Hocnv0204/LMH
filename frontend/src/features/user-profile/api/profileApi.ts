import { CustomResponse, PageResponse } from '@/types/common.ts'
import { fetchApi } from '@/api/api.ts'
import { authService } from '@/api/auth.ts'
import type {
  UserProfileResponse,
  UpdateProfileRequest,
  UpdateApiConfigRequest,
  UserHistoryResponse,
} from '@/features/user-profile/types/user-profile'

const getAuthHeadersAndUserId = async () => {
  // Bước 1: Gọi và chờ hàm getCurrentUser xử lý xong (bao gồm cả refresh token nếu cần)
  const currentUser = await authService.getCurrentUser()

  // Bước 2: Kiểm tra kết quả sau khi đã có
  if (!currentUser || !currentUser.id) {
    // Lỗi này có thể xảy ra nếu token ban đầu hết hạn và refresh cũng thất bại
    throw new Error('Người dùng chưa đăng nhập hoặc phiên đã hết hạn.')
  }

  // Bước 3: Lấy accessToken MỚI NHẤT từ localStorage sau khi có thể đã được refresh
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    // Trường hợp này hiếm khi xảy ra nếu currentUser tồn tại, nhưng vẫn nên kiểm tra
    throw new Error('Không tìm thấy accessToken sau khi xác thực.')
  }

  const headers = new Headers()
  headers.set('Authorization', `Bearer ${accessToken}`)

  // Ép kiểu ID từ string sang integer (số nguyên)
  const userIdAsInt = parseInt(currentUser.id, 10)

  if (isNaN(userIdAsInt)) {
    throw new Error('ID người dùng trong token không hợp lệ.')
  }

  // Trả về userId đã được ép kiểu thành số nguyên
  return { userId: userIdAsInt, headers }
}

export const userProfileApi = {
  /**
   * Lấy thông tin profile của người dùng hiện tại.
   */
  getUserProfile: async (): Promise<CustomResponse<UserProfileResponse>> => {
    const { userId, headers } = await getAuthHeadersAndUserId()
    return fetchApi(`/user/profile/${userId}`, { headers })
  },

  /**
   * Cập nhật thông tin profile của người dùng hiện tại.
   */
  updateUserProfile: async (
    request: UpdateProfileRequest
  ): Promise<CustomResponse<string>> => {
    const { userId, headers } = await getAuthHeadersAndUserId()
    return fetchApi(`/user/profile/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(request),
    })
  },

  /**
   * Cập nhật cấu hình API của người dùng hiện tại.
   */
  updateUserApiConfig: async (
    request: UpdateApiConfigRequest
  ): Promise<CustomResponse<string>> => {
    const { userId, headers } = await getAuthHeadersAndUserId()
    return fetchApi(`/user/profile/${userId}/api-config`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(request),
    })
  },

  /**
   * Lấy lịch sử luyện tập của người dùng hiện tại.
   */
  getUserHistory: async (
    page: number,
    size: number
  ): Promise<CustomResponse<PageResponse<UserHistoryResponse>>> => {
    const { userId, headers } = await getAuthHeadersAndUserId()
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('size', size.toString())
    params.append('sort', 'createdAt,DESC')

    return fetchApi(`/user/profile/${userId}/history?${params.toString()}`, {
      headers,
    })
  },
}
