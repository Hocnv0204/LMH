'use client'

import { useNavigate } from '@tanstack/react-router'
import {
  BookOpen,
  MessageSquare,
  CheckCircle,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { UserHistoryResponse } from '@/features/user-profile/types/user-profile'

interface HistoryDetailsModalProps {
  history: UserHistoryResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HistoryDetailsModal({
  history,
  open,
  onOpenChange,
}: HistoryDetailsModalProps) {
  if (!history) return null
  const navigate = useNavigate()

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

  const getResultIcon = (result: string) => {
    switch (result.toLowerCase()) {
      case 'correct':
      case 'pass':
        return <CheckCircle className='h-4 w-4 text-green-500' />
      default:
        return <CheckCircle className='text-muted-foreground h-4 w-4' />
    }
  }

  const handleGoToLesson = () => {
    navigate({ to: `/user/lesson-practice/${history.lessonId}` })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-10xl max-h-[90vh] w-full'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5' />
            Practice Session Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[70vh]'>
          <div className='space-y-6'>
            {/* Header Information */}
            <div className='flex items-center justify-between'>
              <div className='flex flex-1 items-center gap-4'>
                <div>
                  <h3 className='text-lg font-semibold'>
                    {history.lessonName}
                  </h3>
                </div>
              </div>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Calendar className='h-4 w-4' />
                {new Date(history.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Question Section */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Question</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='prose prose-sm max-w-none'>
                  <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                    {history.question}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Answer Section */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Your Answer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='prose prose-sm max-w-none'>
                  <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                    {history.answer}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Result Section */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  {getResultIcon(history.result)}
                  Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='prose prose-sm max-w-none'>
                  <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                    {history.result}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className='flex justify-between border-t pt-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleGoToLesson}
            className='flex items-center gap-2'
          >
            <BookOpen className='h-4 w-4' />
            Go to Lesson
            <ExternalLink className='h-4 w-4' />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
