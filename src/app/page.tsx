'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { QueueManagement } from '@/components/queue/queue-management'

export default function DashboardPage() {
  const [currentPath, setCurrentPath] = useState('/')

  return (
    <MainLayout currentPath={currentPath} onNavigate={setCurrentPath}>
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
