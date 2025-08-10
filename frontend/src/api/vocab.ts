import axios from 'axios'
import { api, apiClient, type ApiResponse } from '@/api/client'

export interface CreateVocabularyRequest {
  term: string
  vi: string
  collectionId?: number
  userId?: number
  // Đã loại bỏ: type, example, pronunciation
}

export interface UpdateVocabularyRequest {
  type?: string
  vi?: string
  example?: string
  collectionId?: number
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
    sort: any
    pageNumber: number
    pageSize: number
    offset: number
    paged: boolean
    unpaged: boolean
  }
  sort?: any
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
      console.log(
        `Calling API: ${BASE_PATH}/${userId}?page=${page}&size=${size}&sortBy=${sortBy}`
      )

      // Backend trả về direct Page object, không wrap trong ApiResponse
      const { data } = await api.get<VocabularyListResponse>(
        `${BASE_PATH}/${userId}?page=${page}&size=${size}&sortBy=${sortBy}`
      )

      console.log('API Response:', data)

      // Backend trả về Spring Boot Page structure trực tiếp
      return data
    } catch (error: any) {
      console.error('List vocabulary by user ID error:', error)

      if (error.response?.status === 500) {
        console.error('Server error details:', error.response.data)
        throw new Error('Lỗi server. Vui lòng kiểm tra backend logs.')
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy dữ liệu người dùng.')
      } else if (error.response?.status === 403) {
        throw new Error('Không có quyền truy cập.')
      } else {
        throw new Error(error.message || 'Không thể tải danh sách từ vựng.')
      }
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
      }

      console.log('Creating vocabulary with data:', vocabularyData)

      // Backend expect part name là 'vocab'
      formData.append('vocab', JSON.stringify(vocabularyData))

      if (image) {
        formData.append('image', image)
      }

      const { data: response } = await api.post<any>(BASE_PATH, formData, {
        // Tạm thời dùng any để debug
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Create vocabulary raw response:', response)
      console.log('Response type:', typeof response)
      console.log('Response keys:', Object.keys(response || {}))

      // Kiểm tra nhiều format response khác nhau
      if (response && typeof response === 'object') {
        // Format 1: ApiResponse wrapper
        if (response.success !== undefined) {
          if (!response.success) {
            const errorMsg =
              response.error?.message ||
              response.error?.details ||
              'Failed to create vocabulary'
            throw new Error(errorMsg)
          }
          console.log(
            'Successfully created vocabulary (ApiResponse format):',
            response.data
          )
          return response.data
        }

        // Format 2: Direct VocabularyDTO
        else if (response.id && response.term) {
          console.log(
            'Successfully created vocabulary (Direct format):',
            response
          )
          return response as VocabularyDTO
        }

        // Format 3: Wrapped in data field
        else if (response.data && response.data.id) {
          console.log(
            'Successfully created vocabulary (Data wrapped):',
            response.data
          )
          return response.data
        }

        // Format không xác định
        else {
          console.error('Unknown response format:', response)
          throw new Error('Response format không được hỗ trợ')
        }
      }

      throw new Error('Invalid response from server')
    } catch (error: any) {
      console.error('Create vocabulary API error:', error)

      // Log full error details
      if (error.response) {
        console.error('Error response status:', error.response.status)
        console.error('Error response data:', error.response.data)
        console.error('Error response headers:', error.response.headers)
      }

      // Nếu backend đã tạo thành công (status 200/201) nhưng có lỗi parse
      if (error.response?.status === 200 || error.response?.status === 201) {
        console.warn(
          'Backend created successfully but frontend failed to parse response'
        )
        // Có thể refresh danh sách thay vì throw error
        throw new Error(
          'Tạo từ vựng thành công nhưng có lỗi hiển thị. Vui lòng refresh trang.'
        )
      }

      if (error.response?.status === 500) {
        throw new Error('Lỗi server. Vui lòng kiểm tra backend logs.')
      } else if (error.response?.status === 400) {
        const errorData = error.response.data
        const errorMsg =
          errorData?.error?.message ||
          errorData?.message ||
          'Dữ liệu không hợp lệ'
        throw new Error(errorMsg)
      } else if (error.response?.status === 404) {
        throw new Error('API endpoint không tìm thấy.')
      } else {
        throw new Error(error.message || 'Không thể tạo từ vựng.')
      }
    }
  },

  async update(
    id: number,
    payload: UpdateVocabularyRequest,
    imageFile?: File | null
  ): Promise<VocabularyDTO> {
    try {
      if (imageFile) {
        // Nếu có file image, dùng FormData
        const formData = new FormData()
        formData.append('vocab', JSON.stringify(payload))
        formData.append('image', imageFile)

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
      } else {
        // Nếu không có file, dùng JSON
        const { data } = await api.put<VocabularyDTO>(
          `${BASE_PATH}/${id}`,
          payload
        )
        return data
      }
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
}
