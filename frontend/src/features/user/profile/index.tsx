'use client'

import { useState } from 'react'
import type { UserHistoryFilters } from '@/types/user-profile'
import { toast } from 'sonner'
import { useUserHistory } from '@/hooks/use-user-profile'
import { UpdateApiConfigModal } from './update-api-config-modal'
import { UpdateProfileModal } from './update-profile-modal'
import { UserHistoryPagination } from './user-history-pagination'
import { UserHistoryTable } from './user-history-table'
import { UserProfileCard } from './user-profile-card'

export default function UserProfilePage() {
  const [updateProfileModalOpen, setUpdateProfileModalOpen] = useState(false)
  const [updateApiConfigModalOpen, setUpdateApiConfigModalOpen] =
    useState(false)

  const [historyFilters, setHistoryFilters] = useState<UserHistoryFilters>({
    page: 0,
    size: 10,
  })

  const { data: historyData } = useUserHistory(historyFilters)

  const handleUpdateProfile = () => {
    setUpdateProfileModalOpen(true)
  }

  const handleUpdateApiConfig = () => {
    setUpdateApiConfigModalOpen(true)
  }

  const handleViewVocabCollection = () => {
    toast('Coming Soon', {
      description: 'Vocabulary collection feature will be available soon!',
    })
  }

  const handleViewCustomLessons = () => {
    toast('Coming Soon', {
      description: 'Custom lessons feature will be available soon!',
    })
  }

  const handleViewCustomTopics = () => {
    toast('Coming Soon', {
      description: 'Custom topics feature will be available soon!',
    })
  }

  const handleHistoryFiltersChange = (
    newFilters: Partial<UserHistoryFilters>
  ) => {
    setHistoryFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handlePageChange = (page: number) => {
    setHistoryFilters((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (size: number) => {
    setHistoryFilters((prev) => ({ ...prev, size, page: 0 }))
  }

  return (
    <div className='container mx-auto space-y-8 py-6'>
      {/* Profile Section */}
      <UserProfileCard
        onUpdateProfile={handleUpdateProfile}
        onUpdateApiConfig={handleUpdateApiConfig}
        onViewVocabCollection={handleViewVocabCollection}
        onViewCustomLessons={handleViewCustomLessons}
        onViewCustomTopics={handleViewCustomTopics}
      />

      {/* History Section */}
      <div className='space-y-4'>
        <UserHistoryTable
          filters={historyFilters}
          onFiltersChange={handleHistoryFiltersChange}
        />

        {historyData?.data && (
          <UserHistoryPagination
            pageData={historyData.data}
            currentPage={historyFilters.page}
            pageSize={historyFilters.size}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      {/* Modals */}
      <UpdateProfileModal
        open={updateProfileModalOpen}
        onOpenChange={setUpdateProfileModalOpen}
      />

      <UpdateApiConfigModal
        open={updateApiConfigModalOpen}
        onOpenChange={setUpdateApiConfigModalOpen}
      />
    </div>
  )
}
