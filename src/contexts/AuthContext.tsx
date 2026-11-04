import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { User } from '../types'
import { API_URL } from '../services/api'

type AuthContextType = {
  token: string
  user: User | null
  setToken: (token: string) => void
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  isAuthenticated: boolean
  clearSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

type LoginResponse = {
  access_token?: unknown
  detail?: unknown
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [tokenState, setTokenState] = useState(
    () => localStorage.getItem('scdip_token') || '',
  )

  const [user, setUser] = useState<User | null>(null)

  const setToken = useCallback((newToken: string) => {
    if (newToken) {
      localStorage.setItem('scdip_token', newToken)
    } else {
      localStorage.removeItem('scdip_token')
    }

    setTokenState(newToken)
  }, [])

  const clearSession = useCallback(() => {
    setToken('')
    setUser(null)
  }, [setToken])

  useEffect(() => {
    const handleTokenRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent<{ token?: string }>
      const newToken = customEvent.detail?.token

      if (typeof newToken === 'string' && newToken.trim()) {
        setToken(newToken)
      }
    }

    window.addEventListener(
      'scdip:token-refreshed',
      handleTokenRefreshed,
    )

    return () => {
      window.removeEventListener(
        'scdip:token-refreshed',
        handleTokenRefreshed,
      )
    }
  }, [setToken])

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    let body: LoginResponse = {}

    try {
      body = await response.json() as LoginResponse
    } catch {
      if (response.ok) {
        throw new Error('Réponse invalide du serveur.')
      }
    }

    if (!response.ok) {
      throw new Error(
        typeof body.detail === 'string'
          ? body.detail
          : 'Connexion impossible.',
      )
    }

    if (
      typeof body.access_token !== 'string' ||
      !body.access_token.trim()
    ) {
      throw new Error(
        'Le serveur n’a pas retourné de jeton de connexion.',
      )
    }

    setToken(body.access_token)
  }, [setToken])

  const value = useMemo<AuthContextType>(
    () => ({
      token: tokenState,
      user,
      setToken,
      setUser,
      login,
      isAuthenticated: Boolean(tokenState),
      clearSession,
    }),
    [tokenState, user, setToken, setUser, login, clearSession],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur de AuthProvider.')
  }

  return context
}