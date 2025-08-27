'use client'

import { BookOpen, TrendingUp, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useTopLessonsToday,
  useTopLessonsThisWeek,
} from '@/features/admin/hooks/use-histories-admin'

interface TopLessonsCardProps {
  period: 'today' | 'this-week'
  title: string
}

export function TopLessonsCard({ period, title }: TopLessonsCardProps) {
  const todayQuery = useTopLessonsToday()
  const weekQuery = useTopLessonsThisWeek()

  const query = period === 'today' ? todayQuery : weekQuery
  const { data, isLoading, error } = query

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin' />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className='py-8 text-center text-red-500'>
          Failed to load data
        </CardContent>
      </Card>
    )
  }

  const lessons = data?.data || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BookOpen className='h-5 w-5' />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lessons.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            No data available
          </div>
        ) : (
          <div className='space-y-3'>
            {lessons.slice(0, 10).map((lesson, index) => (
              <div
                key={lesson.lessonId}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex items-center gap-3'>
                  <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold'>
                    {index + 1}
                  </div>
                  <div>
                    <p className='font-medium'>{lesson.lessonName}</p>
                    <p className='text-muted-foreground text-xs'>
                      ID: {lesson.lessonId}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4 text-green-600' />
                  <Badge variant='secondary'>
                    {lesson.submissionCount} submissions
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
