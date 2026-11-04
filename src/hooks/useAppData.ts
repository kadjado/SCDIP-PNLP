
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, ApiError } from '../services/api'
import type { User, Fiche, Structure } from '../types'

type UseAppDataOptions = {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
  onSessionInvalid: () => Promise<void>
}

export function useAppData({
  setUser,
  setLoading,
  setError,
  onSessionInvalid,
}: UseAppDataOptions) {
  const [fiches, setFiches] = useState<Fiche[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [regions, setRegions] = useState<Structure[]>([])
  const [prefectures, setPrefectures] = useState<Structure[]>([])
  const [communes, setCommunes] = useState<Structure[]>([])
  const [formations, setFormations] = useState<Structure[]>([])

  const requestController = useRef<AbortController | null>(null)
  const requestId = useRef(0)

  const cancelPendingLoad = useCallback(() => {
    requestId.current += 1
    requestController.current?.abort()
    requestController.current = null
  }, [])

  const clearSessionData = useCallback(() => {
    cancelPendingLoad()

    setFiches([])
    setUsers([])
    setRegions([])
    setPrefectures([])
    setCommunes([])
    setFormations([])

    setLoading(false)
    setError('')
  }, [cancelPendingLoad, setLoading, setError])

  const loadData = useCallback(async (activeToken: string) => {
    if (!activeToken) return

    // Annuler le chargement précédent.
    requestController.current?.abort()

    const controller = new AbortController()
    requestController.current = controller

    const currentRequestId = ++requestId.current
    const signal = controller.signal

    const isCurrentRequest = () =>
      requestId.current === currentRequestId && !signal.aborted

    setLoading(true)
    setError('')

    try {
      // Vérifier la session et récupérer le rôle.
      const me = await api<User>(
        '/api/v1/auth/me',
        activeToken,
        { signal },
      )

      if (!isCurrentRequest()) return

      setUser(me)

      // Seul l'administrateur national charge les données administratives.
      if (me.role !== 'administrateur_national') {
        setUsers([])
        setRegions([])
        setPrefectures([])
        setCommunes([])
        setFormations([])
      }

      // Tous les utilisateurs autorisés chargent leurs fiches.
      const fichesPromise = api<Fiche[]>(
        '/api/v1/fiches?limit=50&offset=0',
        activeToken,
        { signal },
      )

      // Les agents et superviseurs ne sollicitent pas les routes admin.
      if (me.role !== 'administrateur_national') {
        const fichesResult = await fichesPromise

        if (!isCurrentRequest()) return

        setFiches(fichesResult)
        return
      }

      // Chargement des données administratives réservé à l'administrateur.
      const results = await Promise.allSettled([
        fichesPromise,
        api<User[]>(
          '/api/v1/admin/users?limit=100&offset=0',
          activeToken,
          { signal },
        ),
        api<Structure[]>(
          '/api/v1/admin/structures/regions',
          activeToken,
          { signal },
        ),
        api<Structure[]>(
          '/api/v1/admin/structures/prefectures',
          activeToken,
          { signal },
        ),
        api<Structure[]>(
          '/api/v1/admin/structures/communes',
          activeToken,
          { signal },
        ),
        api<Structure[]>(
          '/api/v1/admin/structures/formations-sanitaires',
          activeToken,
          { signal },
        ),
      ] as const)

      if (!isCurrentRequest()) return

      // Une réponse 401 invalide la session entière.
      const hasUnauthorizedError = results.some(
        result =>
          result.status === 'rejected' &&
          result.reason instanceof ApiError &&
          result.reason.status === 401,
      )

      if (hasUnauthorizedError) {
        await onSessionInvalid()
        return
      }

      const errors: string[] = []

      const [
        fichesResult,
        usersResult,
        regionsResult,
        prefecturesResult,
        communesResult,
        formationsResult,
      ] = results

      if (fichesResult.status === 'fulfilled') {
        setFiches(fichesResult.value)
      } else {
        errors.push(
          `Chargement des fiches impossible : ${String(fichesResult.reason)}`,
        )
      }

      if (usersResult.status === 'fulfilled') {
        setUsers(usersResult.value)
      } else {
        errors.push(
          `Chargement des utilisateurs impossible : ${String(usersResult.reason)}`,
        )
      }

      if (regionsResult.status === 'fulfilled') {
        setRegions(regionsResult.value)
      } else {
        errors.push(
          `Chargement des régions impossible : ${String(regionsResult.reason)}`,
        )
      }

      if (prefecturesResult.status === 'fulfilled') {
        setPrefectures(prefecturesResult.value)
      } else {
        errors.push(
          `Chargement des préfectures impossible : ${String(prefecturesResult.reason)}`,
        )
      }

      if (communesResult.status === 'fulfilled') {
        setCommunes(communesResult.value)
      } else {
        errors.push(
          `Chargement des communes impossible : ${String(communesResult.reason)}`,
        )
      }

      if (formationsResult.status === 'fulfilled') {
        setFormations(formationsResult.value)
      } else {
        errors.push(
          `Chargement des formations sanitaires impossible : ${String(formationsResult.reason)}`,
        )
      }

      if (errors.length > 0) {
        setError(errors.join('\n'))
      }
    } catch (error) {
      if (!isCurrentRequest()) return

      if (error instanceof ApiError && error.status === 401) {
        await onSessionInvalid()
        return
      }

      setError(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue pendant le chargement des données.',
      )
    } finally {
      if (isCurrentRequest()) {
        requestController.current = null
        setLoading(false)
      }
    }
  }, [setUser, setLoading, setError, onSessionInvalid])

  // Annuler les requêtes restantes lorsque le hook est démonté.
  useEffect(() => {
    return () => {
      requestId.current += 1
      requestController.current?.abort()
      requestController.current = null
    }
  }, [])

  return {
    fiches,
    setFiches,
    users,
    setUsers,
    regions,
    prefectures,
    communes,
    formations,
    loadData,
    clearSessionData,
  }
}
