import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import type { PageResponse } from '@/types/common'
import {
  Plus,
  Trash2,
  Pencil,
  Layers,
  SquareStack,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from 'lucide-react'
import { authService } from '@/api/auth'
import { api } from '@/api/client'
import {
  vocabApi,
  type VocabularyDTO,
  type CreateVocabularyRequest,
  type UpdateVocabularyRequest,
  WordValidationError,
} from '@/api/vocab'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { IndexTopBar } from '@/components/layout/index-top-bar'
import { VocabValidationDialog } from '@/components/vocab/VocabValidationDialog'

export const Route = createFileRoute('/vocab/')({
  component: VocabPage,
})

type SortKey = 'az' | 'za' | 'new' | 'old'

function VocabPage() {
  const [items, setItems] = useState<VocabularyDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [editingVocab, setEditingVocab] = useState<VocabularyDTO | null>(null)
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
              return 'createdAt' // Backend sẽ sort theo createdAt
            case 'az':
            case 'za':
              return 'term' // Backend sẽ sort theo term
            default:
              return 'createdAt'
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
        if (sortBy === 'new' || sortBy === 'za') {
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
  }, [user?.id, user, currentPage, pageSize, sortBy])

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

  const handleEdit = (vocab: VocabularyDTO) => {
    setEditingVocab(vocab)
  }

  const handleUpdateVocab = async (
    id: number,
    updatedData: UpdateVocabularyRequest,
    imageFile?: File | null
  ) => {
    try {
      const updated = await vocabApi.update(id, updatedData, imageFile)
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
      setEditingVocab(null)
      toast({
        title: 'Thành công',
        description: 'Cập nhật từ vựng thành công',
      })
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: (error as Error).message || 'Có lỗi khi cập nhật từ vựng',
        variant: 'destructive',
      })
    }
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
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <SquareStack /> Flashcard
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chọn Collection để học Flashcard</DialogTitle>
                </DialogHeader>
                <CollectionSelector />
              </DialogContent>
            </Dialog>

            <Button onClick={() => navigate({ to: '/quiz/setup' })}>
              <Trophy /> Quiz
            </Button>
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

        {/* Edit Vocab Dialog */}
        {editingVocab && (
          <Dialog
            open={!!editingVocab}
            onOpenChange={() => setEditingVocab(null)}
          >
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Sửa từ vựng: {editingVocab.term}</DialogTitle>
              </DialogHeader>
              <EditVocabForm
                vocab={editingVocab}
                onSubmit={(
                  updatedData: UpdateVocabularyRequest,
                  imageFile?: File | null
                ) => handleUpdateVocab(editingVocab.id, updatedData, imageFile)}
                onCancel={() => setEditingVocab(null)}
              />
            </DialogContent>
          </Dialog>
        )}

        <div className='rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Từ</TableHead>
                <TableHead>Nghĩa (vi)</TableHead>
                <TableHead>Loại từ</TableHead>
                <TableHead>Phiên âm</TableHead>
                <TableHead>Âm thanh</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className='py-8 text-center'>
                    <div className='flex items-center justify-center'>
                      <div className='border-primary mr-2 h-6 w-6 animate-spin rounded-full border-b-2'></div>
                      Đang tải...
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='py-8 text-center'>
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
                    onEdit={handleEdit}
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

  // States for validation dialog
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [validationError, setValidationError] = useState<string>('')
  const [pendingFormData, setPendingFormData] = useState<{
    payload: CreateVocabularyRequest
    image: File | null
  } | null>(null)

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

        // Lấy userId từ accessToken thay vì từ context
        const currentUser = await authService.getCurrentUser()
        const userId = Number(currentUser?.id)

        if (!userId) {
          console.warn('Không thể lấy userId từ token')
          setCollections([])
          return
        }

        // Gọi API với pagination để lấy tất cả collections
        const { data } = await api.get<
          PageResponse<{ id: number; collectionName: string }>
        >(
          `/api/collection/user/${userId}`,
          { params: { page: 0, size: 1000 } } // Lấy tất cả collections trong 1 request
        )

        console.log('Collections loaded in VocabForm (paged):', data)

        // Trích xuất danh sách từ trường content của Page response
        const transformedCollections = (data.content || []).map(
          (collection) => ({
            id: collection.id,
            name: collection.collectionName,
          })
        )

        console.log(
          'Transformed collections for select:',
          transformedCollections
        )
        setCollections(transformedCollections)
      } catch (error) {
        console.error('Error loading collections:', error)
        setCollections([]) // Set empty array on error
      } finally {
        setLoadingCollections(false)
      }
    }

    loadCollections()
  }, [])

  // Helper function to create vocabulary
  const createVocabulary = async (
    payload: CreateVocabularyRequest,
    imageFile: File | null
  ) => {
    const created = await vocabApi.create(payload, imageFile)
    onSubmitted(created)

    // Reset form
    setTerm('')
    setVi('')
    setCollectionId('none')
    setImage(null)
    setPendingFormData(null)
    setValidationError('')
  }

  // Handle validation dialog confirmation
  const handleValidationConfirm = async () => {
    if (!pendingFormData) return

    setSubmitting(true)
    try {
      // Add forceAdd = true to the payload
      const payloadWithForceAdd = {
        ...pendingFormData.payload,
        forceAdd: true,
      }

      await createVocabulary(payloadWithForceAdd, pendingFormData.image)
      setShowValidationDialog(false)
    } catch (e) {
      const msg = (e as Error).message
      onError(msg || 'Có lỗi khi tạo từ vựng.')
      setShowValidationDialog(false)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle validation dialog cancellation
  const handleValidationCancel = () => {
    setPendingFormData(null)
    setValidationError('')
    setSubmitting(false)
  }

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

      await createVocabulary(payload, image)
    } catch (e) {
      console.log('Caught error in handleSubmit:', e) // Debug log
      console.log('Error type:', typeof e) // Debug log
      console.log('Is WordValidationError?', e instanceof WordValidationError) // Debug log

      if (e instanceof WordValidationError) {
        console.log('Showing validation dialog') // Debug log
        // Store form data and show validation dialog
        setPendingFormData({
          payload: {
            term,
            vi,
            collectionId:
              collectionId !== 'none' ? Number(collectionId) : undefined,
            userId: user?.id ? Number(user.id) : undefined,
          },
          image,
        })
        setValidationError(e.message)
        setShowValidationDialog(true)
      } else {
        console.log('Showing regular error') // Debug log
        const msg = (e as Error).message
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

      {/* Validation Dialog */}
      <VocabValidationDialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        onConfirm={handleValidationConfirm}
        onCancel={handleValidationCancel}
        term={term}
        errorMessage={validationError}
      />
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
  onEdit,
}: {
  item: VocabularyDTO
  learned: boolean
  isPlaying: boolean
  onToggleLearned: () => void
  onPlayAudio: () => void
  onPauseAudio: () => void
  onDelete: () => void
  onEdit: (vocab: VocabularyDTO) => void
}) {
  return (
    <TableRow>
      <TableCell className='font-medium'>{item.term}</TableCell>
      <TableCell>{item.vi}</TableCell>
      <TableCell>{item.type || '-'}</TableCell>
      <TableCell>{item.pronunciation || '-'}</TableCell>
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
          <Button size='sm' variant='outline' onClick={() => onEdit(item)}>
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

// Component chọn collection để học flashcard
function CollectionSelector() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')
  const [collections, setCollections] = useState<
    { id: number; name: string }[]
  >([])
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [loadingVocab, setLoadingVocab] = useState(false)
  const [vocabCount, setVocabCount] = useState<number | null>(null)

  // Load danh sách collections
  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoadingCollections(true)
        const currentUser = await authService.getCurrentUser()
        const userId = Number(currentUser?.id)

        if (!userId) {
          console.warn('Không thể lấy userId từ token')
          setCollections([])
          return
        }

        const { data } = await api.get<
          PageResponse<{ id: number; collectionName: string }>
        >(`/api/collection/user/${userId}`, { params: { page: 0, size: 1000 } })

        const transformedCollections = (data.content || []).map(
          (collection) => ({
            id: collection.id,
            name: collection.collectionName,
          })
        )

        setCollections(transformedCollections)
      } catch (error) {
        console.error('Error loading collections:', error)
        setCollections([])
      } finally {
        setLoadingCollections(false)
      }
    }

    loadCollections()
  }, [])

  // Load số lượng vocab khi chọn collection
  useEffect(() => {
    if (!selectedCollectionId) {
      setVocabCount(null)
      return
    }

    const loadVocabCount = async () => {
      try {
        setLoadingVocab(true)
        const vocabList = await vocabApi.getByCollectionId(
          Number(selectedCollectionId)
        )
        setVocabCount(vocabList.length)
      } catch (error) {
        console.error('Error loading vocab count:', error)
        setVocabCount(0)
      } finally {
        setLoadingVocab(false)
      }
    }

    loadVocabCount()
  }, [selectedCollectionId])

  const handleStartFlashcard = () => {
    if (selectedCollectionId && vocabCount && vocabCount > 0) {
      // Chuyển hướng đến trang flashcard với collection ID
      window.location.href = `/vocab/flashcard?collection=${selectedCollectionId}`
    }
  }

  return (
    <div className='space-y-4'>
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
            <SelectValue placeholder='Chọn collection để học flashcard' />
          </SelectTrigger>
          <SelectContent>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={String(collection.id)}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCollectionId && (
        <div className='rounded-md border p-3'>
          {loadingVocab ? (
            <div className='text-muted-foreground text-sm'>
              Đang đếm từ vựng...
            </div>
          ) : vocabCount !== null ? (
            <div className='text-sm'>
              <span className='font-medium'>
                Collection này có {vocabCount} từ vựng
              </span>
              {vocabCount === 0 && (
                <div className='text-destructive mt-2 text-xs'>
                  Collection này chưa có từ vựng nào. Vui lòng chọn collection
                  khác.
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      <div className='flex justify-end gap-2'>
        <Button
          onClick={handleStartFlashcard}
          disabled={!selectedCollectionId || !vocabCount || vocabCount === 0}
        >
          Bắt đầu học Flashcard
        </Button>
      </div>
    </div>
  )
}

// Component form sửa từ vựng
export function EditVocabForm({
  vocab,
  onSubmit,
  onCancel,
}: {
  vocab: VocabularyDTO
  onSubmit: (data: UpdateVocabularyRequest, imageFile?: File | null) => void
  onCancel: () => void
}) {
  const [term, setTerm] = useState(vocab.term)
  const [vi, setVi] = useState(vocab.vi)
  const [type, setType] = useState(vocab.type || '')
  const [example, setExample] = useState(vocab.example || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(vocab.imageUrl || '')
  const [collectionId, setCollectionId] = useState<string>(
    vocab.collectionId ? String(vocab.collectionId) : 'none'
  )
  const [collections, setCollections] = useState<
    { id: number; name: string }[]
  >([])
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load danh sách collections
  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoadingCollections(true)
        const currentUser = await authService.getCurrentUser()
        const userId = Number(currentUser?.id)

        if (!userId) {
          console.warn('Không thể lấy userId từ token')
          setCollections([])
          return
        }

        const { data } = await api.get<
          PageResponse<{ id: number; collectionName: string }>
        >(`/api/collection/user/${userId}`, { params: { page: 0, size: 1000 } })

        const transformedCollections = (data.content || []).map(
          (collection) => ({
            id: collection.id,
            name: collection.collectionName,
          })
        )

        setCollections(transformedCollections)
      } catch (error) {
        console.error('Error loading collections:', error)
        setCollections([])
      } finally {
        setLoadingCollections(false)
      }
    }

    loadCollections()
  }, [])

  // Reset image state when vocab changes
  useEffect(() => {
    setImageFile(null)
    setImagePreview(vocab.imageUrl || '')
  }, [vocab.id, vocab.imageUrl]) // Reset khi vocab thay đổi

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Tạo preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImageFile(null)
      setImagePreview(vocab.imageUrl || '')
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    // Giữ lại ảnh cũ để hiển thị preview, nhưng không gửi ảnh mới
    setImagePreview(vocab.imageUrl || '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitting(true)
    try {
      const updatedData: UpdateVocabularyRequest = {
        type: type || undefined,
        vi,
        example: example || undefined,
        collectionId:
          collectionId !== 'none' ? Number(collectionId) : undefined,
      }

      // Chỉ gửi image file nếu user thực sự chọn ảnh mới
      // Nếu imageFile là null (không có ảnh mới), chỉ gửi JSON data
      console.log('Submitting with imageFile:', imageFile)
      console.log('Submitting with updatedData:', updatedData)
      onSubmit(updatedData, imageFile || undefined)
    } catch (error) {
      console.error('Error updating vocab:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='mb-2 block text-sm font-medium'>Từ (term)</label>
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            disabled
            className='bg-muted'
          />
          <p className='text-muted-foreground mt-1 text-xs'>
            Không thể sửa từ gốc
          </p>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium'>
            Loại từ (type)
          </label>
          <Input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder='noun, verb, adjective...'
          />
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>
          Nghĩa tiếng Việt (vi) *
        </label>
        <Input
          value={vi}
          onChange={(e) => setVi(e.target.value)}
          placeholder='Nhập nghĩa tiếng Việt'
          required
        />
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>
          Ví dụ (example)
        </label>
        <Textarea
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder='Nhập ví dụ sử dụng từ này'
          rows={3}
        />
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>Ảnh (image)</label>
        <div className='space-y-3'>
          <div className='flex gap-2'>
            <Input
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              className='flex-1'
            />
            {imagePreview && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleRemoveImage}
                className='shrink-0'
              >
                Xóa ảnh
              </Button>
            )}
          </div>

          {imagePreview && (
            <div className='mt-2'>
              <label className='text-muted-foreground mb-2 block text-sm font-medium'>
                Xem trước ảnh:
              </label>
              <div className='border-border/20 bg-muted/20 relative h-32 w-32 overflow-hidden rounded-lg border'>
                <img
                  src={imagePreview}
                  alt='Preview'
                  className='h-full w-full object-cover'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement!
                    parent.innerHTML =
                      '<div class="flex h-full w-full items-center justify-center text-muted-foreground text-sm">Ảnh không hợp lệ</div>'
                  }}
                />
              </div>
              <p className='text-muted-foreground mt-1 text-xs'>
                Ảnh sẽ được hiển thị ở mặt trước của flashcard
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>Collection</label>
        <Select
          value={collectionId}
          onValueChange={setCollectionId}
          disabled={loadingCollections}
        >
          <SelectTrigger>
            <SelectValue placeholder='Chọn collection' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='none'>Không chọn</SelectItem>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={String(collection.id)}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Hủy
        </Button>
        <Button type='submit' disabled={submitting || !vi.trim()}>
          {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  )
}
