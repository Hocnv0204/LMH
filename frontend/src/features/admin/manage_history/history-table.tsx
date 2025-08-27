'use client'

import type { HistoryFilters } from '@/types/history'
import { Loader2, User, BookOpen, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useHistory } from '@/features/admin/hooks/use-histories-admin'

interface HistoryTableProps {
  filters: HistoryFilters
}

export function HistoryTable({ filters }: HistoryTableProps) {
  const { data, isLoading, error } = useHistory(filters)

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-2'>Loading history...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <div className='text-center text-red-500'>Failed to load history</div>
        </CardContent>
      </Card>
    )
  }

  const histories = data?.data?.content || []

  const getResultBadgeVariant = (result: string) => {
    switch (result.toLowerCase()) {
      case 'correct':
      case 'pass':
        return 'default'
      case 'incorrect':
      case 'fail':
        return 'destructive'
      case 'partial':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Clock className='h-5 w-5' />
          History Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {histories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='py-8 text-center'>
                    No history records found for this period
                  </TableCell>
                </TableRow>
              ) : (
                histories.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell className='font-medium'>{history.id}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <User className='text-muted-foreground h-4 w-4' />
                        <div>
                          <p className='font-medium'>{history.userName}</p>
                          <p className='text-muted-foreground text-xs'>
                            ID: {history.userId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <BookOpen className='text-muted-foreground h-4 w-4' />
                        <div>
                          <p className='font-medium'>{history.lessonName}</p>
                          <p className='text-muted-foreground text-xs'>
                            ID: {history.lessonId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='max-w-xs'>
                        <p className='truncate' title={history.question}>
                          {history.question}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='max-w-xs'>
                        <p className='truncate' title={history.answer}>
                          {history.answer}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(history.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
