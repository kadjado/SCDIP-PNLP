import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { useAuth } from './AuthContext'
import { api } from '../services/api'
import {
  activatePushNotifications,
  listenToForegroundMessages,
  obtenirJetonPushExistant,
} from '../pushNotifications'

type PushContextType = {
  pushEnabled: boolean
  pushBusy: boolean
  unreadNotifications: number
  setUnreadNotifications: (count: number) => void
  activatePush: () => Promise<void>
  disablePush: () => Promise<void>
  disablePushForLogout: () => Promise<void>
}

const PushContext = createContext<PushContextType | undefined>(undefined)

type PushProviderProps = {
  children: ReactNode
}

export function PushProvider({ children }: PushProviderProps) {
  const { token } = useAuth()

  const [pushBusy, setPushBusy] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const [pushEnabled, setPushEnabled] = useState(() => {
    const jeton = localStorage.getItem('scdip_push_token')
    return (
      Boolean(jeton) &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    )
  })

  const verifierEtatNotifications = useCallback(() => {
    const jeton = localStorage.getItem('scdip_push_token')
    const autorisationAccordee =
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'

    setPushEnabled(Boolean(jeton) && autorisationAccordee)
  }, [])

  useEffect(() => {
    if (!token) {
      setUnreadNotifications(0)
      return
    }

    let cancelled = false

    const refreshCount = async () => {
      try {
        const response = await api<{ non_lues: number }>(
          '/api/v1/notifications/non-lues/count',
          token,
        )

        if (!cancelled) {
          setUnreadNotifications(response.non_lues)
        }
      } catch {
        // Le prochain rafraîchissement réessaiera.
      }
    }

    void refreshCount()

    const timer = window.setInterval(() => {
      void refreshCount()
    }, 30000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [token])

  useEffect(() => {
    if (!token) return

    let cancelled = false

    async function synchroniserAppareilPush() {
      if (localStorage.getItem('scdip_push_disabled') === '1') {
        return
      }

      try {
        const jeton = await obtenirJetonPushExistant()

        if (!jeton || cancelled) return

        await api('/api/v1/notifications/appareils', token, {
          method: 'POST',
          body: JSON.stringify({
            jeton,
            plateforme: 'web',
          }),
        })

        if (!cancelled) {
          localStorage.setItem('scdip_push_token', jeton)
          setPushEnabled(true)
        }
      } catch (error) {
        console.warn(
          'Synchronisation automatique du Push impossible :',
          error,
        )
      }
    }

    void synchroniserAppareilPush()

    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (!token) return

    let cancelled = false
    let unsubscribe: (() => void) | undefined

    async function demarrerEcoutePush() {
      try {
        const arreter = await listenToForegroundMessages((payload) => {
          if (cancelled) return

          const donnees = payload as {
            notification?: {
              title?: string
              body?: string
            }
          }

          const titre =
            donnees.notification?.title || 'SCDIP - PNLP'

          const message =
            donnees.notification?.body ||
            'Vous avez une nouvelle notification.'

          if (
            typeof Notification !== 'undefined' &&
            Notification.permission === 'granted'
          ) {
            try {
              const notification = new Notification(titre, {
                body: message,
                icon: '/favicon.ico',
              })

              notification.onclick = () => {
                window.focus()
                notification.close()
              }
            } catch (error) {
              console.warn(
                'Affichage de la notification système impossible :',
                error,
              )
            }
          }

          void api<{ non_lues: number }>(
            '/api/v1/notifications/non-lues/count',
            token,
          )
            .then((result) => {
              if (!cancelled) {
                setUnreadNotifications(result.non_lues)
              }
            })
            .catch(() => {
              // Le rafraîchissement périodique actualisera le compteur.
            })
        })

        if (cancelled) {
          arreter?.()
        } else {
          unsubscribe = arreter
        }
      } catch (error) {
        console.error(
          'Écoute des notifications Push impossible :',
          error,
        )
      }
    }

    void demarrerEcoutePush()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [token])

  useEffect(() => {
    verifierEtatNotifications()

    const verifierAuRetour = () => {
      if (document.visibilityState === 'visible') {
        verifierEtatNotifications()
      }
    }

    window.addEventListener('focus', verifierEtatNotifications)
    document.addEventListener('visibilitychange', verifierAuRetour)

    return () => {
      window.removeEventListener('focus', verifierEtatNotifications)
      document.removeEventListener('visibilitychange', verifierAuRetour)
    }
  }, [verifierEtatNotifications])

  const activatePush = useCallback(async () => {
    if (!token || pushBusy) return

    setPushBusy(true)

    try {
      const jeton = await activatePushNotifications()

      await api('/api/v1/notifications/appareils', token, {
        method: 'POST',
        body: JSON.stringify({
          jeton,
          plateforme: 'web',
        }),
      })

      localStorage.removeItem('scdip_push_disabled')
      localStorage.setItem('scdip_push_token', jeton)
      setPushEnabled(true)
    } catch (error) {
      console.error('Erreur activation notifications :', error)
    } finally {
      setPushBusy(false)
    }
  }, [token, pushBusy])

  const disablePush = useCallback(async () => {
    if (!token || pushBusy) return

    const jeton = localStorage.getItem('scdip_push_token')

    if (!jeton) {
      localStorage.setItem('scdip_push_disabled', '1')
      localStorage.removeItem('scdip_push_token')
      setPushEnabled(false)
      return
    }

    setPushBusy(true)

    try {
      await api('/api/v1/notifications/appareils/desactiver', token, {
        method: 'PATCH',
        body: JSON.stringify({ jeton }),
      })

      setPushEnabled(false)
      localStorage.removeItem('scdip_push_token')
      localStorage.setItem('scdip_push_disabled', '1')
    } catch (error) {
      console.error('Erreur désactivation notifications :', error)
    } finally {
      setPushBusy(false)
    }
  }, [token, pushBusy])

  const disablePushForLogout = useCallback(async () => {
    const jeton = localStorage.getItem('scdip_push_token')

    if (token && jeton) {
      try {
        await api(
          '/api/v1/notifications/appareils/desactiver',
          token,
          {
            method: 'PATCH',
            body: JSON.stringify({ jeton }),
          },
        )
      } catch (error) {
        console.warn(
          'Impossible de désactiver le Push pendant la déconnexion :',
          error,
        )
      }
    }

    setPushEnabled(false)
    setUnreadNotifications(0)
  }, [token])

  const value = useMemo<PushContextType>(
    () => ({
      pushEnabled,
      pushBusy,
      unreadNotifications,
      setUnreadNotifications,
      activatePush,
      disablePush,
      disablePushForLogout,
    }),
    [
      pushEnabled,
      pushBusy,
      unreadNotifications,
      activatePush,
      disablePush,
      disablePushForLogout,
    ],
  )

  return (
    <PushContext.Provider value={value}>
      {children}
    </PushContext.Provider>
  )
}

export function usePush() {
  const context = useContext(PushContext)

  if (!context) {
    throw new Error('usePush doit être utilisé à l’intérieur de PushProvider.')
  }

  return context
}
