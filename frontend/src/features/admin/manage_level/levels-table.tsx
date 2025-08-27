'use client'

import { useState } from 'react'
import type { AdminLevelResponse, LevelFilters } from '@/types/level'
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
  useLevelsAdmin,
  useDeleteLevel,
  useRestoreLevel,
} from '@/features/admin/hooks/use-levels-admin'
import { LevelDetailsModal } from './level-details-modal'

interface LevelsTableProps {
  filters: LevelFilters
  onFiltersChange: (filters: Partial<LevelFilters>) => void
  onEditLevel: (level: AdminLevelResponse) => void
}

export function LevelsTable({
  filters,
  onFiltersChange,
  onEditLevel,
}: LevelsTableProps) {
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const { data, isLoading, error } = useLevelsAdmin(filters)
  const deleteMutation = useDeleteLevel()
  const restoreMutation = useRestoreLevel()

  const handleSort = (column: string) => {
    const newSortDir =
      filters.sortBy === column && filters.sortDir === 'ASC' ? 'DESC' : 'ASC'
    onFiltersChange({ sortBy: column, sortDir: newSortDir })
  }

  const handleViewDetails = (levelId: number) => {
    setSelectedLevelId(levelId)
    setDetailsModalOpen(true)
  }

  const handleDelete = (levelId: number) => {
    if (confirm('Are you sure you want to delete this level?')) {
      deleteMutation.mutate(levelId)
    }
  }

  const handleRestore = (levelId: number) => {
    if (confirm('Are you sure you want to restore this level?')) {
      restoreMutation.mutate(levelId)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center'>Loading levels...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center text-red-500'>Failed to load levels</div>
      </div>
    )
  }

  const levels = data?.data?.content || []

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('name')}
                  className='h-auto p-0 font-semibold'
                >
                  Name
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Language</TableHead>
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
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('updatedAt')}
                  className='h-auto p-0 font-semibold'
                >
                  Updated At
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead className='w-[50px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='py-8 text-center'>
                  No levels found
                </TableCell>
              </TableRow>
            ) : (
              levels.map((level) => (
                <TableRow key={level.id}>
                  <TableCell className='font-medium'>{level.name}</TableCell>
                  <TableCell className='max-w-xs truncate'>
                    {level.description || '-'}
                  </TableCell>
                  <TableCell>{level.languageName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={level.deleteFlag ? 'destructive' : 'default'}
                    >
                      {level.deleteFlag ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(level.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(level.updatedAt).toLocaleDateString()}
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
                          onClick={() => handleViewDetails(level.id)}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditLevel(level)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Update Level
                        </DropdownMenuItem>
                        {level.deleteFlag ? (
                          <DropdownMenuItem
                            onClick={() => handleRestore(level.id)}
                          >
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Restore Level
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleDelete(level.id)}
                            className='text-red-600'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete Level
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

      <LevelDetailsModal
        levelId={selectedLevelId}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </>
  )
}
