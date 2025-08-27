'use client'

import { Users, TrendingUp, Loader2, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useTopUsersToday,
  useTopUsersThisWeek,
} from '@/features/admin/hooks/use-histories-admin'

interface TopUsersCardProps {
  period: 'today' | 'this-week'
  title: string
}

export function TopUsersCard({ period, title }: TopUsersCardProps) {
  const todayQuery = useTopUsersToday()
  const weekQuery = useTopUsersThisWeek()

  const query = period === 'today' ? todayQuery : weekQuery
  const { data, isLoading, error } = query

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
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
            <Users className='h-5 w-5' />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className='py-8 text-center text-red-500'>
          Failed to load data
        </CardContent>
      </Card>
    )
  }

  const users = data?.data || []

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className='h-4 w-4 text-yellow-500' />
    return null
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 1:
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-primary/10 text-primary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5' />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            No data available
          </div>
        ) : (
          <div className='space-y-3'>
            {users.slice(0, 10).map((user, index) => (
              <div
                key={user.userId}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${getRankColor(index)}`}
                  >
                    {getRankIcon(index) || index + 1}
                  </div>
                  <div>
                    <p className='font-medium'>{user.username}</p>
                    <p className='text-muted-foreground text-xs'>
                      ID: {user.userId}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4 text-green-600' />
                  <Badge variant='secondary'>
                    {user.submissionCount} submissions
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
