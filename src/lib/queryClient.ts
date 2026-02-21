import { QueryClient } from '@tanstack/react-query'

const CACHE_PREFIX = 'rq_v1_'
const CACHE_MAX_AGE_MS = 60 * 60 * 1000 // 1 hora

/** Creates a new QueryClient instance (e.g. for tests or SSR). */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      }
    }
  })
}

function loadCache(client: QueryClient) {
  try {
    for (const storageKey of Object.keys(localStorage)) {
      if (!storageKey.startsWith(CACHE_PREFIX)) continue
      const raw = localStorage.getItem(storageKey)
      if (!raw) continue
      const { data, dataUpdatedAt, queryKey } = JSON.parse(raw)
      if (Date.now() - dataUpdatedAt > CACHE_MAX_AGE_MS) {
        localStorage.removeItem(storageKey)
        continue
      }
      client.setQueryData(queryKey, data, { updatedAt: dataUpdatedAt })
    }
  } catch {
  }
}

function persistCache(client: QueryClient) {
  client.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated') return
    const action = event.action as { type: string }
    if (action.type !== 'success') return
    const query = event.query
    if (typeof query.queryKey[0] !== 'string') return
    const storageKey = CACHE_PREFIX + JSON.stringify(query.queryKey)
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        queryKey: query.queryKey,
        data: query.state.data,
        dataUpdatedAt: query.state.dataUpdatedAt,
      }))
    } catch {
    }
  })
}

const queryClient = createQueryClient()
loadCache(queryClient)
persistCache(queryClient)

export { queryClient }
