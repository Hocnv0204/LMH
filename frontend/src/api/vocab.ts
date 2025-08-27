import { api, apiClient, type ApiResponse } from '@/api/client'

// Custom error class for word validation
export class WordValidationError extends Error {
  constructor(message: string = 'Từ vựng không hợp lệ') {
    super(message)
    this.name = 'WordValidationError'
  }
}

export interface CreateVocabularyRequest {
  term: string
  vi: string
  collectionId?: number
  userId?: number
  forceAdd?: boolean
  // Đã loại bỏ: type, example, pronunciation
}

export interface UpdateVocabularyRequest {
  type?: string
  vi?: string
  example?: string
  collectionId?: number
  imageUrl?: string
}

export interface VocabularyDTO {
  id: number
  term: string
  vi: string
  type?: string
  example?: string
  pronunciation?: string
  audioUrl?: string
  collectionId?: number
  imageUrl?: string
  createdAt?: string
  // Optional backend extras if present
  collectionName?: string
}

export interface VocabularyListResponse {
  content: VocabularyDTO[]
  totalElements: number
  totalPages: number
  size: number
  number: number // Spring Boot page number (0-based)
  first: boolean
  last: boolean
  // Các fields khác của Spring Boot Page nếu cần
  empty?: boolean
  numberOfElements?: number
  pageable?: {
    sort: unknown
    pageNumber: number
    pageSize: number
    offset: number
    paged: boolean
    unpaged: boolean
  }
  sort?: unknown
}

const BASE_PATH = '/api/vocab'

export const vocabApi = {
  // Method tương ứng với controller @GetMapping("/{userId}")
  async listByUserId(
    userId: number,
    size: number = 10, // Default size = 5
    page: number = 0, // Default page = 1
    sortBy: string = 'id' // Chỉ field name, không có direction
  ): Promise<VocabularyListResponse> {
    try {
      // Tạo URL với thứ tự parameters: page, size, sortBy

      // Backend trả về direct Page object, không wrap trong ApiResponse
      const { data } = await api.get<VocabularyListResponse>(
        `${BASE_PATH}/${userId}?page=${page}&size=${size}&sortBy=${sortBy}`
      )


      // Backend trả về Spring Boot Page structure trực tiếp
      return data
    } catch (error: unknown) {
      console.error('List vocabulary by user ID error:', error)

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { status: number; data: unknown }
        }
        if (axiosError.response?.status === 500) {
          console.error('Server error details:', axiosError.response.data)
          throw new Error('Lỗi server. Vui lòng kiểm tra backend logs.')
        } else if (axiosError.response?.status === 404) {
          throw new Error('Không tìm thấy dữ liệu người dùng.')
        } else if (axiosError.response?.status === 403) {
          throw new Error('Không có quyền truy cập.')
        }
      }

      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Không thể tải danh sách từ vựng.'
      throw new Error(errorMessage)
    }
  },

  // Method cũ cho backward compatibility - SỬA LẠI
  async list(userId?: number): Promise<VocabularyDTO[]> {
    try {
      if (userId) {
        // Nếu có userId, dùng listByUserId và extract content
        const pageResponse = await this.listByUserId(userId, 100, 0, 'id') // Get large page
        return pageResponse.content
      } else {
        // Fallback: thử get all vocabularies (nếu backend hỗ trợ)
        const { data } = await api.get<VocabularyDTO[]>(`${BASE_PATH}/all`)
        return data
      }
    } catch (error) {
      console.error('List vocabulary error:', error)
      throw error
    }
  },

  async create(
    data: CreateVocabularyRequest,
    image?: File | null
  ): Promise<VocabularyDTO> {
    try {
      const formData = new FormData()

      // Chỉ gửi các field cần thiết
      const vocabularyData = {
        term: data.term,
        vi: data.vi,
        ...(data.collectionId && { collectionId: data.collectionId }),
        ...(data.userId && { userId: data.userId }),
        ...(data.forceAdd !== undefined && { forceAdd: data.forceAdd }),
      }

      console.log('Creating vocabulary with data:', vocabularyData)

      // Backend expect part name là 'vocab'
      formData.append('vocab', JSON.stringify(vocabularyData))

      if (image) {
        formData.append('image', image)
      }

      const { data: response } = await api.post<unknown>(BASE_PATH, formData, {
        // Using unknown for flexible response handling
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Kiểm tra nhiều format response khác nhau
      if (response && typeof response === 'object') {
        // Format 1: ApiResponse wrapper
        if ('success' in response) {
          const apiResponse = response as {
            success: boolean
            error?: { message?: string; details?: string }
            data?: VocabularyDTO
          }
          if (!apiResponse.success) {
            const errorMsg =
              apiResponse.error?.message ||
              apiResponse.error?.details ||
              'Failed to create vocabulary'
            throw new Error(errorMsg)
          }
          return apiResponse.data!
        }

        // Format 2: Direct VocabularyDTO
        else if ('id' in response && 'term' in response) {
          console.log(
            'Successfully created vocabulary (Direct format):',
            response
          )
          return response as VocabularyDTO
        }

        // Format 3: Wrapped in data field
        else if ('data' in response) {
          const wrappedResponse = response as { data: VocabularyDTO }
          if (
            wrappedResponse.data &&
            typeof wrappedResponse.data === 'object' &&
            'id' in wrappedResponse.data
          ) {
            console.log(
              'Successfully created vocabulary (Data wrapped):',
              wrappedResponse.data
            )
            return wrappedResponse.data
          }
        }

        // Format không xác định
        console.error('Unknown response format:', response)
        throw new Error('Response format không được hỗ trợ')
      }

      throw new Error('Invalid response from server')
    } catch (error: unknown) {
      console.error('Create vocabulary API error:', error)

      // Type guard for axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: {
            status: number
            data: {
              error?: { message?: string; code?: string }
              message?: string
            }
          }
        }

        // Log full error details
        console.error('Error response status:', axiosError.response.status)
        console.error('Error response data:', axiosError.response.data)

        // Nếu backend đã tạo thành công (status 200/201) nhưng có lỗi parse
        if (
          axiosError.response.status === 200 ||
          axiosError.response.status === 201
        ) {
          console.warn(
            'Backend created successfully but frontend failed to parse response'
          )
          throw new Error(
            'Tạo từ vựng thành công nhưng có lỗi hiển thị. Vui lòng refresh trang.'
          )
        }

        if (axiosError.response.status === 500) {
          throw new Error('Lỗi server. Vui lòng kiểm tra backend logs.')
        } else if (axiosError.response.status === 400) {
          const errorData = axiosError.response.data
          console.log('400 Error Data:', errorData) // Debug log

          const errorMsg =
            errorData?.error?.message ||
            errorData?.message ||
            'Dữ liệu không hợp lệ'

          console.log('Error Code:', errorData?.error?.code) // Debug log
          console.log('Error Message:', errorMsg) // Debug log

          // Check if this is a word validation error (WORD_INVALID)
          if (
            errorData?.error?.code === 'WORD_INVALID' ||
            errorMsg.includes('WORD_INVALID') ||
            errorMsg.includes('word is invalid') ||
            errorMsg.includes('Word is invalid') ||
            errorMsg.includes('từ không hợp lệ') ||
            errorMsg.includes('không tìm thấy trong từ điển') ||
            // Based on your backend error message
            errorMsg.toLowerCase().includes('invalid')
          ) {
            console.log('Throwing WordValidationError') // Debug log
            throw new WordValidationError(errorMsg)
          }

          throw new Error(errorMsg)
        } else if (axiosError.response.status === 404) {
          throw new Error('API endpoint không tìm thấy.')
        }
      }

      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Không thể tạo từ vựng.'
      throw new Error(errorMessage)
    }
  },

  async update(
    id: number,
    payload: UpdateVocabularyRequest,
    imageFile?: File | null
  ): Promise<VocabularyDTO> {
    try {
      console.log('API update called with imageFile:', imageFile)
      console.log('API update called with payload:', payload)

      // Luôn sử dụng FormData để phù hợp với backend @RequestPart
      const formData = new FormData()
      formData.append('vocab', JSON.stringify(payload))

      if (imageFile) {
        console.log('Adding image file to FormData')
        formData.append('image', imageFile)
      } else {
        console.log('No image file, sending FormData without image')
        // Không append image field khi không có ảnh mới
        // Backend sẽ xử lý trường hợp này
      }

      const response = await apiClient.put<ApiResponse<VocabularyDTO>>(
        `${BASE_PATH}/${id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      if (!response.data.success) {
        throw new Error(
          response.data.error?.message || 'Cập nhật từ vựng thất bại'
        )
      }

      return response.data.data
    } catch (error) {
      console.error('Update vocabulary error:', error)
      throw error
    }
  },

  async remove(id: number): Promise<string> {
    try {
      const { data } = await api.delete<string>(`${BASE_PATH}/${id}`)
      return data
    } catch (error) {
      console.error('Delete vocabulary error:', error)
      throw error
    }
  },

  // Lấy vocab theo collection ID
  async getByCollectionId(collectionId: number): Promise<VocabularyDTO[]> {
    try {
      const { data } = await api.get<VocabularyDTO[]>(
        `${BASE_PATH}/collection/${collectionId}`
      )
      return data
    } catch (error) {
      console.error('Get vocabulary by collection error:', error)
      throw new Error('Không thể tải từ vựng của collection này.')
    }
  },
}
