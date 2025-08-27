'use client'

import * as z from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  AdminUpdateSuggestVocabularyRequest,
  SuggestVocabularyResponse,
} from '@/types/lesson'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const vocabularySchema = z.object({
  vocabularies: z.array(
    z.object({
      term: z.string().min(1, 'Term is required'),
      vietnamese: z.string().min(1, 'Vietnamese translation is required'),
      type: z.string().min(1, 'Type is required'),
      pronunciation: z.string().min(1, 'Pronunciation is required'),
      example: z.string().min(1, 'Example is required'),
    })
  ),
})

type VocabularyFormData = z.infer<typeof vocabularySchema>

interface VocabularyFormProps {
  vocabularies: SuggestVocabularyResponse[]
  onSubmit: (data: AdminUpdateSuggestVocabularyRequest[]) => void
  onCancel: () => void
  isLoading?: boolean
}

export function VocabularyForm({
  vocabularies,
  onSubmit,
  onCancel,
  isLoading,
}: VocabularyFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VocabularyFormData>({
    resolver: zodResolver(vocabularySchema),
    defaultValues: {
      vocabularies: vocabularies.map((vocab) => ({
        term: vocab.term,
        vietnamese: vocab.vietnamese,
        type: vocab.type,
        pronunciation: vocab.pronunciation,
        example: vocab.example,
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vocabularies',
  })

  const onFormSubmit = (data: VocabularyFormData) => {
    onSubmit(data.vocabularies)
  }

  const addVocabulary = () => {
    append({
      term: '',
      vietnamese: '',
      type: '',
      pronunciation: '',
      example: '',
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Manage Vocabularies</h3>
        <Button type='button' onClick={addVocabulary} size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          Add Vocabulary
        </Button>
      </div>

      <div className='max-h-96 space-y-4 overflow-y-auto'>
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm'>
                  Vocabulary {index + 1}
                </CardTitle>
                <Button
                  type='button'
                  onClick={() => remove(index)}
                  size='sm'
                  variant='destructive'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1'>
                  <Label htmlFor={`vocabularies.${index}.term`}>Term *</Label>
                  <Input
                    {...register(`vocabularies.${index}.term`)}
                    placeholder='English term'
                    className='text-sm'
                  />
                  {errors.vocabularies?.[index]?.term && (
                    <p className='text-xs text-red-500'>
                      {errors.vocabularies[index]?.term?.message}
                    </p>
                  )}
                </div>

                <div className='space-y-1'>
                  <Label htmlFor={`vocabularies.${index}.vietnamese`}>
                    Vietnamese *
                  </Label>
                  <Input
                    {...register(`vocabularies.${index}.vietnamese`)}
                    placeholder='Vietnamese translation'
                    className='text-sm'
                  />
                  {errors.vocabularies?.[index]?.vietnamese && (
                    <p className='text-xs text-red-500'>
                      {errors.vocabularies[index]?.vietnamese?.message}
                    </p>
                  )}
                </div>

                <div className='space-y-1'>
                  <Label htmlFor={`vocabularies.${index}.type`}>Type *</Label>
                  <Input
                    {...register(`vocabularies.${index}.type`)}
                    placeholder='noun, verb, adjective, etc.'
                    className='text-sm'
                  />
                  {errors.vocabularies?.[index]?.type && (
                    <p className='text-xs text-red-500'>
                      {errors.vocabularies[index]?.type?.message}
                    </p>
                  )}
                </div>

                <div className='space-y-1'>
                  <Label htmlFor={`vocabularies.${index}.pronunciation`}>
                    Pronunciation *
                  </Label>
                  <Input
                    {...register(`vocabularies.${index}.pronunciation`)}
                    placeholder='/prəˌnʌnsiˈeɪʃən/'
                    className='text-sm'
                  />
                  {errors.vocabularies?.[index]?.pronunciation && (
                    <p className='text-xs text-red-500'>
                      {errors.vocabularies[index]?.pronunciation?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='space-y-1'>
                <Label htmlFor={`vocabularies.${index}.example`}>
                  Example *
                </Label>
                <Input
                  {...register(`vocabularies.${index}.example`)}
                  placeholder='Example sentence using this word'
                  className='text-sm'
                />
                {errors.vocabularies?.[index]?.example && (
                  <p className='text-xs text-red-500'>
                    {errors.vocabularies[index]?.example?.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {fields.length === 0 && (
        <div className='text-muted-foreground py-8 text-center'>
          <p>No vocabularies added yet.</p>
          <Button type='button' onClick={addVocabulary} className='mt-2'>
            <Plus className='mr-2 h-4 w-4' />
            Add First Vocabulary
          </Button>
        </div>
      )}

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Vocabularies'}
        </Button>
      </div>
    </form>
  )
}
