'use client'

import { useState } from 'react'
import type { LessonFilters } from '@/types/lesson'
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  useLessons,
  useDeleteLesson,
  useRestoreLesson,
} from '@/features/admin/hooks/use-lessons-admin'
import { LessonDetailsModal } from './lesson-details-modal'

interface LessonsTableProps {
  filters: LessonFilters
  onFiltersChange: (filters: Partial<LessonFilters>) => void
}

export function LessonsTable({ filters, onFiltersChange }: LessonsTableProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const { data, isLoading, error } = useLessons(filters)
  const deleteMutation = useDeleteLesson()
  const restoreMutation = useRestoreLesson()

  const handleSort = (column: string) => {
    const newSortDir =
      filters.sortBy === column && filters.sortDir === 'ASC' ? 'DESC' : 'ASC'
    onFiltersChange({ sortBy: column, sortDir: newSortDir })
  }

  const handleViewDetails = (lessonId: number) => {
    setSelectedLessonId(lessonId)
    setDetailsModalOpen(true)
  }

  const handleUpdateLesson = (lessonId: number) => {
    setSelectedLessonId(lessonId)
    setDetailsModalOpen(true)
  }

  const handleDelete = (lessonId: number) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      deleteMutation.mutate(lessonId)
    }
  }

  const handleRestore = (lessonId: number) => {
    if (confirm('Are you sure you want to restore this lesson?')) {
      restoreMutation.mutate(lessonId)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center'>Loading lessons...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center text-red-500'>Failed to load lessons</div>
      </div>
    )
  }

  const lessons = data?.data?.content || []

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('name')}
                  className='h-auto p-0 font-semibold'
                >
                  Name
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('createdAt')}
                  className='h-auto p-0 font-semibold'
                >
                  Created At
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead className='w-[50px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='py-8 text-center'>
                  No lessons found
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className='font-medium'>{lesson.name}</TableCell>
                  <TableCell>{lesson.topicName}</TableCell>
                  <TableCell>{lesson.levelName}</TableCell>
                  <TableCell>{lesson.languageName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={lesson.deleteFlag ? 'destructive' : 'default'}
                    >
                      {lesson.deleteFlag ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(lesson.id)}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          View Lesson Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateLesson(lesson.id)}
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          Update Lesson
                        </DropdownMenuItem>
                        {lesson.deleteFlag ? (
                          <DropdownMenuItem
                            onClick={() => handleRestore(lesson.id)}
                          >
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Restore Lesson
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleDelete(lesson.id)}
                            className='text-red-600'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete Lesson
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LessonDetailsModal
        lessonId={selectedLessonId}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </>
  )
}
