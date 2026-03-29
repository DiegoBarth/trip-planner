import { useToast } from "@/contexts/toast"

export const OFFLINE_MUTATION_ERROR_MESSAGE = 'Modo offline: alterações desabilitadas.'

export function assertOnlineForMutation(): void {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    useToast().error(OFFLINE_MUTATION_ERROR_MESSAGE)
    throw new Error(OFFLINE_MUTATION_ERROR_MESSAGE)
  }
}
