'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { QueueManagement } from '@/components/queue/queue-management'
import { AuthService } from '@/lib/auth'

export default function DashboardPage() {
  const [currentPath, setCurrentPath] = useState('/')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

 useEffect(() => {
  setIsAuthenticated(true)
}, [])


  const handleNavigate = (path: string) => {
    setCurrentPath(path)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">RimMed</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout currentPath={currentPath} onNavigate={handleNavigate}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Queue Management</h1>
          <p className="text-gray-600 mt-2">
            Manage patient turns and queue for your clinic
          </p>
        </div>
        
        <QueueManagement />
      </div>
    </MainLayout>
  )
}