'use client'

import { useState } from 'react'
import type { HistoryFilters, TimePeriod } from '@/types/history'
import { BarChart3, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminPagination } from '@/features/admin/components/admin-pagination'
import { Header } from '@/features/admin/components/header'
import { useHistory } from '@/features/admin/hooks/use-histories-admin'
import { HistoryStatsOverview } from './history-stats-overview'
import { HistoryTable } from './history-table'
import { TopLessonsCard } from './top-lessons-card'
import { TopUsersCard } from './top-users-card'

export default function HistoryPage() {
  const [filters, setFilters] = useState<HistoryFilters>({
    timePeriod: 'today',
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  const { data } = useHistory(filters)

  const handleTimePeriodChange = (timePeriod: TimePeriod) => {
    setFilters((prev) => ({ ...prev, timePeriod, page: 0 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, size, page: 0 }))
  }

  const getPeriodLabel = (period: TimePeriod) => {
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
    <div className='container mx-auto space-y-4 pb-10'>
      <Header>
        <div className='flex items-center justify-between'>
          <div className='flex flex-1 items-center gap-2'>
            <BarChart3 className='h-8 w-8' />
            <h1 className='text-3xl font-bold'>History Statistics</h1>
          </div>
        </div>
      </Header>

      {/* Time Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Time Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.timePeriod}
            onValueChange={handleTimePeriodChange}
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='today'>Today</SelectItem>
              <SelectItem value='this-week'>This Week</SelectItem>
              <SelectItem value='this-month'>This Month</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Overview Statistics */}
      <HistoryStatsOverview filters={filters} />

      {/* Main Content Tabs */}
      <Tabs defaultValue='history' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='history'>History Records</TabsTrigger>
          <TabsTrigger value='statistics'>Top Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value='history' className='space-y-4'>
          <HistoryTable filters={filters} />

          {data?.data && (
            <AdminPagination
              pageData={data.data}
              currentPage={filters.page}
              pageSize={filters.size}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </TabsContent>

        <TabsContent value='statistics' className='space-y-6'>
          <div className='mb-4 flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            <h2 className='text-xl font-semibold'>
              Top Performers - {getPeriodLabel(filters.timePeriod)}
            </h2>
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Top Lessons */}
            <div className='space-y-4'>
              <TopLessonsCard period='today' title='Top Lessons Today' />
              <TopLessonsCard
                period='this-week'
                title='Top Lessons This Week'
              />
            </div>

            {/* Top Users */}
            <div className='space-y-4'>
              <TopUsersCard period='today' title='Top Users Today' />
              <TopUsersCard period='this-week' title='Top Users This Week' />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
