'use client'

import { useState, useEffect } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { Loader2, ChevronRight } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
// Thay đổi import
import {
  useLessons,
  useAllLanguages,
} from '@/features/lesson-discovery/hooks/useLessonDiscovery'
import type { LessonFilters } from '@/features/lesson-discovery/types/lesson-selection'
import { DiscoveryPagination } from '../components/DiscoveryPagination'
import { LessonCards } from '../components/lesson-cards'
import { LevelSelector } from '../components/level-selector'

export default function LessonSelectionPage() {
  const { topicId, topicName, languageName } = useSearch({
    from: '/user/lesson-discovery/lesson', // Cập nhật đường dẫn route
  })

  const [selectedLevel, setSelectedLevel] = useState('all')

  const [languageId, setLanguageId] = useState<number | null>(null)

  const { data: languagesResponse } = useAllLanguages()

  // Find language ID from language name
  useEffect(() => {
    if (languagesResponse?.data && languageName) {
      const language = languagesResponse.data.find(
        (lang) => lang.name === languageName
      )
      if (language) {
        setLanguageId(Number.parseInt(language.id))
      }
    }
  }, [languagesResponse, languageName])

  const [lessonFilters, setLessonFilters] = useState<LessonFilters>({
    topicId: topicId ? Number(topicId) : undefined,
    levelId:
      selectedLevel === 'all' ? undefined : Number.parseInt(selectedLevel),
    languageId: languageId || 1, // Default to 1 if not found
    page: 0,
    size: 8, // 2 cards per row, 4 rows max
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  // Update filters when languageId changes
  useEffect(() => {
    if (languageId) {
      setLessonFilters((prev) => ({ ...prev, languageId }))
    }
  }, [languageId])

  const { data: lessonsResponse, isLoading, error } = useLessons(lessonFilters)

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level)
    setLessonFilters((prev) => ({
      ...prev,
      levelId: level === 'all' ? undefined : Number.parseInt(level),
      page: 0,
    }))
  }

  const handlePageChange = (page: number) => {
    setLessonFilters((prev) => ({ ...prev, page: page - 1 }))
  }

  if (!topicId || !languageName) {
    return (
      <div className='container mx-auto py-8'>
        <div className='text-center'>
          <p className='text-destructive'>Invalid lesson parameters</p>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto space-y-8 py-8'>
      {/* Cập nhật Breadcrumb để sử dụng Link */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to='/user/lesson-discovery'
                search={{
                  languageName: languageName,
                }}
              >
                {languageName}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className='h-4 w-4' />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{topicName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='text-center'>
        <h1 className='mb-4 text-4xl font-bold'>Choose Your Lesson</h1>
        <p className='text-muted-foreground text-xl'>
          {languageName} <ChevronRight className='mx-2 inline h-5 w-5' />{' '}
          {topicName}
        </p>
      </div>

      {/* Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Level</CardTitle>
          <CardDescription>
            Choose a specific level or view all available lessons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='max-w-xs'>
            <LevelSelector
              languageName={languageName}
              value={selectedLevel}
              onValueChange={handleLevelChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lessons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Available Lessons</CardTitle>
          <CardDescription>
            {selectedLevel === 'all'
              ? 'All lessons for this topic'
              : `Lessons filtered by selected level`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : error ? (
            <div className='py-12 text-center'>
              <p className='text-destructive'>Failed to load lessons</p>
            </div>
          ) : (
            <div className='space-y-6'>
              <LessonCards lessons={lessonsResponse?.data?.content || []} />
              {lessonsResponse?.data && (
                <DiscoveryPagination
                  currentPage={lessonsResponse.data.number + 1}
                  totalPages={lessonsResponse.data.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
