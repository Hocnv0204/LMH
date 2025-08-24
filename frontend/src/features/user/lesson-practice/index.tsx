import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  X,
  Clock,
  History,
} from 'lucide-react'
import { ParsedHistoryResult } from '@/api/history'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HistoryList } from '@/components/history/HistoryList'
import { useLessonPractice } from './hooks/useLessonPractice'

interface LessonPracticePageProps {
  lessonId: number
  username: string
  searchParams?: {
    levelId?: number
    levelName?: string
    languageName?: string
    topicId?: number
    topicName?: string
  }
}

export default function LessonPracticePage({
  lessonId,
  username,
  searchParams,
}: LessonPracticePageProps) {
  const navigate = useNavigate()
  const {
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
  } = useLessonPractice(lessonId, username)

  useEffect(() => {
    fetchLesson()
  }, [lessonId])

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return
    await submitAnswer()
  }

  const handleNext = () => {
    nextSentence()
  }

  const handlePrevious = () => {
    previousSentence()
  }

  const canProceed = true // Always allow proceeding
  const shouldShowRetry = validationResult && validationResult.score < 80
  const canGoBack = currentSentenceIndex > 0
  const isLastSentence = currentSentenceIndex >= sentences.length - 1
  const canGoNext = currentSentenceIndex < sentences.length - 1

  const currentSentence = sentences[currentSentenceIndex]
  const progress =
    sentences.length > 0
      ? ((currentSentenceIndex + 1) / sentences.length) * 100
      : 0

  // Render paragraph panel
  const ParagraphPanel = () => {
    const paragraphStyle = {
      color: '#1e293b',
      backgroundColor: 'transparent',
      fontSize: '0.875rem',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap' as const,
      fontWeight: '500',
    }

    return (
      <Card className='sticky top-4 h-fit'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg'>Đoạn văn gốc</CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={toggleParagraphPosition}
              title='Chuyển vị trí'
            >
              <RotateCcw className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='max-h-96 overflow-y-auto rounded-lg border bg-gray-100 p-4'>
            <p style={paragraphStyle}>{lesson?.paragraph}</p>
          </div>
          <div className='text-muted-foreground mt-3 text-xs'>
            Câu hiện tại: {currentSentenceIndex + 1}/{sentences.length}
          </div>
        </CardContent>
      </Card>
    )
  }

  const parseHistoryResult = (
    resultString: string
  ): ParsedHistoryResult | null => {
    try {
      const cleanedResult = resultString
        .replace(/```json\n?|\n?```/g, '')
        .trim()
      return JSON.parse(cleanedResult)
    } catch {
      return null
    }
  }

  // Format suggestion string with ~~strike~~ and **highlight** markup into styled HTML
  const formatSuggestion = (text: string) => {
    // Escape HTML first
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    const html = escaped
      .replace(/~~(.*?)~~/g, '<span class="line-through text-red-600">$1</span>')
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-green-700">$1</span>')
    return { __html: html }
  }

  // Sanitize limited HTML from model output: allow only whitelisted tags and safe style/class attributes
  const sanitizeHtml = (html: string) => {
    const allowed = new Set([
      'DIV',
      'P',
      'SPAN',
      'STRONG',
      'B',
      'EM',
      'I',
      'H4',
      'UL',
      'LI',
      'U',
      'S',
      'MARK',
    ])
    const allowedStyleProps = new Set([
      'color',
      'text-decoration',
      'font-weight',
      'font-style',
      'background-color',
    ])
    const container = document.createElement('div')
    container.innerHTML = html
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT)
    const removeNodes: Element[] = []
    let node = walker.nextNode() as Element | null
    while (node) {
      const currentEl: Element = node
      if (!allowed.has(currentEl.tagName)) {
        removeNodes.push(currentEl)
      } else {
        // allow only safe class and limited style attributes
        const classAttr = currentEl.getAttribute('class')
        if (currentEl.tagName === 'DIV' && classAttr === 'feedback') {
          currentEl.setAttribute('class', 'feedback')
        } else if (classAttr) {
          currentEl.removeAttribute('class')
        }

        const styleAttr = currentEl.getAttribute('style') || ''
        if (styleAttr) {
          const safeCss: string[] = []
          styleAttr
            .split(';')
            .map((d) => d.trim())
            .filter(Boolean)
            .forEach((declaration) => {
              const [propRaw, valueRaw] = declaration.split(':')
              if (!propRaw || !valueRaw) return
              const prop = propRaw.trim().toLowerCase()
              const value = valueRaw.trim()
              const safeValuePattern = /^[#a-zA-Z0-9(),.%\s-]+$/
              if (allowedStyleProps.has(prop) && safeValuePattern.test(value)) {
                safeCss.push(`${prop}: ${value}`)
              }
            })
          if (safeCss.length > 0) {
            currentEl.setAttribute('style', safeCss.join('; '))
          } else {
            currentEl.removeAttribute('style')
          }
        }

        // remove any other attributes
        Array.from(currentEl.attributes).forEach((attr) => {
          if (attr.name !== 'class' && attr.name !== 'style') {
            currentEl.removeAttribute(attr.name)
          }
        })
      }
      node = walker.nextNode() as Element | null
    }
    removeNodes.forEach((el) => el.replaceWith(...Array.from(el.childNodes)))
    return { __html: container.innerHTML }
  }

  const handleBackToLessons = () => {
    if (
      searchParams &&
      searchParams.levelId &&
      searchParams.levelName &&
      searchParams.languageName
    ) {
      navigate({
        to: '/user/lessons',
        search: {
          levelId: searchParams.levelId,
          levelName: searchParams.levelName,
          languageName: searchParams.languageName,
          ...(searchParams.topicId && { topicId: searchParams.topicId }),
          ...(searchParams.topicName && { topicName: searchParams.topicName }),
        },
      })
    } else {
      // Fallback to lessons page without search params
      navigate({
        to: '/user/lessons',
        search: {
          levelId: 1,
          levelName: '',
          languageName: '',
        },
      })
    }
  }

  if (isLoadingLesson) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='mr-3 h-8 w-8 animate-spin' />
        <span className='text-lg'>Đang tải bài học...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card className='mx-auto max-w-2xl'>
          <CardContent className='py-8 text-center'>
            <XCircle className='mx-auto mb-4 h-16 w-16 text-red-500' />
            <h3 className='mb-2 text-xl font-semibold'>Có lỗi xảy ra</h3>
            <p className='text-muted-foreground mb-4'>{error}</p>
            <Button onClick={handleBackToLessons}>
              Quay lại danh sách bài học
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card className='mx-auto max-w-2xl'>
          <CardContent className='py-8 text-center'>
            <CheckCircle className='mx-auto mb-4 h-16 w-16 text-green-500' />
            <h3 className='mb-2 text-xl font-semibold'>Chúc mừng!</h3>
            <p className='text-muted-foreground mb-4'>
              Bạn đã hoàn thành bài học "{lesson?.name}"
            </p>
            <Button onClick={handleBackToLessons}>
              Quay lại danh sách bài học
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mx-auto max-w-7xl'>
        {/* Breadcrumb Navigation */}
        <div className='mb-6 flex items-center gap-4'>
          <Button variant='ghost' size='sm' onClick={handleBackToLessons}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
          <div className='flex-1'>
            <h1 className='text-2xl font-bold'>{lesson?.name}</h1>
            <p className='text-muted-foreground'>{lesson?.description}</p>
          </div>
          <Button variant='outline' size='sm' onClick={toggleParagraph}>
            {showParagraph ? (
              <EyeOff className='mr-2 h-4 w-4' />
            ) : (
              <Eye className='mr-2 h-4 w-4' />
            )}
            {showParagraph ? 'Ẩn đoạn văn' : 'Hiện đoạn văn'}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={fetchSuggestedVocabulary}
            disabled={isLoadingVocabulary}
          >
            {isLoadingVocabulary ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <BookOpen className='mr-2 h-4 w-4' />
            )}
            Từ vựng gợi ý
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={fetchLessonHistory}
            disabled={isLoadingHistory}
          >
            {isLoadingHistory ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <History className='mr-2 h-4 w-4' />
            )}
            Lịch sử
          </Button>
        </div>

        <div
          className={`grid gap-6 ${showParagraph ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}
        >
          {/* Left Panel - Paragraph (if position is left) */}
          {showParagraph && paragraphPosition === 'left' && (
            <div className='lg:col-span-1'>
              <ParagraphPanel />
            </div>
          )}

          {/* Main Content */}
          <div
            className={
              showParagraph ? 'lg:col-span-2' : 'col-span-1 mx-auto max-w-4xl'
            }
          >
            {/* Progress */}
            <Card className='mb-6'>
              <CardContent className='pt-6'>
                <div className='mb-2 flex items-center justify-between'>
                  <span className='text-sm font-medium'>Tiến độ</span>
                  <span className='text-muted-foreground text-sm'>
                    Câu {currentSentenceIndex + 1} / {sentences.length}
                  </span>
                </div>
                <Progress value={progress} className='h-2' />
              </CardContent>
            </Card>

            {/* Current Sentence */}
            <Card className='mb-6'>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Dịch câu sau:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='mb-4 rounded-lg bg-blue-50 p-4'>
                  <p className='text-lg font-medium text-blue-900'>
                    {currentSentence}
                  </p>
                </div>

                <div className='space-y-4'>
                  <Input
                    placeholder='Nhập bản dịch của bạn...'
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={isValidating || !!validationResult}
                    className='text-lg'
                    onKeyPress={(e) => {
                      if (
                        e.key === 'Enter' &&
                        !isValidating &&
                        !validationResult
                      ) {
                        handleSubmit()
                      }
                    }}
                  />

                  <div className='flex gap-2'>
                    {/* Previous Button */}
                    {canGoBack && (
                      <Button
                        onClick={handlePrevious}
                        disabled={isValidating}
                        variant='outline'
                        size='sm'
                      >
                        <ChevronLeft className='mr-1 h-4 w-4' />
                        Câu trước
                      </Button>
                    )}

                    {/* Main Action Buttons */}
                    <div className='flex flex-1 gap-2'>
                      {!validationResult ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!userAnswer.trim() || isValidating}
                          className='flex-1'
                        >
                          {isValidating ? (
                            <>
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              Đang kiểm tra...
                            </>
                          ) : (
                            'Kiểm tra'
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setUserAnswer('')
                            setValidationResult(null)
                          }}
                          variant='outline'
                          className='flex-1'
                        >
                          Thử lại
                        </Button>
                      )}
                    </div>

                    {/* Next Button */}
                    {canGoNext && (
                      <Button
                        onClick={handleNext}
                        disabled={isValidating}
                        variant='outline'
                        size='sm'
                      >
                        Câu tiếp theo
                        <ChevronRight className='ml-1 h-4 w-4' />
                      </Button>
                    )}

                    {/* Complete Button - only show on last sentence */}
                    {isLastSentence && (
                      <Button
                        onClick={handleNext}
                        disabled={isValidating}
                        size='sm'
                      >
                        Hoàn thành
                      </Button>
                    )}
                  </div>

                  {/* Navigation Helper Text */}
                  <div className='text-muted-foreground text-center text-xs'>
                    Bạn có thể di chuyển tự do giữa các câu để ôn tập
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Result */}
            {validationResult && (
              <Card>
                <CardContent className='pt-6'>
                  <div className='rounded-lg border p-4 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'>
                    <div className='mb-2 flex items-center gap-2'>
                      {validationResult.status === 'perfect' ? (
                        <CheckCircle className='h-5 w-5 text-green-700 dark:text-green-400' />
                      ) : validationResult.status === 'good' ? (
                        <CheckCircle className='h-5 w-5 text-yellow-700 dark:text-yellow-400' />
                      ) : (
                        <XCircle className='h-5 w-5 text-red-700 dark:text-red-400' />
                      )}
                      <span
                        className={`font-semibold ${
                          validationResult.status === 'perfect'
                            ? 'text-green-800 dark:text-green-200'
                            : validationResult.status === 'good'
                              ? 'text-yellow-800 dark:text-yellow-200'
                              : 'text-red-800 dark:text-red-200'
                        }`}
                      >
                        Điểm: {validationResult.score}/100
                      </span>
                    </div>

                    {validationResult.message && (
                      <p
                        className={`mb-2 ${
                          validationResult.status === 'perfect'
                            ? 'text-green-800 dark:text-green-200'
                            : validationResult.status === 'good'
                              ? 'text-yellow-800 dark:text-yellow-200'
                              : 'text-red-800 dark:text-red-200'
                        }`}
                      >
                        {validationResult.message}
                      </p>
                    )}

                    {(validationResult.rich_html || validationResult.suggestion_html || validationResult.suggestion_markdown) && (
                      <div className='mb-3'>
                        <p
                          className={`font-medium ${
                            validationResult.status === 'perfect'
                              ? 'text-green-800 dark:text-green-200'
                              : validationResult.status === 'good'
                                ? 'text-yellow-800 dark:text-yellow-200'
                                : 'text-red-800 dark:text-red-200'
                          }`}
                        >
                          Suggestion:
                        </p>
                        {validationResult.rich_html ? (
                          <div
                            className='text-sm'
                            dangerouslySetInnerHTML={sanitizeHtml(
                              validationResult.rich_html
                            )}
                          />
                        ) : validationResult.suggestion_html ? (
                          <p
                            className='text-sm'
                            dangerouslySetInnerHTML={sanitizeHtml(
                              validationResult.suggestion_html
                            )}
                          />
                        ) : (
                          <p
                            className='text-sm'
                            dangerouslySetInnerHTML={formatSuggestion(
                              validationResult.suggestion_markdown as string
                            )}
                          />
                        )}
                      </div>
                    )}

                    {validationResult.comment && (
                      <p
                        className={`mb-2 ${
                          validationResult.status === 'perfect'
                            ? 'text-green-700 dark:text-green-300'
                            : validationResult.status === 'good'
                              ? 'text-yellow-700 dark:text-yellow-300'
                              : 'text-red-700 dark:text-red-300'
                        }`}
                      >
                        {validationResult.comment}
                      </p>
                    )}

                    {validationResult.improvement_suggestions && (
                      <div className='mb-2'>
                        <p
                          className={`font-medium ${
                            validationResult.status === 'perfect'
                              ? 'text-green-800 dark:text-green-200'
                              : validationResult.status === 'good'
                                ? 'text-yellow-800 dark:text-yellow-200'
                                : 'text-red-800 dark:text-red-200'
                          }`}
                        >
                          Gợi ý cải thiện:
                        </p>
                        <p
                          className={`text-sm ${
                            validationResult.status === 'perfect'
                              ? 'text-green-700 dark:text-green-300'
                              : validationResult.status === 'good'
                                ? 'text-yellow-700 dark:text-yellow-300'
                                : 'text-red-700 dark:text-red-300'
                          }`}
                        >
                          {validationResult.improvement_suggestions}
                        </p>
                      </div>
                    )}

                    {validationResult.improvements &&
                      validationResult.improvements.length > 0 && (
                        <div className='mb-3'>
                          <p
                            className={`font-medium ${
                              validationResult.status === 'perfect'
                                ? 'text-green-800 dark:text-green-200'
                                : validationResult.status === 'good'
                                  ? 'text-yellow-800 dark:text-yellow-200'
                                  : 'text-red-800 dark:text-red-200'
                            }`}
                          >
                            Suggested improvements:
                          </p>
                          <ul
                            className={`list-disc pl-5 text-sm ${
                              validationResult.status === 'perfect'
                                ? 'text-green-700 dark:text-green-300'
                                : validationResult.status === 'good'
                                  ? 'text-yellow-700 dark:text-yellow-300'
                                  : 'text-red-700 dark:text-red-300'
                            }`}
                          >
                            {validationResult.improvements.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {validationResult.correct_answer && (
                      <div>
                        <p
                          className={`font-medium ${
                            validationResult.status === 'perfect'
                              ? 'text-green-800 dark:text-green-200'
                              : validationResult.status === 'good'
                                ? 'text-yellow-800 dark:text-yellow-200'
                                : 'text-red-800 dark:text-red-200'
                          }`}
                        >
                          Đáp án tham khảo:
                        </p>
                        <p
                          className={`text-sm italic ${
                            validationResult.status === 'perfect'
                              ? 'text-green-700 dark:text-green-300'
                              : validationResult.status === 'good'
                                ? 'text-yellow-700 dark:text-yellow-300'
                                : 'text-red-700 dark:text-red-300'
                          }`}
                        >
                          {validationResult.correct_answer}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Paragraph (if position is right) */}
          {showParagraph && paragraphPosition === 'right' && (
            <div className='lg:col-span-1'>
              <ParagraphPanel />
            </div>
          )}
        </div>

        {/* Vocabulary Display - Show card when vocabulary panel is open */}
        {showVocabulary && (
          <Card className='mb-6'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='text-lg'>Từ vựng gợi ý</CardTitle>
              <Button variant='ghost' size='sm' onClick={toggleVocabulary}>
                <X className='h-4 w-4' />
              </Button>
            </CardHeader>
            <CardContent>
              {suggestedVocabulary.length > 0 ? (
                <div className='grid gap-3'>
                  {suggestedVocabulary.map((vocab) => (
                    <div key={vocab.id} className='rounded-lg border p-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='font-medium'>{vocab.term}</div>
                          <div className='text-muted-foreground text-sm'>
                            {vocab.vietnamese}
                          </div>
                          {vocab.pronunciation && (
                            <div className='text-xs text-blue-600'>
                              /{vocab.pronunciation}/
                            </div>
                          )}
                        </div>
                        <Badge variant='secondary' className='text-xs'>
                          {vocab.type}
                        </Badge>
                      </div>
                      {vocab.example && (
                        <div className='mt-2 text-sm text-gray-600 italic'>
                          {vocab.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='py-8 text-center'>
                  <BookOpen className='text-muted-foreground mx-auto mb-3 h-12 w-12' />
                  <p className='text-muted-foreground'>
                    Không có từ vựng gợi ý cho bài học này
                  </p>
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-3'
                    onClick={fetchSuggestedVocabulary}
                    disabled={isLoadingVocabulary}
                  >
                    {isLoadingVocabulary ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <BookOpen className='mr-2 h-4 w-4' />
                    )}
                    Thử lại
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showHistory} onOpenChange={toggleHistory}>
        <DialogContent className='max-h-[80vh] w-3/4 max-w-none'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <History className='h-5 w-5' />
              Lịch sử bài học: {lesson?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className='max-h-[60vh]'>
            <HistoryList history={lessonHistory} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
