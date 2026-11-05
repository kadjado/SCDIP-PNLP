import DashboardPage from '../dashboard/DashboardPage'
import FichesPage from '../fiches/FichesPage'
import Mailbox from '../mailbox/Mailbox'
import UserCrud from '../users/UserCrud'
import StructurePanel from '../structures/StructurePanel'
import ComingSoon from '../shared/ComingSoon'
//import ReportsPage from '../reports/ReportsPage'
import ProfilePage from '../account/ProfilePage'
import HelpPage from '../account/HelpPage'
import ReportsCenter from "../reports/ReportsCenter";
import type { Page } from '../../config/navigation'

import type { Fiche, Structure, User } from '../../types'
import type { Dispatch, SetStateAction } from 'react'

type SupervisorAction =
  | 'valider'
  | 'demander-correction'
  | 'traiter-correction'

type AppPagesProps = {
  page: Page
  token: string
  user: User | null
  userRoleLabel: string
  isSupervisor: boolean
  
  fiches: Fiche[]
  pagedFiches: Fiche[]
  users: User[]

  regions: Structure[]
  prefectures: Structure[]
  communes: Structure[]
  formations: Structure[]

  loading: boolean
  busy: boolean

  search: string
  setSearch: Dispatch<SetStateAction<string>>

  pageOffset: number
  setPageOffset: Dispatch<SetStateAction<number>>
  pageSize: number
  totalFiches: number

  showNewFiche: boolean
  setShowNewFiche: Dispatch<SetStateAction<boolean>>
  unreadNotifications: number
  pushEnabled: boolean

  onSetPage: (page: Page) => void
  onSupervisorAction: (
    fiche: Fiche,
    action: SupervisorAction,
  ) => Promise<void>
  onRefresh: () => Promise<void>
  onCreated: () => Promise<void>
  onUnreadCountChange: (count: number) => void
  onUsersRefresh: () => Promise<void>
  
  onSessionInvalid: () => Promise<void>
}

function AppPages({
  page,
  token,
  user,
  userRoleLabel,
  isSupervisor,
  fiches,
  pagedFiches,
  users,
  regions,
  prefectures,
  communes,
  formations,
  loading,
  busy,
  search,
  setSearch,
  pageOffset,
  setPageOffset,
  pageSize,
  totalFiches,
  showNewFiche,
  setShowNewFiche,
  unreadNotifications,
  pushEnabled,
  onSetPage,
  onSupervisorAction,
  onRefresh,
  onCreated,
  onUnreadCountChange,
  onUsersRefresh,
  onSessionInvalid,
}: AppPagesProps) {
  return (
    <>
      {page === 'dashboard' && (
        <DashboardPage
          fiches={fiches}
          loading={loading}
          busy={busy}
          token={token}
          role={user?.role || ''}
          isSupervisor={isSupervisor}
          unreadNotifications={unreadNotifications}
          pushEnabled={pushEnabled}
          regions={regions}
          prefectures={prefectures}
          communes={communes}
          formations={formations}
          onSetPage={onSetPage}
          onSupervisorAction={onSupervisorAction}
          onRefresh={onRefresh}
          onSessionInvalid={onSessionInvalid}
        />
      )}

      {page === 'fiches' && (
        <FichesPage
          token={token}
          role={user?.role || ''}
          fiches={pagedFiches}
          loading={loading}
          busy={busy}
          search={search}
          setSearch={setSearch}
          pageOffset={pageOffset}
          setPageOffset={setPageOffset}
          pageSize={pageSize}
          totalFiches={totalFiches}
          showNewFiche={showNewFiche}
          setShowNewFiche={setShowNewFiche}
          onAction={onSupervisorAction}
          onRefresh={onRefresh}
          onCreated={onCreated}
          onSessionInvalid={onSessionInvalid}
        />
      )}

      {page === 'mailbox' && (
        <Mailbox
          token={token}
          onUnreadCountChange={onUnreadCountChange}
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
          onRefresh={onUsersRefresh}
        />
      )}

      {page === 'structures' && (
        <div className="structure-grid list-grid">
          <StructurePanel title="Régions" items={regions} icon="map" />
          <StructurePanel title="Préfectures" items={prefectures} icon="pin" />
          <StructurePanel title="Communes" items={communes} icon="structures" />
          <StructurePanel
            title="Formations sanitaires"
            items={formations}
            icon="hospital"
          />
        </div>
      )}

      {page === 'journaux' && (
        <ComingSoon
          icon="journal"
          text="Le journal des actions sera disponible ici."
        />
      )}

      {page === 'rapport' && (
        <ReportsCenter token={token} />
      )}

      {page === 'export' && (
        <ComingSoon
          icon="download"
          text="L’export des données sera disponible ici."
        />
      )}

      {page === 'profil' && (
        <ProfilePage user={user} roleLabel={userRoleLabel} />
      )}

      {page === 'aide' && <HelpPage />}

    </>
  )
}

export default AppPages

