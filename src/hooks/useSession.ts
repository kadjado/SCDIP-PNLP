import { useCallback } from 'react'

import { API_URL } from '../services/api'
import { withGlobalLoading } from '../services/globalLoading'

type SessionOptions = {
  handleInvalidSession: () => Promise<void>
}

export function useSession({
  handleInvalidSession,
}: SessionOptions) {
  const logout = useCallback(async () => {
    await withGlobalLoading(async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error(
        'Impossible de contacter le serveur pour révoquer la session.',
        error,
      )
    } finally {
      await handleInvalidSession()
    }
    })
  }, [handleInvalidSession])

  return { logout }
}
