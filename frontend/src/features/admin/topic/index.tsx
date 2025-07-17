import { useState } from 'react'
import { MoreHorizontal, Plus } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { ThemeSwitch } from '@/components/theme-switch'
import { TopicForm } from './topic-form'

type Topic = {
  id: string
  name: string
  description: string
  imageUrl?: string
  lessonCount: number
  displayOrder: 'high' | 'medium' | 'low'
  status: 'active' | 'inactive'
  createdAt: Date
}

const initialTopics: Topic[] = [
  {
    id: 'topic-1',
    name: 'Thời tiết',
    description:
      'Các bài học về từ vựng và mẫu câu liên quan đến chủ đề thời tiết, khí hậu.',
    imageUrl: '/placeholder.svg?height=64&width=64',
    lessonCount: 12,
    displayOrder: 'low',
    status: 'active',
    createdAt: new Date('2024-10-15'),
  },
  {
    id: 'topic-2',
    name: 'Giao thông',
    description:
      'Học về các phương tiện giao thông, luật lệ và cách hỏi đường.',
    imageUrl: '/placeholder.svg?height=64&width=64',
    lessonCount: 8,
    displayOrder: 'high',
    status: 'active',
    createdAt: new Date('2024-09-28'),
  },
  {
    id: 'topic-3',
    name: 'Mua sắm',
    description:
      'Từ vựng và hội thoại khi đi mua sắm quần áo, thực phẩm và các mặt hàng khác.',
    imageUrl: '/placeholder.svg?height=64&width=64',
    lessonCount: 15,
    displayOrder: 'medium',
    status: 'inactive',
    createdAt: new Date('2024-08-01'),
  },
]

export default function TopicManagementPage() {
  const [topics, setTopics] = useState<Topic[]>(initialTopics)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null)

  const handleAddTopic = (data: Omit<Topic, 'id' | 'createdAt'>) => {
    const newTopic: Topic = {
      ...data,
      id: `topic-${Date.now()}`,
      createdAt: new Date(),
    }
    setTopics((prev) => [...prev, newTopic])
    setIsAddDialogOpen(false)
  }

  const handleEditTopic = (data: Omit<Topic, 'id' | 'createdAt'>) => {
    if (!editingTopic) return

    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === editingTopic.id ? { ...topic, ...data } : topic
      )
    )
    setEditingTopic(null)
  }

  const handleDeleteTopic = () => {
    if (!deletingTopic) return

    setTopics((prev) => prev.filter((topic) => topic.id !== deletingTopic.id))
    setDeletingTopic(null)
  }

  const handleToggleStatus = (topic: Topic) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topic.id
          ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' }
          : t
      )
    )
  }

  const truncateText = (text: string, maxLength = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className='container mx-auto space-y-6'>
      {/* Header */}
      <Header>
        <div>
          <h1 className='text-xl font-bold'>Manage Topic</h1>
        </div>
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
        </div>
      </Header>
      <div className='flex items-center justify-between px-4'>
        <h1 className='text-3xl font-bold'>List Topic</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              New Topic
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>New Topic</DialogTitle>
            </DialogHeader>
            <TopicForm onSubmit={handleAddTopic} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Topics Table */}
      <div className='mx-4 rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ảnh</TableHead>
              <TableHead>Tên Chủ đề</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Số bài học</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className='w-[70px]'>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage
                      src={topic.imageUrl || '/placeholder.svg'}
                      alt={topic.name}
                    />
                    <AvatarFallback>{topic.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className='font-medium'>{topic.name}</TableCell>
                <TableCell>{truncateText(topic.description)}</TableCell>
                <TableCell>{topic.lessonCount}</TableCell>
                <TableCell>{formatDate(topic.createdAt)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      topic.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {topic.status === 'active'
                      ? 'Đang hoạt động'
                      : 'Không hoạt động'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' className='h-8 w-8 p-0'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => setEditingTopic(topic)}>
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(topic)}
                      >
                        {topic.status === 'active'
                          ? 'Vô hiệu hóa'
                          : 'Kích hoạt'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-red-600'
                        onClick={() => setDeletingTopic(topic)}
                      >
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Topic Dialog */}
      <Dialog
        open={!!editingTopic}
        onOpenChange={(open) => !open && setEditingTopic(null)}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Chủ đề: {editingTopic?.name}</DialogTitle>
          </DialogHeader>
          {editingTopic && (
            <TopicForm initialData={editingTopic} onSubmit={handleEditTopic} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTopic}
        onOpenChange={(open) => !open && setDeletingTopic(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Chủ đề này sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTopic}
              className='bg-red-600 hover:bg-red-700'
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
