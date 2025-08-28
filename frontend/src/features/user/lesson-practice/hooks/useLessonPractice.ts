import { useState, useCallback } from 'react'
import { geminiApi } from '@/api/gemini'
import { historyApi, HistoryResponse, ParsedHistoryResult } from '@/api/history'
import { lessonApi } from '@/api/lesson'
import { VocabularyItem } from '@/api/suggestVocabulary'
import { GeminiValidationResult } from '@/components/gemini-validation-result'

interface LessonData {
  id: number
  name: string
  description: string
  paragraph: string
  suggestVocabularies?: VocabularyItem[]
}

export interface ValidationResult {
  score: number
  status: 'perfect' | 'good' | 'needs_improvement'
  message?: string
  comment?: string
  improvement_suggestions?: string
  correct_answer?: string
  // New fields to support suggestion-like UI rendering
  suggestion_markdown?: string
  improvements?: string[]
  suggestion_html?: string
  rich_html?: string
}

export function useLessonPractice(lessonId: number, username: string) {
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [sentences, setSentences] = useState<string[]>([])
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null)
  const [isLoadingLesson, setIsLoadingLesson] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showParagraph, setShowParagraph] = useState(true)
  const [paragraphPosition, setParagraphPosition] = useState<'left' | 'right'>(
    'right'
  )
  const [suggestedVocabulary, setSuggestedVocabulary] = useState<
    VocabularyItem[]
  >([])
  const [isLoadingVocabulary, setIsLoadingVocabulary] = useState(false)
  const [showVocabulary, setShowVocabulary] = useState(false)
  const [lessonHistory, setLessonHistory] = useState<HistoryResponse[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const splitIntoSentences = (paragraph: string): string[] => {
    return paragraph
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0)
  }

  const fetchLesson = useCallback(async () => {
    setIsLoadingLesson(true)
    setError(null)

    try {
      const response = await lessonApi.getLessonById(lessonId)
      setLesson(response.data)

      setSuggestedVocabulary(response.data.suggestVocabularies || [])

      const sentenceList = splitIntoSentences(response.data.paragraph)
      setSentences(sentenceList)
      setCurrentSentenceIndex(0)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải bài học')
    } finally {
      setIsLoadingLesson(false)
    }
  }, [lessonId])

  const submitAnswer = useCallback(async () => {
    if (!userAnswer.trim() || currentSentenceIndex >= sentences.length) return

    setIsValidating(true)
    setError(null)

    const parseResult = (result: string): ValidationResult | null => {
      try {
        const cleaned = result.replace(/```json\n?|\n?```/g, '').trim()
        return JSON.parse(cleaned) as ValidationResult
      } catch {
        return null
      }
    }

    try {
      const response = await geminiApi.askGemini(username, lessonId, {
        question: sentences[currentSentenceIndex],
        answer: userAnswer.trim(),
      })

      const history = response.data.data // CustomResponse<HistoryResponse>
      const parsed = parseResult(history.result)
      if (parsed) {
        setValidationResult(parsed)
      } else {
        setValidationResult(null)
        setError('Phản hồi không hợp lệ từ máy chấm')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra câu trả lời'
      )
    } finally {
      setIsValidating(false)
    }
  }, [userAnswer, currentSentenceIndex, sentences, username, lessonId])

  const nextSentence = useCallback(() => {
    setValidationResult(null)
    setUserAnswer('')
    setCurrentSentenceIndex((prev) => prev + 1)
  }, [])

  const previousSentence = useCallback(() => {
    if (currentSentenceIndex > 0) {
      setValidationResult(null)
      setUserAnswer('')
      setCurrentSentenceIndex((prev) => prev - 1)
    }
  }, [currentSentenceIndex])

  const toggleParagraph = useCallback(() => {
    setShowParagraph((prev) => !prev)
  }, [])

  const toggleParagraphPosition = useCallback(() => {
    setParagraphPosition((prev) => (prev === 'left' ? 'right' : 'left'))
  }, [])

  const isCompleted = currentSentenceIndex >= sentences.length

  const fetchSuggestedVocabulary = useCallback(async () => {
    setIsLoadingVocabulary(true)
    setError(null)

    try {
      const list = lesson?.suggestVocabularies || []
      setSuggestedVocabulary(list)
      setShowVocabulary(true)
    } catch (err: any) {
      setError('Không thể tải từ vựng gợi ý')
      setSuggestedVocabulary([])
      setShowVocabulary(true)
    } finally {
      setIsLoadingVocabulary(false)
    }
  }, [lesson])

  const toggleVocabulary = useCallback(() => {
    setShowVocabulary((prev) => !prev)
  }, [])

  const fetchLessonHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    setError(null)

    try {
      const response = await historyApi.getHistoryByUserAndLesson(
        username,
        lessonId
      )
      setLessonHistory(response.data.content)
      setShowHistory(true)
    } catch (err: any) {
      setError('Không thể tải lịch sử bài học')
      setLessonHistory([])
      setShowHistory(true)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [username, lessonId])

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev)
  }, [])

  return {
    lesson,
    sentences,
    currentSentenceIndex,
    userAnswer,
    setUserAnswer,
    validationResult,
    setValidationResult,
    isLoadingLesson,
    isValidating,
    error,
    fetchLesson,
    submitAnswer,
    nextSentence,
    previousSentence,
    isCompleted,
    showParagraph,
    paragraphPosition,
    toggleParagraph,
    toggleParagraphPosition,
    suggestedVocabulary,
    isLoadingVocabulary,
    showVocabulary,
    fetchSuggestedVocabulary,
    toggleVocabulary,
    lessonHistory,
    isLoadingHistory,
    showHistory,
    fetchLessonHistory,
    toggleHistory,
  }
}
