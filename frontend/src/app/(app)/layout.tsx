'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { type AuthUser } from '@/services/auth.service'

type AppAuthContext = {
  user: AuthUser | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AppAuthContext | null>(null)

export function useAppAuth(): AppAuthContext {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAppAuth must be used within AppLayout')
  return ctx
}

export { AuthContext }

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto max-w-2xl px-4 py-8">{children}</main>
      </div>
    </AuthContext.Provider>
  )
}
