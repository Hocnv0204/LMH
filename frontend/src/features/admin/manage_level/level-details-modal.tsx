import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLevelDetails } from '@/features/admin/hooks/use-levels-admin'

interface LevelDetailsModalProps {
  levelId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LevelDetailsModal({
  levelId,
  open,
  onOpenChange,
}: LevelDetailsModalProps) {
  const { data, isLoading, error } = useLevelDetails(levelId!)

  if (!levelId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Level Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        )}

        {error && (
          <div className='py-8 text-center text-red-500'>
            Failed to load level details
          </div>
        )}

        {data?.data && (
          <div className='space-y-4'>
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
                  Created At
                </h3>
                <p>{new Date(data.data.createdAt).toLocaleString()}</p>
              </div>

              <div className='col-span-2'>
                <h3 className='text-muted-foreground text-sm font-semibold'>
                  Last Updated
                </h3>
                <p>{new Date(data.data.updatedAt).toLocaleString()}</p>
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
