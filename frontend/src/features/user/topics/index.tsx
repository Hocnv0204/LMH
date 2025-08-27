import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import {
  BookOpen,
  ChevronLeft,
  Loader2,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useTopics } from '@/hooks/use-topics'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface TopicsPageProps {
  levelId: number
  levelName: string
  languageName: string
}

interface TopicFormData {
  name: string
  description: string
  languageName: string
  levelName: string
}

export default function TopicsPage({
  levelId,
  levelName,
  languageName,
}: TopicsPageProps) {
  const navigate = useNavigate()
  const {
    topics,
    loading,
    error,
    fetchTopics,
    createTopic,
    updateTopic,
    deleteTopic,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTopics()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<any>(null)
  const [deletingTopic, setDeletingTopic] = useState<any>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState<TopicFormData>({
    name: '',
    description: '',
    languageName: languageName,
    levelName: levelName,
  })
  const { user } = useAuth()
  
  useEffect(() => {
    fetchTopics({
      levelName,
      languageName,
      userId: Number(user?.id), // Use user ID or default to 1
    })
  }, [levelName, languageName, fetchTopics])

  const handleBackToLevels = () => {
    navigate({ to: '/user/level' })
  }

  const handleTopicSelect = (topicId: number, topicName: string) => {
    navigate({
      to: '/user/lessons',
      search: {
        levelId,
        levelName,
        languageName,
        topicId,
        topicName,
      },
    })
  }

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTopic(user?.username || 'Student', {
        name: formData.name,
        description: formData.description,
        languageRequest: { name: formData.languageName },
        levelRequest: { name: formData.levelName },
      })
      setIsCreateDialogOpen(false)
      setFormData({ name: '', description: '', languageName, levelName })
    } catch (error) {
      console.error('Failed to create topic:', error)
    }
  }

  const handleEditTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTopic) return

    // Check if name already exists (excluding current topic)
    const nameExists = topics.some(
      (topic) =>
        topic.name.toLowerCase() === formData.name.toLowerCase() &&
        topic.id !== editingTopic.id
    )

    if (nameExists) {
      setFormError(
        `Tên chủ đề "${formData.name}" đã tồn tại. Vui lòng chọn tên khác.`
      )
      return
    }

    try {
      await updateTopic(user?.username || 'Student', {
        name: formData.name,
        description: formData.description,
        levelRequest: { name: formData.levelName },
        originalName: editingTopic.name, // Pass the original name for backend identification
      })
      setIsEditDialogOpen(false)
      setEditingTopic(null)
      setFormError(null)

      // Refresh the topics list to ensure we have the latest data
      await fetchTopics({
        levelName,
        languageName,
        userId: 1, // Use user ID or default to 1
      })
    } catch (error) {
      console.error('Failed to update topic:', error)
      setFormError('Không thể cập nhật chủ đề. Vui lòng thử lại.')
    }
  }

  const handleDeleteTopic = async () => {
    if (!deletingTopic) return

    try {
      await deleteTopic(user?.username || 'Student', deletingTopic.name)
      setIsDeleteDialogOpen(false)
      setDeletingTopic(null)
    } catch (error) {
      console.error('Failed to delete topic:', error)
    }
  }

  const openEditDialog = (topic: any) => {
    setEditingTopic(topic)
    setFormData({
      name: topic.name,
      description: topic.description,
      languageName: languageName,
      levelName: levelName,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (topic: any) => {
    setDeletingTopic(topic)
    setIsDeleteDialogOpen(true)
  }

  const canModifyTopic = (topic: any) => {
    // More robust type checking
    const topicType = topic.type?.toString().trim().toUpperCase()
    const canModify = topicType === 'USER_CREATION'

    return canModify
  }

  return (
    <div className='container mx-auto max-w-6xl p-6'>
      {/* Breadcrumb Navigation */}
      <div className='mb-8 flex items-center justify-between'>
        <div className='flex items-center'>
          <Button variant='ghost' onClick={handleBackToLevels} className='mr-4'>
            <ChevronLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>Chọn Chủ Đề</h1>
            <p className='text-muted-foreground'>
              {languageName} - {levelName}
            </p>
          </div>
        </div>

        {/* Create Topic Button */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Tạo Chủ Đề
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Chủ Đề Mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTopic} className='space-y-4'>
              <div>
                <Label htmlFor='name'>Tên Chủ Đề</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='description'>Mô Tả</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className='flex gap-4'>
                <Button type='submit' disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : null}
                  Tạo
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {error && (
        <Alert className='mb-6' variant='destructive'>
          <AlertDescription>Lỗi: {error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='mr-3 h-8 w-8 animate-spin' />
          <span className='text-lg'>Đang tải chủ đề...</span>
        </div>
      )}

      {/* No Results */}
      {!loading && topics.length === 0 && !error && (
        <div className='py-12 text-center'>
          <BookOpen className='text-muted-foreground mx-auto mb-4 h-16 w-16' />
          <h3 className='mb-2 text-xl font-semibold'>Chưa có chủ đề</h3>
          <p className='text-muted-foreground'>
            Hiện tại chưa có chủ đề nào cho cấp độ "{levelName}" trong ngôn ngữ
            "{languageName}".
          </p>
        </div>
      )}

      {/* Topics Grid */}
      {topics.length > 0 && (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className='relative cursor-pointer transition-all duration-200 hover:shadow-lg'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle
                    className='text-lg'
                    onClick={() => handleTopicSelect(topic.id, topic.name)}
                  >
                    {topic.name}
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={
                        topic.type === 'DEFAULT' ? 'secondary' : 'default'
                      }
                    >
                      {topic.type === 'DEFAULT' ? 'Mặc định' : 'Tự tạo'}
                    </Badge>

                    {canModifyTopic(topic) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                          >
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(topic)}
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(topic)}
                            className='text-red-600'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {/* Temporary: Show dropdown for all topics to test rendering */}
                    {!canModifyTopic(topic) && (
                      <div className='text-muted-foreground text-xs'>
                        (Default topic)
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent
                onClick={() => handleTopicSelect(topic.id, topic.name)}
              >
                {topic.description && (
                  <p className='text-muted-foreground mb-4 text-sm'>
                    {topic.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Topic Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Chủ Đề</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTopic} className='space-y-4'>
            <div>
              <Label htmlFor='edit-name'>Tên Chủ Đề</Label>
              <Input
                id='edit-name'
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                placeholder='Nhập tên chủ đề'
              />
              {formData.name.trim() === '' && (
                <p className='mt-1 text-sm text-red-600'>
                  Tên chủ đề không được để trống
                </p>
              )}
            </div>
            <div>
              <Label htmlFor='edit-description'>Mô Tả</Label>
              <Textarea
                id='edit-description'
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
                placeholder='Nhập mô tả chủ đề'
              />
              {formData.description.trim() === '' && (
                <p className='mt-1 text-sm text-red-600'>
                  Mô tả không được để trống
                </p>
              )}
            </div>
            <div className='flex gap-4'>
              <Button
                type='submit'
                disabled={
                  isUpdating ||
                  !formData.name.trim() ||
                  !formData.description.trim()
                }
              >
                {isUpdating ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Cập nhật
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setFormError(null) // Clear errors when closing
                }}
              >
                Hủy
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác Nhận Xóa</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground mb-4 text-sm'>
            Bạn có chắc chắn muốn xóa chủ đề "{deletingTopic?.name}"? Hành động
            này không thể hoàn tác.
          </p>
          <div className='flex gap-4'>
            <Button
              variant='destructive'
              onClick={handleDeleteTopic}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Xóa
            </Button>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
