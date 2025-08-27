'use client'

import { useState } from 'react'
import type {
  UserFilters,
  AdminUserSummaryResponse,
  AdminUpdateUserRequest,
} from '@/types/user'
import { USER_ROLES } from '@/types/user'
import { Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminPagination } from '@/features/admin/components/admin-pagination'
import { Header } from '@/features/admin/components/header'
import {
  useUsersAdmin,
  useUpdateUser,
  useUserDetails,
} from '@/features/admin/hooks/use-users-admin'
import { UserForm } from './user-form'
import { UsersTable } from './users-table'

export default function UsersManagementPage() {
  const [filters, setFilters] = useState<UserFilters>({
    searchTerm: '',
    role: undefined,
    isDeleted: undefined,
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  const [searchInput, setSearchInput] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)

  const { data } = useUsersAdmin(filters)
  const { data: userDetailsData } = useUserDetails(editingUserId!)
  const updateMutation = useUpdateUser()

  const handleFiltersChange = (newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))
  }

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, searchTerm: searchInput, page: 0 }))
  }

  const handleRoleFilter = (role: string) => {
    const roleValue = role === 'all' ? undefined : role
    setFilters((prev) => ({ ...prev, role: roleValue, page: 0 }))
  }

  const handleStatusChange = (status: string) => {
    let isDeleted: boolean | undefined
    if (status === 'active') isDeleted = false
    else if (status === 'deleted') isDeleted = true
    else isDeleted = undefined

    setFilters((prev) => ({ ...prev, isDeleted, page: 0 }))
  }

  const handleUpdateUser = (request: AdminUpdateUserRequest) => {
    if (!editingUserId) return

    updateMutation.mutate(
      { userId: editingUserId, request },
      {
        onSuccess: () => {
          setEditModalOpen(false)
          setEditingUserId(null)
        },
      }
    )
  }

  const handleEditUser = (user: AdminUserSummaryResponse) => {
    setEditingUserId(user.id)
    setEditModalOpen(true)
  }

  return (
    <div className='container mx-auto space-y-4 pb-10'>
      <Header>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Users className='h-8 w-8' />
            <h1 className='text-3xl font-bold'>User Management</h1>
          </div>
        </div>
      </Header>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='flex flex-1 gap-2'>
              <Input
                placeholder='Search by username, email, or name...'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size='icon'>
                <Search className='h-4 w-4' />
              </Button>
            </div>

            <Select
              value={filters.role || 'all'}
              onValueChange={handleRoleFilter}
            >
              <SelectTrigger className='w-[150px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Roles</SelectItem>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={
                filters.isDeleted === undefined
                  ? 'all'
                  : filters.isDeleted
                    ? 'deleted'
                    : 'active'
              }
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className='w-[150px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='deleted'>Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {data?.data && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-blue-600'>
                  {data.data.totalElements}
                </p>
                <p className='text-muted-foreground text-sm'>Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-green-600'>
                  {data.data.content.filter((u) => !u.deleteFlag).length}
                </p>
                <p className='text-muted-foreground text-sm'>Active Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-purple-600'>
                  {data.data.content.reduce((sum, u) => sum + u.topicCount, 0)}
                </p>
                <p className='text-muted-foreground text-sm'>Total Topics</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-orange-600'>
                  {data.data.content.reduce((sum, u) => sum + u.lessonCount, 0)}
                </p>
                <p className='text-muted-foreground text-sm'>Total Lessons</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className='pt-6'>
          <UsersTable
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onEditUser={handleEditUser}
          />

          {data?.data && (
            <div className='mt-4'>
              <AdminPagination
                pageData={data.data}
                currentPage={filters.page}
                pageSize={filters.size}
                onPageChange={(page) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
                onPageSizeChange={(size) =>
                  setFilters((prev) => ({ ...prev, size, page: 0 }))
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Update User</DialogTitle>
          </DialogHeader>
          {userDetailsData?.data && (
            <UserForm
              user={userDetailsData.data}
              onSubmit={handleUpdateUser}
              onCancel={() => {
                setEditModalOpen(false)
                setEditingUserId(null)
              }}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
