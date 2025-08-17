import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Trophy } from 'lucide-react'
import { authService } from '@/api/auth'
import { collectionApi, type CollectionDTO } from '@/api/collection'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function QuizSetupPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')
  const [questionCount, setQuestionCount] = useState<string>('5')
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [loadingVocab, setLoadingVocab] = useState(false)
  const [vocabCount, setVocabCount] = useState<number | null>(null)
  const [startingQuiz, setStartingQuiz] = useState(false)

  const { toast } = useToast()
  const navigate = useNavigate()

  // Load collections
  const loadCollections = async () => {
    setLoadingCollections(true)
    try {
      const currentUser = await authService.getCurrentUser()
      const userId = Number(currentUser?.id)

      if (!userId) {
        throw new Error('User ID không hợp lệ')
      }

      const collectionsResponse = await collectionApi.list(userId)

      // Extract collections from Page response
      const collectionsArray = collectionsResponse?.content || []

      // Transform CollectionDTO to Collection interface
      const transformedCollections = collectionsArray.map(
        (col: CollectionDTO) => ({
          id: col.id,
          name: col.collectionName,
          vocabCount: col.vocabularyDTOList?.length || 0,
        })
      )
      setCollections(transformedCollections)
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

  // Load vocab count when collection changes
  const loadVocabCount = async (collectionId: string) => {
    if (!collectionId) {
      setVocabCount(null)
      return
    }

    setLoadingVocab(true)
    try {
      // Get vocab count from the selected collection
      const selectedCollection = collections.find(
        (c) => c.id === Number(collectionId)
      )
      const count = selectedCollection?.vocabCount || 0
      setVocabCount(count)

      // Adjust question count if it exceeds vocab count
      if (parseInt(questionCount) > count) {
        setQuestionCount(String(Math.min(count, 5)))
      }
    } catch (error) {
      console.error('Error loading vocab count:', error)
      setVocabCount(0)
    } finally {
      setLoadingVocab(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    loadVocabCount(selectedCollectionId)
  }, [selectedCollectionId])

  const handleStartQuiz = async () => {
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

    setStartingQuiz(true)
    try {
      // Navigate to quiz page with collection and question count
      navigate({
        to: '/quiz/$collectionId',
        params: { collectionId: selectedCollectionId },
        search: { questionCount: count },
      })
    } catch (error) {
      console.error('Error starting quiz:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể bắt đầu quiz. Vui lòng thử lại.',
        variant: 'destructive',
      })
      setStartingQuiz(false)
    }
  }

  const handleBack = () => {
    navigate({ to: '/vocab' })
  }

  return (
    <div className='bg-background min-h-screen'>
      {/* Header */}
      <header className='bg-card border-b shadow-sm'>
        <div className='mx-auto max-w-4xl px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='ghost' onClick={handleBack} className='gap-2'>
                <ArrowLeft className='h-4 w-4' />
                Quay lại
              </Button>
              <div>
                <h1 className='text-foreground flex items-center gap-2 text-2xl font-bold'>
                  <Trophy className='h-6 w-6 text-yellow-500' />
                  Thiết lập Quiz từ vựng
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='mx-auto max-w-2xl px-4 py-12'>
        <div className='bg-card rounded-lg border p-8 shadow-sm'>
          <div className='space-y-8'>
            {/* Introduction */}
            <div className='space-y-4 text-center'>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10'>
                <Trophy className='h-8 w-8 text-yellow-500' />
              </div>
              <div>
                <h2 className='text-foreground mb-2 text-2xl font-bold'>
                  Bắt đầu Quiz từ vựng
                </h2>
                <p className='text-muted-foreground'>
                  Chọn collection và số lượng câu hỏi để bắt đầu bài kiểm tra từ
                  vựng của bạn
                </p>
              </div>
            </div>

            {/* Form */}
            <div className='space-y-6'>
              <div>
                <label className='text-foreground mb-2 block text-sm font-medium'>
                  Chọn Collection
                </label>
                <Select
                  value={selectedCollectionId}
                  onValueChange={setSelectedCollectionId}
                  disabled={loadingCollections}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn một collection...' />
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
                {loadingCollections && (
                  <p className='text-muted-foreground mt-1 text-sm'>
                    Đang tải collections...
                  </p>
                )}
              </div>

              {selectedCollectionId && (
                <div>
                  <label className='text-foreground mb-2 block text-sm font-medium'>
                    Số lượng câu hỏi
                  </label>
                  <Input
                    type='number'
                    min='1'
                    max={vocabCount || 1}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    placeholder='Nhập số câu hỏi...'
                    disabled={loadingVocab}
                  />
                  {vocabCount !== null && (
                    <p className='text-muted-foreground mt-1 text-sm'>
                      Collection này có {vocabCount} từ vựng. Tối đa{' '}
                      {vocabCount} câu hỏi.
                    </p>
                  )}
                  {loadingVocab && (
                    <p className='text-muted-foreground mt-1 text-sm'>
                      Đang tải số lượng từ vựng...
                    </p>
                  )}
                </div>
              )}

              {/* Start Button */}
              <div className='pt-6'>
                <Button
                  onClick={handleStartQuiz}
                  disabled={
                    !selectedCollectionId ||
                    !questionCount ||
                    loadingCollections ||
                    loadingVocab ||
                    startingQuiz
                  }
                  className='h-12 w-full text-lg'
                  size='lg'
                >
                  {startingQuiz ? (
                    <>
                      <div className='border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
                      Đang bắt đầu...
                    </>
                  ) : (
                    <>
                      <Trophy className='mr-2 h-5 w-5' />
                      Bắt đầu Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Tips */}
            <div className='rounded-lg border border-blue-500/20 bg-blue-500/10 p-4'>
              <h3 className='text-foreground mb-2 font-semibold'>
                💡 Mẹo làm quiz:
              </h3>
              <ul className='text-muted-foreground space-y-1 text-sm'>
                <li>• Đọc kỹ câu hỏi trước khi chọn đáp án</li>
                <li>
                  • Bạn có thể chọn từ 1 đến {vocabCount || '...'} câu hỏi
                </li>
                <li>• Kết quả sẽ được hiển thị ngay sau khi hoàn thành</li>
                <li>• Hãy thử thách bản thân với nhiều câu hỏi hơn!</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
