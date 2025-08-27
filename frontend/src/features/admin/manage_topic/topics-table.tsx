'use client'

import { useState } from 'react'
import type { AdminTopicResponse, TopicFilters } from '@/types/topic'
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
  useTopicsAdmin,
  useDeleteTopic,
  useRestoreTopic,
} from '@/features/admin/hooks/use-topics-admin'
import { TopicDetailsModal } from './topic-details-modal'

interface TopicsTableProps {
  filters: TopicFilters
  onFiltersChange: (filters: Partial<TopicFilters>) => void
  onEditTopic: (topic: AdminTopicResponse) => void
}

export function TopicsTable({
  filters,
  onFiltersChange,
  onEditTopic,
}: TopicsTableProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const { data, isLoading, error } = useTopicsAdmin(filters)
  const deleteMutation = useDeleteTopic()
  const restoreMutation = useRestoreTopic()

  const handleSort = (column: string) => {
    const newSortDir =
      filters.sortBy === column && filters.sortDir === 'ASC' ? 'DESC' : 'ASC'
    onFiltersChange({ sortBy: column, sortDir: newSortDir })
  }

  const handleViewDetails = (topicId: number) => {
    setSelectedTopicId(topicId)
    setDetailsModalOpen(true)
  }

  const handleDelete = (topicId: number) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      deleteMutation.mutate(topicId)
    }
  }

  const handleRestore = (topicId: number) => {
    if (confirm('Are you sure you want to restore this topic?')) {
      restoreMutation.mutate(topicId)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center'>Loading topics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center text-red-500'>Failed to load topics</div>
      </div>
    )
  }

  const topics = data?.data?.content || []

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
              <TableHead>Description</TableHead>
              <TableHead>Lesson</TableHead>
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
            {topics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='py-8 text-center'>
                  No topics found
                </TableCell>
              </TableRow>
            ) : (
              topics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className='font-medium'>{topic.name}</TableCell>
                  <TableCell className='max-w-xs truncate'>
                    {topic.description || '-'}
                  </TableCell>
                  <TableCell>{topic.lessonCount}</TableCell>
                  <TableCell>{topic.languageName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={topic.deleteFlag ? 'destructive' : 'default'}
                    >
                      {topic.deleteFlag ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(topic.createdAt).toLocaleDateString()}
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
                          onClick={() => handleViewDetails(topic.id)}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditTopic(topic)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Update Topic
                        </DropdownMenuItem>
                        {topic.deleteFlag ? (
                          <DropdownMenuItem
                            onClick={() => handleRestore(topic.id)}
                          >
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Restore Topic
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleDelete(topic.id)}
                            className='text-red-600'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete Topic
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

      <TopicDetailsModal
        topicId={selectedTopicId}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </>
  )
}
