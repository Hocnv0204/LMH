'use client'

import React from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  useUpdateUserProfile,
} from '@/features/user-profile/hooks/useProfile'
import type { UpdateProfileRequest } from '@/features/user-profile/types/user-profile'

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  school: z
    .string()
    .max(100, 'School name must be at most 100 characters')
    .optional()
    .or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UpdateProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateProfileModal({
  open,
  onOpenChange,
}: UpdateProfileModalProps) {
  const { data: profileData } = useCurrentUserProfile()
  const updateMutation = useUpdateUserProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profileData?.data?.name || '',
      dateOfBirth: profileData?.data?.dateOfBirth || '',
      school: profileData?.data?.school || '',
    },
  })

  // Reset form when profile data changes
  React.useEffect(() => {
    if (profileData?.data) {
      reset({
        name: profileData.data.name || '',
        dateOfBirth: profileData.data.dateOfBirth || '',
        school: profileData.data.school || '',
      })
    }
  }, [profileData, reset])

  const onSubmit = (data: ProfileFormData) => {
    const updateData: UpdateProfileRequest = {}

    if (data.name && data.name.trim()) {
      updateData.name = data.name.trim()
    }
    if (data.dateOfBirth) {
      updateData.dateOfBirth = data.dateOfBirth
    }
    if (data.school && data.school.trim()) {
      updateData.school = data.school.trim()
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
          <DialogTitle>Update Profile Information</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Full Name</Label>
            <Input
              id='name'
              {...register('name')}
              placeholder='Enter your full name'
            />
            {errors.name && (
              <p className='text-sm text-red-500'>{errors.name.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='dateOfBirth'>Date of Birth</Label>
            <Input id='dateOfBirth' type='date' {...register('dateOfBirth')} />
            {errors.dateOfBirth && (
              <p className='text-sm text-red-500'>
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='school'>School</Label>
            <Input
              id='school'
              {...register('school')}
              placeholder='Enter your school name'
            />
            {errors.school && (
              <p className='text-sm text-red-500'>{errors.school.message}</p>
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
              {updateMutation.isPending ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
