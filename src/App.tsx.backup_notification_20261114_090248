import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { useAuth } from './contexts/AuthContext'
import { usePush } from './contexts/PushContext'
import { useAppData } from './hooks/useAppData'
import { useSupervisorActions } from './hooks/useSupervisorActions'
import { useFichesPagination } from './hooks/useFichesPagination'
import { useAppNavigation } from './hooks/useAppNavigation'
import { useLogin } from './hooks/useLogin'
import { useSession } from './hooks/useSession'
//import Icon from './components/shared/Icon'
import LoginPage from './components/auth/LoginPage'
import AppTopbar from './components/layout/AppTopbar'
import AppSidebar from './components/layout/AppSidebar'
import AppContent from './components/layout/AppContent'
import AppPages from './components/layout/AppPages'

import {
  navigation,
  settingsNavigation,
  accountPages,
  pageSubtitles,
} from './config/navigation'

import { api, ApiError } from './services/api'
import type {
  PagedFiches,
} from './types'


function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    token,
    user,
    setUser,
    login,
    clearSession,
  } = useAuth()

  const {
    pushEnabled,
    pushBusy,
    unreadNotifications,
    setUnreadNotifications,
    activatePush,
    disablePush,
    disablePushForLogout,
  } = usePush()

  const clearSessionDataRef = useRef<(() => void) | null>(null)
const invalidatingSessionRef = useRef(false)

const handleInvalidSession = useCallback(async () => {
  // Évite plusieurs déconnexions simultanées en cas de réponses 401 multiples.
  if (invalidatingSessionRef.current) return

  invalidatingSessionRef.current = true

  try {
    // Désactive le Push côté serveur avant de supprimer la session.
    await disablePushForLogout()
  } finally {
    // Supprime la session d'authentification.
    clearSession()

    // Efface les données privées conservées dans l'application.
    clearSessionDataRef.current?.()

    invalidatingSessionRef.current = false
  }
}, [disablePushForLogout, clearSession])

useEffect(() => {
  const handleSessionInvalid = () => {
    void handleInvalidSession()
  }

  window.addEventListener(
    'scdip:session-invalid',
    handleSessionInvalid,
  )

  return () => {
    window.removeEventListener(
      'scdip:session-invalid',
      handleSessionInvalid,
    )
  }
}, [handleInvalidSession])

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
  const {
    page,
    setPage,
    menuOpen,
    setMenuOpen,
    settingsOpen,
    setSettingsOpen,
    visibleNavigation,
  } = useAppNavigation(isSupervisor)
  const isNationalAdmin = user?.role === 'administrateur_national'

  const navigationForRole = isNationalAdmin
    ? visibleNavigation
    : visibleNavigation.filter(
        (item) => item.id !== 'users' && item.id !== 'structures',
      )
  const [busy, setBusy] = useState(false)
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loginError,
    handleLogin,
  } = useLogin(login, setBusy)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [pageOffset, setPageOffset] = useState(0)
  const [showNewFiche, setShowNewFiche] = useState(false)

  const pageSize = 10
  const {
    pagedFiches,
    setPagedFiches,
    totalFiches,
    setTotalFiches,
    loading: fichesLoading,
  } = useFichesPagination({
    token,
    page,
    search,
    pageOffset,
    pageSize,
    refreshKey,
    setError,
    onSessionInvalid: handleInvalidSession,
  })

  const {
    fiches,
    users,
    regions,
    prefectures,
    communes,
    formations,
    loadData,
    clearSessionData,
  } = useAppData({
    setUser,
    setLoading: setDataLoading,
    setError,
    onSessionInvalid: handleInvalidSession,
  })
  clearSessionDataRef.current = clearSessionData
  const loading = dataLoading || fichesLoading
  const { logout } = useSession({ handleInvalidSession })
  const { handleSupervisorAction } = useSupervisorActions({
    token,
    role: user?.role,
    setBusy,
    setError,
    loadData,
    onRefresh: () => setRefreshKey(value => value + 1),
    onSessionInvalid: handleInvalidSession,
  })

  useEffect(() => {
    if (token) void loadData(token)
  }, [token, loadData])
  
  if (!token) {
  return (
    <LoginPage
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      loginError={loginError}
      error={error}
      busy={busy}
      onSubmit={handleLogin}
    />
  )
}

  const pageTitle = [...navigation, ...settingsNavigation, ...accountPages]
    .find((item) => item.id === page)?.label || 'Tableau de bord'

  const pageSubtitle =
    pageSubtitles[page] ??
    'Consultez les structures administratives et sanitaires.'
  const userRoleLabel = (user?.role || 'Compte connecté').replace(/_/g, ' ')
  return (
    <div className={`app-shell ${menuOpen ? '' : 'menu-closed'}`}>
      <AppSidebar
        page={page}
        settingsOpen={settingsOpen}
        unreadNotifications={unreadNotifications}
        visibleNavigation={navigationForRole}
        onCloseMenu={() => setMenuOpen(false)}
        onToggleSettings={() => setSettingsOpen((value) => !value)}
        onNavigate={(target) => {
          setPage(target)
          setSearch('')
        }}
        onLogout={() => void logout()}
      />
      <main className="main-panel">
        <AppTopbar
          user={user}
          userRoleLabel={userRoleLabel}
          loading={loading}
          pushEnabled={pushEnabled}
          pushBusy={pushBusy}
          unreadNotifications={unreadNotifications}
          onToggleMenu={() => setMenuOpen((value) => !value)}
          onRefresh={() => void loadData(token)}
          onTogglePush={() => {
            if (pushEnabled) {
              void disablePush()
            } else {
              void activatePush()
            }
          }}
          onOpenAccountPage={(target) => {
            setSearch('')
            setPage(target)
          }}
          onLogout={() => void logout()}
        />
        <AppContent
          page={page}
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          error={error}
        >
        <AppPages
            page={page}
            token={token}
            user={user}
            userRoleLabel={userRoleLabel}
            isSupervisor={isSupervisor}
            fiches={fiches}
            pagedFiches={pagedFiches}
            users={users}
            regions={regions}
            prefectures={prefectures}
            communes={communes}
            formations={formations}
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
            unreadNotifications={unreadNotifications}
            pushEnabled={pushEnabled}
            onSetPage={setPage}
            onSupervisorAction={handleSupervisorAction}
            onRefresh={async () => {
              await loadData(token)
              setRefreshKey((value) => value + 1)
            }}
            onCreated={async () => {
              setShowNewFiche(false)
              setSearch('')
              setPageOffset(0)

              try {
                const refreshed = await api<PagedFiches>(
                  '/api/v1/fiches/paginees?limit=10&offset=0',
                  token,
                )

                setPagedFiches(refreshed.items)
                setTotalFiches(refreshed.total)
              } catch (error) {
                if (error instanceof ApiError && error.status === 401) {
                  await handleInvalidSession()
                  return
                }

                setError(
                  error instanceof Error
                    ? error.message
                    : 'Impossible de recharger les fiches.',
                )
              }
            }}
            onUnreadCountChange={setUnreadNotifications}
            onUsersRefresh={async () => {
              await loadData(token)
            }}
            onSessionInvalid={handleInvalidSession}
          />
        </AppContent>
      </main>
    </div>
  )
}

export default App

