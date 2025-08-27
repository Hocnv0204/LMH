import { useState } from 'react'
import type { AdminUserSummaryResponse, UserFilters } from '@/types/user'
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useUsersAdmin,
  useDeleteUser,
  useRestoreUser,
} from '@/features/admin/hooks/use-users-admin'
import { UserDetailsModal } from './user-details-modal'

interface UsersTableProps {
  filters: UserFilters
  onFiltersChange: (filters: Partial<UserFilters>) => void
  onEditUser: (user: AdminUserSummaryResponse) => void
}

export function UsersTable({
  filters,
  onFiltersChange,
  onEditUser,
}: UsersTableProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const { data, isLoading, error } = useUsersAdmin(filters)
  const deleteMutation = useDeleteUser()
  const restoreMutation = useRestoreUser()

  const handleSort = (column: string) => {
    const newSortDir =
      filters.sortBy === column && filters.sortDir === 'ASC' ? 'DESC' : 'ASC'
    onFiltersChange({ sortBy: column, sortDir: newSortDir })
  }

  const handleViewDetails = (userId: number) => {
    setSelectedUserId(userId)
    setDetailsModalOpen(true)
  }

  const handleDelete = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId)
    }
  }

  const handleRestore = (userId: number) => {
    if (confirm('Are you sure you want to restore this user?')) {
      restoreMutation.mutate(userId)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center'>Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center text-red-500'>Failed to load users</div>
      </div>
    )
  }

  const users = data?.data?.content || []

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('username')}
                  className='h-auto p-0 font-semibold'
                >
                  Username
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('email')}
                  className='h-auto p-0 font-semibold'
                >
                  Email
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('credit')}
                  className='h-auto p-0 font-semibold'
                >
                  Credit
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>Topics</TableHead>
              <TableHead>Lessons</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('createdAt')}
                  className='h-auto p-0 font-semibold'
                >
                  Created At
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead className='w-[50px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='py-8 text-center'>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className='bg-muted rounded px-2 py-1 font-mono text-sm'>
                      {user.credit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{user.topicCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{user.lessonCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.deleteFlag ? 'destructive' : 'default'}
                    >
                      {user.deleteFlag ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(user.id)}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditUser(user)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Update User
                        </DropdownMenuItem>
                        {user.deleteFlag ? (
                          <DropdownMenuItem
                            onClick={() => handleRestore(user.id)}
                          >
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Restore User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id)}
                            className='text-red-600'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserDetailsModal
        userId={selectedUserId}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </>
  )
}
