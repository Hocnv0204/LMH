import { useState } from 'react'
import { RefreshCw, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { IndexTopBar } from '@/components/layout/index-top-bar'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'

export default function LeaderboardPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Sử dụng backend sorting với desc để có điểm cao đến thấp
  const { data, isLoading, error, refetch, isFetching } = useLeaderboard({
    page: currentPage - 1, // API sử dụng 0-based pagination
    size: pageSize,
    sortBy: 'point',
    sort: 'desc', // Mặc định sắp xếp theo điểm từ cao đến thấp
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size))
    setCurrentPage(1) // Reset về trang đầu khi thay đổi page size
  }

  const handleRefresh = () => {
    refetch()
  }

  if (error) {
    return (
      <div>
        <IndexTopBar />
        <div className='container mx-auto py-8'>
          <Alert variant='destructive'>
            <AlertDescription>
              Có lỗi xảy ra khi tải bảng xếp hạng. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Backend đã sắp xếp và phân trang rồi, chỉ cần lấy dữ liệu
  const users = data?.data?.content || []
  const totalPages = data?.data?.totalPages || 1

  return (
    <div>
      <IndexTopBar />
      <div className='container mx-auto space-y-6 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <Trophy className='h-6 w-6 text-yellow-500' />
              <h1 className='text-3xl font-bold'>Bảng Xếp Hạng</h1>
            </div>
            <p className='text-muted-foreground'>
              Xem thứ hạng của bạn so với các học viên khác
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isFetching}
            variant='outline'
            size='sm'
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')}
            />
            Làm mới
          </Button>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Bảng xếp hạng</CardTitle>
            <CardDescription>
              Danh sách người dùng được sắp xếp theo điểm số
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <label htmlFor='pageSize' className='text-sm font-medium'>
                    Hiển thị:
                  </label>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className='w-20'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='5'>5</SelectItem>
                      <SelectItem value='10'>10</SelectItem>
                      <SelectItem value='20'>20</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: pageSize }).map((_, index) => (
                  <Skeleton key={index} className='h-16 w-full' />
                ))}
              </div>
            ) : users.length > 0 ? (
              <LeaderboardTable
                users={users}
                currentPage={currentPage}
                pageSize={pageSize}
              />
            ) : (
              <div className='py-8 text-center'>
                <p className='text-muted-foreground'>
                  Không có dữ liệu để hiển thị
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-center'>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={cn(
                          currentPage === 1 && 'pointer-events-none opacity-50'
                        )}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        className={cn(
                          currentPage === totalPages &&
                            'pointer-events-none opacity-50'
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
