'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTopics } from '@/features/lesson-discovery/hooks/useLessonDiscovery'
import type { TopicFilters } from '@/features/lesson-discovery/types/lesson-selection'
import { DiscoveryPagination } from '../components/DiscoveryPagination'
import { LanguageSelector } from '../components/language-selector'
import { TopicCards } from '../components/topic-cards'

export default function TopicSelectionPage() {
  const navigate = useNavigate({ from: '/user/lesson-discovery' })
  const { languageName } = useSearch({ from: '/user/lesson-discovery/' })
  const [topicFilters, setTopicFilters] = useState<TopicFilters>({
    languageName: languageName,
    page: 0,
    size: 20, // 5 cards per row, 4 rows max
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  const { data: topicsResponse, isLoading, error } = useTopics(topicFilters)

  useEffect(() => {
    setTopicFilters((prev) => ({
      ...prev,
      languageName: languageName,
      page: 0, // Reset về trang đầu khi đổi ngôn ngữ
    }))
  }, [languageName])

  const handleLanguageChange = (newLanguage: string) => {
    // Dùng navigate để thay đổi search param, không dùng setState trực tiếp nữa
    navigate({
      search: (prev) => ({ ...prev, languageName: newLanguage }),
      // `replace: true` để không tạo thêm lịch sử trình duyệt khi chỉ thay đổi filter
      replace: true,
    })
  }

  const handleTopicSelect = (topicId: number, topicName: string) => {
    // Sử dụng navigate để chuyển trang với search params
    navigate({
      to: '/user/lesson-discovery/lesson', // Điều hướng đến route mới
      search: {
        topicId,
        topicName,
        languageName: languageName,
      },
    })
  }

  const handlePageChange = (page: number) => {
    setTopicFilters((prev) => ({ ...prev, page: page - 1 }))
  }

  return (
    <div className='container mx-auto space-y-8 py-8'>
      <div className='text-center'>
        <h1 className='mb-4 text-4xl font-bold'>Start Learning</h1>
        <p className='text-muted-foreground text-xl'>
          Choose a language and explore topics to begin your learning journey
        </p>
      </div>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Language</CardTitle>
          <CardDescription>
            Select the language you want to learn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='max-w-xs'>
            <LanguageSelector
              value={languageName}
              onValueChange={handleLanguageChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Topics Section */}
      {languageName && (
        <Card>
          <CardHeader>
            <CardTitle>Explore Topics</CardTitle>
            <CardDescription>
              Browse available topics for {languageName} and start learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            ) : error ? (
              <div className='py-12 text-center'>
                <p className='text-destructive'>Failed to load topics</p>
              </div>
            ) : (
              <div className='space-y-6'>
                <TopicCards
                  topics={topicsResponse?.data?.content || []}
                  onTopicSelect={handleTopicSelect}
                />
                {topicsResponse?.data && (
                  <DiscoveryPagination
                    currentPage={topicsResponse.data.number + 1}
                    totalPages={topicsResponse.data.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
