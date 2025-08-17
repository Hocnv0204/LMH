import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { PageResponse } from '@/types/common'
import { Plus, Trash2, Pencil, ArrowLeft } from 'lucide-react'
import { authService } from '@/api/auth'
import { api } from '@/api/client'
import { collectionApi, type CollectionDTO } from '@/api/collection'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IndexTopBar } from '@/components/layout/index-top-bar'

export const Route = createFileRoute('/collections/')({
  component: CollectionsPage,
})

function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingCollection, setEditingCollection] =
    useState<CollectionDTO | null>(null)
  const [deletingCollection, setDeletingCollection] =
    useState<CollectionDTO | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async (page = 0, size = 10) => {
    setIsLoading(true)
    setError(null)
    try {
      const currentUser = await authService.getCurrentUser()
      const userId = Number(currentUser?.id)
      if (!userId) {
        throw new Error('Không xác định được người dùng từ token')
      }

      const { data } = await api.get<PageResponse<CollectionDTO>>(
        `/api/collection/user/${userId}`,
        { params: { page, size } }
      )

      const transformedCollections = (data.content || []).map((collection) => ({
        id: collection.id,
        collectionName: collection.collectionName,
        vocabularyDTOList: collection.vocabularyDTOList || [],
      }))

      setCollections(transformedCollections)
    } catch (e) {
      const msg = (e as Error)?.message || 'Không thể tải danh sách chủ đề.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (collectionName: string) => {
    try {
      const currentUser = await authService.getCurrentUser()
      const userId = Number(currentUser?.id)
      if (!userId) throw new Error('Không xác định được người dùng từ token')
      const created = await collectionApi.create({ userId, collectionName })
      // Transform created collection too
      const transformedCreated = {
        id: created.id,
        collectionName: created.collectionName,
        vocabularyDTOList: created.vocabularyDTOList || [],
      }
      setCollections((prev) => [transformedCreated, ...prev])
      setShowCreateDialog(false)
    } catch (e) {
      const msg = (e as Error).message
      if (msg?.includes('COLLECTION_EXISTS')) {
        toast({
          title: 'Lỗi',
          description: 'Tên chủ đề đã tồn tại',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Lỗi',
          description: msg || 'Có lỗi khi tạo chủ đề',
          variant: 'destructive',
        })
      }
    }
  }

  const handleUpdate = async (id: number, collectionName: string) => {
    try {
      const updated = await collectionApi.update(id, { collectionName })
      // Transform updated collection
      const transformedUpdated = {
        id: updated.id,
        collectionName: updated.collectionName,
        vocabularyDTOList: updated.vocabularyDTOList || [],
      }
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? transformedUpdated : c))
      )
      setEditingCollection(null)
      toast({
        title: 'Thành công',
        description: 'Cập nhật chủ đề thành công',
      })
    } catch (e) {
      const msg = (e as Error).message
      toast({
        title: 'Lỗi',
        description: msg || 'Có lỗi khi cập nhật chủ đề',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await collectionApi.remove(id)
      setCollections((prev) => prev.filter((c) => c.id !== id))
      setDeletingCollection(null)
      toast({
        title: 'Thành công',
        description: 'Xóa chủ đề thành công',
      })
    } catch (e) {
      const msg = (e as Error).message
      toast({
        title: 'Lỗi',
        description: msg || 'Có lỗi khi xóa chủ đề',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='bg-background min-h-screen'>
      <IndexTopBar />

      <main className='mx-auto max-w-6xl px-4 py-8'>
        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => window.history.back()}
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Quay lại Vocab
            </Button>
            <h2 className='text-2xl font-bold'>Chủ đề từ vựng</h2>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> Tạo chủ đề
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo chủ đề mới</DialogTitle>
              </DialogHeader>
              <CreateCollectionForm
                onSubmit={handleCreate}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className='border-destructive/50 text-destructive mb-4 rounded-md border p-3'>
            {error}
          </div>
        )}

        <div className='rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên chủ đề</TableHead>
                <TableHead>Số lượng từ vựng</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3}>Đang tải...</TableCell>
                </TableRow>
              ) : collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>Chưa có chủ đề nào.</TableCell>
                </TableRow>
              ) : (
                collections.map((collection) => (
                  <Row
                    key={collection.id}
                    collection={collection}
                    onEdit={() => setEditingCollection(collection)}
                    onDelete={() => setDeletingCollection(collection)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        {editingCollection && (
          <Dialog
            open={!!editingCollection}
            onOpenChange={() => setEditingCollection(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sửa chủ đề</DialogTitle>
              </DialogHeader>
              <EditCollectionForm
                collection={editingCollection}
                onSubmit={(name) => handleUpdate(editingCollection.id, name)}
                onCancel={() => setEditingCollection(null)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation */}
        {deletingCollection && (
          <AlertDialog
            open={!!deletingCollection}
            onOpenChange={() => setDeletingCollection(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa chủ đề "
                  {deletingCollection.collectionName}"? Hành động này không thể
                  hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(deletingCollection.id)}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </main>
    </div>
  )
}

function CreateCollectionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      await onSubmit(name.trim())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='mb-1 block text-sm font-medium'>Tên chủ đề *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Nhập tên chủ đề'
          required
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Hủy
        </Button>
        <Button type='submit' disabled={submitting || !name.trim()}>
          {submitting ? 'Đang tạo...' : 'Tạo'}
        </Button>
      </div>
    </form>
  )
}

function EditCollectionForm({
  collection,
  onSubmit,
  onCancel,
}: {
  collection: CollectionDTO
  onSubmit: (name: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(collection.collectionName)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name === collection.collectionName) return

    setSubmitting(true)
    try {
      await onSubmit(name.trim())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='mb-1 block text-sm font-medium'>Tên chủ đề *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Nhập tên chủ đề'
          required
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Hủy
        </Button>
        <Button
          type='submit'
          disabled={
            submitting || !name.trim() || name === collection.collectionName
          }
        >
          {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </div>
    </form>
  )
}

function Row({
  collection,
  onEdit,
  onDelete,
}: {
  collection: CollectionDTO
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <TableRow>
      <TableCell>
        <span className='text-primary font-medium'>
          {collection.collectionName}
        </span>
      </TableCell>
      <TableCell>{collection.vocabularyDTOList?.length || 0}</TableCell>
      <TableCell>
        <div className='flex items-center gap-2'>
          <Button size='sm' variant='outline' onClick={onEdit}>
            <Pencil className='mr-2 h-4 w-4' />
            Sửa
          </Button>
          <Button size='sm' variant='destructive' onClick={onDelete}>
            <Trash2 className='mr-2 h-4 w-4' />
            Xóa
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
