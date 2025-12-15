'use client'

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'

type BasicUser = {
  name: string
  email: string
  role: string
}

interface MainLayoutProps {
  children: ReactNode
  currentPath: string
  onNavigate: (path: string) => void
  user?: BasicUser
}

const FALLBACK_USER: BasicUser = {
  name: 'RimMed Admin',
  email: 'admin@rimmed.local',
  role: 'ADMIN',
}

export function MainLayout({ children, currentPath, onNavigate, user }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        user={user ?? FALLBACK_USER}
        currentPath={currentPath}
        onNavigate={onNavigate}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
