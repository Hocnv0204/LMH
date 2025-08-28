'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAllLanguages } from '@/features/lesson-discovery/hooks/useLessonDiscovery'
import {
  useMyTopics,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
} from '@/features/user/custom-topic/hooks/useTopics'
import type {
  TopicRequest,
  TopicResponse,
} from '@/features/user/custom-topic/types/topic'
import { TopicCard } from './components/TopicCard'
import { TopicModal } from './components/TopicModal'

export default function CustomTopicsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<TopicResponse | null>(null)

  const pageSize = 20 // 5 cards per row × 4 rows

  const { data: languagesResponse, isLoading, error } = useAllLanguages()

  const { data: topicsData, isLoading: topicsLoading } = useMyTopics({
    searchTerm: searchTerm || undefined,
    languageName: selectedLanguage === 'all' ? undefined : selectedLanguage,
    page: currentPage,
    size: pageSize,
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  const createTopicMutation = useCreateTopic()
  const updateTopicMutation = useUpdateTopic()
  const deleteTopicMutation = useDeleteTopic()

  const handleCreateTopic = (data: TopicRequest, file?: File) => {
    createTopicMutation.mutate(
      { request: data, file },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false)
        },
      }
    )
  }

  const handleUpdateTopic = (data: TopicRequest, file?: File) => {
    if (!selectedTopic) return

    updateTopicMutation.mutate(
      { topicId: selectedTopic.id, request: data, file },
      {
        onSuccess: () => {
          setIsUpdateModalOpen(false)
          setSelectedTopic(null)
        },
      }
    )
  }

  const handleEditTopic = (topic: TopicResponse) => {
    setSelectedTopic(topic)
    setIsUpdateModalOpen(true)
  }

  const handleDeleteTopic = (topicId: number) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      deleteTopicMutation.mutate(topicId)
    }
  }

  const topics = topicsData?.data?.content || []
  const totalPages = topicsData?.data?.totalPages || 0
  const isFirstPage = topicsData?.data?.first ?? true
  const isLastPage = topicsData?.data?.last ?? true

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Custom Topics</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Topic
        </Button>
      </div>

      {/* Filters */}
      <div className='mb-6 flex gap-4'>
        <div className='max-w-sm flex-1'>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
            <Input
              placeholder='Search topics...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(0)
              }}
              className='pl-10'
            />
          </div>
        </div>
        <Select
          value={selectedLanguage}
          onValueChange={(value) => {
            setSelectedLanguage(value)
            setCurrentPage(0)
          }}
        >
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='All Languages' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Languages</SelectItem>
            {languagesResponse?.data.map((language) => (
              <SelectItem key={language.id} value={language.name}>
                {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Topics Grid */}
      {topicsLoading ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='bg-muted h-48 animate-pulse rounded-lg' />
          ))}
        </div>
      ) : topics.length > 0 ? (
        <>
          <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onEdit={handleEditTopic}
                onDelete={handleDeleteTopic}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2'>
              <Button
                variant='outline'
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={isFirstPage}
              >
                Previous
              </Button>
              <span className='text-muted-foreground text-sm'>
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant='outline'
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={isLastPage}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className='py-12 text-center'>
          <p className='text-muted-foreground mb-4'>No topics found</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Create Your First Topic
          </Button>
        </div>
      )}

      {/* Modals */}
      <TopicModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTopic}
        isLoading={createTopicMutation.isPending}
      />

      <TopicModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false)
          setSelectedTopic(null)
        }}
        onSubmit={handleUpdateTopic}
        topic={selectedTopic}
        isLoading={updateTopicMutation.isPending}
      />
    </div>
  )
}
