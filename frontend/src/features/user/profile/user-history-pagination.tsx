'use client'

import type { PageResponse } from '@/types/common'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UserHistoryPaginationProps {
  pageData: PageResponse<any>
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function UserHistoryPagination({
  pageData,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: UserHistoryPaginationProps) {
  const { totalElements, totalPages, first, last } = pageData

  return (
    <div className='flex items-center justify-between px-2'>
      <div className='flex items-center space-x-2'>
        <p className='text-muted-foreground text-sm'>
          Showing {currentPage * pageSize + 1} to{' '}
          {Math.min((currentPage + 1) * pageSize, totalElements)} of{' '}
          {totalElements} records
        </p>
      </div>

      <div className='flex items-center space-x-6'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>Records per page</p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side='top'>
              {[5, 10, 20, 30].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>
            Page {currentPage + 1} of {totalPages}
          </p>
          <div className='flex items-center space-x-1'>
            <Button
              variant='outline'
              className='h-8 w-8 bg-transparent p-0'
              onClick={() => onPageChange(currentPage - 1)}
              disabled={first}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 bg-transparent p-0'
              onClick={() => onPageChange(currentPage + 1)}
              disabled={last}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
