'use client'

import React, { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { LessonFilters, AdminCreateLessonRequest } from '@/types/lesson'
import { useAllLanguages, useLevelsByLanguage, useTopics } from '@/features/lesson-discovery/hooks/useLessonDiscovery'
import { useMyLessons, useGenerateMyLessonWithAI } from '@/features/user/custom-lesson/hooks/useLessons'
import { LessonForm as UserLessonForm } from '@/features/user/custom-lesson/lesson-form'
import { LessonCards } from '@/features/lesson-discovery/components/lesson-cards'
import { DiscoveryPagination } from '@/features/lesson-discovery/components/DiscoveryPagination'

export function CustomLessonsPage() {
  const { data: allLanguagesData } = useAllLanguages()

  const defaultLanguageName = useMemo(() => {
    const english = allLanguagesData?.data?.find(
      (l) => l.name.toLowerCase() === 'english'
    )
    return english?.name || allLanguagesData?.data?.[0]?.name || ''
  }, [allLanguagesData])

  const [filters, setFilters] = useState<LessonFilters>({
    searchTerm: '',
    topicId: undefined,
    levelId: undefined,
    languageId: 0,
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  React.useEffect(() => {
    if (defaultLanguageName && filters.languageId === 0) {
      // map name->id by looking up languages list; need id not name
      const lang = allLanguagesData?.data?.find((l) => l.name === defaultLanguageName)
      if (lang) {
        const idNum = Number(lang.id)
        if (!Number.isNaN(idNum)) {
          setFilters((prev) => ({ ...prev, languageId: idNum }))
        }
      }
    }
  }, [defaultLanguageName, allLanguagesData, filters.languageId])

  const { data: levelsData } = useLevelsByLanguage(
    useMemo(() => {
      const lang = allLanguagesData?.data?.find((l) => Number(l.id) === filters.languageId)
      return lang?.name || ''
    }, [allLanguagesData, filters.languageId])
  )

  const { data: topicsData } = useTopics({
    searchTerm: '',
    languageName: useMemo(() => {
      const lang = allLanguagesData?.data?.find((l) => Number(l.id) === filters.languageId)
      return lang?.name || ''
    }, [allLanguagesData, filters.languageId]),
    page: 0,
    size: 50,
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  const { data: lessonsData } = useMyLessons(filters)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const generateMutation = useGenerateMyLessonWithAI()

  const languages = allLanguagesData?.data || []
  const levels = levelsData?.data || []
  const topics = topicsData?.data?.content || []

  const handleLanguageChange = (languageId: string) => {
    const id = Number(languageId)
    setFilters((prev) => ({ ...prev, languageId: id, topicId: undefined, levelId: undefined, page: 0 }))
  }

  const handleTopicChange = (topicId: string) => {
    const id = topicId === 'all' ? undefined : Number(topicId)
    setFilters((prev) => ({ ...prev, topicId: id, page: 0 }))
  }

  const handleLevelChange = (levelId: string) => {
    const id = levelId === 'all' ? undefined : Number(levelId)
    setFilters((prev) => ({ ...prev, levelId: id, page: 0 }))
  }

  const handleCreateLesson = (request: AdminCreateLessonRequest) => {
    generateMutation.mutate(request, { onSuccess: () => setCreateModalOpen(false) })
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page: page - 1 }))
  }

  return (
    <div className='bg-background min-h-screen'>
      {/* Header Section */}
      <div className='bg-primary text-primary-foreground'>
        <div className='container mx-auto px-6 py-8'>
          <h1 className='text-3xl font-bold text-balance'>Custom Lessons</h1>
          <p className='text-primary-foreground/80 mt-2'>
            Create and manage your personalized learning content
          </p>
        </div>
      </div>

      <div className='container mx-auto px-6 py-8'>
        {/* Controls Section */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='text-xl'>Lesson Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end'>
              <div className='flex flex-1 flex-col gap-4 sm:flex-row'>
                <div className='min-w-[200px] space-y-2'>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Language
                  </label>
                  <Select
                    value={filters.languageId ? filters.languageId.toString() : ''}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select language' />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='min-w-[200px] space-y-2'>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Topic
                  </label>
                  <Select
                    value={filters.topicId ? filters.topicId.toString() : 'all'}
                    onValueChange={handleTopicChange}
                    disabled={!filters.languageId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select topic' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Topics</SelectItem>
                      {topics.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='min-w-[200px] space-y-2'>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Level
                  </label>
                  <Select
                    value={filters.levelId ? filters.levelId.toString() : 'all'}
                    onValueChange={handleLevelChange}
                    disabled={!filters.languageId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select level' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Levels</SelectItem>
                      {levels.map((lv) => (
                        <SelectItem key={lv.id} value={lv.id.toString()}>
                          {lv.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Create Lesson Button */}
              <Button className='bg-primary hover:bg-primary/90 text-primary-foreground' onClick={() => setCreateModalOpen(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Create Lesson
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lessons Display Section */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Your Lessons</CardTitle>
            <p className='text-muted-foreground'>
              {lessonsData?.data?.totalElements
                ? `${lessonsData.data.totalElements} lessons found`
                : 'Your custom lessons will appear here once created'}
            </p>
          </CardHeader>
          <CardContent>
            {lessonsData?.data?.content?.length ? (
              <div className='space-y-6'>
                <LessonCards lessons={lessonsData.data.content} />
                {lessonsData?.data && (
                <DiscoveryPagination
                  currentPage={lessonsData.data.number + 1}
                  totalPages={lessonsData.data.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                  <Plus className='text-muted-foreground h-8 w-8' />
                </div>
                <h3 className='mb-2 text-lg font-semibold'>No lessons yet</h3>
                <p className='text-muted-foreground mb-4 max-w-md'>
                  Start creating your first custom lesson by clicking the "Create
                  Lesson" button above. You can organize lessons by language and
                  difficulty level.
                </p>
                <Button
                  variant='outline'
                  className='border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent'
                  onClick={() => setCreateModalOpen(true)}
                >
                  Get Started
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Create Custom Lesson</DialogTitle>
            </DialogHeader>
            <UserLessonForm
              onSubmit={handleCreateLesson}
              onCancel={() => setCreateModalOpen(false)}
              isLoading={generateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
