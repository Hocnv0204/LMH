import { useEffect, useState } from 'react'
import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Image as ImageIcon,
} from 'lucide-react'
import { vocabApi, type VocabularyDTO } from '@/api/vocab'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IndexTopBar } from '@/components/layout/index-top-bar'

export const Route = createFileRoute('/vocab/flashcard')({
  component: FlashcardPage,
  validateSearch: (search: Record<string, unknown>) => ({
    collection: search.collection as string | undefined,
  }),
})

function FlashcardPage() {
  const [items, setItems] = useState<VocabularyDTO[]>([])
  const [current, setCurrent] = useState(0)
  const [flip, setFlip] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [collectionName, setCollectionName] = useState<string>('')
  const [imageLoading, setImageLoading] = useState<{
    [key: number]: boolean | undefined
  }>({})

  // Lấy collection ID từ URL search params
  const search = useSearch({ from: '/vocab/flashcard' })
  const collectionId = (search as { collection?: string }).collection

  useEffect(() => {
    const fetchData = async () => {
      if (!collectionId) {
        setError('Không có collection được chọn')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Lấy vocab theo collection ID
        const vocabList = await vocabApi.getByCollectionId(Number(collectionId))
        setItems(vocabList)

        // Lấy tên collection để hiển thị
        if (vocabList.length > 0 && vocabList[0].collectionName) {
          setCollectionName(vocabList[0].collectionName)
        }
      } catch (error) {
        console.error('Failed to load vocabulary:', error)
        setError('Không thể tải từ vựng của collection này')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [collectionId])

  const next = () => {
    setFlip(false)
    setCurrent((i) => (i + 1) % Math.max(items.length || 1, 1))
    // Reset image loading for next card
    if (items.length > 0) {
      const nextIndex = (current + 1) % items.length
      setImageLoading((prev) => ({ ...prev, [items[nextIndex].id]: undefined }))
    }
  }

  const prev = () => {
    setFlip(false)
    setCurrent(
      (i) =>
        (i - 1 + Math.max(items.length || 1, 1)) %
        Math.max(items.length || 1, 1)
    )
    // Reset image loading for previous card
    if (items.length > 0) {
      const prevIndex = (current - 1 + items.length) % items.length
      setImageLoading((prev) => ({ ...prev, [items[prevIndex].id]: undefined }))
    }
  }

  const reset = () => {
    setFlip(false)
    setCurrent(0)
    // Reset all image loading states
    setImageLoading({})
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
          <div className='flex items-center gap-4'>
            <Link to='/vocab'>
              <Button variant='ghost'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Quay lại Vocab
              </Button>
            </Link>

            {collectionName && (
              <div className='text-muted-foreground text-sm'>
                Collection:{' '}
                <span className='font-medium'>{collectionName}</span>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className='text-muted-foreground text-sm'>
              {current + 1} / {items.length}
            </div>
          )}
        </div>

        {error ? (
          <div className='text-destructive border-destructive/50 rounded-lg border p-8 text-center'>
            <p className='mb-4'>{error}</p>
            <Link to='/vocab'>
              <Button>Quay lại Vocab</Button>
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className='text-muted-foreground rounded-lg border p-8 text-center'>
            <p className='mb-4'>Collection này chưa có từ vựng nào.</p>
            <Link to='/vocab'>
              <Button>Quay lại Vocab</Button>
            </Link>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-6'>
            {/* Flashcard */}
            <div
              className={`border-border bg-card relative h-96 w-full max-w-2xl cursor-pointer rounded-2xl border-2 p-8 text-center shadow-lg transition-all duration-500 [transform-style:preserve-3d] hover:shadow-xl ${
                flip ? '[transform:rotateY(180deg)]' : ''
              }`}
              onClick={() => setFlip((f) => !f)}
              aria-label='Lật thẻ để xem nghĩa'
            >
              {/* Front side - English term */}
              <div className='absolute inset-0 flex flex-col items-center justify-center backface-hidden'>
                {/* Image display */}
                {item.imageUrl && (
                  <div className='mb-4 w-full max-w-xs'>
                    {imageLoading[item.id] !== false && (
                      <div className='border-border/20 bg-muted/20 mx-auto flex h-36 w-32 items-center justify-center rounded-xl border'>
                        <ImageIcon className='text-muted-foreground h-8 w-8 animate-pulse' />
                      </div>
                    )}
                    <img
                      src={item.imageUrl}
                      alt={`Image for ${item.term}`}
                      className={`border-border/20 mx-auto h-36 w-auto rounded-xl border object-contain shadow-lg transition-opacity duration-300 ${
                        imageLoading[item.id] === false
                          ? 'opacity-100'
                          : 'opacity-0'
                      }`}
                      onError={(e) => {
                        // Hide image if it fails to load
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        setImageLoading((prev) => ({
                          ...prev,
                          [item.id]: false,
                        }))
                      }}
                      onLoad={() => {
                        // Show image when loaded
                        setImageLoading((prev) => ({
                          ...prev,
                          [item.id]: false,
                        }))
                      }}
                      onLoadStart={() => {
                        // Set loading state
                        setImageLoading((prev) => ({
                          ...prev,
                          [item.id]: true,
                        }))
                      }}
                    />
                  </div>
                )}

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
