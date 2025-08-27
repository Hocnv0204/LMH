import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import type { UserFilters, AdminUpdateUserRequest } from '@/types/user.ts'
import { toast } from 'sonner'
import { userApi } from '@/features/admin/api/adminUserApi'

export const useUsersAdmin = (filters: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userApi.getAllUsers(filters),
    placeholderData: keepPreviousData,
  })
}

export const useUserDetails = (userId: number) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUserDetails(userId),
    enabled: !!userId,
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      request,
    }: {
      userId: number
      request: AdminUpdateUserRequest
    }) => userApi.updateUser(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      // Sửa lại cách gọi toast cho trường hợp thành công
      toast.success('User updated successfully')
    },
    onError: (error) => {
      // Sửa lại cách gọi toast cho trường hợp lỗi
      toast.error('Failed to update user')
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete user')
    },
  })
}

export const useRestoreUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.restoreUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User restored successfully')
    },
    onError: (error) => {
      toast.error('Failed to restore user')
    },
  })
}
