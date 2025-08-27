import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import type {
  LanguageFilters,
  AdminCreateLanguageRequest,
  AdminUpdateLanguageRequest,
} from '@/types/language.ts'
import { toast } from 'sonner'
import { languageApi } from '@/features/admin/api/adminLanguageApi'

export const useAvailableLanguages = () => {
  return useQuery({
    queryKey: ['available-languages'],
    queryFn: () => languageApi.getAvailableLanguages(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useLanguagesAdmin = (filters: LanguageFilters) => {
  return useQuery({
    queryKey: ['languages', filters],
    queryFn: () => languageApi.getAllLanguages(filters),
    placeholderData: keepPreviousData,
  })
}

export const useLanguageDetails = (languageId: number) => {
  return useQuery({
    queryKey: ['language', languageId],
    queryFn: () => languageApi.getLanguageDetails(languageId),
    enabled: !!languageId,
  })
}

export const useCreateLanguage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: AdminCreateLanguageRequest) =>
      languageApi.createLanguage(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] })
      // Sửa lại cách gọi toast cho sonner
      toast.success('Language created successfully')
    },
    onError: (error) => {
      // Sửa lại cách gọi toast cho sonner
      toast.error('Failed to create language')
    },
  })
}

export const useUpdateLanguage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      languageId,
      request,
    }: {
      languageId: number
      request: AdminUpdateLanguageRequest
    }) => languageApi.updateLanguage(languageId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] })
      queryClient.invalidateQueries({ queryKey: ['language'] })
      // Sửa lại cách gọi toast cho sonner
      toast.success('Language updated successfully')
    },
    onError: (error) => {
      // Sửa lại cách gọi toast cho sonner
      toast.error('Failed to update language')
    },
  })
}

export const useDeleteLanguage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: languageApi.deleteLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] })
      // Sửa lại cách gọi toast cho sonner
      toast.success('Language deleted successfully')
    },
    onError: (error) => {
      // Sửa lại cách gọi toast cho sonner
      toast.error('Failed to delete language')
    },
  })
}

export const useRestoreLanguage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: languageApi.restoreLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] })
      // Sửa lại cách gọi toast cho sonner
      toast.success('Language restored successfully')
    },
    onError: (error) => {
      // Sửa lại cách gọi toast cho sonner
      toast.error('Failed to restore language')
    },
  })
}
