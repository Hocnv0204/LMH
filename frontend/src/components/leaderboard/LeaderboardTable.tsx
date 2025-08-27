import { Trophy, Medal, Award, Star } from 'lucide-react'
import { LeaderboardUser } from '@/api/leaderboard'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface LeaderboardTableProps {
  users: LeaderboardUser[]
  currentPage: number
  pageSize: number
}

export function LeaderboardTable({
  users,
  currentPage,
  pageSize,
}: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className='h-5 w-5 text-yellow-500' />
      case 2:
        return <Medal className='h-5 w-5 text-gray-400' />
      case 3:
        return <Award className='h-5 w-5 text-amber-600' />
      default:
        return <Star className='text-muted-foreground h-5 w-5' />
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return 'default' as const
      case 2:
        return 'secondary' as const
      case 3:
        return 'outline' as const
      default:
        return 'secondary' as const
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('vi-VN')
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-16 text-center'>Hạng</TableHead>
            <TableHead>Tên người dùng</TableHead>
            <TableHead className='text-center'>Điểm</TableHead>
            <TableHead className='text-center'>Ngày tạo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => {
            // Rank toàn cục dựa trên pagination (backend đã sắp xếp)
            const globalRank = (currentPage - 1) * pageSize + index + 1
            const isTopThree = globalRank <= 3

            return (
              <TableRow
                key={user.id}
                className={cn(
                  'hover:bg-muted/50 transition-colors',
                  isTopThree && 'from-muted/30 bg-gradient-to-r to-transparent'
                )}
              >
                <TableCell className='text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    {getRankIcon(globalRank)}
                    <Badge
                      variant={getRankBadgeVariant(globalRank)}
                      className='min-w-8'
                    >
                      #{globalRank}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarFallback className='text-sm font-medium'>
                        {getInitials(user.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm font-medium'>
                        {user.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-center'>
                  <div className='flex items-center justify-center'>
                    <Badge variant='outline' className='font-mono text-sm'>
                      {(user.point ?? 0).toLocaleString()} pts
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className='text-muted-foreground text-center text-sm'>
                  {formatDate(user.createdAt || '')}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
