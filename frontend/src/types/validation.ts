export interface ValidationResult {
  score: number
  status: 'perfect' | 'good' | 'needs_improvement'
  message?: string
  comment?: string
  improvement_suggestions?: string
  correct_answer?: string
  suggestion_markdown?: string
  improvements?: string[]
  suggestion_html?: string
  rich_html?: string
}