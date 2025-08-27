'use client'

import { useState } from 'react'
import { History, Eye, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useUserHistory } from '@/features/user-profile/hooks/useProfile'
import type {
  UserHistoryFilters,
  UserHistoryResponse,
} from '@/features/user-profile/types/user-profile'
import { HistoryDetailsModal } from './history-details-modal'

interface UserHistoryTableProps {
  filters: UserHistoryFilters
  onFiltersChange: (filters: Partial<UserHistoryFilters>) => void
}

export function UserHistoryTable({
  filters,
  onFiltersChange,
}: UserHistoryTableProps) {
  const [selectedHistory, setSelectedHistory] =
    useState<UserHistoryResponse | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const { data, isLoading, error } = useUserHistory(filters)

  const handleViewDetails = (history: UserHistoryResponse) => {
    setSelectedHistory(history)
    setDetailsModalOpen(true)
  }

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='text-center'>Loading your history...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='text-center text-red-500'>Failed to load history</div>
        </CardContent>
      </Card>
    )
  }

  const histories = data?.data?.content || []

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <History className='h-5 w-5' />
            My Learning History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='w-[100px]'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {histories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='py-8 text-center'>
                      <div className='flex flex-col items-center gap-2'>
                        <BookOpen className='text-muted-foreground h-12 w-12' />
                        <p className='text-muted-foreground'>
                          No learning history yet
                        </p>
                        <p className='text-muted-foreground text-sm'>
                          Start practicing to see your progress here!
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  histories.map((history) => (
                    <TableRow
                      key={history.id}
                      onClick={() => handleViewDetails(history)}
                      className='hover:bg-muted/50 cursor-pointer'
                    >
                      <TableCell>
                        <div>
                          <p className='font-medium'>{history.lessonName}</p>
                          {/* <p className='text-muted-foreground text-xs'>
                            ID: {history.lessonId}
                          </p> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-xs'>
                          <p
                            className='truncate text-sm'
                            title={history.question}
                          >
                            {history.question}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-xs'>
                          <p
                            className='truncate text-sm'
                            title={history.answer}
                          >
                            {history.answer}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <p>
                            {new Date(history.createdAt).toLocaleDateString()}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            {new Date(history.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleViewDetails(history)}
                          className='h-8 w-8 p-0'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <HistoryDetailsModal
        history={selectedHistory}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </>
  )
}
