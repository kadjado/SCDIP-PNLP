import type { User } from '../../types'

function ProfilePage({ user, roleLabel }: { user: User | null; roleLabel: string }) {
  return (
    <section className="panel list-panel">
      <dl className="profile-grid">
        <div><dt>Prénom</dt><dd>{user?.prenom || '—'}</dd></div>
        <div><dt>Nom</dt><dd>{user?.nom || '—'}</dd></div>
        <div><dt>Adresse e-mail</dt><dd>{user?.email || '—'}</dd></div>
        <div><dt>Rôle</dt><dd className="is-role">{roleLabel}</dd></div>
      </dl>
    </section>
  )
}

export default ProfilePage
