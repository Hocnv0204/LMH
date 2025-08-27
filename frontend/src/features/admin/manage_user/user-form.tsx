import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  AdminUserDetailResponse,
  AdminUpdateUserRequest,
} from '@/types/user'
import { USER_ROLES } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const userSchema = z.object({
  role: z.string().optional(),
  credit: z.number().min(0, 'Credit must be non-negative').optional(),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  user: AdminUserDetailResponse
  onSubmit: (data: AdminUpdateUserRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export function UserForm({
  user,
  onSubmit,
  onCancel,
  isLoading,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: user.role,
      credit: user.credit,
    },
  })

  const selectedRole = watch('role')

  const onFormSubmit = (data: UserFormData) => {
    const updateData: AdminUpdateUserRequest = {}

    if (data.role && data.role !== user.role) {
      updateData.role = data.role
    }

    if (data.credit !== undefined && data.credit !== user.credit) {
      updateData.credit = data.credit
    }

    onSubmit(updateData)
  }

  return (
    <div className='space-y-6'>
      {/* User Information (Read-only) */}
      <div className='bg-muted/50 space-y-4 rounded-lg p-4'>
        <h3 className='text-lg font-semibold'>User Information</h3>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='font-medium'>Username:</span> {user.username}
          </div>
          <div>
            <span className='font-medium'>Email:</span> {user.email}
          </div>
          <div>
            <span className='font-medium'>Name:</span> {user.name || 'N/A'}
          </div>
          <div>
            <span className='font-medium'>Points:</span> {user.point}
          </div>
          <div>
            <span className='font-medium'>Topics:</span> {user.topicCount}
          </div>
          <div>
            <span className='font-medium'>Lessons:</span> {user.lessonCount}
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='role'>Role</Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setValue('role', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a role' />
            </SelectTrigger>
            <SelectContent>
              {USER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className='text-sm text-red-500'>{errors.role.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='credit'>Credit</Label>
          <Input
            id='credit'
            type='number'
            min='0'
            {...register('credit', { valueAsNumber: true })}
            placeholder='Enter credit amount'
          />
          {errors.credit && (
            <p className='text-sm text-red-500'>{errors.credit.message}</p>
          )}
        </div>

        <div className='flex justify-end space-x-2 pt-4'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update User'}
          </Button>
        </div>
      </form>
    </div>
  )
}
