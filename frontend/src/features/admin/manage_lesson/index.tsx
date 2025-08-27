'use client'

import React from 'react'
import { useState } from 'react'
import type { LessonFilters, AdminCreateLessonRequest } from '@/types/lesson'
import { Plus, Search, BookOpen } from 'lucide-react'
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
import {
  useLessons,
  useGenerateLessonWithAI,
  useAvailableLanguages,
  useTopicsByLanguage,
  useLevelsByLanguage,
} from '@/features/admin/hooks/use-lessons-admin'
import { LessonForm } from './lesson-form'
import { LessonsTable } from './lessons-table'

export default function LessonsManagementPage() {
  const { data: languagesData } = useAvailableLanguages()

  // Find English language ID for default
  const englishLanguage = languagesData?.data?.find(
    (lang) => lang.name.toLowerCase() === 'english'
  )
  const defaultLanguageId = englishLanguage?.id || 1

  const [filters, setFilters] = useState<LessonFilters>({
    searchTerm: '',
    topicId: undefined,
    levelId: undefined,
    languageId: defaultLanguageId,
    isDeleted: undefined,
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  const [searchInput, setSearchInput] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const { data } = useLessons(filters)
  const { data: topicsData } = useTopicsByLanguage(filters.languageId)
  const { data: levelsData } = useLevelsByLanguage(filters.languageId)
  const generateMutation = useGenerateLessonWithAI()

  // Update filters when default language is loaded
  React.useEffect(() => {
    if (englishLanguage && filters.languageId !== englishLanguage.id) {
      setFilters((prev) => ({ ...prev, languageId: englishLanguage.id }))
    }
  }, [englishLanguage, filters.languageId])

  const handleFiltersChange = (newFilters: Partial<LessonFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))
  }

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, searchTerm: searchInput, page: 0 }))
  }

  const handleLanguageChange = (languageId: string) => {
    const id = Number(languageId)
    setFilters((prev) => ({
      ...prev,
      languageId: id,
      topicId: undefined,
      levelId: undefined,
      page: 0,
    }))
  }

  const handleTopicFilter = (topicId: string) => {
    const id = topicId === 'all' ? undefined : Number(topicId)
    setFilters((prev) => ({ ...prev, topicId: id, page: 0 }))
  }

  const handleLevelFilter = (levelId: string) => {
    const id = levelId === 'all' ? undefined : Number(levelId)
    setFilters((prev) => ({ ...prev, levelId: id, page: 0 }))
  }

  const handleStatusChange = (status: string) => {
    let isDeleted: boolean | undefined
    if (status === 'active') isDeleted = false
    else if (status === 'deleted') isDeleted = true
    else isDeleted = undefined

    setFilters((prev) => ({ ...prev, isDeleted, page: 0 }))
  }

  const handleCreateLesson = (request: AdminCreateLessonRequest) => {
    generateMutation.mutate(request, {
      onSuccess: () => {
        setCreateModalOpen(false)
      },
    })
  }

  const languages = languagesData?.data || []
  const topics = topicsData?.data || []
  const levels = levelsData?.data || []

  return (
    <div className='container mx-auto space-y-4 pb-10'>
      <Header>
        <div className='flex flex-1 items-center justify-between'>
          <div className='flex items-center gap-2'>
            <BookOpen className='h-8 w-8' />
            <h1 className='text-3xl font-bold'>Lesson Management</h1>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Generate Lesson with AI
          </Button>
        </div>
      </Header>

      {/* Language Filter (Required) */}
      <Card>
        <CardHeader>
          <CardTitle>Language Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.languageId.toString()}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.id.toString()}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Topic and Level Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Topic & Level Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4'>
            <Select
              value={filters.topicId ? filters.topicId.toString() : 'all'}
              onValueChange={handleTopicFilter}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Topics</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id.toString()}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.levelId ? filters.levelId.toString() : 'all'}
              onValueChange={handleLevelFilter}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Search and Status Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Status Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='flex flex-1 gap-2'>
              <Input
                placeholder='Search lessons by name...'
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

      {/* Statistics Cards */}
      {data?.data && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-blue-600'>
                  {data.data.totalElements}
                </p>
                <p className='text-muted-foreground text-sm'>Total Lessons</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-green-600'>
                  {data.data.content.filter((l) => !l.deleteFlag).length}
                </p>
                <p className='text-muted-foreground text-sm'>Active Lessons</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-purple-600'>
                  {data.data.content.filter((l) => l.deleteFlag).length}
                </p>
                <p className='text-muted-foreground text-sm'>Deleted Lessons</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lessons Table */}
      <Card>
        <CardContent className='pt-6'>
          <LessonsTable
            filters={filters}
            onFiltersChange={handleFiltersChange}
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

      {/* Create Lesson Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Generate New Lesson with AI</DialogTitle>
          </DialogHeader>
          <LessonForm
            onSubmit={handleCreateLesson}
            onCancel={() => setCreateModalOpen(false)}
            isLoading={generateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
