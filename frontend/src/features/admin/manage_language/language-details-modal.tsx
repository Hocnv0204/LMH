import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLanguageDetails } from '@/features/admin/hooks/use-languages-admin'

interface LanguageDetailsModalProps {
  languageId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LanguageDetailsModal({
  languageId,
  open,
  onOpenChange,
}: LanguageDetailsModalProps) {
  const { data, isLoading, error } = useLanguageDetails(languageId!)

  if (!languageId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Language Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        )}

        {error && (
          <div className='py-8 text-center text-red-500'>
            Failed to load language details
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
                  Language Code
                </h3>
                <p className='bg-muted rounded px-2 py-1 font-mono text-sm'>
                  {data.data.languageCode}
                </p>
              </div>

              <div>
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

            {data.data.note && (
              <div>
                <h3 className='text-muted-foreground text-sm font-semibold'>
                  Note
                </h3>
                <p className='mt-1'>{data.data.note}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
