import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  AdminLanguageResponse,
  AdminCreateLanguageRequest,
  AdminUpdateLanguageRequest,
} from '@/types/language'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const languageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  languageCode: z
    .string()
    .min(1, 'Language code is required')
    .max(10, 'Language code must be 10 characters or less'),
  note: z.string().optional(),
})

type LanguageFormData = z.infer<typeof languageSchema>

interface LanguageFormProps {
  language?: AdminLanguageResponse
  onSubmit: (
    data: AdminCreateLanguageRequest | AdminUpdateLanguageRequest
  ) => void
  onCancel: () => void
  isLoading?: boolean
}

export function LanguageForm({
  language,
  onSubmit,
  onCancel,
  isLoading,
}: LanguageFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      name: language?.name || '',
      languageCode: language?.languageCode || '',
      note: language?.note || '',
    },
  })

  const onFormSubmit = (data: LanguageFormData) => {
    onSubmit({
      name: data.name,
      languageCode: data.languageCode,
      note: data.note,
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Name *</Label>
        <Input
          id='name'
          {...register('name')}
          placeholder='Enter language name (e.g., English)'
        />
        {errors.name && (
          <p className='text-sm text-red-500'>{errors.name.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='languageCode'>Language Code *</Label>
        <Input
          id='languageCode'
          {...register('languageCode')}
          placeholder='Enter language code (e.g., en, vi, es)'
          className='uppercase'
        />
        {errors.languageCode && (
          <p className='text-sm text-red-500'>{errors.languageCode.message}</p>
        )}
        <p className='text-muted-foreground text-xs'>
          Use standard language codes like 'en' for English, 'vi' for
          Vietnamese, etc.
        </p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='note'>Note</Label>
        <Textarea
          id='note'
          {...register('note')}
          placeholder='Enter additional notes (optional)'
          rows={3}
        />
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : language
              ? 'Update Language'
              : 'Create Language'}
        </Button>
      </div>
    </form>
  )
}
