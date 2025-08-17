import { api } from '@/api/client'

export interface CollectionDTO {
  id: number
  collectionName: string // Thay vì name
  vocabularyDTOList: VocabularyDTO[] // Thay vì vocabCount
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
  collectionName?: string
}

export interface CreateCollectionRequest {
  userId: number
  collectionName: string
}

export interface UpdateCollectionRequest {
  collectionName: string
}

export interface PageResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      empty: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: {
    sorted: boolean
    empty: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

const BASE_PATH = '/api/collection'

export const collectionApi = {
  async list(userId: number): Promise<PageResponse<CollectionDTO>> {
    const { data } = await api.get<PageResponse<CollectionDTO>>(
      `${BASE_PATH}/user/${userId}`
    )
    return data
  },

  async getById(id: number): Promise<CollectionDTO> {
    const { data } = await api.get<CollectionDTO>(`${BASE_PATH}/${id}`)
    return data
  },

  async create(payload: CreateCollectionRequest): Promise<CollectionDTO> {
    const { data } = await api.post<CollectionDTO>(`${BASE_PATH}`, payload)
    return data
  },

  async update(
    id: number,
    payload: UpdateCollectionRequest
  ): Promise<CollectionDTO> {
    const { data } = await api.put<CollectionDTO>(`${BASE_PATH}/${id}`, payload)
    return data
  },

  async remove(id: number): Promise<string> {
    const { data } = await api.delete<string>(`${BASE_PATH}/${id}`)
    return data
  },

  async exists(id: number): Promise<boolean> {
    const { data } = await api.get<boolean>(`${BASE_PATH}/${id}/exists`)
    return data
  },
}
