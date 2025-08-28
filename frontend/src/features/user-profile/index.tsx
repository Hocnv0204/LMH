'use client'

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useUserHistory } from '@/features/user-profile/hooks/useProfile'
import type { UserHistoryFilters } from '@/features/user-profile/types/user-profile'
import { UpdateApiConfigModal } from './components/update-api-config-modal'
import { UpdateProfileModal } from './components/update-profile-modal'
import { UserHistoryPagination } from './components/user-history-pagination'
import { UserHistoryTable } from './components/user-history-table'
import { UserProfileCard } from './components/user-profile-card'

export default function UserProfilePage() {
  const navigate = useNavigate()
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
    // Sửa thành toast.info()
    toast.info('Coming Soon', {
      description: 'Vocabulary collection feature will be available soon!',
    })
  }

  const handleViewCustomLessons = () => {
    navigate({ to: '/user/custom-lessons' })
  }

  const handleViewCustomTopics = () => {
    navigate({ to: '/user/custom-topics' })
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
