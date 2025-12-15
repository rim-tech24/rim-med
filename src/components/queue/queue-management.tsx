'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  UserPlus, 
  Search, 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { TurnCard } from './turn-card'
import { useTodayTurns, useQueueStats, useClinicPatients, useTurnActions } from '@/hooks'
import { AuthService } from '@/lib/auth'
import type { TurnWithPatient, Patient } from '@/lib/types'

export function QueueManagement() {
  const [searchPatient, setSearchPatient] = useState('')
  const [showAddTurn, setShowAddTurn] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isUrgent, setIsUrgent] = useState(false)
  const [serviceType, setServiceType] = useState('')

  const user = AuthService.getCurrentUser()
  const clinicId = user?.clinicId || ''
  const userId = user?.id || ''

  const { data: turns = [], isLoading: turnsLoading } = useTodayTurns(clinicId)
  const { data: stats } = useQueueStats(clinicId)
  const { data: patients = [] } = useClinicPatients(clinicId, searchPatient)
  
  const turnActions = useTurnActions(clinicId, userId)

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.phoneNumber.includes(searchPatient)
  )

  const handleAddTurn = async () => {
    if (!selectedPatient) return

    try {
      await turnActions.addTurn({
        patientId: selectedPatient.id,
        isUrgent,
        serviceType
      })
      
      // Reset form
      setSelectedPatient(null)
      setIsUrgent(false)
      setServiceType('')
      setShowAddTurn(false)
      setSearchPatient('')
    } catch (error) {
      console.error('Failed to add turn:', error)
    }
  }

  const handleTurnAction = async (turnId: string, action: () => Promise<void>) => {
    try {
      await action()
    } catch (error) {
      console.error('Failed to perform turn action:', error)
    }
  }

  const getNextInQueue = () => {
    return turns.find(turn => turn.status === 'NEXT')
  }

  const getTurnsByStatus = (status: string) => {
    return turns.filter(turn => turn.status === status)
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Turns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.waiting || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Consultation</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.inConsultation || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats?.done || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.urgent || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Dialog open={showAddTurn} onOpenChange={setShowAddTurn}>
            <DialogTrigger asChild>
              <Button size="lg">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Turn
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Turn</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-search">Search Patient</Label>
                  <Input
                    id="patient-search"
                    placeholder="Search by name or phone..."
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                  />
                </div>

                {searchPatient && (
                  <ScrollArea className="h-32 border rounded-md p-2">
                    <div className="space-y-2">
                      {filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className={`
                            p-2 rounded cursor-pointer transition-colors
                            ${selectedPatient?.id === patient.id 
                              ? 'bg-blue-100 border-blue-300 border' 
                              : 'hover:bg-gray-100'
                            }
                          `}
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-gray-600">{patient.phoneNumber}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                <div className="space-y-2">
                  <Label htmlFor="service-type">Service Type (Optional)</Label>
                  <Input
                    id="service-type"
                    placeholder="e.g., General Consultation"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urgent"
                    checked={isUrgent}
                    onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
                  />
                  <Label htmlFor="urgent">Mark as Urgent</Label>
                </div>

                <Button 
                  onClick={handleAddTurn}
                  disabled={!selectedPatient || turnActions.isLoading}
                  className="w-full"
                >
                  Add Turn
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Queue Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Patient */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Next Patient</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const nextTurn = getNextInQueue()
                return nextTurn ? (
                  <TurnCard
                    turn={nextTurn}
                    isNext={true}
                    onCheckIn={() => handleTurnAction(nextTurn.id, () => turnActions.checkIn(nextTurn.id))}
                    onCall={() => handleTurnAction(nextTurn.id, () => turnActions.callNext(nextTurn.id))}
                    onStartConsultation={() => handleTurnAction(nextTurn.id, () => turnActions.startConsultation(nextTurn.id))}
                    onMarkDone={() => handleTurnAction(nextTurn.id, () => turnActions.markDone(nextTurn.id))}
                    onCancel={() => handleTurnAction(nextTurn.id, () => turnActions.cancelTurn(nextTurn.id))}
                    onSkip={() => handleTurnAction(nextTurn.id, () => turnActions.skipTurn(nextTurn.id))}
                    onReturnToWaiting={() => handleTurnAction(nextTurn.id, () => turnActions.returnToWaiting(nextTurn.id))}
                    isLoading={turnActions.isLoading}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No patients in queue</p>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Waiting Queue */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Waiting Queue</span>
                  <Badge variant="secondary">{getTurnsByStatus('WAITING').length}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {getTurnsByStatus('WAITING').map((turn) => (
                    <TurnCard
                      key={turn.id}
                      turn={turn}
                      onCheckIn={() => handleTurnAction(turn.id, () => turnActions.checkIn(turn.id))}
                      onCall={() => handleTurnAction(turn.id, () => turnActions.callNext(turn.id))}
                      onStartConsultation={() => handleTurnAction(turn.id, () => turnActions.startConsultation(turn.id))}
                      onMarkDone={() => handleTurnAction(turn.id, () => turnActions.markDone(turn.id))}
                      onCancel={() => handleTurnAction(turn.id, () => turnActions.cancelTurn(turn.id))}
                      onSkip={() => handleTurnAction(turn.id, () => turnActions.skipTurn(turn.id))}
                      onReturnToWaiting={() => handleTurnAction(turn.id, () => turnActions.returnToWaiting(turn.id))}
                      isLoading={turnActions.isLoading}
                    />
                  ))}
                  
                  {getTurnsByStatus('IN_CONSULTATION').map((turn) => (
                    <TurnCard
                      key={turn.id}
                      turn={turn}
                      onCheckIn={() => handleTurnAction(turn.id, () => turnActions.checkIn(turn.id))}
                      onCall={() => handleTurnAction(turn.id, () => turnActions.callNext(turn.id))}
                      onStartConsultation={() => handleTurnAction(turn.id, () => turnActions.startConsultation(turn.id))}
                      onMarkDone={() => handleTurnAction(turn.id, () => turnActions.markDone(turn.id))}
                      onCancel={() => handleTurnAction(turn.id, () => turnActions.cancelTurn(turn.id))}
                      onSkip={() => handleTurnAction(turn.id, () => turnActions.skipTurn(turn.id))}
                      onReturnToWaiting={() => handleTurnAction(turn.id, () => turnActions.returnToWaiting(turn.id))}
                      isLoading={turnActions.isLoading}
                    />
                  ))}

                  {getTurnsByStatus('SKIPPED').map((turn) => (
                    <TurnCard
                      key={turn.id}
                      turn={turn}
                      onCheckIn={() => handleTurnAction(turn.id, () => turnActions.checkIn(turn.id))}
                      onCall={() => handleTurnAction(turn.id, () => turnActions.callNext(turn.id))}
                      onStartConsultation={() => handleTurnAction(turn.id, () => turnActions.startConsultation(turn.id))}
                      onMarkDone={() => handleTurnAction(turn.id, () => turnActions.markDone(turn.id))}
                      onCancel={() => handleTurnAction(turn.id, () => turnActions.cancelTurn(turn.id))}
                      onSkip={() => handleTurnAction(turn.id, () => turnActions.skipTurn(turn.id))}
                      onReturnToWaiting={() => handleTurnAction(turn.id, () => turnActions.returnToWaiting(turn.id))}
                      isLoading={turnActions.isLoading}
                    />
                  ))}

                  {getTurnsByStatus('WAITING').length === 0 && 
                   getTurnsByStatus('IN_CONSULTATION').length === 0 && 
                   getTurnsByStatus('SKIPPED').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No patients in queue</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}