import { Loader2, User, Mail, Calendar, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUserDetails } from '@/features/admin/hooks/use-users-admin'

interface UserDetailsModalProps {
  userId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailsModal({
  userId,
  open,
  onOpenChange,
}: UserDetailsModalProps) {
  const { data, isLoading, error } = useUserDetails(userId!)

  if (!userId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        )}

        {error && (
          <div className='py-8 text-center text-red-500'>
            Failed to load user details
          </div>
        )}

        {data?.data && (
          <div className='space-y-6'>
            {/* Basic Information */}
            <div className='grid grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <h3 className='flex items-center gap-2 text-lg font-semibold'>
                  <User className='h-5 w-5' />
                  Basic Information
                </h3>

                <div className='space-y-3'>
                  <div>
                    <h4 className='text-muted-foreground text-sm font-semibold'>
                      ID
                    </h4>
                    <p>{data.data.id}</p>
                  </div>

                  <div>
                    <h4 className='text-muted-foreground text-sm font-semibold'>
                      Name
                    </h4>
                    <p>{data.data.name || 'N/A'}</p>
                  </div>

                  <div>
                    <h4 className='text-muted-foreground text-sm font-semibold'>
                      Username
                    </h4>
                    <p>{data.data.username}</p>
                  </div>

                  <div>
                    <h4 className='text-muted-foreground text-sm font-semibold'>
                      Role
                    </h4>
                    <Badge variant='outline'>
                      {data.data.role.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div>
                    <h4 className='text-muted-foreground text-sm font-semibold'>
                      Status
                    </h4>
                    <Badge
                      variant={data.data.deleteFlag ? 'destructive' : 'default'}
                    >
                      {data.data.deleteFlag ? 'Deleted' : 'Active'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='flex items-center gap-2 text-lg font-semibold'>
                  <Mail className='h-5 w-5' />
                  Contact Information
                </h3>

                <div className='space-y-3'>
                  <div>
                    <h4 className='text-muted-foreground text-sm font-semibold'>
                      Email
                    </h4>
                    <p>{data.data.email}</p>
                  </div>

                  <div>
                    <h4 className='text-muted-foreground text-sm font-semibold'>
                      Phone Number
                    </h4>
                    <p>{data.data.phoneNumber || 'N/A'}</p>
                  </div>

                  <div>
                    <h4 className='text-muted-foreground text-sm font-semibold'>
                      Date of Birth
                    </h4>
                    <p>
                      {data.data.dateOfBirth
                        ? new Date(data.data.dateOfBirth).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <h4 className='text-muted-foreground text-sm font-semibold'>
                      School
                    </h4>
                    <p>{data.data.school || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className='bg-muted/50 grid grid-cols-3 gap-4 rounded-lg p-4'>
              <div className='text-center'>
                <h4 className='text-muted-foreground text-sm font-semibold'>
                  Points
                </h4>
                <p className='text-2xl font-bold text-blue-600'>
                  {data.data.point}
                </p>
              </div>
              <div className='text-center'>
                <h4 className='text-muted-foreground text-sm font-semibold'>
                  Credits
                </h4>
                <p className='text-2xl font-bold text-green-600'>
                  {data.data.credit}
                </p>
              </div>
              <div className='text-center'>
                <h4 className='text-muted-foreground text-sm font-semibold'>
                  Topics
                </h4>
                <p className='text-2xl font-bold text-purple-600'>
                  {data.data.topicCount}
                </p>
              </div>
            </div>

            <div className='bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4'>
              <div className='text-center'>
                <h4 className='text-muted-foreground text-sm font-semibold'>
                  Lessons Completed
                </h4>
                <p className='text-2xl font-bold text-orange-600'>
                  {data.data.lessonCount}
                </p>
              </div>
              <div className='text-center'>
                <h4 className='text-muted-foreground text-sm font-semibold'>
                  Completion Rate
                </h4>
                <p className='text-2xl font-bold text-indigo-600'>
                  {data.data.topicCount > 0
                    ? Math.round(
                        (data.data.lessonCount / data.data.topicCount) * 100
                      ) / 100
                    : 0}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h4 className='text-muted-foreground flex items-center gap-2 text-sm font-semibold'>
                  <Calendar className='h-4 w-4' />
                  Created At
                </h4>
                <p>{new Date(data.data.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h4 className='text-muted-foreground flex items-center gap-2 text-sm font-semibold'>
                  <Clock className='h-4 w-4' />
                  Last Login
                </h4>
                <p>
                  {data.data.lastLogin
                    ? new Date(data.data.lastLogin).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
