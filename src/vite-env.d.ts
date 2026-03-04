declare module 'virtual:pwa-register/react' {
  export interface RegisterSWOptions {
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: unknown) => void
  }

  export function useRegisterSW(
    options?: RegisterSWOptions
  ): {
    needRefresh: [boolean, (value: boolean) => void]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
}