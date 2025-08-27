'use client'

import { useState } from 'react'
import type {
  AdminUpdateLessonRequest,
  AdminUpdateSuggestVocabularyRequest,
} from '@/types/lesson'
import { Loader2, BookOpen, MessageSquare, FileText, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useLessonDetails,
  useUpdateLesson,
  useUpdateLessonVocabularies,
} from '@/features/admin/hooks/use-lessons-admin'
import { LessonUpdateForm } from './lesson-update-form'
import { VocabularyForm } from './vocabulary-form'

interface LessonDetailsModalProps {
  lessonId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LessonDetailsModal({
  lessonId,
  open,
  onOpenChange,
}: LessonDetailsModalProps) {
  const [editMode, setEditMode] = useState<'none' | 'lesson' | 'vocabularies'>(
    'none'
  )
  const { data, isLoading, error } = useLessonDetails(lessonId!)
  const updateLessonMutation = useUpdateLesson()
  const updateVocabulariesMutation = useUpdateLessonVocabularies()

  if (!lessonId) return null

  const handleUpdateLesson = (updateData: AdminUpdateLessonRequest) => {
    updateLessonMutation.mutate(
      { lessonId, request: updateData },
      {
        onSuccess: () => {
          setEditMode('none')
        },
      }
    )
  }

  const handleUpdateVocabularies = (
    vocabularies: AdminUpdateSuggestVocabularyRequest[]
  ) => {
    updateVocabulariesMutation.mutate(
      { lessonId, vocabularies },
      {
        onSuccess: () => {
          setEditMode('none')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-6xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Lesson Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        )}

        {error && (
          <div className='py-8 text-center text-red-500'>
            Failed to load lesson details
          </div>
        )}

        {data?.data && (
          <Tabs defaultValue='details' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='details'>Details</TabsTrigger>
              <TabsTrigger value='content'>Content</TabsTrigger>
              <TabsTrigger value='vocabularies'>
                Vocabularies ({data.data.suggestVocabularies.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value='details' className='space-y-4'>
              {editMode === 'lesson' ? (
                <LessonUpdateForm
                  lesson={data.data}
                  onSubmit={handleUpdateLesson}
                  onCancel={() => setEditMode('none')}
                  isLoading={updateLessonMutation.isPending}
                />
              ) : (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-semibold'>
                      Lesson Information
                    </h3>
                    <Button onClick={() => setEditMode('lesson')} size='sm'>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit Lesson
                    </Button>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <Card>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-sm'>
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-2 text-sm'>
                        <div>
                          <span className='font-medium'>ID:</span>{' '}
                          {data.data.id}
                        </div>
                        <div>
                          <span className='font-medium'>Name:</span>{' '}
                          {data.data.name}
                        </div>
                        <div>
                          <span className='font-medium'>Status:</span>
                          <Badge
                            variant={
                              data.data.deleteFlag ? 'destructive' : 'default'
                            }
                            className='ml-2'
                          >
                            {data.data.deleteFlag ? 'Deleted' : 'Active'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-sm'>
                          Classification
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-2 text-sm'>
                        <div>
                          <span className='font-medium'>Language:</span>{' '}
                          {data.data.languageName}
                        </div>
                        <div>
                          <span className='font-medium'>Topic:</span>{' '}
                          {data.data.topicName}
                        </div>
                        <div>
                          <span className='font-medium'>Level:</span>{' '}
                          {data.data.levelName}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-sm'>Timestamps</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-2 text-sm'>
                        <div>
                          <span className='font-medium'>Created:</span>{' '}
                          {new Date(data.data.createdAt).toLocaleString()}
                        </div>
                        <div>
                          <span className='font-medium'>Updated:</span>{' '}
                          {new Date(data.data.updatedAt).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-sm'>Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-2 text-sm'>
                        <div>
                          <span className='font-medium'>Vocabularies:</span>
                          <Badge variant='outline' className='ml-2'>
                            {data.data.suggestVocabularies.length}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value='content' className='space-y-4'>
              <div className='space-y-4'>
                {data.data.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-sm'>
                        <FileText className='h-4 w-4' />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm whitespace-pre-wrap'>
                        {data.data.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {data.data.paragraph && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-sm'>
                        <BookOpen className='h-4 w-4' />
                        Paragraph
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm whitespace-pre-wrap'>
                        {data.data.paragraph}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {data.data.note && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-sm'>
                        <MessageSquare className='h-4 w-4' />
                        Note
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm whitespace-pre-wrap'>
                        {data.data.note}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value='vocabularies' className='space-y-4'>
              {editMode === 'vocabularies' ? (
                <VocabularyForm
                  vocabularies={data.data.suggestVocabularies}
                  onSubmit={handleUpdateVocabularies}
                  onCancel={() => setEditMode('none')}
                  isLoading={updateVocabulariesMutation.isPending}
                />
              ) : (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-semibold'>
                      Suggest Vocabularies (
                      {data.data.suggestVocabularies.length})
                    </h3>
                    <Button
                      onClick={() => setEditMode('vocabularies')}
                      size='sm'
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      Edit Vocabularies
                    </Button>
                  </div>

                  {data.data.suggestVocabularies.length === 0 ? (
                    <div className='text-muted-foreground py-8 text-center'>
                      <p>No vocabularies added yet.</p>
                      <Button
                        onClick={() => setEditMode('vocabularies')}
                        className='mt-2'
                      >
                        Add Vocabularies
                      </Button>
                    </div>
                  ) : (
                    <div className='grid gap-4'>
                      {data.data.suggestVocabularies.map((vocab, index) => (
                        <Card key={vocab.id}>
                          <CardHeader className='pb-3'>
                            <CardTitle className='text-sm'>
                              {index + 1}. {vocab.term}
                              <Badge variant='outline' className='ml-2'>
                                {vocab.type}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className='space-y-2 text-sm'>
                            <div>
                              <span className='font-medium'>Vietnamese:</span>{' '}
                              {vocab.vietnamese}
                            </div>
                            <div>
                              <span className='font-medium'>
                                Pronunciation:
                              </span>{' '}
                              {vocab.pronunciation}
                            </div>
                            <div>
                              <span className='font-medium'>Example:</span>{' '}
                              {vocab.example}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
