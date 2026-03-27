/** Min age before a focus/reconnect refetch runs; keeps two devices reasonably in sync without spamming the API. */
const FOCUS_REFETCH_INTERVAL_MS = 1000 * 45 // 45 seconds

export function shouldRefetchOnFocus(query: any) {
  const last = query.state.dataUpdatedAt

  if (!last) return 'always'

  const diff = Date.now() - last

  if (diff > FOCUS_REFETCH_INTERVAL_MS) {
    return 'always'
  }

  return false
}