
import { useMemo, useState } from 'react'

const API = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

type Structure = {
  id: number
  code: string
  libelle: string
  actif?: boolean
}

type User = {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string | null
  fonction?: string
  role: string
  formation_sanitaire_id?: number | null
  commune_id?: number | null
  prefecture_id?: number | null
  region_id?: number | null
  actif?: boolean
  cree_le?: string
}

type UserForm = {
  nom: string
  prenom: string
  email: string
  telephone: string
  fonction: string
  role: string
  password: string
  region_id: string
  prefecture_id: string
  commune_id: string
  formation_sanitaire_id: string
  actif: boolean
}

const emptyForm = (): UserForm => ({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  fonction: '',
  role: 'agent_fs',
  password: '',
  region_id: '',
  prefecture_id: '',
  commune_id: '',
  formation_sanitaire_id: '',
  actif: true,
})

async function api<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
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
      if (typeof body.detail === 'string') {
        message = body.detail
      } else if (Array.isArray(body.detail)) {
        message = body.detail
          .map((item: { msg?: string }) => item.msg || '')
          .filter(Boolean)
          .join(' ')
      }
    } catch {
      // La réponse n'est pas du JSON.
    }

    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function toForm(user: User): UserForm {
  return {
    nom: user.nom || '',
    prenom: user.prenom || '',
    email: user.email || '',
    telephone: user.telephone || '',
    fonction: user.fonction || '',
    role: user.role || 'agent_fs',
    password: '',
    region_id: user.region_id ? String(user.region_id) : '',
    prefecture_id: user.prefecture_id ? String(user.prefecture_id) : '',
    commune_id: user.commune_id ? String(user.commune_id) : '',
    formation_sanitaire_id: user.formation_sanitaire_id
      ? String(user.formation_sanitaire_id)
      : '',
    actif: user.actif !== false,
  }
}

export default function UserCrud({
  token,
  users,
  regions,
  prefectures,
  communes,
  formations,
  currentUserId,
  onRefresh,
}: {
  token: string
  users: User[]
  regions: Structure[]
  prefectures: Structure[]
  communes: Structure[]
  formations: Structure[]
  currentUserId?: number
  onRefresh: () => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('tous')
  const [page, setPage] = useState(0)
  const [mode, setMode] = useState<'create' | 'edit' | 'view' | null>(null)
  const [selected, setSelected] = useState<User | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const pageSize = 10

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch = [
        user.nom,
        user.prenom,
        user.email,
        user.telephone || '',
        user.fonction || '',
        user.role,
        String(user.id),
      ].join(' ').toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'tous' ||
        (statusFilter === 'actifs' && user.actif !== false) ||
        (statusFilter === 'inactifs' && user.actif === false)

      return matchesSearch && matchesStatus
    })
  }, [users, search, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const visibleUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize)

  const availablePrefectures = prefectures
  const availableCommunes = communes
  const availableFormations = formations

  function closeModal() {
    if (busy) return
    setMode(null)
    setSelected(null)
    setForm(emptyForm())
    setError('')
  }

  function startCreate() {
    setSelected(null)
    setForm(emptyForm())
    setError('')
    setNotice('')
    setMode('create')
  }

  async function openUser(id: number, nextMode: 'view' | 'edit') {
    setBusy(true)
    setError('')
    setNotice('')

    try {
      const detail = await api<User>(`/api/v1/admin/users/${id}`, token)
      setSelected(detail)
      setForm(toForm(detail))
      setMode(nextMode)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger ce compte.')
    } finally {
      setBusy(false)
    }
  }

  function payload(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim(),
      fonction: form.fonction.trim(),
      role: form.role,
      actif: form.actif,
      region_id: form.region_id ? Number(form.region_id) : null,
      prefecture_id: form.prefecture_id ? Number(form.prefecture_id) : null,
      commune_id: form.commune_id ? Number(form.commune_id) : null,
      formation_sanitaire_id: form.formation_sanitaire_id
        ? Number(form.formation_sanitaire_id)
        : null,
    }

    if (form.password.trim()) data.password = form.password
    return data
  }

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!mode || mode === 'view') return

    setBusy(true)
    setError('')
    setNotice('')

    try {
      if (mode === 'create' && form.password.length < 12) {
        throw new Error('Le mot de passe doit contenir au moins 12 caractères.')
      }

      const data = payload()

      if (mode === 'create') {
        await api<User>('/api/v1/admin/users', token, {
          method: 'POST',
          body: JSON.stringify(data),
        })
        setNotice('Utilisateur créé avec succès.')
      } else if (selected) {
        if (!form.password.trim()) delete data.password

        await api<User>(`/api/v1/admin/users/${selected.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(data),
        })
        setNotice('Utilisateur modifié avec succès.')
      }

      setMode(null)
      setSelected(null)
      setForm(emptyForm())
      await onRefresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(user: User) {
    if (user.id === currentUserId && user.actif !== false) {
      setError('Vous ne pouvez pas désactiver votre propre compte.')
      return
    }

    const activating = user.actif === false
    const question = activating
      ? `Réactiver le compte de ${user.prenom} ${user.nom} ?`
      : `Désactiver le compte de ${user.prenom} ${user.nom} ?`

    if (!window.confirm(question)) return

    setBusy(true)
    setError('')
    setNotice('')

    try {
      if (activating) {
        await api<User>(`/api/v1/admin/users/${user.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify({ actif: true }),
        })
      } else {
        await api<User>(`/api/v1/admin/users/${user.id}/desactiver`, token, {
          method: 'PATCH',
        })
      }

      setNotice(activating ? 'Compte réactivé.' : 'Compte désactivé.')
      await onRefresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de modifier le statut.')
    } finally {
      setBusy(false)
    }
  }

  async function deleteUser(user: User) {
    if (!window.confirm(
      `Supprimer définitivement le compte de ${user.prenom} ${user.nom} (ID ${user.id}) ? Cette action peut être irréversible.`,
    )) return

    setBusy(true)
    setError('')
    setNotice('')

    try {
      await api<unknown>(`/api/v1/admin/users/${user.id}`, token, {
        method: 'DELETE',
      })

      setNotice('Compte supprimé.')
      await onRefresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible.')
    } finally {
      setBusy(false)
    }
  }

  function field<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  return (
    <section className="panel">
      <div className="panel-heading user-crud-heading">
        <div>
          <h2>Comptes utilisateurs</h2>
          <p className="muted">
            {filteredUsers.length} résultat(s) · {users.length} compte(s) chargés
          </p>
        </div>
        <button type="button" className="primary-button" onClick={startCreate}>
          + Nouvel utilisateur
        </button>
      </div>

      {error && <div className="alert error" role="alert">{error}</div>}
      {notice && <div className="alert user-notice" role="status">{notice}</div>}

      <div className="user-filters">
        <input
          className="search-input"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(0)
          }}
          placeholder="Rechercher : nom, e-mail, téléphone…"
          aria-label="Rechercher un utilisateur"
        />
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value)
            setPage(0)
          }}
          aria-label="Filtrer par statut"
        >
          <option value="tous">Tous les statuts</option>
          <option value="actifs">Actifs</option>
          <option value="inactifs">Inactifs</option>
        </select>
      </div>

      {visibleUsers.length === 0 ? (
        <div className="empty-state"><span>♙</span><p>Aucun utilisateur correspondant.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Contact</th>
                <th>Fonction</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.prenom} {item.nom}</strong>
                    <small className="cell-sub">ID {item.id}</small>
                  </td>
                  <td>
                    <span>{item.email}</span>
                    <small className="cell-sub">{item.telephone || 'Téléphone non renseigné'}</small>
                  </td>
                  <td>{item.fonction || '—'}</td>
                  <td><span className="role-pill">{item.role.replaceAll('_', ' ')}</span></td>
                  <td>
                    <span className={`status ${item.actif === false ? 'inactive' : 'confirmed'}`}>
                      {item.actif === false ? 'Inactif' : 'Actif'}
                    </span>
                  </td>
                  <td>
                    <div className="user-row-actions">
                      <button type="button" className="secondary-button" disabled={busy}
                        onClick={() => void openUser(item.id, 'view')}>Voir</button>
                      <button type="button" className="secondary-button" disabled={busy}
                        onClick={() => void openUser(item.id, 'edit')}>Modifier</button>
                      <button type="button" className="secondary-button" disabled={busy}
                        onClick={() => void toggleActive(item)}>
                        {item.actif === false ? 'Réactiver' : 'Désactiver'}
                      </button>
                      <button type="button" className="danger-button" disabled={busy}
                        onClick={() => void deleteUser(item)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-foot pagination-controls">
        <span>
          Page {page + 1} sur {pageCount} · {filteredUsers.length} compte(s)
        </span>
        <div>
          <button type="button" className="secondary-button" disabled={page === 0 || busy}
            onClick={() => setPage((value) => Math.max(0, value - 1))}>Précédent</button>
          <button type="button" className="secondary-button"
            disabled={page + 1 >= pageCount || busy}
            onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>Suivant</button>
        </div>
      </div>

      {mode && (
        <div className="user-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal()
        }}>
          <section className="user-modal" role="dialog" aria-modal="true"
            aria-labelledby="user-modal-title">
            <div className="panel-heading">
              <div>
                <h2 id="user-modal-title">
                  {mode === 'create' ? 'Créer un utilisateur' :
                    mode === 'edit' ? `Modifier le compte #${selected?.id}` :
                      `Détail du compte #${selected?.id}`}
                </h2>
                <p className="muted">
                  {mode === 'view' ? 'Informations du compte utilisateur.' :
                    'Les champs marqués * sont obligatoires.'}
                </p>
              </div>
              <button type="button" className="secondary-button" disabled={busy}
                onClick={closeModal}>Fermer</button>
            </div>

            <form onSubmit={saveUser}>
              <div className="user-form-grid">
                <label className="nf-field">
                  Nom *
                  <input required maxLength={150} value={form.nom} disabled={mode === 'view'}
                    onChange={(e) => field('nom', e.target.value)} />
                </label>
                <label className="nf-field">
                  Prénom *
                  <input required maxLength={150} value={form.prenom} disabled={mode === 'view'}
                    onChange={(e) => field('prenom', e.target.value)} />
                </label>
                <label className="nf-field">
                  E-mail *
                  <input required type="email" maxLength={255} value={form.email}
                    disabled={mode === 'view'} onChange={(e) => field('email', e.target.value)} />
                </label>
                <label className="nf-field">
                  Téléphone *
                  <input required type="tel" minLength={8} maxLength={20} value={form.telephone}
                    disabled={mode === 'view'} placeholder="+228 90 00 00 00"
                    onChange={(e) => field('telephone', e.target.value)} />
                </label>
                <label className="nf-field">
                  Fonction *
                  <input required maxLength={150} value={form.fonction} disabled={mode === 'view'}
                    onChange={(e) => field('fonction', e.target.value)} />
                </label>
                <label className="nf-field">
                  Rôle *
                  <select required value={form.role} disabled={mode === 'view'}
                    onChange={(e) => field('role', e.target.value)}>
                    <option value="agent_fs">Agent FS</option>
                    <option value="superviseur">Superviseur</option>
                    <option value="administrateur_national">Administrateur national</option>
                  </select>
                </label>

                {mode === 'create' && (
                  <label className="nf-field user-form-wide">
                    Mot de passe * (12 caractères minimum)
                    <input required type="password" minLength={12} maxLength={128}
                      autoComplete="new-password" value={form.password}
                      onChange={(e) => field('password', e.target.value)} />
                  </label>
                )}
                {mode === 'edit' && (
                  <label className="nf-field user-form-wide">
                    Nouveau mot de passe (laisser vide pour ne pas le changer)
                    <input type="password" minLength={12} maxLength={128}
                      autoComplete="new-password" value={form.password}
                      onChange={(e) => field('password', e.target.value)} />
                  </label>
                )}

                <label className="nf-field">
                  Région
                  <select value={form.region_id} disabled={mode === 'view'}
                    onChange={(e) => {
                      field('region_id', e.target.value)
                      field('prefecture_id', '')
                      field('commune_id', '')
                      field('formation_sanitaire_id', '')
                    }}>
                    <option value="">Non définie</option>
                    {regions.map((s) => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                  </select>
                </label>
                <label className="nf-field">
                  Préfecture
                  <select value={form.prefecture_id} disabled={mode === 'view'}
                    onChange={(e) => {
                      field('prefecture_id', e.target.value)
                      field('commune_id', '')
                      field('formation_sanitaire_id', '')
                    }}>
                    <option value="">Non définie</option>
                    {availablePrefectures.map((s) => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                  </select>
                </label>
                <label className="nf-field">
                  Commune
                  <select value={form.commune_id} disabled={mode === 'view'}
                    onChange={(e) => {
                      field('commune_id', e.target.value)
                      field('formation_sanitaire_id', '')
                    }}>
                    <option value="">Non définie</option>
                    {availableCommunes.map((s) => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                  </select>
                </label>
                <label className="nf-field">
                  Formation sanitaire
                  <select value={form.formation_sanitaire_id} disabled={mode === 'view'}
                    onChange={(e) => field('formation_sanitaire_id', e.target.value)}>
                    <option value="">Non définie</option>
                    {availableFormations.map((s) => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                  </select>
                </label>

                {mode !== 'create' && (
                  <label className="nf-field user-form-wide">
                    Statut du compte
                    <select value={form.actif ? 'true' : 'false'} disabled={mode === 'view'}
                      onChange={(e) => field('actif', e.target.value === 'true')}>
                      <option value="true">Actif</option>
                      <option value="false">Inactif</option>
                    </select>
                  </label>
                )}

                {selected?.cree_le && (
                  <p className="muted user-form-wide">
                    Créé le : {new Date(selected.cree_le).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>

              {error && <div className="alert error" role="alert">{error}</div>}

              {mode !== 'view' && (
                <div className="nf-actions">
                  <button type="button" className="secondary-button" disabled={busy}
                    onClick={closeModal}>Annuler</button>
                  <button type="submit" className="primary-button" disabled={busy}>
                    {busy ? 'Enregistrement…' : mode === 'create' ? 'Créer le compte' : 'Enregistrer les modifications'}
                  </button>
                </div>
              )}
            </form>
          </section>
        </div>
      )}
    </section>
  )
}
