import type { ReactNode } from 'react'
import type { Page } from '../../config/navigation'

type AppContentProps = {
  page: Page
  pageTitle: string
  pageSubtitle: string
  error: string
  children: ReactNode
}

function AppContent({
  page,
  pageTitle,
  pageSubtitle,
  error,
  children,
}: AppContentProps) {
  return (
    <div className="content">
      {page !== 'dashboard' && (
        <div className="page-heading">
          <div>
            <span className="eyebrow">SUIVI ET PILOTAGE</span>
            <h1>{pageTitle}</h1>
            <p className="muted">{pageSubtitle}</p>
          </div>

          <div className="date-chip">
            {new Intl.DateTimeFormat('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }).format(new Date())}
          </div>
        </div>
      )}

      {error && <div className="alert error">{error}</div>}

      {children}

      <footer className="footer">
        <span>SCDIP-PNLP</span>
        <span>Collecte des données individuelles du paludisme</span>
      </footer>
    </div>
  )
}

export default AppContent
