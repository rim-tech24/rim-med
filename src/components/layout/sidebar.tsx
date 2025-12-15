'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  Menu,
  X,
  Phone,
  Clock,
  UserCheck
} from 'lucide-react'
import { AuthService } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

interface SidebarProps {
  user: AuthUser
  currentPath: string
  onNavigate: (path: string) => void
}

export function Sidebar({ user, currentPath, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST']
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Users,
      path: '/patients',
      roles: ['ADMIN', 'RECEPTIONIST']
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      path: '/calendar',
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      roles: ['ADMIN']
    }
  ]

  const filteredMenuItems = menuItems.filter(item => 
    AuthService.hasAnyRole(item.roles as any[])
  )

  return (
    <div className={cn(
      'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-gray-900">RimMed</h1>
            <p className="text-xs text-gray-500">{user.clinicName}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.path
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                isCollapsed && 'justify-center px-2'
              )}
              onClick={() => onNavigate(item.path)}
            >
              <Icon className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Button>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {user.role}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => AuthService.signOut()}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-gray-600" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => AuthService.signOut()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}