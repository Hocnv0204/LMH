import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import {
  BookOpen,
  ChevronLeft,
  Loader2,
  Play,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import { CreateLessonRequest, UpdateLessonRequest } from '@/api/lesson'
import { useLessons } from '@/hooks/use-lessons'
import { useAuth } from '@/context/auth-context'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface LessonsPageProps {
  levelId: number
  levelName: string
  languageName: string
  topicId?: number
  topicName?: string
  userId: number
}

interface LessonFormData {
  name: string
  description: string
  paragraph: string
  note?: string
}

export default function LessonsPage({
  levelId,
  levelName,
  languageName,
  topicId,
  topicName,
  userId,
}: LessonsPageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    lessons,
    loading,
    error,
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    isCreating,
    isUpdating,
    isDeleting,
  } = useLessons()

  const [selectedTopic, setSelectedTopic] = useState(topicName || '')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [deletingLesson, setDeletingLesson] = useState<any>(null)
  const [formData, setFormData] = useState<LessonFormData>({
    name: '',
    description: '',
    paragraph: '',
    note: '',
  })

  const currentUsername = user?.username || ''

  useEffect(() => {
    fetchLessons({
      userId,
      levelName,
      languageName,
      topicName: selectedTopic,
    })
  }, [userId, levelName, languageName, selectedTopic, fetchLessons])

  const handleBackToTopics = () => {
    navigate({
      to: '/user/topics',
      search: {
        levelId,
        levelName,
        languageName,
      },
    })
  }

  const handleLessonStart = (lessonId: number, lessonName: string) => {
    navigate({
      to: '/user/lesson-practice/$lessonId',
      params: { lessonId: lessonId.toString() },
      search: {
        levelId,
        levelName,
        languageName,
        ...(topicId && { topicId }),
        ...(topicName && { topicName }),
      },
    })
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTopic) {
      alert('Vui lòng chọn chủ đề')
      return
    }

    if (!currentUsername) {
      alert('Bạn cần đăng nhập để tạo bài học')
      return
    }

    try {
      const lessonData: CreateLessonRequest = {
        name: formData.name,
        description: formData.description,
        paragraph: formData.paragraph,
        note: formData.note,
        topicName: selectedTopic,
        languageRequest: { name: languageName },
        levelRequest: { name: levelName },
      }

      await createLesson(currentUsername, lessonData)
      setIsCreateDialogOpen(false)
      setFormData({ name: '', description: '', paragraph: '', note: '' })
    } catch (error) {
      console.error('Failed to create lesson:', error)
    }
  }

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLesson) return

    if (!currentUsername) {
      alert('Bạn cần đăng nhập để cập nhật bài học')
      return
    }

    try {
      const lessonData: UpdateLessonRequest = {
        name: formData.name,
        description: formData.description,
        paragraph: formData.paragraph,
        note: formData.note,
      }

      await updateLesson(currentUsername, lessonData)
      setIsEditDialogOpen(false)
      setEditingLesson(null)
      setFormData({ name: '', description: '', paragraph: '', note: '' })
    } catch (error) {
      console.error('Failed to update lesson:', error)
    }
  }

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return

    if (!currentUsername) {
      alert('Bạn cần đăng nhập để xóa bài học')
      return
    }

    try {
      await deleteLesson(currentUsername, deletingLesson.name)
      setIsDeleteDialogOpen(false)
      setDeletingLesson(null)
    } catch (error) {
      console.error('Failed to delete lesson:', error)
    }
  }

  const openEditDialog = (lesson: any) => {
    setEditingLesson(lesson)
    setFormData({
      name: lesson.name,
      description: lesson.description || '',
      paragraph: lesson.paragraph || '',
      note: lesson.note || '',
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (lesson: any) => {
    setDeletingLesson(lesson)
    setIsDeleteDialogOpen(true)
  }

  const canManageLesson = (lesson: any) => {
    return lesson.type === 'USER_CREATION'
  }

  return (
    <div className='container mx-auto max-w-6xl p-6'>
      {/* Breadcrumb Navigation */}
      <div className='mb-8 flex items-center justify-between'>
        <div className='flex items-center'>
          <Button variant='ghost' onClick={handleBackToTopics} className='mr-4'>
            <ChevronLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>Bài Học</h1>
            <p className='text-muted-foreground'>
              {languageName} - {levelName} {topicName && `- ${topicName}`}
            </p>
          </div>
        </div>

        {selectedTopic && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open)
              if (open) {
                // Reset form data when opening create dialog
                setFormData({
                  name: '',
                  description: '',
                  paragraph: '',
                  note: '',
                })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Tạo bài học
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Tạo bài học mới</DialogTitle>
                <DialogDescription>
                  Tạo bài học cho chủ đề: {selectedTopic}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLesson} className='space-y-4'>
                <div>
                  <Label htmlFor='name'>Tên bài học</Label>
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
                  <Label htmlFor='description'>Mô tả</Label>
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
                <div>
                  <Label htmlFor='paragraph'>Đoạn văn</Label>
                  <Textarea
                    id='paragraph'
                    value={formData.paragraph}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paragraph: e.target.value,
                      }))
                    }
                    rows={6}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor='note'>Ghi chú (tùy chọn)</Label>
                  <Textarea
                    id='note'
                    value={formData.note}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, note: e.target.value }))
                    }
                  />
                </div>
                <DialogFooter>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type='submit' disabled={isCreating}>
                    {isCreating && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Tạo bài học
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
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
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-2'>Đang tải bài học...</span>
        </div>
      )}

      {/* Lessons Grid */}
      {lessons.length > 0 && (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {lessons.map((lesson) => (
            <Card
              key={lesson.id}
              className='cursor-pointer transition-all duration-200 hover:shadow-lg'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>{lesson.name}</CardTitle>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={
                        lesson.status === 'ACTIVE' ? 'default' : 'secondary'
                      }
                    >
                      {lesson.status}
                    </Badge>
                    {canManageLesson(lesson) && (
                      <Badge variant='outline'>USER</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {lesson.description && (
                  <p className='text-muted-foreground mb-4 text-sm'>
                    {lesson.description}
                  </p>
                )}

                <div className='flex items-center justify-between'>
                  <Button
                    onClick={() => handleLessonStart(lesson.id, lesson.name)}
                    className='mr-2 flex-1'
                  >
                    <Play className='mr-2 h-4 w-4' />
                    Bắt đầu
                  </Button>

                  {canManageLesson(lesson) && (
                    <div className='flex gap-1'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openEditDialog(lesson)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openDeleteDialog(lesson)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingLesson(null)
            // Reset form data when closing edit dialog
            setFormData({ name: '', description: '', paragraph: '', note: '' })
          }
        }}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài học</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin bài học: {editingLesson?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateLesson} className='space-y-4'>
            <div>
              <Label htmlFor='edit-name'>Tên bài học</Label>
              <Input
                id='edit-name'
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor='edit-description'>Mô tả</Label>
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
              />
            </div>
            <div>
              <Label htmlFor='edit-paragraph'>Đoạn văn</Label>
              <Textarea
                id='edit-paragraph'
                value={formData.paragraph}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paragraph: e.target.value,
                  }))
                }
                rows={6}
                required
              />
            </div>
            <div>
              <Label htmlFor='edit-note'>Ghi chú</Label>
              <Textarea
                id='edit-note'
                value={formData.note}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, note: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsEditDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type='submit' disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bài học "{deletingLesson?.name}"? Hành
              động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteLesson}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
