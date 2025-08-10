import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { authService } from '@/api/auth'
import { vocabApi, type VocabularyDTO } from '@/api/vocab'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IndexTopBar } from '@/components/layout/index-top-bar'

export const Route = createFileRoute('/vocab/flashcard')({
  component: FlashcardPage,
})

function FlashcardPage() {
  const [items, setItems] = useState<VocabularyDTO[]>([])
  const [current, setCurrent] = useState(0)
  const [flip, setFlip] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const user = authService.getCurrentUser()
        if (!user || !user.id) {
          throw new Error('User not authenticated')
        }
        const userId = parseInt(user.id)
        const list = await vocabApi.list(userId)
        setItems(list)
      } catch (error) {
        console.error('Failed to load vocabulary:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const next = () => {
    setFlip(false)
    setCurrent((i) => (i + 1) % Math.max(items.length || 1, 1))
  }

  const prev = () => {
    setFlip(false)
    setCurrent(
      (i) =>
        (i - 1 + Math.max(items.length || 1, 1)) %
        Math.max(items.length || 1, 1)
    )
  }

  const reset = () => {
    setFlip(false)
    setCurrent(0)
  }

  const item = items[current]

  if (isLoading) {
    return (
      <div className='bg-background min-h-screen'>
        <IndexTopBar />
        <main className='mx-auto max-w-3xl px-4 py-8'>
          <div className='flex h-64 items-center justify-center'>
            <div className='text-muted-foreground'>Đang tải...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className='bg-background min-h-screen'>
      <IndexTopBar />
      <main className='mx-auto max-w-3xl px-4 py-8'>
        <div className='mb-6 flex items-center justify-between'>
          <Link to='/vocab'>
            <Button variant='ghost'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Quay lại Vocab
            </Button>
          </Link>

          {items.length > 0 && (
            <div className='text-muted-foreground text-sm'>
              {current + 1} / {items.length}
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className='text-muted-foreground rounded-lg border p-8 text-center'>
            <p className='mb-4'>Chưa có từ vựng nào.</p>
            <Link to='/vocab'>
              <Button>Thêm từ vựng đầu tiên</Button>
            </Link>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-6'>
            {/* Flashcard */}
            <div
              className={`border-border bg-card relative h-80 w-full max-w-2xl cursor-pointer rounded-2xl border-2 p-8 text-center shadow-lg transition-all duration-500 [transform-style:preserve-3d] hover:shadow-xl ${
                flip ? '[transform:rotateY(180deg)]' : ''
              }`}
              onClick={() => setFlip((f) => !f)}
              aria-label='Lật thẻ để xem nghĩa'
            >
              {/* Front side - English term */}
              <div className='absolute inset-0 flex flex-col items-center justify-center backface-hidden'>
                <div className='text-primary mb-4 text-4xl font-bold'>
                  {item.term}
                </div>
                {item.pronunciation && (
                  <div className='text-muted-foreground mb-2 text-lg'>
                    {item.pronunciation}
                  </div>
                )}
                {item.type && (
                  <Badge variant='secondary' className='text-xs'>
                    {item.type}
                  </Badge>
                )}
                <div className='text-muted-foreground mt-4 text-sm'>
                  Click để lật thẻ
                </div>
              </div>

              {/* Back side - Vietnamese meaning */}
              <div className='absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center backface-hidden'>
                <div className='mb-4 text-3xl font-semibold'>{item.vi}</div>
                {item.example && (
                  <div className='text-muted-foreground mb-4 max-w-md text-lg'>
                    "{item.example}"
                  </div>
                )}
                <div className='text-muted-foreground text-sm'>
                  Click để lật lại
                </div>
              </div>
            </div>

            {/* Navigation controls */}
            <div className='flex items-center gap-4'>
              <Button onClick={prev} variant='outline' size='lg'>
                <ChevronLeft className='mr-2 h-5 w-5' />
                Trước
              </Button>

              <Button onClick={reset} variant='secondary' size='sm'>
                <RotateCcw className='mr-2 h-4 w-4' />
                Bắt đầu lại
              </Button>

              <Button onClick={next} variant='outline' size='lg'>
                Sau
                <ChevronRight className='ml-2 h-5 w-5' />
              </Button>
            </div>

            {/* Progress indicator */}
            <div className='w-full max-w-md'>
              <div className='text-muted-foreground mb-2 flex justify-between text-sm'>
                <span>Tiến độ</span>
                <span>{Math.round(((current + 1) / items.length) * 100)}%</span>
              </div>
              <div className='bg-secondary h-2 w-full rounded-full'>
                <div
                  className='bg-primary h-2 rounded-full transition-all duration-300'
                  style={{ width: `${((current + 1) / items.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
