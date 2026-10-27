import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API_URL = (
  import.meta.env.VITE_API_URL || 'https://backend-b66fa288.fastapicloud.dev/'
).replace(/\/$/, '')

type SessionUser = {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
}

type Fiche = {
  id: string
  numero_fiche?: string
  num_oc?: string
  date_consultation?: string
  diagnostic?: string
  validation_confirmee?: boolean
  cree_le?: string
}

type Agent = {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  actif: boolean
}

type Structure = {
  id: number
  code?: string
  libelle: string
  actif?: boolean
}

type Page = 'overview' | 'fiches' | 'users' | 'structures'

const roleLabels: Record<string, string> = {
  agent_fs: 'Agent de santé',
  superviseur_communal: 'Superviseur communal',
  superviseur_prefectoral: 'Superviseur préfectoral',
  superviseur_regional: 'Superviseur régional',
  administrateur_national: 'Administrateur national',
}

async function apiRequest<T>(
  path: string,
  token?: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let detail = `Erreur HTTP ${response.status}`

    try {
      const body = await response.json()
      if (typeof body.detail === 'string') detail = body.detail
    } catch {
      // La réponse n'est pas nécessairement au format JSON.
    }

    throw new Error(detail)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function getError(error: unknown): string {
  if (error instanceof TypeError) {
    return 'Impossible de joindre le serveur. Vérifie que le backend est démarré et que son adresse est correcte.'
  }

  return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.'
}

function formatDate(value?: string): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function App() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('scdip_access_token'),
  )
  const [user, setUser] = useState<SessionUser | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [page, setPage] = useState<Page>('overview')
  const [loading, setLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [fiches, setFiches] = useState<Fiche[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [regions, setRegions] = useState<Structure[]>([])
  const [prefectures, setPrefectures] = useState<Structure[]>([])
  const [communes, setCommunes] = useState<Structure[]>([])
  const [formations, setFormations] = useState<Structure[]>([])

  const logout = useCallback(() => {
    localStorage.removeItem('scdip_access_token')
    setToken(null)
    setUser(null)
    setPassword('')
    setFiches([])
    setAgents([])
    setRegions([])
    setPrefectures([])
    setCommunes([])
    setFormations([])
    setDataError('')
  }, [])

  const loadData = useCallback(async (accessToken: string) => {
    setLoading(true)
    setDataError('')

    const loadList = async <T,>(
      path: string,
      setter: (value: T[]) => void,
    ) => {
      try {
        const result = await apiRequest<T[]>(path, accessToken)
        setter(Array.isArray(result) ? result : [])
      } catch (error) {
        console.warn(`Chargement impossible : ${path}`, error)
      }
    }

    try {
      await Promise.all([
        loadList<Fiche>('/api/v1/fiches?limit=50&offset=0', setFiches),
        loadList<Agent>('/api/v1/admin/users?limit=100&offset=0', setAgents),
        loadList<Structure>('/api/v1/admin/structures/regions', setRegions),
        loadList<Structure>('/api/v1/admin/structures/prefectures', setPrefectures),
        loadList<Structure>('/api/v1/admin/structures/communes', setCommunes),
        loadList<Structure>(
          '/api/v1/admin/structures/formations-sanitaires',
          setFormations,
        ),
      ])
    } catch (error) {
      setDataError(getError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!token) return

    let cancelled = false

    apiRequest<SessionUser>('/api/v1/auth/me', token)
      .then((sessionUser) => {
        if (!cancelled) setUser(sessionUser)
      })
      .catch(() => {
        if (!cancelled) logout()
      })

    return () => {
      cancelled = true
    }
  }, [token, logout])

  useEffect(() => {
    if (token && user) void loadData(token)
  }, [token, user, loadData])

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const result = await apiRequest<{
        access_token: string
        user: SessionUser
      }>('/api/v1/auth/login', undefined, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (!result.access_token || !result.user) {
        throw new Error('La réponse du serveur est incomplète.')
      }

      localStorage.setItem('scdip_access_token', result.access_token)
      setUser(result.user)
      setToken(result.access_token)
      setPassword('')
    } catch (error) {
      setLoginError(getError(error))
    } finally {
      setLoginLoading(false)
    }
  }

  if (!token || !user) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="brand-mark">S</div>
          <p className="eyebrow">PROGRAMME NATIONAL DE LUTTE CONTRE LE PALUDISME</p>
          <h1>SCDIP-PNLP</h1>
          <p className="login-subtitle">
            Système de collecte des données individuelles du paludisme
          </p>

          <div className="login-divider" />
          <h2>Connexion à votre espace</h2>
          <p className="muted">Utilisez votre compte professionnel.</p>

          <form onSubmit={handleLogin} className="login-form">
            <label htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nom@exemple.org"
              required
            />

            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Votre mot de passe"
              required
            />

            {loginError && (
              <div className="alert alert-error" role="alert">
                {loginError}
              </div>
            )}

            <button className="primary-button login-button" disabled={loginLoading}>
              {loginLoading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          <p className="login-footer">
            Accès réservé aux utilisateurs autorisés.
          </p>
        </section>
      </main>
    )
  }

  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: 'overview', label: 'Vue d’ensemble', icon: '◫' },
    { id: 'fiches', label: 'Fiches paludisme', icon: '▤' },
    { id: 'users', label: 'Utilisateurs', icon: '♙' },
    { id: 'structures', label: 'Structures sanitaires', icon: '⌂' },
  ]

  const pageTitles: Record<Page, string> = {
    overview: 'Vue d’ensemble',
    fiches: 'Fiches paludisme',
    users: 'Gestion des utilisateurs',
    structures: 'Structures sanitaires',
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">S</div>
          <div>
            <strong>SCDIP-PNLP</strong>
            <span>Collecte sanitaire</span>
          </div>
        </div>

        <div className="nav-caption">MENU PRINCIPAL</div>
        <nav className="main-nav" aria-label="Navigation principale">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-note">
            <span className="security-icon">✓</span>
            <div>
              <strong>Espace sécurisé</strong>
              <p>Accès authentifié</p>
            </div>
          </div>
          <button className="logout-button" onClick={logout}>
            ↪ Déconnexion
          </button>
          <p className="version-label">SCDIP-PNLP · Interface web</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Espace de travail <span>/</span> {pageTitles[page]}</div>
          <div className="profile">
            <div className="profile-avatar">
              {(user.prenom?.[0] || '') + (user.nom?.[0] || '')}
            </div>
            <div className="profile-info">
              <strong>{user.prenom} {user.nom}</strong>
              <span>{roleLabels[user.role] || user.role}</span>
            </div>
            <button className="logout-mobile" onClick={logout}>Quitter</button>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">SUIVI ÉPIDÉMIOLOGIQUE</p>
              <h1>{pageTitles[page]}</h1>
              <p className="muted">
                Consultez les données disponibles dans votre espace.
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={() => void loadData(token)}
              disabled={loading}
            >
              <span className={loading ? 'refresh-icon spinning' : 'refresh-icon'}>↻</span>
              {loading ? 'Actualisation…' : 'Actualiser'}
            </button>
          </div>

          {dataError && (
            <div className="alert alert-error" role="alert">{dataError}</div>
          )}

          <div className="notice">
            <span className="notice-symbol">i</span>
            <p>
              Les compteurs ci-dessous représentent les éléments récupérés par
              cette interface, et non nécessairement les totaux de toute la base.
              Les données restent soumises aux droits de votre compte.
            </p>
          </div>

          {page === 'overview' && (
            <>
              <div className="welcome-banner">
                <div>
                  <span className="welcome-label">ESPACE DE PILOTAGE</span>
                  <h2>Bienvenue dans votre espace de suivi</h2>
                  <p>
                    Retrouvez les fiches disponibles et les ressources de collecte
                    du programme.
                  </p>
                </div>
                <div className="banner-symbol" aria-hidden="true">＋</div>
              </div>

              <div className="section-heading">
                <h2>Indicateurs de votre espace</h2>
                <span className="live-label"><span /> Données chargées depuis l’API</span>
              </div>

              <div className="stats-grid">
                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon teal">▤</span>
                    <span className="stat-tag">Collecte</span>
                  </div>
                  <p className="stat-label">Fiches chargées</p>
                  <strong className="stat-number">{fiches.length}</strong>
                  <span className="stat-foot">Maximum 50 dans cette vue</span>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon blue">♙</span>
                    <span className="stat-tag">Comptes</span>
                  </div>
                  <p className="stat-label">Utilisateurs chargés</p>
                  <strong className="stat-number">{agents.length}</strong>
                  <span className="stat-foot">Maximum 100 dans cette vue</span>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon purple">⌂</span>
                    <span className="stat-tag">Territoires</span>
                  </div>
                  <p className="stat-label">Régions chargées</p>
                  <strong className="stat-number">{regions.length}</strong>
                  <span className="stat-foot">Structures géographiques</span>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon orange">＋</span>
                    <span className="stat-tag">Soins</span>
                  </div>
                  <p className="stat-label">Formations sanitaires</p>
                  <strong className="stat-number">{formations.length}</strong>
                  <span className="stat-foot">Établissements chargés</span>
                </article>
              </div>

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Fiches récemment disponibles</h2>
                    <p>Les dernières fiches renvoyées par le serveur.</p>
                  </div>
                  <button className="text-button" onClick={() => setPage('fiches')}>
                    Voir les fiches →
                  </button>
                </div>
                <FicheTable fiches={fiches.slice(0, 5)} />
              </section>

              <section className="quick-links">
                <button onClick={() => setPage('fiches')}>
                  <span className="quick-icon teal">▤</span>
                  <span><strong>Consulter les fiches</strong><small>Accéder aux données collectées</small></span>
                  <span className="quick-arrow">→</span>
                </button>
                <button onClick={() => setPage('structures')}>
                  <span className="quick-icon blue">⌂</span>
                  <span><strong>Explorer les structures</strong><small>Régions, communes et formations</small></span>
                  <span className="quick-arrow">→</span>
                </button>
              </section>
            </>
          )}

          {page === 'fiches' && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Registre des fiches</h2>
                  <p>{fiches.length} fiche(s) chargée(s) depuis l’API.</p>
                </div>
              </div>
              <FicheTable fiches={fiches} />
              <p className="table-footnote">
                La pagination avancée et les filtres seront ajoutés dans une prochaine étape.
              </p>
            </section>
          )}

          {page === 'users' && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Comptes utilisateurs</h2>
                  <p>{agents.length} compte(s) renvoyé(s) par l’API d’administration.</p>
                </div>
              </div>
              {agents.length === 0 ? (
                <EmptyState text="Aucun utilisateur disponible ou accès à cette liste non autorisé." />
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Utilisateur</th><th>E-mail</th><th>Rôle</th><th>État</th></tr></thead>
                    <tbody>
                      {agents.map((agent) => (
                        <tr key={agent.id}>
                          <td><strong>{agent.prenom} {agent.nom}</strong></td>
                          <td>{agent.email}</td>
                          <td>{roleLabels[agent.role] || agent.role}</td>
                          <td><span className={`status ${agent.actif ? 'status-ok' : 'status-off'}`}>{agent.actif ? 'Actif' : 'Inactif'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="table-footnote">
                La création et la modification des comptes seront intégrées après validation de cet affichage.
              </p>
            </section>
          )}

          {page === 'structures' && (
            <div className="structure-grid">
              <StructureCard title="Régions" items={regions} />
              <StructureCard title="Préfectures" items={prefectures} />
              <StructureCard title="Communes" items={communes} />
              <StructureCard title="Formations sanitaires" items={formations} />
            </div>
          )}

          <footer className="page-footer">
            <span>SCDIP-PNLP · Collecte des données individuelles du paludisme</span>
            <span>Interface web connectée à l’API</span>
          </footer>
        </section>
      </main>
    </div>
  )
}

function FicheTable({ fiches }: { fiches: Fiche[] }) {
  if (fiches.length === 0) {
    return <EmptyState text="Aucune fiche disponible pour le moment, ou les données n’ont pas pu être chargées." />
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Numéro de fiche</th><th>Date de consultation</th><th>Diagnostic</th><th>Validation</th></tr>
        </thead>
        <tbody>
          {fiches.map((fiche) => (
            <tr key={fiche.id}>
              <td><strong>{fiche.numero_fiche || fiche.num_oc || fiche.id.slice(0, 8)}</strong></td>
              <td>{formatDate(fiche.date_consultation)}</td>
              <td>{fiche.diagnostic || 'Non renseigné'}</td>
              <td>
                <span className={`status ${fiche.validation_confirmee ? 'status-ok' : 'status-pending'}`}>
                  {fiche.validation_confirmee ? 'Confirmée' : 'En attente'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StructureCard({ title, items }: { title: string; items: Structure[] }) {
  return (
    <section className="panel structure-card">
      <div className="structure-card-heading">
        <div>
          <h2>{title}</h2>
          <span className="structure-count">{items.length}</span>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="empty-inline">Aucune donnée disponible ou accès non autorisé.</p>
      ) : (
        <ul className="structure-list">
          {items.slice(0, 10).map((item) => (
            <li key={item.id}>
              <span className="structure-dot" />
              <span>{item.libelle}</span>
              {item.code && <small>{item.code}</small>}
            </li>
          ))}
        </ul>
      )}
      {items.length > 10 && <p className="table-footnote">10 éléments affichés sur {items.length}.</p>}
    </section>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <span className="empty-symbol">▤</span>
      <p>{text}</p>
    </div>
  )
}

export default App
