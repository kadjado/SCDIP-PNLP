import { useCallback, useEffect, useState } from 'react'
import './App.css'
import NewFicheForm from './NewFicheForm'
import UserCrud from './UserCrud'
import FicheActions from './FicheActions'
import Mailbox from './Mailbox'
import {
  activatePushNotifications,
  listenToForegroundMessages,
  obtenirJetonPushExistant,
} from './pushNotifications'
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

type User = {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  actif?: boolean
}

type Fiche = {
  id: string
  numero_fiche: string
  date_consultation: string
  date_saisie?: string
  age: number
  sexe: string
  diagnostic: string
  validation_confirmee?: boolean
  formation_sanitaire_id: number
}

type PagedFiches = {
  items: Fiche[]
  total: number
  limit: number
  offset: number
}

type Structure = {
  id: number
  code: string
  libelle: string
  actif?: boolean
}

async function api<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`
    try {
      const body = await response.json()
      message = typeof body.detail === 'string' ? body.detail : message
    } catch {
      // La réponse ne contient pas de message JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

const navigation = [
  { id: 'dashboard', icon: '▦', label: 'Tableau de bord' },
  { id: 'fiches', icon: '▤', label: 'Fiches paludisme' },
  { id: 'mailbox', icon: '✉', label: 'Messagerie' },
  { id: 'users', icon: '♙', label: 'Utilisateurs' },
  { id: 'structures', icon: '⌂', label: 'Structures sanitaires' },
] as const

type Page = typeof navigation[number]['id']

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('scdip_token') || '')
  const [user, setUser] = useState<User | null>(null)
  const [page, setPage] = useState<Page>('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)
  const isSupervisor = user?.role === 'superviseur'
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const [pushBusy, setPushBusy] = useState(false)
    const [pushEnabled, setPushEnabled] = useState(() => {
    const jeton = localStorage.getItem('scdip_push_token')

    return (
      Boolean(jeton) &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    )
  })
  const visibleNavigation = navigation.filter((item) => {
    if (isSupervisor) {
      return item.id === 'dashboard'
        || item.id === 'fiches'
        || item.id === 'mailbox'
    }

    return true
  })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fiches, setFiches] = useState<Fiche[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [regions, setRegions] = useState<Structure[]>([])
  const [prefectures, setPrefectures] = useState<Structure[]>([])
  const [communes, setCommunes] = useState<Structure[]>([])
  const [formations, setFormations] = useState<Structure[]>([])
  const [search, setSearch] = useState('')
  const [pagedFiches, setPagedFiches] = useState<Fiche[]>([])
  const [totalFiches, setTotalFiches] = useState(0)
  const [pageOffset, setPageOffset] = useState(0)
  const [showNewFiche, setShowNewFiche] = useState(false)
  const pageSize = 10

  const logout = useCallback(async () => {
    const jetonPush = localStorage.getItem('scdip_push_token')

    // Désactivation côté serveur avant de supprimer la session.
    if (token && jetonPush) {
      try {
        await api(
          '/api/v1/notifications/appareils/desactiver',
          token,
          {
            method: 'PATCH',
            body: JSON.stringify({ jeton: jetonPush }),
          },
        )
      } catch (e) {
        console.warn(
          'Impossible de désactiver le Push pendant la déconnexion :',
          e,
        )
      }
    }

    localStorage.removeItem('scdip_token')
    setToken('')
    setUser(null)
    setFiches([])
    setUsers([])
    setUnreadNotifications(0)
    setPushEnabled(false)
  }, [token])

  const loadData = useCallback(async (activeToken: string) => {
    setLoading(true)
    setError('')

    try {
      const me = await api<User>('/api/v1/auth/me', activeToken)
      setUser(me)

      if (me.role === 'superviseur') {
        setUsers([])
        setRegions([])
        setPrefectures([])
        setCommunes([])
        setFormations([])

        try {
          const supervisorFiches = await api<Fiche[]>(
            '/api/v1/fiches?limit=50&offset=0',
            activeToken,
          )
          setFiches(supervisorFiches)
        } catch (e) {
          setError(
            'Chargement des fiches impossible : ' +
            (e instanceof Error ? e.message : String(e)),
          )
        } finally {
          setLoading(false)
        }

        return
      }
   } catch (e) {
     await logout()
     setError(e instanceof Error ? e.message : 'Session invalide. Veuillez vous reconnecter.')
     setLoading(false)
     return
   }

    const results = await Promise.allSettled([
      api<Fiche[]>('/api/v1/fiches?limit=50&offset=0', activeToken),
      api<User[]>('/api/v1/admin/users?limit=100&offset=0', activeToken),
      api<Structure[]>('/api/v1/admin/structures/regions', activeToken),
      api<Structure[]>('/api/v1/admin/structures/prefectures', activeToken),
      api<Structure[]>('/api/v1/admin/structures/communes', activeToken),
      api<Structure[]>('/api/v1/admin/structures/formations-sanitaires', activeToken),
    ])

    if (results[0].status === 'fulfilled') setFiches(results[0].value)
    else setError('Chargement des fiches impossible : ' + String(results[0].reason))

    if (results[1].status === 'fulfilled') setUsers(results[1].value)
    if (results[2].status === 'fulfilled') setRegions(results[2].value)
    if (results[3].status === 'fulfilled') setPrefectures(results[3].value)
    if (results[4].status === 'fulfilled') setCommunes(results[4].value)
    if (results[5].status === 'fulfilled') setFormations(results[5].value)

    setLoading(false)
  }, [logout])

  useEffect(() => {
    if (token) void loadData(token)
  }, [token, loadData])

  const updateUnreadNotifications = useCallback((count: number) => {
    setUnreadNotifications(count)
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
        if (!cancelled) setUnreadNotifications(response.non_lues)
      } catch {
        // Le compteur sera réessayé au prochain rafraîchissement.
      }
    }

    void refreshCount()
    const timer = window.setInterval(() => void refreshCount(), 30000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [token])

  useEffect(() => {
    if (!token) return

    let cancelled = false

    async function synchroniserAppareilPush() {
      // Respecter le choix explicite de désactivation de l'utilisateur.
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
      } catch (e) {
        console.warn(
          'Synchronisation automatique du Push impossible :',
          e,
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

          // Afficher la notification système lorsque l'application est ouverte.
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
            } catch (e) {
              console.warn(
                'Affichage de la notification système impossible :',
                e,
              )
            }
          }

          // Actualiser le compteur depuis le serveur.
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
              // Le prochain rafraîchissement périodique actualisera le compteur.
            })
        })

        if (cancelled) {
          arreter?.()
        } else {
          unsubscribe = arreter
        }
      } catch (e) {
        console.error('Écoute des notifications Push impossible :', e)
      }
    }

    void demarrerEcoutePush()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [token])

//---------------------------------

  async function handleActivatePush() {
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
  } catch (e) {
    console.error('Erreur activation notifications :', e)
  } finally {
    setPushBusy(false)
  }
}

async function handleDisablePush() {
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
  } catch (e) {
    console.error('Erreur désactivation notifications :', e)
  } finally {
    setPushBusy(false)
  }
}

  const verifierEtatNotifications = useCallback(() => {
    const jeton = localStorage.getItem('scdip_push_token')

    const autorisationAccordee =
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'

    setPushEnabled(Boolean(jeton) && autorisationAccordee)
  }, [])

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

  useEffect(() => {
      if (
  isSupervisor
  && page !== 'dashboard'
  && page !== 'fiches'
  && page !== 'mailbox'
) {
      setPage('dashboard')
    }
  }, [isSupervisor, page])

  useEffect(() => {
    if (!token || page !== 'fiches') return

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
        )
        if (!cancelled) {
          setPagedFiches(result.items)
          setTotalFiches(result.total)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error
            ? 'Chargement des fiches impossible : ' + e.message
            : 'Chargement des fiches impossible.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [token, page, search, pageOffset, refreshKey])

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setLoginError('')

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const body = await response.json()
      if (!response.ok) {
        throw new Error(typeof body.detail === 'string' ? body.detail : 'Connexion impossible.')
      }

      if (!body.access_token) throw new Error('Le serveur n’a pas retourné de jeton de connexion.')

      localStorage.setItem('scdip_token', body.access_token)
      setToken(body.access_token)
      setPassword('')
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Impossible de contacter le serveur.')
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <main className="login-layout">
        <section className="login-brand">
          <div className="brand-mark">S</div>
          <span className="eyebrow">PROGRAMME NATIONAL DE LUTTE CONTRE LE PALUDISME</span>
          <h1>SCDIP<span>-PNLP</span></h1>
          <p>Système de collecte des données individuelles du paludisme.</p>
          <div className="login-note">
            <span className="note-icon">✓</span>
            <div><strong>Une collecte structurée</strong><small>Des données accessibles selon vos autorisations.</small></div>
          </div>
        </section>
        <section className="login-panel">
          <form className="login-card" onSubmit={handleLogin}>
            <div className="mobile-brand"><div className="brand-mark">S</div> SCDIP-PNLP</div>
            <span className="eyebrow">ESPACE SÉCURISÉ</span>
            <h2>Bienvenue</h2>
            <p className="muted">Connectez-vous à votre espace de travail.</p>
            <label htmlFor="email">Adresse e-mail</label>
            <input id="email" type="email" autoComplete="username" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="nom@organisation.tg" required />
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" required />
            {loginError && <div className="alert error">{loginError}</div>}
            {error && <div className="alert error">{error}</div>}
            <button className="primary-button login-button" disabled={busy}>
              {busy ? 'Connexion en cours…' : 'Se connecter'} <span>→</span>
            </button>
            <p className="login-foot">Accès réservé aux utilisateurs autorisés.</p>
          </form>
        </section>
      </main>
    )
  }

  async function handleSupervisorAction(
    fiche: Fiche,
    action: 'valider' | 'demander-correction' | 'traiter-correction',
  ) {
    if (!token || user?.role !== 'superviseur') return

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
        const saisieMotif = window.prompt('Motif de la nouvelle correction :')

        if (saisieMotif === null) return

        if (!saisieMotif.trim()) {
          window.alert('Le motif est obligatoire pour demander une nouvelle correction.')
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
      setRefreshKey((value) => value + 1)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Impossible de réaliser cette action.',
      )
    } finally {
      setBusy(false)
    }
  }

  const pageTitle = navigation.find((item) => item.id === page)?.label || 'Tableau de bord'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div><strong>SCDIP<span>-PNLP</span></strong><small>Gestion des données</small></div>
        </div>
        <div className="nav-caption">ESPACE DE TRAVAIL</div>
        <nav>
          {visibleNavigation.map((item) => (
            <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => { setPage(item.id); setSearch('') }}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'mailbox' && unreadNotifications > 0 && (
                <span className="notification-badge">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
              {page === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="secure-badge"><span>●</span> Session sécurisée</div>
          <div className="profile">
            <div className="avatar">{(user?.prenom?.[0] || 'U')}{(user?.nom?.[0] || '')}</div>
            <div className="profile-info"><strong>{user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}</strong><small>{user?.role || 'Compte connecté'}</small></div>
            <button className="logout-icon" title="Se déconnecter" onClick={logout}>↪</button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs">SCDIP <span>/</span> <strong>{pageTitle}</strong></div>
          <div className="top-actions">
            <span className="connection">
              <span className="online-dot" /> Connecté
            </span>

            <button
              type="button"
              className="refresh-button"
              onClick={() => {
                if (pushEnabled) {
                  void handleDisablePush()
                } else {
                  void handleActivatePush()
                }
              }}
              disabled={pushBusy}
              title={
                pushEnabled
                  ? 'Désactiver les notifications'
                  : 'Activer les notifications'
              }
              aria-label={
                pushEnabled
                  ? 'Désactiver les notifications'
                  : 'Activer les notifications'
              }
            >
              {pushEnabled ? '🔔' : '🔕'}
            </button>

            <button
              className="refresh-button"
              onClick={() => void loadData(token)}
              disabled={loading}
            >
              <span className={loading ? 'spin' : ''}>↻</span> Actualiser
            </button>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">SUIVI ET PILOTAGE</span>
              <h1>{pageTitle}</h1>
              <p className="muted">
                {page === 'dashboard' ? 'Vue d’ensemble des données disponibles dans votre périmètre.' :
                  page === 'fiches' ? 'Consultez les fiches accessibles à votre compte.' :
                  page === 'users' ? 'Consultez les comptes utilisateurs disponibles.' :
                  'Consultez les structures administratives et sanitaires.'}
              </p>
            </div>
            <div className="date-chip">{new Intl.DateTimeFormat('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric',
            }).format(new Date())}</div>
          </div>

          {error && <div className="alert error">{error}</div>}

          {page === 'dashboard' && (
            <>
              {isSupervisor ? (
                <div className="stats-grid">
                  <StatCard
                    icon="▤"
                    label="Fiches chargées"
                    value={String(fiches.length)}
                    detail="Fiches récentes accessibles"
                    tone="blue"
                  />
                  <StatCard
                    icon="◷"
                    label="Non validées"
                    value={String(fiches.filter((f) => !f.validation_confirmee).length)}
                    detail="Fiches restant à examiner"
                    tone="amber"
                  />
                  <StatCard
                    icon="✓"
                    label="Fiches validées"
                    value={String(fiches.filter((f) => f.validation_confirmee).length)}
                    detail="Parmi les fiches chargées"
                    tone="green"
                  />
                </div>
              ) : (
                <div className="stats-grid">
                  <StatCard
                    icon="▤"
                    label="Fiches chargées"
                    value={String(fiches.length)}
                    detail="Maximum 50 fiches récentes"
                    tone="blue"
                  />
                  <StatCard
                    icon="♙"
                    label="Utilisateurs chargés"
                    value={String(users.length)}
                    detail="Selon vos droits d’accès"
                    tone="violet"
                  />
                  <StatCard
                    icon="⌂"
                    label="Formations sanitaires"
                    value={String(formations.length)}
                    detail="Structures retournées par l’API"
                    tone="green"
                  />
                  <StatCard
                    icon="✓"
                    label="Fiches confirmées"
                    value={String(fiches.filter((f) => f.validation_confirmee).length)}
                    detail="Parmi les fiches chargées"
                    tone="amber"
                  />
                </div>
              )}

              <section className="panel recent-panel">
                <div className="panel-heading">
                  <div><h2>Fiches récentes</h2><p className="muted">Dernières fiches retournées par le serveur</p></div>
                  <button className="text-button" onClick={() => setPage('fiches')}>Voir les fiches <span>→</span></button>
                </div>
                <FicheTable
                  fiches={fiches.slice(0, 6)}
                  loading={loading}
                  role={user?.role || ''}
                  busy={busy}
                  onAction={handleSupervisorAction}
                  token={token}
                  onRefresh={async () => {
                    await loadData(token)
                    setRefreshKey((value) => value + 1)
                  }}
                />
              </section>

              {isSupervisor ? (
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Votre espace de supervision</h2>
                      <p className="muted">
                        Examinez les fiches de votre périmètre, demandez des corrections
                        et validez les fiches conformes.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setPage('fiches')}
                  >
                    Accéder aux fiches <span>→</span>
                  </button>
                </section>
              ) : (
                <div className="bottom-grid">
                  <section className="panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Structures administratives</h2>
                        <p className="muted">Données disponibles via l’API</p>
                      </div>
                    </div>
                    <div className="structure-list">
                      <StructureRow label="Régions" count={regions.length} icon="◈" />
                      <StructureRow label="Préfectures" count={prefectures.length} icon="⌖" />
                      <StructureRow label="Communes" count={communes.length} icon="⌂" />
                      <StructureRow label="Formations sanitaires" count={formations.length} icon="✚" />
                    </div>
                  </section>

                  <section className="panel access-panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Accès rapide</h2>
                        <p className="muted">Gestion des données</p>
                      </div>
                    </div>

                    <button className="quick-link" onClick={() => setPage('fiches')}>
                      <span className="quick-icon blue">▤</span>
                      <span>
                        <strong>Consulter les fiches</strong>
                        <small>Accéder aux données de collecte</small>
                      </span>
                      <b>→</b>
                    </button>

                    <button className="quick-link" onClick={() => setPage('users')}>
                      <span className="quick-icon violet">♙</span>
                      <span>
                        <strong>Utilisateurs</strong>
                        <small>Voir les comptes accessibles</small>
                      </span>
                      <b>→</b>
                    </button>

                    <button className="quick-link" onClick={() => setPage('structures')}>
                      <span className="quick-icon green">⌂</span>
                      <span>
                        <strong>Structures</strong>
                        <small>Voir les structures sanitaires</small>
                      </span>
                      <b>→</b>
                    </button>
                  </section>
                </div>
              )}
            </>
          )}

          {page === 'fiches' && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Registre des fiches</h2>
                  <p className="muted">
                    {totalFiches} fiche(s) au total
                    {totalFiches > 0
                      ? ` — ${pageOffset + 1}–${Math.min(pageOffset + pageSize, totalFiches)} affichée(s)`
                      : ''}
                  </p>
                </div>
<div className="nf-header-actions">
<input
                  className="search-input"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPageOffset(0)
                  }}
                  placeholder="Rechercher une fiche…"
                />
                {user?.role === 'agent_fs' && (
                  <button type="button" className="nf-plus-button" aria-label="Créer une nouvelle fiche" title="Nouvelle fiche paludisme" onClick={() => setShowNewFiche((value) => !value)}>{showNewFiche ? '×' : '+'}</button>
                )}
              </div>
              </div>

              {showNewFiche && user?.role === 'agent_fs' && token && (
                <NewFicheForm
                  token={token}
                  onCancel={() => setShowNewFiche(false)}
                  onCreated={async () => {
                    setShowNewFiche(false)
                    setSearch('')
                    setPageOffset(0)
                    const refreshed = await api<PagedFiches>('/api/v1/fiches/paginees?limit=10&offset=0', token)
                    setPagedFiches(refreshed.items)
                    setTotalFiches(refreshed.total)
                  }}
                />
              )}
              <FicheTable
                fiches={pagedFiches}
                loading={loading}
                role={user?.role || ''}
                busy={busy}
                onAction={handleSupervisorAction}
                token={token}
                onRefresh={async () => {
                  await loadData(token)
                  setRefreshKey((value) => value + 1)
                }}
              />
              <div className="table-foot pagination-controls">
                <span>
                  Page {Math.floor(pageOffset / pageSize) + 1} sur {Math.max(1, Math.ceil(totalFiches / pageSize))}
                </span>
                <div>
                  <button type="button" className="secondary-button"
                    disabled={loading || pageOffset === 0}
                    onClick={() => setPageOffset((offset) => Math.max(0, offset - pageSize))}>
                    Précédent
                  </button>
                  <button type="button" className="secondary-button"
                    disabled={loading || pageOffset + pageSize >= totalFiches}
                    onClick={() => setPageOffset((offset) => offset + pageSize)}>
                    Suivant
                  </button>
                </div>
              </div>
            </section>
          )}
          {page === 'mailbox' && (
            <Mailbox
              token={token}
              onUnreadCountChange={updateUnreadNotifications}
            />
          )}
          {page === 'users' && (
            <UserCrud
              token={token}
              users={users}
              regions={regions}
              prefectures={prefectures}
              communes={communes}
              formations={formations}
              currentUserId={user?.id}
              onRefresh={async () => {
                await loadData(token)
              }}
            />
          )}

          {page === 'structures' && (
            <div className="structure-grid">
              <StructurePanel title="Régions" items={regions} />
              <StructurePanel title="Préfectures" items={prefectures} />
              <StructurePanel title="Communes" items={communes} />
              <StructurePanel title="Formations sanitaires" items={formations} />
            </div>
          )}

          <footer className="footer"><span>SCDIP-PNLP</span><span>Collecte des données individuelles du paludisme</span></footer>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, detail, tone }: {
  icon: string; label: string; value: string; detail: string; tone: string
}) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><strong className="stat-value">{value}</strong><span className="stat-detail">{detail}</span></article>
}

function FicheTable({
  fiches,
  loading,
  role,
  busy,
  onAction,
  token,
  onRefresh,
}: {
  fiches: Fiche[]
  loading: boolean
  role: string
  busy: boolean
  token: string
  onRefresh: () => Promise<void>
  onAction: (
    fiche: Fiche,
    action: 'valider' | 'demander-correction' | 'traiter-correction',
  ) => void
}) {
  if (loading && fiches.length === 0) {
    return <EmptyState text="Chargement des fiches..." />
  }

  if (!fiches.length) {
    return <EmptyState text="Aucune fiche disponible dans les résultats chargés." />
  }

  const isSupervisor = role === 'superviseur'

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Numéro de fiche</th>
            <th>Date consultation</th>
            <th>Âge</th>
            <th>Sexe</th>
            <th>Diagnostic</th>
            <th>Validation</th>
            <th>Gestion</th>
            {isSupervisor && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {fiches.map((fiche) => (
            <tr key={fiche.id}>
              <td>
                <strong>{fiche.numero_fiche || fiche.id.slice(0, 8)}</strong>
              </td>

              <td>
                {fiche.date_consultation
                  ? new Date(fiche.date_consultation).toLocaleDateString('fr-FR')
                  : '—'}
              </td>

              <td>{fiche.age} ans</td>

              <td>
                {fiche.sexe === 'M'
                  ? 'Masculin'
                  : fiche.sexe === 'F'
                    ? 'Féminin'
                    : fiche.sexe}
              </td>

              <td>
                <span className="diagnostic">
                  {fiche.diagnostic || 'Non renseigné'}
                </span>
              </td>

              <td>
                <span
                  className={`status ${
                    fiche.validation_confirmee ? 'confirmed' : 'pending'
                  }`}
                >
                  {fiche.validation_confirmee ? 'Confirmée' : 'À confirmer'}
                </span>
              </td>
                <td>
                  <FicheActions
                    ficheId={fiche.id}
                    numeroFiche={fiche.numero_fiche}
                    token={token}
                    role={role}
                    onRefresh={onRefresh}
                  />
                </td>
              {isSupervisor && (
                <td>
                  <div className="fiche-actions">
                    {!fiche.validation_confirmee && (
                      <>
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={busy}
                          onClick={() => onAction(fiche, 'valider')}
                        >
                          Valider
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          disabled={busy}
                          onClick={() => onAction(fiche, 'demander-correction')}
                        >
                          Demander correction
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          disabled={busy}
                          onClick={() => onAction(fiche, 'traiter-correction')}
                        >
                          Traiter réponse
                        </button>
                      </>
                    )}

                    {fiche.validation_confirmee && (
                      <span className="status confirmed">Déjà validée</span>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StructureRow({ label, count, icon }: { label: string; count: number; icon: string }) {
  return <div className="structure-row"><span className="structure-row-icon">{icon}</span><span>{label}</span><strong>{count}</strong></div>
}

function StructurePanel({ title, items }: { title: string; items: Structure[] }) {
  return <section className="panel structure-panel"><div className="panel-heading"><div><h2>{title}</h2><p className="muted">{items.length} élément(s) chargé(s)</p></div></div>
    {!items.length ? <EmptyState text="Aucune donnée retournée ou accès indisponible." /> :
      <div className="structure-list">{items.map((item) => <div className="structure-row" key={item.id}><span className="structure-row-icon">⌂</span><span><strong>{item.libelle}</strong><small className="cell-sub">{item.code}</small></span>{item.actif !== undefined && <span className={`status ${item.actif ? 'confirmed' : 'inactive'}`}>{item.actif ? 'Actif' : 'Inactif'}</span>}</div>)}</div>}
  </section>
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state"><span>▤</span><p>{text}</p></div>
}

export default App
