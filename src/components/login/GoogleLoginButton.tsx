import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from '@/config/constants'

interface Props {
  onSuccess: (credential: CredentialResponse) => void
  onError: () => void
}

import { useEffect, useState } from 'react'

export default function GoogleLoginButton({ onSuccess, onError }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID ?? ''}>
      <GoogleLogin onSuccess={onSuccess} onError={onError} useOneTap={window.innerWidth >= 768} />
    </GoogleOAuthProvider>
  )
}
