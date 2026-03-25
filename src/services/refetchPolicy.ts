const FOCUS_REFETCH_INTERVAL = 1000 * 60 * 1 // 1 minute

export function shouldRefetchOnFocus(query: any) {
  const last = query.state.dataUpdatedAt

  if (!last) return 'always'

  const diff = Date.now() - last

  if (diff > FOCUS_REFETCH_INTERVAL) {
    return 'always'
  }

  return false
}