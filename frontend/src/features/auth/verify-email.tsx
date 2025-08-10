import React from 'react'
import EmailVerificationPage from './email-verification'

interface VerifyEmailProps {
  token: string
}

export default function VerifyEmail({ token }: VerifyEmailProps) {
  return <EmailVerificationPage mode='verify' />
}
