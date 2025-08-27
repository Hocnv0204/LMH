'use client'

import type { HistoryFilters } from '@/types/history'
import { BarChart3, Users, BookOpen, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHistory } from '@/features/admin/hooks/use-histories-admin'

interface HistoryStatsOverviewProps {
  filters: HistoryFilters
}

export function HistoryStatsOverview({ filters }: HistoryStatsOverviewProps) {
  const { data } = useHistory(filters)

  const histories = data?.data?.content || []
  const totalRecords = data?.data?.totalElements || 0

  // Calculate statistics
  const uniqueUsers = new Set(histories.map((h) => h.userId)).size
  const uniqueLessons = new Set(histories.map((h) => h.lessonId)).size
  const correctAnswers = histories.filter(
    (h) => h.result.toLowerCase() === 'correct'
  ).length
  const successRate =
    histories.length > 0
      ? Math.round((correctAnswers / histories.length) * 100)
      : 0

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'today':
        return 'Today'
      case 'this-week':
        return 'This Week'
      case 'this-month':
        return 'This Month'
      default:
        return 'Today'
    }
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Submissions
          </CardTitle>
          <BarChart3 className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalRecords}</div>
          <p className='text-muted-foreground text-xs'>
            {getPeriodLabel(filters.timePeriod)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
          <Users className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{uniqueUsers}</div>
          <p className='text-muted-foreground text-xs'>Unique users active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Lessons Practiced
          </CardTitle>
          <BookOpen className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{uniqueLessons}</div>
          <p className='text-muted-foreground text-xs'>Different lessons</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Success Rate</CardTitle>
          <Activity className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{successRate}%</div>
          <p className='text-muted-foreground text-xs'>
            {correctAnswers} correct answers
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
