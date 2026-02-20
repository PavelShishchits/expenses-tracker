import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation bar added in Phase 3 */}
      <main className="container mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  )
}
