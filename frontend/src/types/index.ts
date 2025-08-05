// Export common types used across the application
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Language {
  id: number
  name: string
}

export type TypeTopic = "DEFAULT" | "USER_CREATION";

export interface Topic {
  id: number
  name: string
  description: string
  language: Language
  type: TypeTopic
  note?: string
  imageUrl?: string
}

