'use client'

import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  UserPlus,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  SkipForward,
  User,
  AlertTriangle,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TurnWithPatient } from '@/lib/types'

interface TurnCardProps {
  turn: TurnWithPatient
  isNext?: boolean
  onCheckIn: () => void
  onCall: () => void
  onStartConsultation: () => void
  onMarkDone: () => void
  onCancel: () => void
  onSkip: () => void
  onReturnToWaiting: () => void
  isLoading?: boolean
}

export function TurnCard({
  turn,
  isNext = false,
  onCheckIn,
  onCall,
  onStartConsultation,
  onMarkDone,
  onCancel,
  onSkip,
  onReturnToWaiting,
  isLoading = false,
}: TurnCardProps) {
  // Normalizamos status (por si viene "waiting", "Waiting", etc.)
  const statusRaw = (turn as any)?.status ?? ''
  const status = String(statusRaw).toUpperCase().trim()

  const statusLabel = status ? status.split('_').join(' ') : 'UNKNOWN'

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'SCHEDULED':
        return 'bg-gray-100 text-gray-800'
      case 'WAITING':
        return 'bg-green-100 text-green-800'
      case 'NEXT':
        return 'bg-blue-100 text-blue-800'
      case 'IN_CONSULTATION':
        return 'bg-purple-100 text-purple-800'
      case 'DONE':
        return 'bg-gray-100 text-gray-600'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'SKIPPED':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'WAITING':
        return <Clock className="h-3 w-3" />
      case 'NEXT':
        return <Play className="h-3 w-3" />
      case 'IN_CONSULTATION':
        return <User className="h-3 w-3" />
      case 'DONE':
        return <CheckCircle className="h-3 w-3" />
      case 'CANCELLED':
        return <XCircle className="h-3 w-3" />
      case 'SKIPPED':
        return <SkipForward className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const formatWaitTime = () => {
    const checkedInAt = (turn as any)?.checkedInAt
    if (!checkedInAt) return null

    const now = new Date()
    const checkedIn = new Date(checkedInAt)
    const diffMs = now.getTime() - checkedIn.getTime()
    const diffMins = Math.max(0, Math.floor(diffMs / 60000))
    return `${diffMins}m`
  }

  const initials = (() => {
    const name = turn?.patient?.name || 'Patient'
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? '')
      .join('')
  })()

  const getActionButtons = () => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <div className="space-y-2">
            <Button onClick={onCheckIn} disabled={isLoading} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Check In
            </Button>
            <Button onClick={onCancel} disabled={isLoading} variant="destructive" className="w-full">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )

      case 'WAITING':
        return (
          <div className="space-y-2">
            <Button
              onClick={onCall}
              disabled={isLoading}
              className="w-full"
              variant={isNext ? 'default' : 'outline'}
            >
              <Play className="h-4 w-4 mr-2" />
              {isNext ? 'Call Now' : 'Call'}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onSkip} disabled={isLoading} variant="outline">
                <SkipForward className="h-4 w-4 mr-2" />
                Skip
              </Button>
              <Button onClick={onCancel} disabled={isLoading} variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )

      case 'NEXT':
        return (
          <div className="space-y-2">
            <Button onClick={onStartConsultation} disabled={isLoading} className="w-full">
              <User className="h-4 w-4 mr-2" />
              Start Consultation
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onSkip} disabled={isLoading} variant="outline">
                <SkipForward className="h-4 w-4 mr-2" />
                Skip
              </Button>
              <Button onClick={onCancel} disabled={isLoading} variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )

      case 'IN_CONSULTATION':
        return (
          <div className="space-y-2">
            <Button onClick={onMarkDone} disabled={isLoading} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Done
            </Button>
            <Button onClick={onCancel} disabled={isLoading} variant="destructive" className="w-full">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )

      case 'SKIPPED':
        return (
          <div className="space-y-2">
            <Button onClick={onReturnToWaiting} disabled={isLoading} variant="outline" className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              Return to Waiting
            </Button>
            <Button onClick={onCancel} disabled={isLoading} variant="destructive" className="w-full">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )

      // DONE / CANCELLED => no actions
      default:
        return null
    }
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isNext && 'ring-2 ring-blue-500 shadow-lg',
        status === 'DONE' && 'opacity-60'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{turn?.patient?.name ?? 'Patient'}</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{turn?.patient?.phoneNumber ?? '-'}</span>
                {formatWaitTime() && (
                  <>
                    <span>•</span>
                    <span>{formatWaitTime()} waiting</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1">
            <Badge className={getStatusColor(status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(status)}
                <span>{statusLabel}</span>
              </div>
            </Badge>

            {!!turn?.isUrgent && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Queue Position</span>
            <span className="font-medium">#{(turn as any)?.queuePosition ?? '-'}</span>
          </div>

          {(turn as any)?.scheduledTime && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Scheduled</span>
              <span className="font-medium">
                {format(new Date((turn as any).scheduledTime), 'HH:mm')}
              </span>
            </div>
          )}

          {(turn as any)?.serviceType && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Service</span>
              <span className="font-medium">{(turn as any).serviceType}</span>
            </div>
          )}

          {getActionButtons()}
        </div>
      </CardContent>
    </Card>
  )
}
