import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from '@/config/constants'

interface Props {
  onSuccess: (credential: CredentialResponse) => void
  onError: () => void
}

export default function LoginScreen({ onSuccess, onError }: Props) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID ?? ''}>
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="w-full max-w-sm bg-white shadow-lg rounded-xl border border-slate-200 p-6 sm:p-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800">
            Trip Planner
          </h1>
          <p className="mb-6 sm:mb-8 text-sm sm:text-base text-slate-500">
            Acesse com sua conta Google para gerenciar seus dados
          </p>
          <GoogleLogin onSuccess={onSuccess} onError={onError} useOneTap />
          <p className="mt-4 text-xs sm:text-sm text-slate-400">
            Apenas e-mails autorizados terão acesso.
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}
