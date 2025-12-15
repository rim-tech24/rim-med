'use client'

import { useState } from 'react'
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
  Square
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
  isLoading = false
}: TurnCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
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

  const getActionButtons = () => {
    switch (turn.status) {
      case 'SCHEDULED':
        return (
          <Button 
            onClick={onCheckIn} 
            disabled={isLoading}
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Check In
          </Button>
        )
      
      case 'WAITING':
        return (
          <Button 
            onClick={onCall} 
            disabled={isLoading}
            className="w-full"
            variant={isNext ? "default" : "outline"}
          >
            <Play className="h-4 w-4 mr-2" />
            {isNext ? 'Call Now' : 'Call Next'}
          </Button>
        )
      
      case 'NEXT':
        return (
          <div className="space-y-2">
            <Button 
              onClick={onStartConsultation} 
              disabled={isLoading}
              className="w-full"
            >
              <User className="h-4 w-4 mr-2" />
              Start Consultation
            </Button>
            <Button 
              onClick={onSkip} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
          </div>
        )
      
      case 'IN_CONSULTATION':
        return (
          <Button 
            onClick={onMarkDone} 
            disabled={isLoading}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Done
          </Button>
        )
      
      case 'SKIPPED':
        return (
          <div className="space-y-2">
            <Button 
              onClick={onReturnToWaiting} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              Return to Waiting
            </Button>
            <Button 
              onClick={onCancel} 
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )
      
      default:
        return null
    }
  }

  const formatWaitTime = () => {
    if (turn.checkedInAt) {
      const now = new Date()
      const checkedIn = new Date(turn.checkedInAt)
      const diffMs = now.getTime() - checkedIn.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      return `${diffMins}m`
    }
    return null
  }

  return (
    <Card className={cn(
      'transition-all duration-200',
      isNext && 'ring-2 ring-blue-500 shadow-lg',
      turn.status === 'DONE' && 'opacity-60'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {turn.patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{turn.patient.name}</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{turn.patient.phoneNumber}</span>
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
            <Badge className={getStatusColor(turn.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(turn.status)}
                <span>{turn.status.replace('_', ' ')}</span>
              </div>
            </Badge>
            {turn.isUrgent && (
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
            <span className="font-medium">#{turn.queuePosition}</span>
          </div>
          
          {turn.scheduledTime && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Scheduled</span>
              <span className="font-medium">
                {format(new Date(turn.scheduledTime), 'HH:mm')}
              </span>
            </div>
          )}

          {turn.serviceType && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Service</span>
              <span className="font-medium">{turn.serviceType}</span>
            </div>
          )}

          {getActionButtons()}
        </div>
      </CardContent>
    </Card>
  )
}