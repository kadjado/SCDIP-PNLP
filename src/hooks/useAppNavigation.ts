
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  navigation,
  settingsNavigation,
  supervisorPages,
  pagePaths,
  pathPages,
} from '../config/navigation'

import type { Page } from '../config/navigation'

export function useAppNavigation(isSupervisor: boolean) {
  const navigate = useNavigate()
  const location = useLocation()

  const page: Page = pathPages[location.pathname] || 'dashboard'

  const setPage = useCallback((nextPage: Page) => {
    navigate(pagePaths[nextPage])
  }, [navigate])

  const [menuOpen, setMenuOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth > 900,
  )

  const [settingsOpen, setSettingsOpen] = useState(() =>
    settingsNavigation.some(
      (item) => item.id === pathPages[location.pathname],
    ),
  )

  useEffect(() => {
    if (isSupervisor && !supervisorPages.includes(page)) {
      setPage('dashboard')
    }
  }, [isSupervisor, page, setPage])

  const visibleNavigation = navigation.filter((item) => {
    if (isSupervisor) {
      return (
        item.id === 'dashboard' ||
        item.id === 'fiches' ||
        item.id === 'mailbox'
      )
    }

    return true
  })

  return {
    page,
    setPage,
    menuOpen,
    setMenuOpen,
    settingsOpen,
    setSettingsOpen,
    visibleNavigation,
  }
}
