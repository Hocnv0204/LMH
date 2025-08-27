'use client'

import { useState } from 'react'
import type {
  TopicFilters,
  AdminTopicResponse,
  AdminCreateTopicRequest,
  AdminUpdateTopicRequest,
} from '@/types/topic'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminPagination } from '@/features/admin/components/admin-pagination'
import { Header } from '@/features/admin/components/header'
import { useAvailableLanguages } from '@/features/admin/hooks/use-languages-admin'
import {
  useTopicsAdmin,
  useCreateTopic,
  useUpdateTopic,
} from '@/features/admin/hooks/use-topics-admin'
import { TopicForm } from './topic-form'
import { TopicsTable } from './topics-table'

export default function TopicsManagementPage() {
  const [filters, setFilters] = useState<TopicFilters>({
    searchTerm: '',
    languageName: '',
    isDeleted: undefined,
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  const { data: languagesData } = useAvailableLanguages()
  const languages = languagesData?.data || []

  const [searchInput, setSearchInput] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<AdminTopicResponse | null>(
    null
  )

  const { data } = useTopicsAdmin(filters)
  const createMutation = useCreateTopic()
  const updateMutation = useUpdateTopic()

  const handleFiltersChange = (newFilters: Partial<TopicFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))
  }

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, searchTerm: searchInput, page: 0 }))
  }

  const handleLanguageChange = (language: string) => {
    const languageName = language === 'all' ? undefined : language
    setFilters((prev) => ({ ...prev, languageName, page: 0 }))
  }

  const handleStatusChange = (status: string) => {
    let isDeleted: boolean | undefined
    if (status === 'active') isDeleted = false
    else if (status === 'deleted') isDeleted = true
    else isDeleted = undefined

    setFilters((prev) => ({ ...prev, isDeleted, page: 0 }))
  }

  const handleCreateTopic = (request: AdminCreateTopicRequest, file?: File) => {
    createMutation.mutate(
      { request, file },
      {
        onSuccess: () => {
          setCreateModalOpen(false)
        },
      }
    )
  }

  const handleUpdateTopic = (request: AdminUpdateTopicRequest, file?: File) => {
    if (!editingTopic) return

    updateMutation.mutate(
      { topicId: editingTopic.id, request, file },
      {
        onSuccess: () => {
          setEditModalOpen(false)
          setEditingTopic(null)
        },
      }
    )
  }

  const handleEditTopic = (topic: AdminTopicResponse) => {
    setEditingTopic(topic)
    setEditModalOpen(true)
  }

  return (
    <div className='container mx-auto space-y-4 pb-10'>
      <Header className='sticky top-0 z-10'>
        <div className='flex flex-1 items-center justify-between'>
          <h1 className='text-3xl font-bold'>Topic Management</h1>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Create Topic
          </Button>
        </div>
      </Header>

      {/* Global Language Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Language Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={
              filters.languageName ? filters.languageName.toString() : 'all'
            }
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Languages</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.name}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Status and Search */}
      <Card>
        <CardContent className='pt-2'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='flex flex-1 gap-2'>
              <Input
                placeholder='Search topics...'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size='icon'>
                <Search className='h-4 w-4' />
              </Button>
            </div>

            <Select
              value={
                filters.isDeleted === undefined
                  ? 'all'
                  : filters.isDeleted
                    ? 'deleted'
                    : 'active'
              }
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className='w-[150px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='deleted'>Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <Card>
        <CardContent className='pt-6'>
          <TopicsTable
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onEditTopic={handleEditTopic}
          />

          {data?.data && (
            <div className='mt-4'>
              <AdminPagination
                pageData={data.data}
                currentPage={filters.page}
                pageSize={filters.size}
                onPageChange={(page) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
                onPageSizeChange={(size) =>
                  setFilters((prev) => ({ ...prev, size, page: 0 }))
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Topic Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create New Topic</DialogTitle>
          </DialogHeader>
          <TopicForm
            onSubmit={(data, file) => {
              handleCreateTopic(data as AdminCreateTopicRequest, file)
            }}
            onCancel={() => setCreateModalOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Topic Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Update Topic</DialogTitle>
          </DialogHeader>
          <TopicForm
            topic={editingTopic || undefined}
            onSubmit={handleUpdateTopic}
            onCancel={() => {
              setEditModalOpen(false)
              setEditingTopic(null)
            }}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
