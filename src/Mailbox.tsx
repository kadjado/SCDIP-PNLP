import { useCallback, useEffect, useState } from 'react'

const API = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

type Notification = {
  id: number
  type: string
  titre: string
  message: string
  fiche_id: string | null
  cree_le: string
  lue_le: string | null
  est_lue: boolean
}

type NotificationResponse = {
  items: Notification[]
  total: number
  non_lues: number
  limit: number
  offset: number
}

export default function Mailbox({
  token,
  onUnreadCountChange,
}: {
  token: string
  onUnreadCountChange: (count: number) => void
}) {
  const [items, setItems] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [nonLues, setNonLues] = useState(0)
  const [filter, setFilter] = useState<'toutes' | 'non-lues'>('toutes')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const request = useCallback(async (path: string, method = 'GET') => {
    const response = await fetch(`${API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      let message = `Erreur HTTP ${response.status}`
      try {
        const body = await response.json()
        if (typeof body.detail === 'string') message = body.detail
      } catch {
        // La réponse n'est pas au format JSON.
      }
      throw new Error(message)
    }

    return response.json()
  }, [token])

  const loadNotifications = useCallback(async () => {
    setError('')
    try {
      const params = new URLSearchParams({ limit: '100', offset: '0' })
      if (filter === 'non-lues') params.set('non_lues_seulement', 'true')

      const result = await request(`/api/v1/notifications?${params.toString()}`) as NotificationResponse
      setItems(result.items)
      setTotal(result.total)
      setNonLues(result.non_lues)
      onUnreadCountChange(result.non_lues)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les notifications.')
    } finally {
      setLoading(false)
    }
  }, [filter, request, onUnreadCountChange])

    useEffect(() => {
    let cancelled = false
    let loadingRequest = false

    const refresh = async () => {
      if (
        cancelled ||
        loadingRequest ||
        document.visibilityState !== 'visible'
      ) {
        return
      }

      loadingRequest = true

      try {
        await loadNotifications()
      } finally {
        loadingRequest = false
      }
    }

    void refresh()

    const timer = window.setInterval(() => {
      void refresh()
    }, 15000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )
    }
  }, [loadNotifications])

  const markAsRead = async (id: number) => {
    setBusy(true)
    setError('')
    try {
      await request(`/api/v1/notifications/${id}/lue`, 'PATCH')
      await loadNotifications()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de marquer cette notification comme lue.')
    } finally {
      setBusy(false)
    }
  }

  const markAllAsRead = async () => {
    setBusy(true)
    setError('')
    try {
      await request('/api/v1/notifications/lues', 'PATCH')
      await loadNotifications()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de marquer les notifications comme lues.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel mailbox">
      <div className="panel-heading mailbox-heading">
        <div>
          <h2>Boîte de réception</h2>
          <p className="muted">
            {nonLues} notification{nonLues !== 1 ? 's' : ''} non lue{nonLues !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => void loadNotifications()}
          disabled={loading || busy}
        >
          Actualiser
        </button>
      </div>

      <div className="mailbox-toolbar">
        <div className="mailbox-filters">
          <button
            type="button"
            className={filter === 'toutes' ? 'mailbox-filter active' : 'mailbox-filter'}
            onClick={() => setFilter('toutes')}
          >
            Toutes ({total})
          </button>
          <button
            type="button"
            className={filter === 'non-lues' ? 'mailbox-filter active' : 'mailbox-filter'}
            onClick={() => setFilter('non-lues')}
          >
            Non lues ({nonLues})
          </button>
        </div>
        <button
          type="button"
          className="text-button"
          onClick={() => void markAllAsRead()}
          disabled={busy || nonLues === 0}
        >
          Tout marquer comme lu
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="mailbox-empty">Chargement des notifications…</div>
      ) : items.length === 0 ? (
        <div className="mailbox-empty">
          <div className="mailbox-empty-icon">✉</div>
          <strong>Aucune notification</strong>
          <p>Les notifications qui vous sont destinées apparaîtront ici.</p>
        </div>
      ) : (
        <div className="mailbox-list">
          {items.map((item) => (
            <article key={item.id} className={`mailbox-item ${item.est_lue ? 'read' : 'unread'}`}>
              <div className="mailbox-item-icon">{item.est_lue ? '✓' : '●'}</div>
              <div className="mailbox-item-content">
                <div className="mailbox-item-top">
                  <strong>{item.titre}</strong>
                  {!item.est_lue && <span className="mailbox-unread-label">Non lue</span>}
                </div>
                <p>{item.message}</p>
                <div className="mailbox-meta">
                  <span>
                    {new Intl.DateTimeFormat('fr-FR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(item.cree_le))}
                  </span>
                  {item.fiche_id && <span>Fiche : {item.fiche_id}</span>}
                  {item.type && <span>{item.type.replace(/[_-]/g, ' ')}</span>}
                </div>
              </div>
              {!item.est_lue && (
                <button
                  type="button"
                  className="secondary-button mailbox-read-button"
                  disabled={busy}
                  onClick={() => void markAsRead(item.id)}
                >
                  Marquer comme lue
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
