import { useEffect, useRef, useState } from 'react'
import Icon from '../shared/Icon'
import type { User } from '../../types'

type AppTopbarProps = {
  user: User | null
  userRoleLabel: string
  loading: boolean
  pushEnabled: boolean
  pushBusy: boolean
  unreadNotifications: number
  onToggleMenu: () => void
  onRefresh: () => void
  onTogglePush: () => void
  onOpenAccountPage: (target: 'profil' | 'aide') => void
  onLogout: () => void
}

function AppTopbar({
  user,
  userRoleLabel,
  loading,
  pushEnabled,
  pushBusy,
  unreadNotifications,
  onToggleMenu,
  onRefresh,
  onTogglePush,
  onOpenAccountPage,
  onLogout,
}: AppTopbarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profileMenuOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileMenuOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [profileMenuOpen])

  const openAccountPage = (target: 'profil' | 'aide') => {
    setProfileMenuOpen(false)
    onOpenAccountPage(target)
  }

  return (
    <header className="topbar">
      <button
        type="button"
        className="menu-toggle"
        aria-label="Afficher ou masquer le menu"
        onClick={onToggleMenu}
      >
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
          onClick={onRefresh}
          disabled={loading}
        >
          <span className={loading ? 'spin' : ''}>
            <Icon name="refresh" />
          </span>
        </button>

        <button
          type="button"
          className={`bell-button ${pushEnabled ? '' : 'is-off'}`}
          onClick={onTogglePush}
          disabled={pushBusy}
          title={pushEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
          aria-label={pushEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
        >
          <Icon name="bell" />
          {unreadNotifications > 0 && (
            <span className="bell-badge">
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          )}
        </button>

        <span className="top-divider" />

        <div className="user-pill" ref={profileRef}>
          <span className="user-avatar">
            <Icon name="user" />
          </span>

          <span className="user-meta">
            <strong>{user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}</strong>
            <small>{userRoleLabel}</small>
          </span>

          <button
            type="button"
            className={`user-chevron ${profileMenuOpen ? 'is-open' : ''}`}
            aria-label="Ouvrir le menu du profil"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((value) => !value)}
          >
            <Icon name="chevron" />
          </button>

          {profileMenuOpen && (
            <div className="profile-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => openAccountPage('profil')}
              >
                <Icon name="user" /> Profil
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => openAccountPage('aide')}
              >
                <Icon name="help" /> Aide
              </button>

              <div className="profile-menu-sep" />

              <button
                type="button"
                role="menuitem"
                className="is-danger"
                onClick={() => {
                  setProfileMenuOpen(false)
                  onLogout()
                }}
              >
                <Icon name="logout" /> Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AppTopbar
