import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import type { Fiche, PagedFiches } from '../types'
import type { Page } from '../config/navigation'

type UseFichesPaginationOptions = {
  token: string
  page: Page
  search: string
  pageOffset: number
  pageSize: number
  refreshKey: number
  setError: (error: string) => void
  onSessionInvalid: () => Promise<void>
}

export function useFichesPagination({
  token,
  page,
  search,
  pageOffset,
  pageSize,
  refreshKey,
  setError,
  onSessionInvalid,
}: UseFichesPaginationOptions) {
  const [pagedFiches, setPagedFiches] = useState<Fiche[]>([])
  const [totalFiches, setTotalFiches] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token || page !== 'fiches') {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({
          search: search.trim(),
          limit: String(pageSize),
          offset: String(pageOffset),
        })

        const result = await api<PagedFiches>(
          `/api/v1/fiches/paginees?${params.toString()}`,
          token,
          { signal: controller.signal },
        )

        if (!cancelled) {
          setPagedFiches(result.items)
          setTotalFiches(result.total)
        }
      } catch (error) {
        if (cancelled || controller.signal.aborted) {
          return
        }

        // Une session expirée doit être invalidée.
        if (error instanceof ApiError && error.status === 401) {
          await onSessionInvalid()
          return
        }

        setError(
          error instanceof Error
            ? `Chargement des fiches impossible : ${error.message}`
            : 'Chargement des fiches impossible.',
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [
    token,
    page,
    search,
    pageOffset,
    pageSize,
    refreshKey,
    setError,
    onSessionInvalid,
  ])

  return {
    pagedFiches,
    setPagedFiches,
    totalFiches,
    setTotalFiches,
    loading,
  }
}