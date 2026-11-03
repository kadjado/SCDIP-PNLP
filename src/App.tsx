import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000' || 'http://localhost:8000').replace(/\/$/, '')

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
  { id: 'dashboard', icon: 'dashboard', label: 'Tableau de bord' },
  { id: 'fiches', icon: 'fiches', label: 'Fiches paludisme' },
  { id: 'mailbox', icon: 'mailbox', label: 'Messagerie' },
  { id: 'users', icon: 'users', label: 'Utilisateurs' },
  { id: 'structures', icon: 'structures', label: 'Structures sanitaires' },
] as const

type Page = typeof navigation[number]['id']

const pagePaths: Record<Page, string> = {
  dashboard: '/dashboard',
  fiches: '/forms',
  mailbox: '/messagerie',
  users: '/utilisateurs',
  structures: '/structures',
}

const pathPages: Record<string, Page> = {
  '/': 'dashboard',
  '/login': 'dashboard',
  '/dashboard': 'dashboard',
  '/forms': 'fiches',
  '/messagerie': 'mailbox',
  '/utilisateurs': 'users',
  '/structures': 'structures',
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const [token, setToken] = useState(() => localStorage.getItem('scdip_token') || '')
  const [user, setUser] = useState<User | null>(null)

  const page: Page = pathPages[location.pathname] || 'dashboard'

  const setPage = useCallback((nextPage: Page) => {
    navigate(pagePaths[nextPage])
  }, [navigate])

  useEffect(() => {
    if (!token) {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true })
      }
      return
    }

    if (location.pathname === '/' || location.pathname === '/login') {
      navigate('/dashboard', { replace: true })
    }
  }, [token, location.pathname, navigate])
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
  const [showPassword, setShowPassword] = useState(false)
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
  const [menuOpen, setMenuOpen] = useState(() => typeof window === 'undefined' || window.innerWidth > 900)
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
      <main className="lg-page">
        <section className="lg-left">
          <div className="lg-stage">
            <div className="lg-hero">
              <svg className="lg-hero-bg" viewBox="0 0 880 799" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <defs>
                  <linearGradient id="lgHeroGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#04386f" />
                    <stop offset=".36" stopColor="#08558a" />
                    <stop offset=".6" stopColor="#177c78" />
                    <stop offset=".8" stopColor="#4aa35a" />
                    <stop offset="1" stopColor="#a9d6a0" />
                  </linearGradient>
                </defs>
                <path d="M0,3 C180,40 360,62 520,46 C650,34 770,18 880,8 L880,799 L0,799 Z" fill="url(#lgHeroGrad)" />
              </svg>
              <img className="lg-hero-art" src="/scdip-hero-art.jpg" alt="" aria-hidden="true" />
              <svg className="lg-hero-sw" viewBox="0 0 880 799" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <defs>
                  <linearGradient id="lgLow" gradientUnits="userSpaceOnUse" x1="150" y1="0" x2="720" y2="0">
                    <stop offset="0" stopColor="#063b72" stopOpacity="0" />
                    <stop offset=".5" stopColor="#4f93c8" stopOpacity=".85" />
                    <stop offset="1" stopColor="#d6e8f1" />
                  </linearGradient>
                  <linearGradient id="lgBlue" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#0a4a98" />
                    <stop offset="1" stopColor="#2386cc" />
                  </linearGradient>
                  <linearGradient id="lgGreen" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#14a04b" />
                    <stop offset="1" stopColor="#62c872" />
                  </linearGradient>
                </defs>
                <path d="M120,799 C320,745 560,735 880,520 L880,799 Z" fill="url(#lgLow)" />
                <path d="M250,640 C520,640 760,520 880,380 L880,445 C770,565 530,690 300,690 Z" fill="url(#lgBlue)" />
                <path d="M300,694 C540,692 780,572 880,450" fill="none" stroke="#fff" strokeWidth="4" />
                <path d="M330,700 C560,700 780,620 880,500 L880,560 C790,660 560,740 360,738 Z" fill="url(#lgGreen)" />
              </svg>
            </div>
            <img className="lg-emblem" src="/scdip-embleme.png" alt="Emblème SCDIP-PNLP" />
            <h1 className="lg-title">SCDIP<span>-PNLP</span></h1>
            <p className="lg-sub">Système de collecte des données individuelles<br />du paludisme</p>
            <div className="lg-prog">PROGRAMME NATIONAL DE LUTTE CONTRE LE PALUDISME</div>
            <div className="lg-togo"><span /><em>TOGO</em><span /></div>
            <h2 className="lg-h2">Ensemble contre<br />le <span>paludisme</span></h2>
            <p className="lg-lead">Des données fiables pour une meilleure surveillance et une action plus efficace.</p>
            <ul className="lg-features">
              <li><span className="lg-feature-icon"><LoginIcon name="chart" /></span><div><strong>Collecte des données</strong><small>Rapide et sécurisée</small></div></li>
              <li><span className="lg-feature-icon lg-green"><LoginIcon name="shieldCheck" /></span><div><strong>Suivi des cas</strong><small>À tous les niveaux</small></div></li>
              <li><span className="lg-feature-icon"><LoginIcon name="people" /></span><div><strong>Meilleure coordination</strong><small>Entre les acteurs de santé</small></div></li>
              <li><span className="lg-feature-icon lg-green"><LoginIcon name="pin" /></span><div><strong>Un Togo sans paludisme</strong><small>C’est possible !</small></div></li>
            </ul>
            <img className="lg-flag" src="/scdip-drapeau.png" alt="" aria-hidden="true" />
            <p className="lg-slogan">Un Togo sans paludisme, c’est possible !</p>
          </div>
        </section>
        <section className="lg-right">
          <div className="lg-rstage">
            <LoginIcon name="hexagons" />
            <div className="lg-hex-b"><LoginIcon name="hexagons" /></div>
            <form className="lg-card" onSubmit={handleLogin}>
              <img className="lg-card-logo" src="/scdip-embleme.png" alt="Emblème SCDIP-PNLP" />
              <h2>Bienvenue</h2>
              <p className="lg-card-sub">Connectez-vous à votre compte</p>
              <div className="lg-field">
                <span className="lg-field-icon"><LoginIcon name="user" /></span>
                <input id="email" type="text" autoComplete="username" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="Identifiant (e-mail ou nom d’utilisateur)" aria-label="Identifiant" required />
              </div>
              <div className="lg-field">
                <span className="lg-field-icon"><LoginIcon name="lock" /></span>
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" aria-label="Mot de passe" required />
                <button type="button" className="lg-eye" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  onClick={() => setShowPassword((value) => !value)}>
                  <LoginIcon name={showPassword ? 'eye' : 'eyeOff'} />
                </button>
              </div>
              {loginError && <div className="alert error">{loginError}</div>}
              {error && <div className="alert error">{error}</div>}
              <button type="submit" className="lg-submit" disabled={busy}>
                <LoginIcon name="login" /> {busy ? 'Connexion en cours…' : 'Se connecter'}
              </button>
              <div className="lg-options">
                <label className="lg-remember"><input type="checkbox" /> Se souvenir de moi</label>
                <a href="#" className="lg-forgot" onClick={(e) => { e.preventDefault(); window.alert('Veuillez contacter l’administrateur du système pour réinitialiser votre mot de passe.') }}>Mot de passe oublié ?</a>
              </div>
              <div className="lg-card-foot">
                <LoginIcon name="shieldCheck" />
                <div><strong>SCDIP-PNLP</strong><span>Programme National de Lutte contre le Paludisme</span><span>Togo</span></div>
              </div>
            </form>
            <div className="lg-bottom">
              <span><LoginIcon name="shield" /> Données fiables</span>
              <span><LoginIcon name="people" /> Communautés en bonne santé</span>
              <span><LoginIcon name="leaf" /> Un Togo sans paludisme</span>
            </div>
          </div>
        </section>
        <div className="lg-stripe" />
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
  const monthlyStats = getMonthlyStats(fiches)
  const currentMonth = monthlyStats[monthlyStats.length - 1]
  const previousMonth = monthlyStats[monthlyStats.length - 2]
  const validatedCount = fiches.filter((f) => f.validation_confirmee).length
  const structuresCount = isSupervisor
    ? new Set(fiches.map((f) => f.formation_sanitaire_id)).size
    : formations.length
  const userRoleLabel = (user?.role || 'Compte connecté').replace(/_/g, ' ')
  const closeMenuOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) setMenuOpen(false)
  }
  return (
    <div className={`app-shell ${menuOpen ? '' : 'menu-closed'}`}>
      <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img className="sidebar-emblem" src="/scdip-embleme.png" alt="Emblème SCDIP-PNLP" />
          <div className="sidebar-wordmark">
            <img src="/scdip-embleme.png" alt="" />
            <strong>SCDIP<span>-PNLP</span></strong>
          </div>
          <small>Ensemble contre le paludisme</small>
        </div>
        <nav>
          {visibleNavigation.map((item) => (
            <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => { setPage(item.id); setSearch(''); closeMenuOnMobile() }}>
              <span className="nav-icon"><Icon name={item.icon} /></span>
              <span className="nav-label">{item.label}</span>
              {item.id === 'mailbox' && unreadNotifications > 0 && (
                <span className="notification-badge">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="nav-separator" />
        <button className="nav-item nav-logout" title="Se déconnecter" onClick={logout}>
          <span className="nav-icon"><Icon name="logout" /></span>
          <span className="nav-label">Déconnexion</span>
        </button>
        <div className="sidebar-bottom">
          <p className="sidebar-slogan">Un Togo sans paludisme,<br />c’est possible !</p>
          <img className="sidebar-flag" src="/scdip-drapeau.png" alt="" />
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <button type="button" className="menu-toggle" aria-label="Afficher ou masquer le menu" onClick={() => setMenuOpen((value) => !value)}>
            <Icon name="menu" />
          </button>
          <div className="topbar-title">
            <h1>SCDIP-PNLP</h1>
            <p>Système de collecte des données individuelles du paludisme</p>
          </div>
          <div className="top-actions">
            <button
              type="button"
              className="icon-button"
              title="Actualiser les données"
              aria-label="Actualiser les données"
              onClick={() => void loadData(token)}
              disabled={loading}
            >
              <span className={loading ? 'spin' : ''}><Icon name="refresh" /></span>
            </button>
            <button
              type="button"
              className={`bell-button ${pushEnabled ? '' : 'is-off'}`}
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
              <Icon name="bell" />
              {unreadNotifications > 0 && (
                <span className="bell-badge">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>
              )}
            </button>
            <span className="top-divider" />
            <div className="user-pill">
              <span className="user-avatar"><Icon name="user" /></span>
              <span className="user-meta">
                <strong>{user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}</strong>
                <small>{userRoleLabel}</small>
              </span>
              <Icon name="chevron" />
            </div>
          </div>
        </header>
        <div className="content">
          {page !== 'dashboard' && (
            <div className="page-heading">
              <div>
                <span className="eyebrow">SUIVI ET PILOTAGE</span>
                <h1>{pageTitle}</h1>
                <p className="muted">
                  {page === 'fiches' ? 'Consultez les fiches accessibles à votre compte.' :
                    page === 'users' ? 'Consultez les comptes utilisateurs disponibles.' :
                    'Consultez les structures administratives et sanitaires.'}
                </p>
              </div>
              <div className="date-chip">{new Intl.DateTimeFormat('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric',
              }).format(new Date())}</div>
            </div>
          )}
          {error && <div className="alert error">{error}</div>}
          {page === 'dashboard' && (
            <>
              <DashboardHero onSeeDashboard={() => document.getElementById('dashboard-stats')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
              <div className="kpi-grid" id="dashboard-stats">
                <KpiCard
                  tone="blue"
                  icon="clipboard"
                  label={<>Fiches saisies<br />ce mois</>}
                  value={currentMonth.total}
                  current={currentMonth.total}
                  previous={previousMonth.total}
                  series={monthlyStats.map((item) => item.total)}
                />
                <KpiCard
                  tone="green"
                  icon="check"
                  label="Fiches validées"
                  value={validatedCount}
                  current={currentMonth.validated}
                  previous={previousMonth.validated}
                  series={monthlyStats.map((item) => item.validated)}
                />
                <KpiCard
                  tone="orange"
                  icon="bell"
                  label={<>Notifications<br />non lues</>}
                  value={unreadNotifications}
                  onClick={() => setPage('mailbox')}
                />
                <KpiCard
                  tone="violet"
                  icon="hospital"
                  label="Structures sanitaires"
                  value={structuresCount}
                  onClick={isSupervisor ? undefined : () => setPage('structures')}
                />
              </div>
              <div className="dashboard-insights">
                <EvolutionPanel fiches={fiches} />
                <NotificationPanel
                  unread={unreadNotifications}
                  pushEnabled={pushEnabled}
                  fiches={fiches}
                  onOpenMailbox={() => setPage('mailbox')}
                />
              </div>
              <PreventionBanner />
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

function LoginIcon({ name }: { name: string }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  const c = { viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false } as const
  switch (name) {
    case 'user': return <svg {...c} {...s}><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20c0-3.9 3.2-6.2 7.2-6.2s7.2 2.3 7.2 6.2" /></svg>
    case 'lock': return <svg {...c} fill="currentColor"><path d="M8 10V7.6a4 4 0 0 1 8 0V10h.8c1 0 1.7.8 1.7 1.7v7.1c0 1-.8 1.7-1.7 1.7H7.2c-1 0-1.7-.8-1.7-1.7v-7.1c0-1 .8-1.7 1.7-1.7zm2 0h4V7.6a2 2 0 0 0-4 0z" /></svg>
    case 'eye': return <svg {...c} {...s}><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
    case 'eyeOff': return <svg {...c} {...s}><path d="M2 12s3.6-6.5 10-6.5c2 0 3.7.6 5.1 1.5M22 12s-3.6 6.5-10 6.5c-2 0-3.7-.6-5.1-1.5" /><circle cx="12" cy="12" r="3" /><path d="m3.5 3.5 17 17" /></svg>
    case 'login': return <svg {...c} {...s}><path d="M14 4h4.2A1.8 1.8 0 0 1 20 5.8v12.4a1.8 1.8 0 0 1-1.8 1.8H14" /><path d="M4 12h11M11.5 8l4 4-4 4" /></svg>
    case 'chart': return <svg {...c} fill="currentColor"><rect x="4" y="11" width="4" height="9" rx="1" /><rect x="10" y="4" width="4" height="16" rx="1" /><rect x="16" y="8" width="4" height="12" rx="1" /></svg>
    case 'shieldCheck': return <svg {...c} {...s}><path d="M12 3 5 5.6v6c0 4.4 3 7.6 7 9.4 4-1.8 7-5 7-9.4v-6z" /><path d="m8.8 12.2 2.2 2.2 4.2-4.6" /></svg>
    case 'shield': return <svg {...c} {...s}><path d="M12 3 5 5.6v6c0 4.4 3 7.6 7 9.4 4-1.8 7-5 7-9.4v-6z" /><path d="m9 12 2.2 2.2L15.2 10" /></svg>
    case 'people': return <svg {...c} fill="currentColor"><circle cx="12" cy="8" r="3.2" /><circle cx="5.2" cy="9.6" r="2.4" /><circle cx="18.8" cy="9.6" r="2.4" /><path d="M6.2 19.5c0-3.3 2.6-5.6 5.8-5.6s5.8 2.3 5.8 5.6z" /><path d="M1.8 18c0-2.3 1.6-4 3.8-4 .9 0 1.7.3 2.3.7-1.1 1-1.8 2.3-2 3.3z" opacity=".85" /><path d="M22.2 18c0-2.3-1.6-4-3.8-4-.9 0-1.7.3-2.3.7 1.1 1 1.8 2.3 2 3.3z" opacity=".85" /></svg>
    case 'pin': return <svg {...c} {...s}><path d="M12 21s6.5-5.7 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.3 6.5 11 6.5 11z" /><circle cx="12" cy="10" r="2.4" /></svg>
    case 'leaf': return <svg {...c} {...s}><path d="M5 19c0-8 5-13 15-14 0 9-4 14-12 14" /><path d="M5 19c2-4 5-7 9-9" /></svg>
    case 'hexagons': return <svg className="lg-hex" viewBox="0 0 220 220" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M150 10l30 17v35l-30 17-30-17V27z" /><path d="M180 62l30 17v35l-30 17-30-17V79z" /><path d="M120 62l30 17v35l-30 17-30-17V79z" /><circle cx="60" cy="40" r="4" fill="currentColor" /><circle cx="95" cy="22" r="3" fill="currentColor" /><circle cx="200" cy="170" r="3" fill="currentColor" /></svg>
    default: return null
  }
}

function Icon({ name }: { name: string }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false } as const
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  switch (name) {
    case 'dashboard':
      return <svg {...common} fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" opacity=".78" /><rect x="3" y="13" width="8" height="8" rx="2" opacity=".78" /><rect x="13" y="13" width="8" height="8" rx="2" /></svg>
    case 'fiches':
    case 'clipboard':
      return <svg {...common} {...stroke}><path d="M9 4h6v2H9z" /><path d="M15 5h2.2A1.8 1.8 0 0 1 19 6.8v12.4a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 19.2V6.8A1.8 1.8 0 0 1 6.8 5H9" /><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" /></svg>
    case 'mailbox':
      return <svg {...common} {...stroke}><rect x="3" y="5" width="18" height="14" rx="2.2" /><path d="m3.5 7 8.5 6.5L20.5 7" /></svg>
    case 'users':
      return <svg {...common} fill="currentColor"><circle cx="12" cy="8" r="3.2" /><circle cx="5.2" cy="9.6" r="2.4" /><circle cx="18.8" cy="9.6" r="2.4" /><path d="M6.2 19.5c0-3.3 2.6-5.6 5.8-5.6s5.8 2.3 5.8 5.6z" /><path d="M1.8 18c0-2.3 1.6-4 3.8-4 .9 0 1.7.3 2.3.7-1.1 1-1.8 2.3-2 3.3z" opacity=".85" /><path d="M22.2 18c0-2.3-1.6-4-3.8-4-.9 0-1.7.3-2.3.7 1.1 1 1.8 2.3 2 3.3z" opacity=".85" /></svg>
    case 'structures':
      return <svg {...common} fill="currentColor"><path d="M12 3.2 2.6 11.4a.9.9 0 0 0 .6 1.6H5v7h5v-5h4v5h5v-7h1.8a.9.9 0 0 0 .6-1.6z" /></svg>
    case 'logout':
      return <svg {...common} {...stroke}><path d="M10 4H5.8A1.8 1.8 0 0 0 4 5.8v12.4A1.8 1.8 0 0 0 5.8 20H10" /><path d="M9 12h11M16.5 8l3.5 4-3.5 4" /></svg>
    case 'bell':
      return <svg {...common} {...stroke}><path d="M6 17h12l-1.5-2.2V10.5a4.5 4.5 0 0 0-9 0v4.3z" /><path d="M10 20a2.2 2.2 0 0 0 4 0" /></svg>
    case 'bellOff':
      return <svg {...common} {...stroke}><path d="M6 17h12l-1.5-2.2V10.5a4.5 4.5 0 0 0-9 0v4.3z" /><path d="M10 20a2.2 2.2 0 0 0 4 0" /><path d="m4 4 16 16" /></svg>
    case 'menu':
      return <svg {...common} {...stroke} strokeWidth={2.6}><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" /></svg>
    case 'chevron':
      return <svg {...common} width={18} height={18} {...stroke}><path d="m6 9 6 6 6-6" /></svg>
    case 'refresh':
      return <svg {...common} {...stroke}><path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5" /><path d="M4 4v4.5h4.5" /><path d="M4 13a8 8 0 0 0 14.3 4.3L20 15.5" /><path d="M20 20v-4.5h-4.5" /></svg>
    case 'user':
      return <svg {...common} fill="currentColor"><circle cx="12" cy="7.6" r="4.2" /><path d="M3.8 21c0-4.6 3.5-7.6 8.2-7.6s8.2 3 8.2 7.6z" /></svg>
    case 'bars':
      return <svg {...common} fill="currentColor"><rect x="3" y="11" width="4.4" height="9" rx="1" /><rect x="9.8" y="4" width="4.4" height="16" rx="1" /><rect x="16.6" y="8" width="4.4" height="12" rx="1" /></svg>
    case 'arrow':
      return <svg {...common} {...stroke}><path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" /></svg>
    case 'check':
      return <svg {...common} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.2" strokeWidth={2.4} /><path d="m7.8 12.4 3 3 5.6-6.2" /></svg>
    case 'hospital':
      return <svg {...common} fill="currentColor"><path fillRule="evenodd" d="M7 3h10a2 2 0 0 1 2 2v1.6h1.2A1.8 1.8 0 0 1 22 8.4V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.4a1.8 1.8 0 0 1 1.8-1.8H5V5a2 2 0 0 1 2-2zm4.2 3.2v1.6H9.6v1.6h1.6v1.6h1.6V9.4h1.6V7.8h-1.6V6.2zM6.4 13v2h2v-2zm4.6 0v2h2v-2zm4.6 0v2h2v-2zM6.4 17v2h2v-2zm4.6 0v2h2v-2zm4.6 0v2h2v-2z" /></svg>
    case 'info':
      return <svg {...common} fill="currentColor"><rect x="10.6" y="10" width="2.8" height="8.4" rx="1.4" /><circle cx="12" cy="6.4" r="1.7" /></svg>
    case 'shield':
      return <svg {...common} viewBox="0 0 48 56" width={62} height={72} fill="none"><path d="M24 2 5 8.6v15.8C5 38.6 13.4 48.4 24 54c10.6-5.6 19-15.4 19-29.6V8.6z" fill="#14a04b" stroke="#0b7a3a" strokeWidth="2" /><path d="M24 7 9.6 12v12.4c0 11.2 6.6 19.2 14.4 24 7.8-4.8 14.4-12.8 14.4-24V12z" fill="none" stroke="#fff" strokeWidth="2" opacity=".75" /><path d="m15.6 27.4 6 6 11-12.4" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    default:
      return null
  }
}

function DashboardHero({ onSeeDashboard }: { onSeeDashboard: () => void }) {
  return (
    <section className="dashboard-hero">
      <img className="hero-art" src="/scdip-hero-art.jpg" alt="" aria-hidden="true" />
      <div className="hero-copy">
        <h2>Bienvenue sur <span>SCDIP-PNLP</span></h2>
        <p>Ensemble pour une meilleure surveillance<br className="desktop-break" /> du paludisme au Togo</p>
        <button type="button" className="hero-button" onClick={onSeeDashboard}>
          <Icon name="bars" /> Voir le tableau de bord <Icon name="arrow" />
        </button>
      </div>
    </section>
  )
}

function getMonthlyStats(fiches: Fiche[]) {
  const now = new Date()
  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const items = fiches.filter((fiche) => {
      const rawDate = fiche.date_consultation || fiche.date_saisie
      if (!rawDate) return false
      const parsed = new Date(rawDate)
      return !Number.isNaN(parsed.getTime()) && `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}` === key
    })
    const month = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(date)
    return { label: month.charAt(0).toUpperCase() + month.slice(1), total: items.length, validated: items.filter((fiche) => fiche.validation_confirmee).length }
  })
}

const formatNumber = (value: number) => value.toLocaleString('fr-FR')

function niceStep(max: number) {
  const raw = Math.max(1, max) / 4
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const base = raw / pow
  const nice = base <= 1 ? 1 : base <= 2 ? 2 : base <= 2.5 ? 2.5 : base <= 5 ? 5 : 10
  return Math.max(1, Math.ceil(nice * pow))
}

function KpiCard({ tone, icon, label, value, current, previous, series, onClick }: {
  tone: 'blue' | 'green' | 'orange' | 'violet'
  icon: string
  label: React.ReactNode
  value: number
  current?: number
  previous?: number
  series?: number[]
  onClick?: () => void
}) {
  const trend = current !== undefined && previous !== undefined && previous > 0
    ? Math.round(((current - previous) / previous) * 100)
    : null
  let spark: { line: string; area: string } | null = null
  if (series && series.length > 1 && Math.max(...series) > 0) {
    const max = Math.max(...series)
    const pts = series.map((v, i) => [(i / (series.length - 1)) * 120, 38 - (v / max) * 30] as const)
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
    spark = { line, area: `${line} L120,44 L0,44 Z` }
  }
  const content = (
    <>
      <span className="kpi-icon"><Icon name={icon} /></span>
      <span className="kpi-body">
        <strong className="kpi-value">{formatNumber(value)}</strong>
        <span className="kpi-label">{label}</span>
      </span>
      {trend !== null && (
        <span className={`kpi-trend ${trend < 0 ? 'down' : ''}`}>{trend < 0 ? '↓' : '↑'} {trend > 0 ? '+' : ''}{trend}%</span>
      )}
      {spark && (
        <svg className="kpi-spark" viewBox="0 0 120 44" preserveAspectRatio="none" aria-hidden="true">
          <path d={spark.area} className="kpi-spark-area" />
          <path d={spark.line} className="kpi-spark-line" />
        </svg>
      )}
      {onClick && <span className="kpi-arrow"><Icon name="chevron" /></span>}
    </>
  )
  return onClick
    ? <button type="button" className={`kpi-card kpi-${tone} is-clickable`} onClick={onClick}>{content}</button>
    : <div className={`kpi-card kpi-${tone}`}>{content}</div>
}

function EvolutionPanel({ fiches }: { fiches: Fiche[] }) {
  const stats = getMonthlyStats(fiches)
  const step = niceStep(Math.max(...stats.map((item) => item.total), 1))
  const top = step * 4
  const W = 640, H = 218, L = 62, R = 622, T = 12, B = 170
  const xAt = (i: number) => L + (i / (stats.length - 1)) * (R - L)
  const yAt = (v: number) => B - (v / top) * (B - T)
  const poly = (key: 'total' | 'validated') => stats.map((item, i) => `${xAt(i)},${yAt(item[key])}`).join(' ')
  const area = `${L},${B} ${poly('total')} ${R},${B}`
  return (
    <section className="panel evolution-panel">
      <div className="panel-title-row">
        <h2><Icon name="bars" /> Évolution des fiches</h2>
        <div className="chart-legend"><span><i className="legend-blue" />Fiches saisies</span><span><i className="legend-green" />Fiches validées</span></div>
      </div>
      <div className="chart-wrap">
        <svg className="evolution-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Évolution mensuelle des fiches saisies et validées parmi les fiches chargées">
          <defs>
            <linearGradient id="evoFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0867e8" stopOpacity=".16" /><stop offset="1" stopColor="#0867e8" stopOpacity=".03" /></linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((n) => <g key={n}><line x1={L} y1={yAt(n * step)} x2={R} y2={yAt(n * step)} className="chart-gridline" /><text x={L - 12} y={yAt(n * step) + 5} textAnchor="end" className="chart-label">{formatNumber(n * step)}</text></g>)}
          {stats.map((item, i) => <line key={item.label + i} x1={xAt(i)} y1={T} x2={xAt(i)} y2={B + 6} className="chart-gridline" />)}
          <polygon points={area} fill="url(#evoFill)" />
          <polyline points={poly('validated')} className="chart-line chart-line-green" />
          <polyline points={poly('total')} className="chart-line chart-line-blue" />
          {stats.map((item, i) => <g key={item.label + i}><circle cx={xAt(i)} cy={yAt(item.validated)} r="5.5" className="chart-dot-green" /><circle cx={xAt(i)} cy={yAt(item.total)} r="5.5" className="chart-dot-blue" /><text x={xAt(i)} y={B + 30} textAnchor={i === 0 ? 'start' : i === stats.length - 1 ? 'end' : 'middle'} dx={i === 0 ? -14 : 0} className="chart-label">{item.label}</text></g>)}
        </svg>
      </div>
    </section>
  )
}

function formatNotificationDate(raw?: string) {
  if (!raw) return ''
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return ''
  const date = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsed)
  if (!raw.includes('T')) return date
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(parsed)
  return `À ${time} - ${date}`
}

function NotificationPanel({ unread, pushEnabled, fiches, onOpenMailbox }: { unread: number; pushEnabled: boolean; fiches: Fiche[]; onOpenMailbox: () => void }) {
  const latest = fiches.reduce<Fiche | null>((best, fiche) => {
    const stamp = new Date(fiche.date_saisie || fiche.date_consultation || '').getTime()
    const bestStamp = best ? new Date(best.date_saisie || best.date_consultation || '').getTime() : -Infinity
    return !Number.isNaN(stamp) && stamp > bestStamp ? fiche : best
  }, null)
  return (
    <section className="panel notification-panel">
      <div className="panel-title-row">
        <h2><Icon name="bell" /> Dernières notifications</h2>
        <button type="button" className="text-button" onClick={onOpenMailbox}>Voir toutes <Icon name="arrow" /></button>
      </div>
      <div className="notif-list">
        <div className="notif-row">
          <span className="notif-icon notif-green"><Icon name="mailbox" /></span>
          <span className="notif-text"><strong>{unread > 0 ? `${unread} message${unread > 1 ? 's' : ''} non lu${unread > 1 ? 's' : ''}` : 'Messagerie à jour'}</strong><small>Messagerie SCDIP-PNLP</small></span>
          <span className={`notif-pill ${unread > 0 ? 'pill-warn' : ''}`}>{unread > 0 ? 'À lire' : 'À jour'}</span>
        </div>
        <div className="notif-row">
          <span className="notif-icon notif-blue"><Icon name="bell" /></span>
          <span className="notif-text"><strong>Notifications Push {pushEnabled ? 'activées' : 'non activées'}</strong><small>Sur cet appareil</small></span>
          <span className={`notif-pill ${pushEnabled ? '' : 'pill-off'}`}>{pushEnabled ? 'Actif' : 'Inactif'}</span>
        </div>
        <div className="notif-row">
          <span className="notif-icon notif-orange"><Icon name="info" /></span>
          <span className="notif-text"><strong>{latest ? 'Nouvelle fiche soumise' : 'Aucune fiche récente'}</strong><small>{latest ? `Fiche ${latest.numero_fiche}` : 'Les fiches apparaîtront ici'}</small></span>
          {latest && <span className="notif-date">{formatNotificationDate(latest.date_saisie || latest.date_consultation)}</span>}
        </div>
      </div>
    </section>
  )
}

function PreventionBanner() {
  return (
    <section className="prevention-banner">
      <span className="prevention-icon"><Icon name="shield" /></span>
      <strong>Prévenir le paludisme, protéger nos communautés</strong>
      <img className="prevention-art" src="/scdip-banner-art.jpg" alt="" aria-hidden="true" />
    </section>
  )
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
