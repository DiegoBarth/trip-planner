import { QueryClient } from '@tanstack/react-query'
import { shouldRefetchOnFocus } from '@/services/refetchPolicy'

const CACHE_PREFIX = 'rq_v1_'
const CACHE_MAX_AGE_MS = 120 * 60 * 1000 // 2 hours (sessionStorage / refresh)
const OSRM_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours (localStorage, OSRM routes)
const OSRM_QUERY_KEY = 'osrm-routes'

function isOSRMQueryKey(queryKey: unknown): boolean {
  if (!queryKey || !Array.isArray(queryKey)) return false
  const first = queryKey[0]
  return first === OSRM_QUERY_KEY || String(first) === OSRM_QUERY_KEY
}

/** Creates a new QueryClient instance (e.g. for tests or SSR). */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: shouldRefetchOnFocus,
        refetchOnReconnect: true,
        refetchOnMount: false
      }
    }
  })
}

function loadFromStorage(client: QueryClient, storage: Storage, onlyOSRM: boolean) {
  for (const storageKey of Object.keys(storage)) {
    if (!storageKey.startsWith(CACHE_PREFIX)) continue
    const raw = storage.getItem(storageKey)
    if (!raw) continue
    try {
      const { data, dataUpdatedAt, queryKey } = JSON.parse(raw)
      if (onlyOSRM !== isOSRMQueryKey(queryKey)) continue
      const maxAge = onlyOSRM ? OSRM_CACHE_MAX_AGE_MS : CACHE_MAX_AGE_MS
      if (Date.now() - dataUpdatedAt > maxAge) {
        storage.removeItem(storageKey)
        continue
      }
      client.setQueryData(queryKey, data, { updatedAt: dataUpdatedAt })
    } catch (parseErr) {
      console.warn('[queryClient] Cache inválido, removendo:', storageKey, parseErr)
      storage.removeItem(storageKey)
    }
  }
}

function loadCache(client: QueryClient) {
  try {
    loadFromStorage(client, sessionStorage, false)
    if (typeof localStorage !== 'undefined') {
      loadFromStorage(client, localStorage, true)
    }
  } catch (err) {
    if (typeof sessionStorage !== 'undefined') {
      console.warn('[queryClient] Erro ao carregar cache:', err)
    }
  }
}

function persistCache(client: QueryClient) {
  client.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated') return
    const query = event.query
    const qk = query?.queryKey
    if (!qk || !Array.isArray(qk) || typeof qk[0] !== 'string') return
    // Persist only when query has data (prefetch and useQuery both set status to 'success')
    if (query.state.status !== 'success' || query.state.data === undefined) return
    const storageKey = CACHE_PREFIX + JSON.stringify(qk)
    const useLocalForOSRM = isOSRMQueryKey(qk) && typeof localStorage !== 'undefined'
    const storage = useLocalForOSRM ? localStorage : sessionStorage
    try {
      storage.setItem(storageKey, JSON.stringify({
        queryKey: qk,
        data: query.state.data,
        dataUpdatedAt: query.state.dataUpdatedAt,
      }))
    } catch (err) {
      const isQuota = err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)
      console.warn(
        isQuota
          ? `[queryClient] ${storage === localStorage ? 'local' : 'session'}Storage cheio; cache não foi salvo. Limpe dados do site se precisar de espaço.`
          : '[queryClient] Erro ao persistir cache:',
        err
      )
    }
  })
}

const queryClient = createQueryClient()
loadCache(queryClient)
persistCache(queryClient)

export { queryClient }
