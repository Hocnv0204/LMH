import { useState } from 'react'
import type {
  LanguageFilters,
  AdminLanguageResponse,
  AdminCreateLanguageRequest,
  AdminUpdateLanguageRequest,
} from '@/types/language'
import { Plus, Search } from 'lucide-react'
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
  useLanguagesAdmin,
  useCreateLanguage,
  useUpdateLanguage,
} from '@/features/admin/hooks/use-languages-admin'
import { LanguageForm } from './language-form'
import { LanguagesTable } from './languages-table.tsx'

export default function LanguagesManagementPage() {
  const [filters, setFilters] = useState<LanguageFilters>({
    searchTerm: '',
    isDeleted: undefined,
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  const [searchInput, setSearchInput] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingLanguage, setEditingLanguage] =
    useState<AdminLanguageResponse | null>(null)

  const { data } = useLanguagesAdmin(filters)
  const createMutation = useCreateLanguage()
  const updateMutation = useUpdateLanguage()

  const handleFiltersChange = (newFilters: Partial<LanguageFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))
  }

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, searchTerm: searchInput, page: 0 }))
  }

  const handleStatusChange = (status: string) => {
    let isDeleted: boolean | undefined
    if (status === 'active') isDeleted = false
    else if (status === 'deleted') isDeleted = true
    else isDeleted = undefined

    setFilters((prev) => ({ ...prev, isDeleted, page: 0 }))
  }

  const handleCreateLanguage = (request: AdminCreateLanguageRequest) => {
    createMutation.mutate(request, {
      onSuccess: () => {
        setCreateModalOpen(false)
      },
    })
  }

  const handleUpdateLanguage = (request: AdminUpdateLanguageRequest) => {
    if (!editingLanguage) return

    updateMutation.mutate(
      { languageId: editingLanguage.id, request },
      {
        onSuccess: () => {
          setEditModalOpen(false)
          setEditingLanguage(null)
        },
      }
    )
  }

  const handleEditLanguage = (language: AdminLanguageResponse) => {
    setEditingLanguage(language)
    setEditModalOpen(true)
  }

  return (
    <div className='container mx-auto space-y-4 pb-10'>
      <Header className='sticky top-0 z-10'>
        <div className='flex flex-1 items-center justify-between'>
          <h1 className='text-3xl font-bold'>Language Management</h1>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Create Language
          </Button>
        </div>
      </Header>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='flex flex-1 gap-2'>
              <Input
                placeholder='Search languages by name or code...'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size='icon'>
                <Search className='h-4 w-4' />
              </Button>
            </div>

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

      {/* Languages Table */}
      <Card>
        <CardContent className='pt-6'>
          <LanguagesTable
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onEditLanguage={handleEditLanguage}
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

      {/* Create Language Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create New Language</DialogTitle>
          </DialogHeader>
          <LanguageForm
            onSubmit={(data) => {
              handleCreateLanguage(data as AdminCreateLanguageRequest)
            }}
            onCancel={() => setCreateModalOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Language Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Update Language</DialogTitle>
          </DialogHeader>
          <LanguageForm
            language={editingLanguage || undefined}
            onSubmit={handleUpdateLanguage}
            onCancel={() => {
              setEditModalOpen(false)
              setEditingLanguage(null)
            }}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
