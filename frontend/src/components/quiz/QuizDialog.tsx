import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Trophy } from 'lucide-react'
import { authService } from '@/api/auth'
import { api } from '@/api/client'
import {
  quizApi,
  type QuizStartRequest,
  type QuizQuestion,
  type QuizAnswerRequest,
} from '@/api/quiz'
import { vocabApi } from '@/api/vocab'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Collection {
  id: number
  name: string
  vocabCount: number
}

interface QuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuizDialog({ open, onOpenChange }: QuizDialogProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')
  const [questionCount, setQuestionCount] = useState<string>('5')
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [loadingVocab, setLoadingVocab] = useState(false)
  const [vocabCount, setVocabCount] = useState<number | null>(null)

  // Quiz states
  const [quizStarted, setQuizStarted] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    null
  )
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [isAnswering, setIsAnswering] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [autoFinished, setAutoFinished] = useState(false)

  const { toast } = useToast()

  // Load collections
  useEffect(() => {
    if (open) {
      loadCollections()
    }
  }, [open])

  // Debug state changes
  useEffect(() => {
    console.log('State changed:', {
      quizStarted,
      currentQuestion: currentQuestion ? 'loaded' : 'null',
      quizCompleted,
      sessionId,
    })
  }, [quizStarted, currentQuestion, quizCompleted, sessionId])

  // Load vocab count when collection changes
  useEffect(() => {
    if (selectedCollectionId) {
      loadVocabCount()
    } else {
      setVocabCount(null)
    }
  }, [selectedCollectionId])

  const loadCollections = async () => {
    try {
      setLoadingCollections(true)
      const currentUser = await authService.getCurrentUser()
      const userId = Number(currentUser?.id)

      if (!userId) {
        toast({
          title: 'Lỗi',
          description: 'Không thể xác định người dùng',
          variant: 'destructive',
        })
        return
      }

      const { data } = await api.get<{
        content: Array<{ id: number; collectionName: string }>
      }>(`/api/collection/user/${userId}`, { params: { page: 0, size: 1000 } })

      const collectionsWithCount = await Promise.all(
        (data.content || []).map(async (collection) => {
          try {
            const vocabList = await vocabApi.getByCollectionId(collection.id)
            return {
              id: collection.id,
              name: collection.collectionName,
              vocabCount: vocabList.length || 0,
            }
          } catch {
            return {
              id: collection.id,
              name: collection.collectionName,
              vocabCount: 0,
            }
          }
        })
      )

      setCollections(collectionsWithCount.filter((c) => c.vocabCount > 0))
    } catch (error) {
      console.error('Error loading collections:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách collections',
        variant: 'destructive',
      })
    } finally {
      setLoadingCollections(false)
    }
  }

  const loadVocabCount = async () => {
    try {
      setLoadingVocab(true)
      const vocabList = await vocabApi.getByCollectionId(
        parseInt(selectedCollectionId)
      )
      setVocabCount(vocabList.length || 0)
    } catch (error) {
      console.error('Error loading vocab count:', error)
      setVocabCount(0)
    } finally {
      setLoadingVocab(false)
    }
  }

  const handleStartQuiz = async () => {
    console.log('handleStartQuiz called')
    console.log('selectedCollectionId:', selectedCollectionId)
    console.log('questionCount:', questionCount)
    console.log('vocabCount:', vocabCount)

    if (!selectedCollectionId || !questionCount) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn collection và số lượng câu hỏi',
        variant: 'destructive',
      })
      return
    }

    const count = parseInt(questionCount)
    if (count > (vocabCount || 0)) {
      toast({
        title: 'Lỗi',
        description: `Số lượng câu hỏi không được vượt quá ${vocabCount} từ vựng trong collection`,
        variant: 'destructive',
      })
      return
    }

    try {
      console.log('Getting current user...')
      const currentUser = await authService.getCurrentUser()
      const userId = Number(currentUser?.id)
      console.log('Current user:', currentUser)
      console.log('UserId:', userId)

      if (!userId) {
        toast({
          title: 'Lỗi',
          description: 'Không thể xác định người dùng',
          variant: 'destructive',
        })
        return
      }

      const request: QuizStartRequest = {
        collectionId: parseInt(selectedCollectionId),
        questionCount: count,
      }
      console.log('Quiz start request:', request)

      console.log('Calling quizApi.start...')
      const response = await quizApi.start(userId, request)
      console.log('Quiz start response:', response)

      // Handle both formats: direct response or wrapped in success/data
      const sessionId = response.sessionId || response.data?.sessionId
      if (sessionId) {
        setSessionId(sessionId)
        setQuizStarted(true)
        setScore(0)
        setTotalAnswered(0)
        setQuizCompleted(false)
        setAutoFinished(false)

        // Load first question
        console.log('Loading first question...')
        await loadCurrentQuestion(sessionId, userId)

        toast({
          title: 'Thành công',
          description: 'Quiz đã bắt đầu! Hãy trả lời câu hỏi đầu tiên.',
        })
      } else {
        throw new Error('Không nhận được sessionId từ server')
      }
    } catch (error: unknown) {
      console.error('Error starting quiz:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      console.error('Error details:', {
        message: errorMessage,
      })
      toast({
        title: 'Lỗi',
        description: `Không thể bắt đầu quiz: ${errorMessage}`,
        variant: 'destructive',
      })
    }
  }

  const loadCurrentQuestion = async (quizId: string, userId: number) => {
    try {
      console.log(
        'Loading current question for quizId:',
        quizId,
        'userId:',
        userId
      )
      const response = await quizApi.getCurrentQuestion(quizId, userId)
      console.log('Current question response:', response)

      // Handle both formats: direct response or wrapped in success/data
      const questionData = response.questionId ? response : response.data
      if (questionData && questionData.questionId) {
        console.log('Setting current question:', questionData)
        setCurrentQuestion(questionData)
        setSelectedAnswer('')
        setShowResult(false)
      } else {
        console.error('No question data found in response:', response)
        toast({
          title: 'Lỗi',
          description: 'Không thể tải câu hỏi: Không tìm thấy dữ liệu câu hỏi',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error loading question:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải câu hỏi',
        variant: 'destructive',
      })
    }
  }

  const handleAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || !sessionId) return

    setIsAnswering(true)
    try {
      const currentUser = await authService.getCurrentUser()
      const userId = Number(currentUser?.id)

      if (!userId) return

      const request: QuizAnswerRequest = {
        quizId: sessionId,
        questionId: currentQuestion.questionId,
        selectedAnswer,
      }

      console.log('Answer request:', {
        userId,
        request,
        currentQuestion: currentQuestion.questionId,
        sessionId,
        selectedAnswer,
      })

      const response = await quizApi.answer(userId, request)
      console.log('Answer response:', response)

      // Handle both formats: direct response or wrapped in success/data
      const answerData =
        response.correct !== undefined ? response : response.data
      if (answerData && answerData.correct !== undefined) {
        console.log('Processing answer data:', {
          correct: answerData.correct,
          completed: answerData.completed,
          isCompleted: answerData.isCompleted,
          nextQuestion: answerData.nextQuestion ? 'present' : 'null',
        })
        setIsCorrect(answerData.correct)
        setShowResult(true)

        if (answerData.correct) {
          setScore((prev) => prev + 1)
        }

        setTotalAnswered((prev) => prev + 1)

        // Show result for 2 seconds then move to next question or finish quiz
        setTimeout(async () => {
          // Check both 'completed' and 'isCompleted' properties for backend compatibility
          const isQuizCompleted = answerData.completed || answerData.isCompleted

          if (isQuizCompleted) {
            console.log('Quiz completed! Auto-finishing...')
            setQuizCompleted(true)
            setCurrentQuestion(null)

            // Auto finish quiz when completed
            try {
              const currentUser = await authService.getCurrentUser()
              const userId = Number(currentUser?.id)
              if (userId && sessionId) {
                console.log('Calling finish quiz API...')
                await quizApi.finish(sessionId, userId)
                console.log('Quiz finished successfully')
                setAutoFinished(true)

                toast({
                  title: 'Hoàn thành!',
                  description: `Bạn đã hoàn thành quiz với ${score + (answerData.correct ? 1 : 0)}/${totalAnswered + 1} câu đúng!`,
                })
              }
            } catch (error) {
              console.error('Error finishing quiz:', error)
              // Don't show error toast to user as quiz is already completed
            }
          } else if (answerData.nextQuestion) {
            setCurrentQuestion(answerData.nextQuestion)
            setSelectedAnswer('')
            setShowResult(false)
          }
        }, 2000)
      } else {
        console.error('Invalid answer response:', response)
        toast({
          title: 'Lỗi',
          description: 'Phản hồi không hợp lệ từ server',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error answering question:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi câu trả lời',
        variant: 'destructive',
      })
    } finally {
      setIsAnswering(false)
    }
  }

  const handleFinishQuiz = async () => {
    if (!sessionId) return

    try {
      const currentUser = await authService.getCurrentUser()
      const userId = Number(currentUser?.id)

      // Only call finish API if not already auto-finished
      if (userId && !autoFinished) {
        console.log('Manual finish quiz API call...')
        await quizApi.finish(sessionId, userId)
      }

      // Reset quiz state
      setQuizStarted(false)
      setSessionId('')
      setCurrentQuestion(null)
      setSelectedAnswer('')
      setShowResult(false)
      setScore(0)
      setTotalAnswered(0)
      setQuizCompleted(false)
      setAutoFinished(false)
      setSelectedCollectionId('')
      setQuestionCount('5')

      onOpenChange(false)

      toast({
        title: 'Hoàn thành!',
        description: `Bạn đã trả lời đúng ${score}/${totalAnswered} câu hỏi`,
      })
    } catch (error) {
      console.error('Error finishing quiz:', error)
    }
  }

  const handleClose = () => {
    if (quizStarted && !quizCompleted) {
      if (confirm('Bạn có chắc muốn thoát? Tiến độ quiz sẽ bị mất.')) {
        handleFinishQuiz()
      }
    } else {
      onOpenChange(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {quizStarted ? (
              <>
                <Trophy className='h-5 w-5 text-yellow-500' />
                Quiz từ vựng
              </>
            ) : (
              'Bắt đầu học từ vựng'
            )}
          </DialogTitle>
        </DialogHeader>

        {!quizStarted ? (
          // Quiz setup form
          <div className='space-y-6'>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Chọn Collection
              </label>
              <Select
                value={selectedCollectionId}
                onValueChange={setSelectedCollectionId}
                disabled={loadingCollections}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn collection để học' />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem
                      key={collection.id}
                      value={String(collection.id)}
                    >
                      {collection.name} ({collection.vocabCount} từ)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCollectionId && (
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  Số lượng câu hỏi
                </label>
                <Input
                  type='number'
                  min='1'
                  max={vocabCount || 1}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  placeholder='Nhập số câu hỏi'
                />
                <p className='text-muted-foreground mt-1 text-xs'>
                  Tối đa {vocabCount} câu hỏi
                </p>
              </div>
            )}

            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={handleClose}>
                Hủy
              </Button>
              <Button
                onClick={handleStartQuiz}
                disabled={
                  !selectedCollectionId ||
                  !questionCount ||
                  loadingCollections ||
                  loadingVocab
                }
              >
                Bắt đầu Quiz
              </Button>
            </div>
          </div>
        ) : quizCompleted ? (
          // Quiz completion screen with congratulations message
          <div className='space-y-8 py-12 text-center'>
            <div className='space-y-4'>
              <Trophy className='mx-auto h-20 w-20 animate-bounce text-yellow-500' />
              <div className='space-y-2'>
                <h2 className='text-3xl font-bold text-green-700'>
                  🎉 Chúc mừng bạn! 🎉
                </h2>
                <p className='text-xl font-semibold text-gray-700'>
                  Bạn đã hoàn thành xuất sắc bài quiz từ vựng!
                </p>
              </div>
            </div>

            <div className='mx-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-6'>
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800'>
                  Kết quả của bạn:
                </h3>
                <div className='flex items-center justify-center space-x-8'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {score}
                    </div>
                    <div className='text-sm text-gray-600'>Câu đúng</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-gray-600'>
                      {totalAnswered}
                    </div>
                    <div className='text-sm text-gray-600'>Tổng câu</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-green-600'>
                      {Math.round((score / totalAnswered) * 100)}%
                    </div>
                    <div className='text-sm text-gray-600'>Độ chính xác</div>
                  </div>
                </div>

                {score / totalAnswered >= 0.8 ? (
                  <div className='rounded-lg bg-green-100 p-3 text-green-800'>
                    <p className='font-semibold'>Xuất sắc! 🌟</p>
                    <p className='text-sm'>Bạn đã nắm vững từ vựng rất tốt!</p>
                  </div>
                ) : score / totalAnswered >= 0.6 ? (
                  <div className='rounded-lg bg-yellow-100 p-3 text-yellow-800'>
                    <p className='font-semibold'>Tốt lắm! 👍</p>
                    <p className='text-sm'>
                      Hãy tiếp tục luyện tập để cải thiện hơn!
                    </p>
                  </div>
                ) : (
                  <div className='rounded-lg bg-blue-100 p-3 text-blue-800'>
                    <p className='font-semibold'>Cố gắng lên! 💪</p>
                    <p className='text-sm'>
                      Đừng nản lòng, hãy thử lại để cải thiện!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-3'>
              <p className='text-gray-600'>
                Cảm ơn bạn đã tham gia! Hãy tiếp tục học tập để nâng cao vốn từ
                vựng nhé! 📚
              </p>
              <Button
                onClick={handleFinishQuiz}
                className='w-full bg-green-600 hover:bg-green-700'
              >
                Hoàn thành và thoát
              </Button>
            </div>
          </div>
        ) : (
          // Quiz interface
          <div className='space-y-6'>
            {/* Progress bar */}
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>
                  Câu hỏi {currentQuestion?.currentQuestionNumber || 0}/
                  {currentQuestion?.totalQuestions || 0}
                </span>
                <span>Điểm: {score}</span>
              </div>
              <Progress
                value={
                  currentQuestion
                    ? (currentQuestion.currentQuestionNumber /
                        currentQuestion.totalQuestions) *
                      100
                    : 0
                }
                className='h-2'
              />
            </div>

            {/* Loading state or Question */}
            {!currentQuestion ? (
              <div className='py-8 text-center'>
                <div className='border-primary mx-auto mr-2 mb-4 h-8 w-8 animate-spin rounded-full border-b-2'></div>
                <p>Đang tải câu hỏi...</p>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='text-center'>
                  <h3 className='mb-2 text-xl font-semibold'>Câu hỏi:</h3>
                  <p className='text-primary text-2xl font-bold'>
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Answer options */}
                <div className='grid gap-3'>
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={
                        selectedAnswer === option ? 'default' : 'outline'
                      }
                      className='h-auto justify-start p-4 text-left'
                      onClick={() => setSelectedAnswer(option)}
                      disabled={showResult}
                    >
                      <span className='mr-3 font-mono text-sm'>
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>

                {/* Result feedback */}
                {showResult && (
                  <div
                    className={`rounded-lg p-4 text-center ${
                      isCorrect
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle className='mx-auto mb-2 h-6 w-6' />
                    ) : (
                      <XCircle className='mx-auto mb-2 h-6 w-6' />
                    )}
                    <p className='font-semibold'>
                      {isCorrect ? 'Chính xác!' : 'Sai rồi!'}
                    </p>
                    <p className='text-sm'>
                      {isCorrect
                        ? 'Chuyển sang câu hỏi tiếp theo.'
                        : 'Câu hỏi này sẽ xuất hiện lại sau.'}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className='flex justify-end gap-2'>
                  <Button
                    onClick={handleAnswer}
                    disabled={!selectedAnswer || isAnswering || showResult}
                    className='min-w-[120px]'
                  >
                    {isAnswering ? 'Đang xử lý...' : 'Trả lời'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
