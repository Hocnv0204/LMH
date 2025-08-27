import { useCallback } from 'react'

interface ToastOptions {
  title: string
  description: string
  variant?: 'default' | 'destructive'
}

export const useToast = () => {
  const toast = useCallback((options: ToastOptions) => {
    const { title, description, variant = 'default' } = options

    if (variant === 'destructive') {
      console.error(`[${title}] ${description}`)
      // Có thể thay thế bằng alert hoặc notification system khác
      alert(`Lỗi: ${title}\n${description}`)
    } else {
      // Có thể thay thế bằng alert hoặc notification system khác
      alert(`Thành công: ${title}\n${description}`)
    }
  }, [])

  return { toast }
}
