'use client'

import React from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useCurrentUserProfile,
  useUpdateUserApiConfig,
} from '@/features/user-profile/hooks/useProfile'
import type { UpdateApiConfigRequest } from '@/features/user-profile/types/user-profile'

const apiConfigSchema = z.object({
  apiKey: z.string().optional().or(z.literal('')),
  apiUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
})

type ApiConfigFormData = z.infer<typeof apiConfigSchema>

interface UpdateApiConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateApiConfigModal({
  open,
  onOpenChange,
}: UpdateApiConfigModalProps) {
  const [showApiKey, setShowApiKey] = React.useState(false)
  const { data: profileData } = useCurrentUserProfile()
  const updateMutation = useUpdateUserApiConfig()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApiConfigFormData>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: profileData?.data?.apiKey || '',
      apiUrl: profileData?.data?.apiUrl || '',
    },
  })

  // Reset form when profile data changes
  React.useEffect(() => {
    if (profileData?.data) {
      reset({
        apiKey: profileData.data.apiKey || '',
        apiUrl: profileData.data.apiUrl || '',
      })
    }
  }, [profileData, reset])

  const onSubmit = (data: ApiConfigFormData) => {
    const updateData: UpdateApiConfigRequest = {}

    if (data.apiKey && data.apiKey.trim()) {
      updateData.apiKey = data.apiKey.trim()
    }
    if (data.apiUrl && data.apiUrl.trim()) {
      updateData.apiUrl = data.apiUrl.trim()
    }

    updateMutation.mutate(updateData, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Update API Configuration</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='apiKey'>API Key</Label>
            <div className='relative'>
              <Input
                id='apiKey'
                type={showApiKey ? 'text' : 'password'}
                {...register('apiKey')}
                placeholder='Enter your API key'
                className='pr-10'
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
            {errors.apiKey && (
              <p className='text-sm text-red-500'>{errors.apiKey.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='apiUrl'>API URL</Label>
            <Input
              id='apiUrl'
              type='url'
              {...register('apiUrl')}
              placeholder='https://api.example.com'
            />
            {errors.apiUrl && (
              <p className='text-sm text-red-500'>{errors.apiUrl.message}</p>
            )}
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update API Config'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
