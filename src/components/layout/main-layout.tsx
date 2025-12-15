'use client'

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { AuthService } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

interface MainLayoutProps {
  children: ReactNode
  currentPath: string
  onNavigate: (path: string) => void
}

export function MainLayout({ children, currentPath, onNavigate }: MainLayoutProps) {
  const user = AuthService.getCurrentUser()
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">RimMed</h1>
          <p className="text-gray-600">Please sign in to continue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        user={user} 
        currentPath={currentPath} 
        onNavigate={onNavigate} 
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}