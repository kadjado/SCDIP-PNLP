import type { Page } from '../../config/navigation'
import { navigation, settingsNavigation } from '../../config/navigation'
import Icon from '../shared/Icon'

type AppSidebarProps = {
  page: Page
  settingsOpen: boolean
  unreadNotifications: number
  visibleNavigation: readonly (typeof navigation)[number][]
  onCloseMenu: () => void
  onToggleSettings: () => void
  onNavigate: (page: Page) => void
  onLogout: () => void
}

function AppSidebar({
  page,
  settingsOpen,
  unreadNotifications,
  visibleNavigation,
  onCloseMenu,
  onToggleSettings,
  onNavigate,
  onLogout,
}: AppSidebarProps) {
  const closeMenuOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      onCloseMenu()
    }
  }

  const navigateFromMenu = (target: Page) => {
    onNavigate(target)
    closeMenuOnMobile()
  }

  return (
    <>
      <div
        className="sidebar-backdrop"
        onClick={onCloseMenu}
      />

      <aside className="sidebar">
        <div className="sidebar-brand">
          <img
            className="sidebar-emblem"
            src="/scdip-embleme.png"
            alt="Emblème SCDIP-PNLP"
          />

          <div className="sidebar-wordmark">
            <strong>SCDIP<span>- PNLP</span></strong>
          </div>

          <small>Ensemble contre le paludisme</small>
        </div>

        <nav>
          {visibleNavigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => navigateFromMenu(item.id)}
            >
              <span className="nav-icon">
                <Icon name={item.icon} />
              </span>

              <span className="nav-label">{item.label}</span>

              {item.id === 'mailbox' && unreadNotifications > 0 && (
                <span className="notification-badge">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>
          ))}

          <div className="nav-group">
            <button
              type="button"
              className={`nav-item nav-parent ${
                settingsNavigation.some((item) => item.id === page)
                  ? 'has-active'
                  : ''
              }`}
              aria-expanded={settingsOpen}
              aria-controls="settings-submenu"
              onClick={onToggleSettings}
            >
              <span className="nav-icon">
                <Icon name="settings" />
              </span>

              <span className="nav-label">Paramètres</span>

              <span className={`nav-caret ${settingsOpen ? 'is-open' : ''}`}>
                <Icon name="chevron" />
              </span>
            </button>

            {settingsOpen && (
              <div className="nav-submenu" id="settings-submenu">
                {settingsNavigation.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-subitem ${
                      page === item.id ? 'active' : ''
                    }`}
                    onClick={() => navigateFromMenu(item.id)}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="nav-separator" />

        <button
          className="nav-item nav-logout"
          title="Se déconnecter"
          onClick={onLogout}
        >
          <span className="nav-icon">
            <Icon name="logout" />
          </span>
          <span className="nav-label">Déconnexion</span>
        </button>

        <div className="sidebar-bottom">
          <p className="sidebar-slogan">
            Un Togo sans paludisme,<br />c’est possible !
          </p>
          <img className="sidebar-flag" src="/scdip-drapeau.png" alt="" />
        </div>
      </aside>
    </>
  )
}

export default AppSidebar
