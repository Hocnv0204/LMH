'use client'

import { Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TopicResponse } from '@/features/user/custom-topic/types/topic'

interface TopicCardProps {
  topic: TopicResponse
  onEdit: (topic: TopicResponse) => void
  onDelete: (topicId: number) => void
}

export function TopicCard({ topic, onEdit, onDelete }: TopicCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card className='group h-full cursor-pointer transition-shadow hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <CardTitle className='group-hover:text-primary line-clamp-2 text-lg font-semibold transition-colors'>
            {topic.name}
          </CardTitle>
          <div className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
            <Button
              variant='ghost'
              size='sm'
              onClick={(e) => {
                e.stopPropagation()
                onEdit(topic)
              }}
              className='h-8 w-8 p-0'
            >
              <Edit className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={(e) => {
                e.stopPropagation()
                onDelete(topic.id)
              }}
              className='text-destructive hover:text-destructive h-8 w-8 p-0'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <Badge variant='secondary' className='w-fit'>
          {topic.languageName}
        </Badge>
      </CardHeader>
      <CardContent className='pt-0'>
        <p className='text-muted-foreground mb-3 line-clamp-3 text-sm'>
          {topic.description}
        </p>
        <p className='text-muted-foreground text-xs'>
          Created {formatDate(topic.createdAt)}
        </p>
      </CardContent>
    </Card>
  )
}
