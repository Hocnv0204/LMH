import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTopicDetails } from '@/features/admin/hooks/use-topics-admin'

interface TopicDetailsModalProps {
  topicId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TopicDetailsModal({
  topicId,
  open,
  onOpenChange,
}: TopicDetailsModalProps) {
  const { data, isLoading, error } = useTopicDetails(topicId!)

  if (!topicId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Topic Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        )}

        {error && (
          <div className='py-8 text-center text-red-500'>
            Failed to load topic details
          </div>
        )}

        {data?.data && (
          <div className='space-y-4'>
            {data.data.imageUrl && (
              <div className='flex justify-center'>
                <img
                  src={data.data.imageUrl || '/placeholder.svg'}
                  alt={data.data.name}
                  className='h-48 w-48 rounded-lg border object-cover'
                />
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h3 className='text-muted-foreground text-sm font-semibold'>
                  ID
                </h3>
                <p>{data.data.id}</p>
              </div>

              <div>
                <h3 className='text-muted-foreground text-sm font-semibold'>
                  Status
                </h3>
                <Badge
                  variant={data.data.deleteFlag ? 'destructive' : 'default'}
                >
                  {data.data.deleteFlag ? 'Deleted' : 'Active'}
                </Badge>
              </div>

              <div>
                <h3 className='text-muted-foreground text-sm font-semibold'>
                  Language
                </h3>
                <p>{data.data.languageName}</p>
              </div>

              <div>
                <h3 className='text-muted-foreground text-sm font-semibold'>
                  Lesson Count
                </h3>
                <p>{data.data.lessonCount}</p>
              </div>

              <div className='col-span-2'>
                <h3 className='text-muted-foreground text-sm font-semibold'>
                  Created At
                </h3>
                <p>{new Date(data.data.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h3 className='text-muted-foreground text-sm font-semibold'>
                Name
              </h3>
              <p className='mt-1'>{data.data.name}</p>
            </div>

            {data.data.description && (
              <div>
                <h3 className='text-muted-foreground text-sm font-semibold'>
                  Description
                </h3>
                <p className='mt-1'>{data.data.description}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
