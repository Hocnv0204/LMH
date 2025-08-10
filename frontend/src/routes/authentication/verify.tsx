import { createFileRoute } from '@tanstack/react-router'
import VerifyEmail from '@/features/auth/verify-email'

export const Route = createFileRoute('/authentication/verify')({
  component: VerifyEmail,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: typeof search.token === 'string' ? search.token : undefined,
    }
  },
})
