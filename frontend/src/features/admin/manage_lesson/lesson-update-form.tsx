'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  AdminLessonDetailResponse,
  AdminUpdateLessonRequest,
} from '@/types/lesson'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const lessonUpdateSchema = z.object({
  name: z.string().optional(),
  paragraph: z.string().optional(),
  note: z.string().optional(),
  description: z.string().optional(),
})

type LessonUpdateFormData = z.infer<typeof lessonUpdateSchema>

interface LessonUpdateFormProps {
  lesson: AdminLessonDetailResponse
  onSubmit: (data: AdminUpdateLessonRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export function LessonUpdateForm({
  lesson,
  onSubmit,
  onCancel,
  isLoading,
}: LessonUpdateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonUpdateFormData>({
    resolver: zodResolver(lessonUpdateSchema),
    defaultValues: {
      name: lesson.name || '',
      paragraph: lesson.paragraph || '',
      note: lesson.note || '',
      description: lesson.description || '',
    },
  })

  const onFormSubmit = (data: LessonUpdateFormData) => {
    const updateData: AdminUpdateLessonRequest = {}

    if (data.name && data.name !== lesson.name) {
      updateData.name = data.name
    }
    if (data.paragraph && data.paragraph !== lesson.paragraph) {
      updateData.paragraph = data.paragraph
    }
    if (data.note && data.note !== lesson.note) {
      updateData.note = data.note
    }
    if (data.description && data.description !== lesson.description) {
      updateData.description = data.description
    }

    onSubmit(updateData)
  }

  return (
    <div className='space-y-6'>
      {/* Lesson Information (Read-only) */}
      <div className='bg-muted/50 space-y-4 rounded-lg p-4'>
        <h3 className='text-lg font-semibold'>Lesson Information</h3>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='font-medium'>ID:</span> {lesson.id}
          </div>
          <div>
            <span className='font-medium'>Language:</span> {lesson.languageName}
          </div>
          <div>
            <span className='font-medium'>Topic:</span> {lesson.topicName}
          </div>
          <div>
            <span className='font-medium'>Level:</span> {lesson.levelName}
          </div>
          <div>
            <span className='font-medium'>Created:</span>{' '}
            {new Date(lesson.createdAt).toLocaleDateString()}
          </div>
          <div>
            <span className='font-medium'>Updated:</span>{' '}
            {new Date(lesson.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Name</Label>
          <Input
            id='name'
            {...register('name')}
            placeholder='Enter lesson name'
          />
          {errors.name && (
            <p className='text-sm text-red-500'>{errors.name.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='paragraph'>Paragraph</Label>
          <Textarea
            id='paragraph'
            {...register('paragraph')}
            placeholder='Enter lesson paragraph'
            rows={4}
          />
          {errors.paragraph && (
            <p className='text-sm text-red-500'>{errors.paragraph.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='note'>Note</Label>
          <Textarea
            id='note'
            {...register('note')}
            placeholder='Enter lesson notes'
            rows={3}
          />
          {errors.note && (
            <p className='text-sm text-red-500'>{errors.note.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            {...register('description')}
            placeholder='Enter lesson description'
            rows={3}
          />
          {errors.description && (
            <p className='text-sm text-red-500'>{errors.description.message}</p>
          )}
        </div>

        <div className='flex justify-end space-x-2 pt-4'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Lesson'}
          </Button>
        </div>
      </form>
    </div>
  )
}
