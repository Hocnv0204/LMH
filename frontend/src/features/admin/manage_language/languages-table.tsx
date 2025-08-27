import { useState } from 'react'
import type { AdminLanguageResponse, LanguageFilters } from '@/types/language'
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
  useLanguagesAdmin,
  useDeleteLanguage,
  useRestoreLanguage,
} from '@/features/admin/hooks/use-languages-admin'
import { LanguageDetailsModal } from './language-details-modal'

interface LanguagesTableProps {
  filters: LanguageFilters
  onFiltersChange: (filters: Partial<LanguageFilters>) => void
  onEditLanguage: (language: AdminLanguageResponse) => void
}

export function LanguagesTable({
  filters,
  onFiltersChange,
  onEditLanguage,
}: LanguagesTableProps) {
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(
    null
  )
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const { data, isLoading, error } = useLanguagesAdmin(filters)
  const deleteMutation = useDeleteLanguage()
  const restoreMutation = useRestoreLanguage()

  const handleSort = (column: string) => {
    const newSortDir =
      filters.sortBy === column && filters.sortDir === 'ASC' ? 'DESC' : 'ASC'
    onFiltersChange({ sortBy: column, sortDir: newSortDir })
  }

  const handleViewDetails = (languageId: number) => {
    setSelectedLanguageId(languageId)
    setDetailsModalOpen(true)
  }

  const handleDelete = (languageId: number) => {
    if (confirm('Are you sure you want to delete this language?')) {
      deleteMutation.mutate(languageId)
    }
  }

  const handleRestore = (languageId: number) => {
    if (confirm('Are you sure you want to restore this language?')) {
      restoreMutation.mutate(languageId)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center'>Loading languages...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center text-red-500'>Failed to load languages</div>
      </div>
    )
  }

  const languages = data?.data?.content || []

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
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('languageCode')}
                  className='h-auto p-0 font-semibold'
                >
                  Language Code
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>Note</TableHead>
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
            {languages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='py-8 text-center'>
                  No languages found
                </TableCell>
              </TableRow>
            ) : (
              languages.map((language) => (
                <TableRow key={language.id}>
                  <TableCell className='font-medium'>{language.name}</TableCell>
                  <TableCell>
                    <code className='bg-muted rounded px-2 py-1 text-sm'>
                      {language.languageCode}
                    </code>
                  </TableCell>
                  <TableCell className='max-w-xs truncate'>
                    {language.note || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={language.deleteFlag ? 'destructive' : 'default'}
                    >
                      {language.deleteFlag ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(language.createdAt).toLocaleDateString()}
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
                          onClick={() => handleViewDetails(language.id)}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEditLanguage(language)}
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          Update Language
                        </DropdownMenuItem>
                        {language.deleteFlag ? (
                          <DropdownMenuItem
                            onClick={() => handleRestore(language.id)}
                          >
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Restore Language
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleDelete(language.id)}
                            className='text-red-600'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete Language
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

      <LanguageDetailsModal
        languageId={selectedLanguageId}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </>
  )
}
