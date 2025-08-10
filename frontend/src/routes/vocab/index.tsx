import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Plus,
  Trash2,
  Pencil,
  Layers,
  ImageIcon,
  SquareStack,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { collectionApi } from '@/api/collection'
import {
  vocabApi,
  type VocabularyDTO,
  type CreateVocabularyRequest,
  type VocabularyListResponse,
} from '@/api/vocab'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IndexTopBar } from '@/components/layout/index-top-bar'

export const Route = createFileRoute('/vocab/')({
  component: VocabPage,
})

type SortKey = 'az' | 'za' | 'new' | 'old'

function VocabPage() {
  const [items, setItems] = useState<VocabularyDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  // Local learned state as a placeholder until backend supports it
  const [learnedIds, setLearnedIds] = useState<Set<number>>(new Set())

  const [sortBy, setSortBy] = useState<SortKey>('new')

  // Audio controller for managing currently playing audio
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Fetch vocabularies
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        console.log('User ID not available, user:', user)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('Fetching vocabularies for user:', user.id)

        // Map sortBy to backend field names - chỉ field name
        const getSortField = (sortKey: SortKey): string => {
          switch (sortKey) {
            case 'new':
            case 'old':
              return 'id' // Backend sẽ sort theo id
            case 'az':
            case 'za':
              return 'term' // Backend sẽ sort theo term
            default:
              return 'id'
          }
        }

        // Gọi API với page bắt đầu từ 1, size=5, sortBy chỉ là field name
        const response = await vocabApi.listByUserId(
          Number(user.id),
          pageSize, // size = 5 hoặc 10
          currentPage, // Convert từ 0-based sang 1-based page
          getSortField(sortBy) // Chỉ 'id' hoặc 'term'
        )

        console.log('Vocabulary response:', response)

        let sortedItems = response.content || []

        // Nếu cần reverse order ở frontend
        if (sortBy === 'old' || sortBy === 'za') {
          sortedItems = [...sortedItems].reverse()
        }

        setItems(sortedItems)
        setTotalPages(response.totalPages || 0)
        setTotalElements(response.totalElements || 0)
      } catch (e) {
        console.error('Fetch vocabularies error:', e)
        const msg = (e as Error)?.message || 'Không thể tải danh sách từ vựng.'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id, currentPage, pageSize, sortBy])

  // Calculate pagination info
  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements)

  const learnedCount = useMemo(
    () => items.filter((i) => learnedIds.has(i.id)).length,
    [items, learnedIds]
  )
  const notLearnedCount = items.length - learnedCount

  const handleAudioPlay = (itemId: number, audioUrl: string) => {
    // Stop currently playing audio if any
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Create new audio element
    const audio = new Audio(audioUrl)
    audioRef.current = audio
    setCurrentlyPlaying(itemId)

    // Set up event listeners
    audio.addEventListener('ended', () => {
      setCurrentlyPlaying(null)
    })

    audio.addEventListener('error', () => {
      setCurrentlyPlaying(null)
      setError('Không thể phát âm thanh. Vui lòng thử lại.')
    })

    // Play audio
    audio.play().catch((e) => {
      console.error('Audio play error:', e)
      setCurrentlyPlaying(null)
      setError('Không thể phát âm thanh. Vui lòng thử lại.')
    })
  }

  const handleAudioPause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setCurrentlyPlaying(null)
    }
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize))
    setCurrentPage(0) // Reset to first page when changing page size
  }

  return (
    <div className='bg-background min-h-screen'>
      <IndexTopBar />

      <main className='mx-auto max-w-6xl px-4 py-8'>
        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <h2 className='text-2xl font-bold'>Từ vựng</h2>
          <div className='flex items-center gap-3'>
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortKey)}
            >
              <SelectTrigger className='w-44'>
                <SelectValue placeholder='Sắp xếp' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='az'>A → Z</SelectItem>
                <SelectItem value='za'>Z → A</SelectItem>
                <SelectItem value='new'>Mới nhất</SelectItem>
                <SelectItem value='old'>Cũ nhất</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant='secondary'
              onClick={() => setShowForm((s) => !s)}
              aria-expanded={showForm}
              aria-controls='vocab-form'
            >
              <Plus /> Thêm từ vựng
            </Button>
            <Link to='/collections'>
              <Button variant='outline'>
                <Layers /> Chủ đề từ vựng
              </Button>
            </Link>
            <Link to='/vocab/flashcard'>
              <Button>
                <SquareStack /> Flashcard
              </Button>
            </Link>
          </div>
        </div>

        <Stats learned={learnedCount} notLearned={notLearnedCount} />

        {showForm && (
          <div
            ref={formRef}
            id='vocab-form'
            className='mb-6 rounded-lg border p-4'
          >
            <VocabForm
              onSubmitted={(newItem) => {
                setItems((prev) => [newItem, ...prev])
                setShowForm(false)
                formRef.current?.focus()
              }}
              onError={(msg) => setError(msg)}
            />
          </div>
        )}

        {error && (
          <div className='border-destructive/50 text-destructive mb-4 rounded-md border p-3'>
            {error}
          </div>
        )}

        <div className='rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Từ</TableHead>
                <TableHead>Nghĩa (vi)</TableHead>
                <TableHead>Loại từ</TableHead>
                <TableHead>Phiên âm</TableHead>
                <TableHead>Ví dụ</TableHead>
                <TableHead>Bộ sưu tập</TableHead>
                <TableHead>Âm thanh</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className='py-8 text-center'>
                    <div className='flex items-center justify-center'>
                      <div className='border-primary mr-2 h-6 w-6 animate-spin rounded-full border-b-2'></div>
                      Đang tải...
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='py-8 text-center'>
                    Chưa có từ vựng nào.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((v) => (
                  <Row
                    key={v.id}
                    item={v}
                    learned={learnedIds.has(v.id)}
                    isPlaying={currentlyPlaying === v.id}
                    onToggleLearned={() =>
                      setLearnedIds((prev) => {
                        const next = new Set(prev)
                        if (next.has(v.id)) {
                          next.delete(v.id)
                        } else {
                          next.add(v.id)
                        }
                        return next
                      })
                    }
                    onPlayAudio={() => handleAudioPlay(v.id, v.audioUrl!)}
                    onPauseAudio={handleAudioPause}
                    onDelete={async () => {
                      const backup = items
                      setItems((prev) => prev.filter((i) => i.id !== v.id))
                      try {
                        await vocabApi.remove(v.id)
                        // Refresh data after successful deletion
                        setTotalElements((prev) => prev - 1)
                      } catch (e) {
                        setItems(backup)
                        setError((e as Error).message)
                      }
                    }}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-6 flex items-center justify-between'>
            <div className='text-muted-foreground text-sm'>
              Hiển thị {startItem}-{endItem} trong tổng số {totalElements} từ
              vựng
            </div>

            <div className='flex items-center gap-2'>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5</SelectItem>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>

              <span className='text-sm'>
                Trang {currentPage + 1} / {totalPages}
              </span>

              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Stats({
  learned,
  notLearned,
}: {
  learned: number
  notLearned: number
}) {
  return (
    <div className='mb-4 grid grid-cols-2 gap-3 sm:max-w-xs'>
      <div className='rounded-md border p-3'>
        <div className='text-muted-foreground text-xs'>Đã học</div>
        <div className='text-xl font-semibold'>{learned}</div>
      </div>
      <div className='rounded-md border p-3'>
        <div className='text-muted-foreground text-xs'>Chưa học</div>
        <div className='text-xl font-semibold'>{notLearned}</div>
      </div>
    </div>
  )
}

function VocabForm({
  onSubmitted,
  onError,
}: {
  onSubmitted: (item: VocabularyDTO) => void
  onError: (msg: string) => void
}) {
  const { user } = useAuth()
  const [term, setTerm] = useState('')
  const [vi, setVi] = useState('')
  const [collectionId, setCollectionId] = useState<string>('none')
  const [image, setImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  interface TransformedCollection {
    id: number
    name: string
  }

  const [collections, setCollections] = useState<TransformedCollection[]>([])
  const [loadingCollections, setLoadingCollections] = useState(false)

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoadingCollections(true)
        const list = await collectionApi.list()
        console.log('Collections loaded in VocabForm:', list)

        const transformedCollections = list.map((collection) => ({
          id: collection.id,
          name: collection.collectionName,
        }))

        console.log(
          'Transformed collections for select:',
          transformedCollections
        )
        setCollections(transformedCollections)
      } catch (error) {
        console.error('Error loading collections:', error)
      } finally {
        setLoadingCollections(false)
      }
    }
    loadCollections()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!term || !vi) {
      onError('Vui lòng nhập đầy đủ "term" và "vi"')
      return
    }

    setSubmitting(true)
    try {
      const payload: CreateVocabularyRequest = {
        term,
        vi,
        collectionId:
          collectionId !== 'none' ? Number(collectionId) : undefined,
        userId: user?.id ? Number(user.id) : undefined,
      }

      const created = await vocabApi.create(payload, image)
      onSubmitted(created)

      // Reset form
      setTerm('')
      setVi('')
      setCollectionId('none')
      setImage(null)
    } catch (e) {
      const msg = (e as Error).message
      if (msg?.includes('WORD_INVALID')) {
        onError('Từ không hợp lệ hoặc không tìm thấy trong từ điển.')
      } else {
        onError(msg || 'Có lỗi khi tạo từ vựng.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='grid grid-cols-1 gap-3 sm:grid-cols-2'
    >
      <div className='sm:col-span-1'>
        <label className='mb-1 block text-sm font-medium'>term (en) *</label>
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder='e.g., apple'
          required
        />
      </div>

      <div className='sm:col-span-1'>
        <label className='mb-1 block text-sm font-medium'>vi (nghĩa) *</label>
        <Input
          value={vi}
          onChange={(e) => setVi(e.target.value)}
          placeholder='e.g., quả táo'
          required
        />
      </div>

      <div className='sm:col-span-1'>
        <label className='mb-1 block text-sm font-medium'>Bộ sưu tập</label>
        <Select
          value={collectionId}
          onValueChange={(v) => setCollectionId(v)}
          disabled={loadingCollections}
        >
          <SelectTrigger>
            <SelectValue placeholder='Chọn bộ sưu tập (tùy chọn)' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='none'>Không chọn</SelectItem>
            {collections.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='sm:col-span-1'>
        <label className='mb-1 block text-sm font-medium'>Hình ảnh</label>
        <Input
          type='file'
          accept='image/*'
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </div>

      <div className='flex items-center gap-2 sm:col-span-2'>
        <Button type='submit' disabled={submitting}>
          <Plus /> {submitting ? 'Đang thêm...' : 'Thêm'}
        </Button>
      </div>
    </form>
  )
}

function Row({
  item,
  learned,
  isPlaying,
  onToggleLearned,
  onPlayAudio,
  onPauseAudio,
  onDelete,
}: {
  item: VocabularyDTO
  learned: boolean
  isPlaying: boolean
  onToggleLearned: () => void
  onPlayAudio: () => void
  onPauseAudio: () => void
  onDelete: () => void
}) {
  return (
    <TableRow>
      <TableCell className='font-medium'>{item.term}</TableCell>
      <TableCell>{item.vi}</TableCell>
      <TableCell>{item.type || '-'}</TableCell>
      <TableCell>{item.pronunciation || '-'}</TableCell>
      <TableCell className='max-w-[300px] truncate'>
        {item.example || '-'}
      </TableCell>
      <TableCell>{item.collectionName || item.collectionId || '-'}</TableCell>
      <TableCell>
        {item.audioUrl ? (
          <Button
            size='sm'
            variant='ghost'
            onClick={isPlaying ? onPauseAudio : onPlayAudio}
            aria-label={
              isPlaying
                ? `Dừng âm thanh cho ${item.term}`
                : `Phát âm cho ${item.term}`
            }
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant={learned ? 'secondary' : 'outline'}
            onClick={onToggleLearned}
          >
            <Layers /> {learned ? 'Đã học' : 'Đánh dấu đã học'}
          </Button>
          <Button size='sm' variant='outline'>
            <Pencil /> Sửa
          </Button>
          <Button
            size='sm'
            variant='destructive'
            onClick={onDelete}
            aria-label={`Xóa ${item.term}`}
          >
            <Trash2 /> Xóa
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
