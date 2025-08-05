import { TypeTopic } from './index'

export interface CreateTopicRequest {
  name: string
  description: string
  languageId: number
  type: TypeTopic
  note?: string
  image?: File
}

export interface UpdateTopicRequest {
  id: number
  data: {
    name: string
    description: string
    languageId: number
    type: TypeTopic
    note?: string
    image?: File
  }
}
