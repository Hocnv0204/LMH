import { createFileRoute } from '@tanstack/react-router'
import EmailVerificationPage from '@/features/auth/email-verification'

export const Route = createFileRoute('/auth/verify-email/$token')({
  component: () => {
    const { token } = Route.useParams()
    return <EmailVerificationPage mode='verify' />
  },
})
