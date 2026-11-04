
import type { ComponentProps } from 'react'
import type { Fiche, Structure } from '../../types'
import type { Page } from '../../config/navigation'

import KpiCard from './KpiCard'
import EvolutionPanel from './EvolutionPanel'
import DashboardHero from './DashboardHero'
import NotificationPanel from './NotificationPanel'
import PreventionBanner from './PreventionBanner'
import FicheTable from '../fiches/FicheTable'
import StructureRow from '../structures/StructureRow'
import { getMonthlyStats } from '../../utils/dashboardStats'

type DashboardPageProps = {
  fiches: Fiche[]
  loading: boolean
  busy: boolean
  token: string
  role: string
  isSupervisor: boolean
  unreadNotifications: number
  pushEnabled: boolean
  regions: Structure[]
  prefectures: Structure[]
  communes: Structure[]
  formations: Structure[]
  onSetPage: (page: Page) => void
  onSupervisorAction: ComponentProps<typeof FicheTable>['onAction']
  onRefresh: () => Promise<void>
  onSessionInvalid: () => Promise<void>
}

function DashboardPage({
  fiches,
  loading,
  busy,
  token,
  role,
  isSupervisor,
  unreadNotifications,
  pushEnabled,
  regions,
  prefectures,
  communes,
  formations,
  onSetPage,
  onSupervisorAction,
  onRefresh,
  onSessionInvalid,
}: DashboardPageProps) {
  const isNationalAdmin = role === 'administrateur_national'

  const monthlyStats = getMonthlyStats(fiches)
  const currentMonth = monthlyStats[monthlyStats.length - 1]
  const previousMonth = monthlyStats[monthlyStats.length - 2]

  const validatedCount = fiches.filter(
    (fiche) => fiche.validation_confirmee,
  ).length

  const structuresCount = isSupervisor
    ? new Set(fiches.map((fiche) => fiche.formation_sanitaire_id)).size
    : formations.length

  return (
    <>
      <DashboardHero
        onSeeDashboard={() =>
          document.getElementById('dashboard-stats')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
      />

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
          onClick={() => onSetPage('mailbox')}
        />

        <KpiCard
          tone="violet"
          icon="hospital"
          label="Structures sanitaires"
          value={structuresCount}
          onClick={
            isNationalAdmin
              ? () => onSetPage('structures')
              : undefined
          }
        />
      </div>

      <div className="dashboard-insights">
        <EvolutionPanel fiches={fiches} />

        <NotificationPanel
          unread={unreadNotifications}
          pushEnabled={pushEnabled}
          fiches={fiches}
          onOpenMailbox={() => onSetPage('mailbox')}
        />
      </div>

      <PreventionBanner />

      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>Fiches récentes</h2>
            <p className="muted">Dernières fiches retournées par le serveur</p>
          </div>

          <button
            className="text-button"
            onClick={() => onSetPage('fiches')}
          >
            Voir les fiches <span>→</span>
          </button>
        </div>

        <FicheTable
          fiches={fiches.slice(0, 6)}
          loading={loading}
          role={role}
          busy={busy}
          onAction={onSupervisorAction}
          token={token}
          onRefresh={onRefresh}
          onSessionInvalid={onSessionInvalid}
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
            onClick={() => onSetPage('fiches')}
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

            <button
              className="quick-link"
              onClick={() => onSetPage('fiches')}
            >
              <span className="quick-icon blue">▤</span>
              <span>
                <strong>Consulter les fiches</strong>
                <small>Accéder aux données de collecte</small>
              </span>
              <b>→</b>
            </button>

            {isNationalAdmin && (
              <>
                <button
                  className="quick-link"
                  onClick={() => onSetPage('users')}
                >
                  <span className="quick-icon violet">♙</span>
                  <span>
                    <strong>Utilisateurs</strong>
                    <small>Gérer les comptes utilisateurs</small>
                  </span>
                  <b>→</b>
                </button>

                <button
                  className="quick-link"
                  onClick={() => onSetPage('structures')}
                >
                  <span className="quick-icon green">⌂</span>
                  <span>
                    <strong>Structures</strong>
                    <small>Gérer les structures sanitaires</small>
                  </span>
                  <b>→</b>
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </>
  )
}

export default DashboardPage
