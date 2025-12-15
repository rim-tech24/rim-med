'use client'

import { useState } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  UserPlus, Users, Calendar, AlertTriangle,
} from 'lucide-react'

type TurnStatus = 'WAITING' | 'NEXT' | 'DONE'

type Turn = {
  id: string
  patientName: string
  urgent: boolean
  status: TurnStatus
}

export function QueueManagement() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [showAddTurn, setShowAddTurn] = useState(false)
  const [patientName, setPatientName] = useState('')
  const [urgent, setUrgent] = useState(false)

  const waiting = turns.filter(t => t.status === 'WAITING')
  const next = turns.find(t => t.status === 'NEXT')
  const done = turns.filter(t => t.status === 'DONE')

  const addTurn = () => {
    if (!patientName.trim()) return

    setTurns(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        patientName,
        urgent,
        status: prev.length === 0 ? 'NEXT' : 'WAITING',
      },
    ])

    setPatientName('')
    setUrgent(false)
    setShowAddTurn(false)
  }

  const markDone = (id: string) => {
    setTurns(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, status: 'DONE' } : t
      )

      const hasNext = updated.some(t => t.status === 'NEXT')
      if (!hasNext) {
        const nextWaiting = updated.find(t => t.status === 'WAITING')
        if (nextWaiting) {
          nextWaiting.status = 'NEXT'
        }
      }

      return [...updated]
    })
  }

  return (
    <div className="space-y-6">

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Stat title="Total Turns" value={turns.length} />
        <Stat title="Waiting" value={waiting.length} />
        <Stat title="In Consultation" value={next ? 1 : 0} />
        <Stat title="Completed" value={done.length} />
        <Stat title="Urgent" value={turns.filter(t => t.urgent).length} urgent />
      </div>

      {/* ADD TURN */}
      <Dialog open={showAddTurn} onOpenChange={setShowAddTurn}>
        <DialogTrigger asChild>
          <Button size="lg">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Turn
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new patient</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Patient name</Label>
              <Input
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={urgent} onCheckedChange={v => setUrgent(!!v)} />
              <Label>Urgent</Label>
            </div>

            <Button onClick={addTurn} className="w-full">
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* NEXT */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Calendar className="h-5 w-5" />
              Next Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            {next ? (
              <TurnRow turn={next} onDone={markDone} />
            ) : (
              <Empty />
            )}
          </CardContent>
        </Card>

        {/* WAITING */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Users className="h-5 w-5" />
              Waiting Queue
              <Badge>{waiting.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              {waiting.length === 0 && <Empty />}
              {waiting.map(t => (
                <TurnRow key={t.id} turn={t} />
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

/* ---------- helpers ---------- */

function Stat({ title, value, urgent }: any) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${urgent ? 'text-red-600' : ''}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function TurnRow({ turn, onDone }: any) {
  return (
    <div className="border rounded p-3 mb-3 flex justify-between items-center">
      <div>
        <div className="font-medium">{turn.patientName}</div>
        {turn.urgent && (
          <div className="flex items-center gap-1 text-red-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Urgent
          </div>
        )}
      </div>

      {onDone && (
        <Button size="sm" onClick={() => onDone(turn.id)}>
          Done
        </Button>
      )}
    </div>
  )
}

function Empty() {
  return (
    <div className="text-center text-gray-500 py-6">
      No patients
    </div>
  )
}
