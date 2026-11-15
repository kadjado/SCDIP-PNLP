const API_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '')

const TOKEN_REFRESHED_EVENT = 'scdip:token-refreshed'
const SESSION_INVALID_EVENT = 'scdip:session-invalid'

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, message: string, detail?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

type RefreshResponse = {
  access_token?: unknown
}

let refreshPromise: Promise<string | null> | null = null

function notifySessionInvalid() {
  window.dispatchEvent(new Event(SESSION_INVALID_EVENT))
}

function saveRefreshedToken(token: string) {
  localStorage.setItem('scdip_token', token)

  window.dispatchEvent(
    new CustomEvent(TOKEN_REFRESHED_EVENT, {
      detail: { token },
    }),
  )
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        notifySessionInvalid()
        return null
      }

      const body = await response.json() as RefreshResponse

      if (
        typeof body.access_token !== 'string' ||
        !body.access_token.trim()
      ) {
        notifySessionInvalid()
        return null
      }

      saveRefreshedToken(body.access_token)

      return body.access_token
    } catch {
      notifySessionInvalid()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function parseApiError(response: Response): Promise<ApiError> {
  let message = `Erreur HTTP ${response.status}`
  let detail: unknown

  try {
    const body = await response.json()
    detail = body.detail

    if (typeof body.detail === 'string') {
      message = body.detail
    } else if (body.detail !== undefined) {
      message = JSON.stringify(body.detail)
    }
  } catch {
    // La réponse ne contient pas de JSON exploitable.
  }

  return new ApiError(response.status, message, detail)
}

function isAuthenticationEndpoint(path: string): boolean {
  return (
    path.startsWith('/api/v1/auth/login') ||
    path.startsWith('/api/v1/auth/refresh') ||
    path.startsWith('/api/v1/auth/logout')
  )
}

async function executeRequest(
  path: string,
  token: string,
  options: RequestInit,
): Promise<Response> {
  const headers = new Headers(options.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  } else {
    headers.delete('Authorization')
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })
}

export async function api<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  let response = await executeRequest(path, token, options)

  if (
    response.status === 401 &&
    !isAuthenticationEndpoint(path)
  ) {
    const newToken = await refreshAccessToken()

    if (!newToken) {
      throw await parseApiError(response)
    }

    // Rejoue automatiquement la requête initiale avec le nouveau JWT.
    response = await executeRequest(path, newToken, options)

    if (response.status === 401) {
      notifySessionInvalid()
    }
  }

  if (!response.ok) {
    throw await parseApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export { API_URL }