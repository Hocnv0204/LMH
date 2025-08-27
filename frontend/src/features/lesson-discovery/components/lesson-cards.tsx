'use client'

import { useNavigate } from '@tanstack/react-router'
import { Calendar, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { LessonSummaryResponse } from '@/features/lesson-discovery/types/lesson-selection'

interface LessonCardsProps {
  lessons: LessonSummaryResponse[]
}

export function LessonCards({ lessons }: LessonCardsProps) {
  const navigate = useNavigate()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleStartLesson = (lessonId: number) => {
    // Cập nhật phương thức điều hướng
    navigate({ to: `/user/lesson-practice/${lessonId}` })
  }

  if (lessons.length === 0) {
    return (
      <div className='py-12 text-center'>
        <p className='text-muted-foreground text-lg'>No lessons found</p>
        <p className='text-muted-foreground mt-1 text-sm'>
          Try selecting a different level or check back later.
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      {lessons.map((lesson) => (
        <Card
          key={lesson.id}
          className='flex h-full flex-col transition-shadow hover:shadow-lg'
        >
          <CardHeader className='flex-1'>
            <div className='flex items-start justify-between'>
              <CardTitle className='line-clamp-2 text-xl'>
                {lesson.name}
              </CardTitle>
              <Badge variant='outline' className='ml-2 shrink-0'>
                {lesson.levelName}
              </Badge>
            </div>
            <CardDescription className='line-clamp-4 flex-1 text-base'>
              {lesson.description}
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                <Calendar className='h-4 w-4' />
                {formatDate(lesson.createdAt)}
              </div>
            </div>
            <Button
              className='w-full'
              onClick={() => handleStartLesson(lesson.id)}
            >
              <Play className='mr-2 h-4 w-4' />
              Start Lesson
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
