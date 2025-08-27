'use client'

import { Calendar, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { TopicResponse } from '@/features/lesson-discovery/types/lesson-selection'

interface TopicCardsProps {
  topics: TopicResponse[]
  onTopicSelect: (topicId: number, topicName: string) => void
}

export function TopicCards({ topics, onTopicSelect }: TopicCardsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (topics.length === 0) {
    return (
      <div className='py-12 text-center'>
        <p className='text-muted-foreground text-lg'>No topics found</p>
        <p className='text-muted-foreground mt-1 text-sm'>
          Try selecting a different language or check back later.
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
      {topics.map((topic) => (
        <Card
          key={topic.id}
          className='flex h-full flex-col transition-shadow hover:shadow-lg'
        >
          <CardHeader className='flex-1'>
            <div className='flex items-start justify-between'>
              <CardTitle className='line-clamp-2 text-lg'>
                {topic.name}
              </CardTitle>
              <Badge variant='secondary' className='ml-2 shrink-0'>
                {topic.languageName}
              </Badge>
            </div>
            <CardDescription className='line-clamp-3 flex-1'>
              {topic.description}
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                <Calendar className='h-3 w-3' />
                {formatDate(topic.createdAt)}
              </div>
            </div>
            <Button
              className='w-full'
              onClick={() => onTopicSelect(topic.id, topic.name)}
            >
              Explore Lessons
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
