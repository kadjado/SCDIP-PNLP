import { useCallback, useEffect, useState } from 'react'
import FicheActions from '../fiches/FicheActions'
import './MailBox.css'

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

type MailboxProps = {
  token: string
  onUnreadCountChange: (count: number) => void
  notificationIdToOpen: string | null
  ficheIdToOpen: string | null
  role: string
  onRefresh: () => Promise<void>
  onSessionInvalid: () => Promise<void>
}

function formaterType(type: string) {
  const libelles: Record<string, string> = {
    fiche_a_valider: 'Fiche à valider',
    fiche_validee: 'Fiche validée',
    correction_demandee: 'Correction demandée',
    reponse_agent: 'Réponse de l’agent',
    correction_acceptee: 'Correction acceptée',
    nouvelle_correction: 'Nouvelle correction',
    fiche_modifiee: 'Fiche modifiée',
  }

  return libelles[type] || type.replace(/[_-]/g, ' ')
}

function formaterDate(date: string) {
  const valeur = new Date(date)

  if (Number.isNaN(valeur.getTime())) {
    return 'Date indisponible'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(valeur)
}

export default function Mailbox({
  token,
  onUnreadCountChange,
  notificationIdToOpen,
  ficheIdToOpen,
  role,
  onRefresh,
  onSessionInvalid,
}: MailboxProps) {
  const [items, setItems] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [nonLues, setNonLues] = useState(0)
  const [filter, setFilter] = useState<'toutes' | 'non-lues'>('toutes')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null)
  const [openFicheId, setOpenFicheId] = useState<string | null>(null)

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

      if (response.status === 401) {
        void onSessionInvalid()
      }

      throw new Error(message)
    }

    return response.json()
  }, [token, onSessionInvalid])

  const loadNotifications = useCallback(async () => {
    setError('')

    try {
      const params = new URLSearchParams({ limit: '100', offset: '0' })

      if (filter === 'non-lues') {
        params.set('non_lues_seulement', 'true')
      }

      const result = await request(
        `/api/v1/notifications?${params.toString()}`,
      ) as NotificationResponse

      setItems(result.items)
      setTotal(result.total)
      setNonLues(result.non_lues)
      onUnreadCountChange(result.non_lues)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Impossible de charger les notifications.',
      )
    } finally {
      setLoading(false)
    }
  }, [filter, request, onUnreadCountChange])

  // Actualisation périodique de la boîte de réception.
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
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadNotifications])

  // Sélection automatique de la notification transmise par le Push.
  useEffect(() => {
    if (notificationIdToOpen) {
      if (filter !== 'toutes') {
        setFilter('toutes')
      }

      const id = Number(notificationIdToOpen)

      if (Number.isSafeInteger(id) && id > 0) {
        setSelectedNotificationId(String(id))
      }

      return
    }

    // Compatibilité avec les anciennes notifications qui ne transmettent
    // que l'identifiant de la fiche.
    if (ficheIdToOpen && items.length > 0) {
      const notification = items.find(
        (item) => item.fiche_id === ficheIdToOpen,
      )

      if (notification) {
        setSelectedNotificationId(String(notification.id))
      }
    }
  }, [notificationIdToOpen, ficheIdToOpen, items, filter])

  const selectedNotification = items.find(
    (item) => String(item.id) === selectedNotificationId,
  ) || null

  const notificationDemandeeIntrouvable =
    Boolean(notificationIdToOpen) &&
    !loading &&
    !selectedNotification

  const markAsRead = async (id: number) => {
    setBusy(true)
    setError('')

    try {
      await request(`/api/v1/notifications/${id}/lue`, 'PATCH')
      await loadNotifications()
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Impossible de marquer cette notification comme lue.',
      )
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
      setError(
        e instanceof Error
          ? e.message
          : 'Impossible de marquer les notifications comme lues.',
      )
    } finally {
      setBusy(false)
    }
  }

  function fermerDetail() {
    setSelectedNotificationId(null)
  }

  return (
    <>
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

        {notificationDemandeeIntrouvable && (
          <div className="mailbox-not-found">
            <strong>Notification introuvable</strong>
            <p>
              Cette notification n’apparaît pas dans les 100 dernières
              notifications chargées. Actualise la boîte de réception.
            </p>
          </div>
        )}

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
              <article
                key={item.id}
                className={[
                  'mailbox-item',
                  item.est_lue ? 'read' : 'unread',
                  String(item.id) === selectedNotificationId ? 'selected' : '',
                ].join(' ')}
                role="button"
                tabIndex={0}
                aria-label={`Afficher la notification : ${item.titre}`}
                title="Cliquer pour afficher les détails"
                onClick={() => setSelectedNotificationId(String(item.id))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedNotificationId(String(item.id))
                  }
                }}
              >
                <div className="mailbox-item-icon">
                  {item.est_lue ? '✓' : '●'}
                </div>

                <div className="mailbox-item-content">
                  <div className="mailbox-item-top">
                    <strong>{item.titre}</strong>
                    {!item.est_lue && (
                      <span className="mailbox-unread-label">Non lue</span>
                    )}
                  </div>

                  <p>{item.message}</p>

                  <div className="mailbox-meta">
                    <span>{formaterDate(item.cree_le)}</span>
                    {item.fiche_id && <span>Fiche associée</span>}
                    {item.type && <span>{formaterType(item.type)}</span>}
                  </div>
                </div>

                <span className="mailbox-item-open-hint">
                  Voir les détails →
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedNotification && (
        <div
          className="mailbox-modal-backdrop"
          onClick={fermerDetail}
        >
          <section
            className="mailbox-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mailbox-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mailbox-modal-header">
              <div>
                <span className="mailbox-detail-eyebrow">
                  Détail de la notification
                </span>
                <h2 id="mailbox-detail-title">
                  {selectedNotification.titre}
                </h2>
                <p>
                  Notification reçue le {formaterDate(selectedNotification.cree_le)}
                </p>
              </div>

              <div className="mailbox-modal-header-right">
                <span
                  className={
                    selectedNotification.est_lue
                      ? 'mailbox-detail-status read'
                      : 'mailbox-detail-status unread'
                  }
                >
                  {selectedNotification.est_lue ? 'Lue' : 'Non lue'}
                </span>

                <button
                  type="button"
                  className="mailbox-modal-close"
                  onClick={fermerDetail}
                  aria-label="Fermer les détails"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="mailbox-modal-content">
              <section className="mailbox-message-card">
                <span className="mailbox-section-label">
                  Message
                </span>
                <p className="mailbox-detail-message">
                  {selectedNotification.message}
                </p>
              </section>

              <section className="mailbox-information-card">
                <h3>Informations de la notification</h3>

                <dl className="mailbox-detail-meta">
                  <div>
                    <dt>Type</dt>
                    <dd>{formaterType(selectedNotification.type)}</dd>
                  </div>

                  <div>
                    <dt>Date de réception</dt>
                    <dd>{formaterDate(selectedNotification.cree_le)}</dd>
                  </div>

                  <div>
                    <dt>Identifiant de notification</dt>
                    <dd>{selectedNotification.id}</dd>
                  </div>

                  <div>
                    <dt>Statut</dt>
                    <dd>
                      {selectedNotification.est_lue ? 'Lue' : 'Non lue'}
                    </dd>
                  </div>

                  {selectedNotification.lue_le && (
                    <div>
                      <dt>Date de lecture</dt>
                      <dd>{formaterDate(selectedNotification.lue_le)}</dd>
                    </div>
                  )}

                  {selectedNotification.fiche_id && (
                    <div>
                      <dt>Identifiant de la fiche associée</dt>
                      <dd>{selectedNotification.fiche_id}</dd>
                    </div>
                  )}
                </dl>
              </section>
            </div>

            <div className="mailbox-modal-footer">
              <div className="mailbox-modal-footer-info">
                <strong>Actions disponibles</strong>
                <span>
                  Gérez cette notification ou consultez la fiche concernée.
                </span>
              </div>

              <div className="mailbox-modal-footer-actions">
                {selectedNotification.fiche_id && (
                  <button
                    type="button"
                    className="mailbox-open-fiche-button"
                    onClick={() => setOpenFicheId(selectedNotification.fiche_id)}
                  >
                    Consulter la fiche associée
                  </button>
                )}

                {!selectedNotification.est_lue && (
                  <button
                    type="button"
                    className="mailbox-read-button"
                    disabled={busy}
                    onClick={() => void markAsRead(selectedNotification.id)}
                  >
                    {busy ? 'Mise à jour…' : 'Marquer comme lue'}
                  </button>
                )}

                <button
                  type="button"
                  className="mailbox-close-detail-button"
                  onClick={fermerDetail}
                >
                  Fermer
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {openFicheId && (
        <FicheActions
          ficheId={openFicheId}
          numeroFiche=""
          token={token}
          role={role}
          onRefresh={onRefresh}
          onSessionInvalid={onSessionInvalid}
          autoOpen
          hideActions
          onAutoOpenClose={() => setOpenFicheId(null)}
        />
      )}
    </>
  )
}
