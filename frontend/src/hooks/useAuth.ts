'use client'

import { useState, useEffect } from 'react'
import { type LoginInput, type RegisterInput } from '@expenses-tracker/shared'
import {
  type AuthUser,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  refresh,
} from '@/services/auth.service'

type AuthState = {
  user: AuthUser | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    refresh()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(input: LoginInput): Promise<void> {
    const authUser = await authLogin(input)
    setUser(authUser)
  }

  async function register(input: RegisterInput): Promise<void> {
    const authUser = await authRegister(input)
    setUser(authUser)
  }

  async function logout(): Promise<void> {
    try {
      await authLogout()
    } finally {
      setUser(null)
    }
  }

  return { user, isLoading, login, register, logout }
}
