import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

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

type Structure = {
  id: number
  code: string
  libelle: string
  actif?: boolean
}

async function api<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
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

  return response.json() as Promise<T>
}

const navigation = [
  { id: 'dashboard', icon: '▦', label: 'Tableau de bord' },
  { id: 'fiches', icon: '▤', label: 'Fiches paludisme' },
  { id: 'users', icon: '♙', label: 'Utilisateurs' },
  { id: 'structures', icon: '⌂', label: 'Structures sanitaires' },
] as const

type Page = typeof navigation[number]['id']

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('scdip_token') || '')
  const [user, setUser] = useState<User | null>(null)
  const [page, setPage] = useState<Page>('dashboard')
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

  const logout = useCallback(() => {
    localStorage.removeItem('scdip_token')
    setToken('')
    setUser(null)
    setFiches([])
    setUsers([])
  }, [])

  const loadData = useCallback(async (activeToken: string) => {
    setLoading(true)
    setError('')

    try {
      const me = await api<User>('/api/v1/auth/me', activeToken)
      setUser(me)
    } catch (e) {
      logout()
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

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setLoginError('')

    try {
      const response = await fetch(`${API}/api/v1/auth/login`, {
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

  const filteredFiches = fiches.filter((fiche) =>
    `${fiche.numero_fiche} ${fiche.diagnostic} ${fiche.sexe} ${fiche.formation_sanitaire_id}`
      .toLowerCase().includes(search.toLowerCase()),
  )

  const filteredUsers = users.filter((item) =>
    `${item.nom} ${item.prenom} ${item.email} ${item.role}`
      .toLowerCase().includes(search.toLowerCase()),
  )

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
          {navigation.map((item) => (
            <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => { setPage(item.id); setSearch('') }}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
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
            <span className="connection"><span className="online-dot" /> Connecté</span>
            <button className="refresh-button" onClick={() => void loadData(token)} disabled={loading}>
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
              <div className="stats-grid">
                <StatCard icon="▤" label="Fiches chargées" value={String(fiches.length)}
                  detail="Maximum 50 fiches récentes" tone="blue" />
                <StatCard icon="♙" label="Utilisateurs chargés" value={String(users.length)}
                  detail="Selon vos droits d’accès" tone="violet" />
                <StatCard icon="⌂" label="Formations sanitaires" value={String(formations.length)}
                  detail="Structures retournées par l’API" tone="green" />
                <StatCard icon="✓" label="Fiches confirmées" value={String(fiches.filter((f) => f.validation_confirmee).length)}
                  detail="Parmi les fiches chargées" tone="amber" />
              </div>

              <section className="panel recent-panel">
                <div className="panel-heading">
                  <div><h2>Fiches récentes</h2><p className="muted">Dernières fiches retournées par le serveur</p></div>
                  <button className="text-button" onClick={() => setPage('fiches')}>Voir les fiches <span>→</span></button>
                </div>
                <FicheTable fiches={fiches.slice(0, 6)} loading={loading} />
              </section>

              <div className="bottom-grid">
                <section className="panel">
                  <div className="panel-heading"><div><h2>Structures administratives</h2><p className="muted">Données disponibles via l’API</p></div></div>
                  <div className="structure-list">
                    <StructureRow label="Régions" count={regions.length} icon="◈" />
                    <StructureRow label="Préfectures" count={prefectures.length} icon="⌖" />
                    <StructureRow label="Communes" count={communes.length} icon="⌂" />
                    <StructureRow label="Formations sanitaires" count={formations.length} icon="✚" />
                  </div>
                </section>
                <section className="panel access-panel">
                  <div className="panel-heading"><div><h2>Accès rapide</h2><p className="muted">Gestion des données</p></div></div>
                  <button className="quick-link" onClick={() => setPage('fiches')}><span className="quick-icon blue">▤</span><span><strong>Consulter les fiches</strong><small>Accéder aux données de collecte</small></span><b>→</b></button>
                  <button className="quick-link" onClick={() => setPage('users')}><span className="quick-icon violet">♙</span><span><strong>Utilisateurs</strong><small>Voir les comptes accessibles</small></span><b>→</b></button>
                  <button className="quick-link" onClick={() => setPage('structures')}><span className="quick-icon green">⌂</span><span><strong>Structures</strong><small>Voir les structures sanitaires</small></span><b>→</b></button>
                </section>
              </div>
            </>
          )}

          {page === 'fiches' && (
            <section className="panel">
              <div className="panel-heading">
                <div><h2>Registre des fiches</h2><p className="muted">{filteredFiches.length} fiche(s) dans les résultats chargés</p></div>
                <input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une fiche…" />
              </div>
              <FicheTable fiches={filteredFiches} loading={loading} />
              <p className="table-foot">Cette vue affiche jusqu’à 50 fiches. La pagination complète pourra être ajoutée ensuite.</p>
            </section>
          )}

          {page === 'users' && (
            <section className="panel">
              <div className="panel-heading">
                <div><h2>Comptes utilisateurs</h2><p className="muted">{filteredUsers.length} compte(s) dans les résultats chargés</p></div>
                <input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un utilisateur…" />
              </div>
              {users.length === 0 && !loading ? <EmptyState text="Aucun utilisateur retourné ou accès administrateur requis." /> :
                <div className="table-wrap"><table><thead><tr><th>Utilisateur</th><th>E-mail</th><th>Rôle</th><th>Statut</th></tr></thead>
                  <tbody>{filteredUsers.map((item) => <tr key={item.id}>
                    <td><strong>{item.prenom} {item.nom}</strong><small className="cell-sub">ID {item.id}</small></td>
                    <td>{item.email}</td><td><span className="role-pill">{item.role.replaceAll('_', ' ')}</span></td>
                    <td><span className={`status ${item.actif === false ? 'inactive' : 'confirmed'}`}>{item.actif === false ? 'Inactif' : 'Actif'}</span></td>
                  </tr>)}</tbody></table></div>}
            </section>
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

function FicheTable({ fiches, loading }: { fiches: Fiche[]; loading: boolean }) {
  if (loading && fiches.length === 0) return <EmptyState text="Chargement des fiches…" />
  if (!fiches.length) return <EmptyState text="Aucune fiche disponible dans les résultats chargés." />
  return <div className="table-wrap"><table><thead><tr><th>Numéro de fiche</th><th>Date consultation</th><th>Âge</th><th>Sexe</th><th>Diagnostic</th><th>Validation</th></tr></thead>
    <tbody>{fiches.map((fiche) => <tr key={fiche.id}>
      <td><strong>{fiche.numero_fiche || fiche.id.slice(0, 8)}</strong></td>
      <td>{fiche.date_consultation ? new Date(fiche.date_consultation).toLocaleDateString('fr-FR') : '—'}</td>
      <td>{fiche.age} ans</td><td>{fiche.sexe === 'M' ? 'Masculin' : fiche.sexe === 'F' ? 'Féminin' : fiche.sexe}</td>
      <td><span className="diagnostic">{fiche.diagnostic || 'Non renseigné'}</span></td>
      <td><span className={`status ${fiche.validation_confirmee ? 'confirmed' : 'pending'}`}>{fiche.validation_confirmee ? 'Confirmée' : 'À confirmer'}</span></td>
    </tr>)}</tbody></table></div>
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
