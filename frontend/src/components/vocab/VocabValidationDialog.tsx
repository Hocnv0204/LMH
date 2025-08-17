import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface VocabValidationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  term: string
  errorMessage?: string
}

export function VocabValidationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  term,
  errorMessage,
}: VocabValidationDialogProps) {
  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Từ vựng không hợp lệ</AlertDialogTitle>
          <AlertDialogDescription>
            Từ "{term}" không được tìm thấy trong từ điển hoặc có thể không hợp
            lệ.
            {errorMessage && (
              <div className='text-muted-foreground mt-2 text-sm'>
                Chi tiết: {errorMessage}
              </div>
            )}
            <br />
            <br />
            Bạn có chắc chắn muốn thêm từ vựng này không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Vẫn thêm từ vựng
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
