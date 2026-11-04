
import { useCallback } from 'react'
import { api, ApiError } from '../services/api'
import type { Fiche } from '../types'

type UseSupervisorActionsOptions = {
  token: string
  role?: string
  setBusy: (value: boolean) => void
  setError: (value: string) => void
  loadData: (activeToken: string) => Promise<void>
  onRefresh: () => void
  onSessionInvalid: () => Promise<void>
}

export function useSupervisorActions({
  token,
  role,
  setBusy,
  setError,
  loadData,
  onRefresh,
  onSessionInvalid,
}: UseSupervisorActionsOptions) {
  
  const handleSupervisorAction = useCallback(async (
    fiche: Fiche,
    action: 'valider' | 'demander-correction' | 'traiter-correction',
  ) => {
    if (!token || role !== 'superviseur') return

    let body: string | undefined
    let confirmation = ''

    if (action === 'valider') {
      confirmation = `Confirmer la validation de la fiche ${fiche.numero_fiche || fiche.id} ?`
    }

    if (action === 'demander-correction') {
      const motif = window.prompt(
        `Motif de correction pour la fiche ${fiche.numero_fiche || fiche.id} :`,
      )

      if (motif === null) return

      if (!motif.trim()) {
        window.alert('Le motif de correction est obligatoire.')
        return
      }

      body = JSON.stringify({ motif: motif.trim() })
      confirmation = 'Envoyer cette demande de correction à l’agent ?'
    }

    if (action === 'traiter-correction') {
      const decision = window.prompt(
        'Saisissez "acceptee" pour accepter la réponse de l’agent, ou "a_corriger" pour demander une nouvelle correction.',
      )

      if (decision === null) return

      if (!['acceptee', 'a_corriger'].includes(decision.trim())) {
        window.alert('Décision invalide. Utilisez "acceptee" ou "a_corriger".')
        return
      }

      let motif = ''

      if (decision.trim() === 'a_corriger') {
        const saisieMotif = window.prompt(
          'Motif de la nouvelle correction :',
        )

        if (saisieMotif === null) return

        if (!saisieMotif.trim()) {
          window.alert(
            'Le motif est obligatoire pour demander une nouvelle correction.',
          )
          return
        }

        motif = saisieMotif.trim()
      }

      body = JSON.stringify({ decision: decision.trim(), motif })
      confirmation = 'Confirmer le traitement de la réponse de l’agent ?'
    }

    if (!window.confirm(confirmation)) return

    setBusy(true)
    setError('')

    try {
      await api<unknown>(
        `/api/v1/fiches/${encodeURIComponent(fiche.id)}/${action}`,
        token,
        {
          method: 'POST',
          ...(body ? { body } : {}),
        },
      )

      window.alert('Action effectuée avec succès.')

      await loadData(token)
      onRefresh()
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await onSessionInvalid()
        return
      }

      setError(
        e instanceof Error
          ? e.message
          : 'Impossible de réaliser cette action.',
      )
    } finally {
      setBusy(false)
    }
    }, [
      token,
      role,
      setBusy,
      setError,
      loadData,
      onRefresh,
      onSessionInvalid,
    ])
  return { handleSupervisorAction }
}
