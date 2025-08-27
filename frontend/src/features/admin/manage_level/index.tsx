import { useState } from 'react'
import type {
  LevelFilters,
  AdminLevelResponse,
  AdminCreateLevelRequest,
  AdminUpdateLevelRequest,
} from '@/types/level'
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
import { useAvailableLanguages } from '@/features/admin/hooks/use-languages-admin'
import {
  useLevelsAdmin,
  useCreateLevel,
  useUpdateLevel,
} from '@/features/admin/hooks/use-levels-admin'
import { LevelForm } from './level-form'
import { LevelsTable } from './levels-table'

export default function LevelsManagementPage() {
  const [filters, setFilters] = useState<LevelFilters>({
    searchTerm: '',
    languageId: undefined,
    isDeleted: undefined,
    page: 0,
    size: 10,
    sortBy: 'name',
    sortDir: 'ASC',
  })

  const [searchInput, setSearchInput] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<AdminLevelResponse | null>(
    null
  )

  const { data } = useLevelsAdmin(filters)
  const { data: languagesData } = useAvailableLanguages()
  const createMutation = useCreateLevel()
  const updateMutation = useUpdateLevel()

  const handleFiltersChange = (newFilters: Partial<LevelFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))
  }

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, searchTerm: searchInput, page: 0 }))
  }

  const handleLanguageFilter = (languageId: string) => {
    const id = languageId === 'all' ? undefined : Number(languageId)
    setFilters((prev) => ({ ...prev, languageId: id, page: 0 }))
  }

  const handleCreateLevel = (request: AdminCreateLevelRequest) => {
    createMutation.mutate(request, {
      onSuccess: () => {
        setCreateModalOpen(false)
      },
    })
  }

  const handleUpdateLevel = (request: AdminUpdateLevelRequest) => {
    if (!editingLevel) return

    updateMutation.mutate(
      { levelId: editingLevel.id, request },
      {
        onSuccess: () => {
          setEditModalOpen(false)
          setEditingLevel(null)
        },
      }
    )
  }

  const handleEditLevel = (level: AdminLevelResponse) => {
    setEditingLevel(level)
    setEditModalOpen(true)
  }

  const handleStatusChange = (status: string) => {
    let isDeleted: boolean | undefined
    if (status === 'active') isDeleted = false
    else if (status === 'deleted') isDeleted = true
    else isDeleted = undefined

    setFilters((prev) => ({ ...prev, isDeleted, page: 0 }))
  }

  const languages = languagesData?.data || []

  return (
    <div className='container mx-auto space-y-4 pb-10'>
      <Header className='sticky top-0 z-10'>
        <div className='flex flex-1 items-center justify-between'>
          <h1 className='text-3xl font-bold'>Level Management</h1>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Create Level
          </Button>
        </div>
      </Header>

      {/* Language Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Language Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.languageId ? filters.languageId.toString() : 'all'}
            onValueChange={handleLanguageFilter}
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Languages</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.id.toString()}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Search and status*/}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='flex flex-1 gap-2'>
              <Input
                placeholder='Search levels by name...'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className='flex-1'
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

      {/* Levels Table */}
      <Card>
        <CardContent className='pt-6'>
          <LevelsTable
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onEditLevel={handleEditLevel}
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

      {/* Create Level Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create New Level</DialogTitle>
          </DialogHeader>
          <LevelForm
            onSubmit={(data) => {
              handleCreateLevel(data as AdminCreateLevelRequest)
            }}
            onCancel={() => setCreateModalOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Level Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Update Level</DialogTitle>
          </DialogHeader>
          <LevelForm
            level={editingLevel || undefined}
            onSubmit={handleUpdateLevel}
            onCancel={() => {
              setEditModalOpen(false)
              setEditingLevel(null)
            }}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
