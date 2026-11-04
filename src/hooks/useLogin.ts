
import { useCallback, useState } from 'react'
import type { FormEvent, Dispatch, SetStateAction } from 'react'

type LoginFunction = (
  email: string,
  password: string,
) => Promise<void>

export function useLogin(
  login: LoginFunction,
  setBusy: Dispatch<SetStateAction<boolean>>,
) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleLogin = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setBusy(true)
      setLoginError('')

      try {
        await login(email.trim(), password)
        setPassword('')
      } catch (error) {
        setLoginError(
          error instanceof Error
            ? error.message
            : 'Impossible de contacter le serveur.',
        )
      } finally {
        setBusy(false)
      }
    },
    [login, email, password, setBusy],
  )

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loginError,
    handleLogin,
  }
}
