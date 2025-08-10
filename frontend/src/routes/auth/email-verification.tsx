import { createFileRoute } from '@tanstack/react-router'
import EmailVerificationPage from '@/features/auth/email-verification'

export const Route = createFileRoute('/auth/email-verification')({
  component: EmailVerificationPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: typeof search.email === 'string' ? search.email : undefined,
      token: typeof search.token === 'string' ? search.token : undefined,
    }
  },
})
