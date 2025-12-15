import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TurnService, PatientService, ClinicService, NotificationService } from '@/lib/services'
import type { CreateTurnData } from '@/lib/types'

// Query keys
export const queryKeys = {
  turns: ['turns'] as const,
  todayTurns: (clinicId: string) => ['turns', 'today', clinicId] as const,
  turn: (id: string) => ['turn', id] as const,
  patients: ['patients'] as const,
  clinicPatients: (clinicId: string) => ['patients', 'clinic', clinicId] as const,
  patient: (id: string) => ['patient', id] as const,
  queueStats: (clinicId: string, date?: Date) => ['queue-stats', clinicId, date] as const,
  nextInQueue: (clinicId: string) => ['next-in-queue', clinicId] as const,
}

// ----------------------------
// Helpers (cola profesional)
// ----------------------------
type TurnStatus =
  | 'SCHEDULED'
  | 'WAITING'
  | 'NEXT'
  | 'IN_CONSULTATION'
  | 'DONE'
  | 'CANCELLED'
  | 'SKIPPED'

type TurnLike = {
  id: string
  clinicId: string
  status: TurnStatus
  isUrgent?: boolean
  queuePosition?: number | null
  checkedInAt?: string | Date | null
}

// Orden: urgentes primero, luego FIFO por queuePosition (o checkedInAt si falta)
function pickBestNextCandidate(turns: TurnLike[]) {
  const waiting = turns.filter(t => t.status === 'WAITING')
  if (waiting.length === 0) return null

  const toNumberTime = (d?: string | Date | null) => {
    if (!d) return Number.MAX_SAFE_INTEGER
    const dt = typeof d === 'string' ? new Date(d) : d
    const n = dt.getTime()
    return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER
  }

  return waiting
    .slice()
    .sort((a, b) => {
      // 1) urgentes primero
      const au = a.isUrgent ? 1 : 0
      const bu = b.isUrgent ? 1 : 0
      if (au !== bu) return bu - au

      // 2) queuePosition más bajo primero (si existe)
      const ap = a.queuePosition ?? Number.MAX_SAFE_INTEGER
      const bp = b.queuePosition ?? Number.MAX_SAFE_INTEGER
      if (ap !== bp) return ap - bp

      // 3) si no hay queuePosition, checkedInAt más antiguo primero
      return toNumberTime(a.checkedInAt) - toNumberTime(b.checkedInAt)
    })[0]
}

async function promoteNextIfNeeded(clinicId: string, userId: string) {
  if (!clinicId || !userId) return

  const turns = (await TurnService.getTodayTurns(clinicId)) as TurnLike[]

  // Si ya hay alguien en NEXT o IN_CONSULTATION, NO promovemos nada automáticamente.
  const hasActive =
    turns.some(t => t.status === 'NEXT') || turns.some(t => t.status === 'IN_CONSULTATION')
  if (hasActive) return

  // Si no hay activo, promovemos el mejor WAITING
  const candidate = pickBestNextCandidate(turns)
  if (!candidate) return

  await TurnService.updateTurnStatus(candidate.id, 'NEXT', userId)
}

// Garantiza 1 solo NEXT: si vas a poner uno como NEXT, baja el anterior NEXT a WAITING
async function ensureSingleNext(clinicId: string, userId: string, nextTurnId: string) {
  const turns = (await TurnService.getTodayTurns(clinicId)) as TurnLike[]
  const currentNext = turns.find(t => t.status === 'NEXT' && t.id !== nextTurnId)
  if (!currentNext) return

  await TurnService.updateTurnStatus(currentNext.id, 'WAITING', userId)
}

// ----------------------------
// Turn hooks
// ----------------------------
export function useTodayTurns(clinicId: string) {
  return useQuery({
    queryKey: queryKeys.todayTurns(clinicId),
    queryFn: () => TurnService.getTodayTurns(clinicId),
    enabled: !!clinicId,
    refetchInterval: 30000,
  })
}

export function useTurn(turnId: string) {
  return useQuery({
    queryKey: queryKeys.turn(turnId),
    queryFn: () => TurnService.getTurnById(turnId),
    enabled: !!turnId,
  })
}

export function useCreateTurn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTurnData & { clinicId: string; createdBy: string }) =>
      TurnService.createTurn(data),
    onSuccess: (newTurn: any, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTurns(variables.clinicId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.queueStats(variables.clinicId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.nextInQueue(variables.clinicId) })
    },
  })
}

export function useUpdateTurnStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ turnId, status, updatedBy, notes }: {
      turnId: string
      status: TurnStatus
      updatedBy: string
      notes?: string
    }) => TurnService.updateTurnStatus(turnId, status, updatedBy, notes),
    onSuccess: (updatedTurn: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTurns(updatedTurn.clinicId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.turn(updatedTurn.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.queueStats(updatedTurn.clinicId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.nextInQueue(updatedTurn.clinicId) })
    },
  })
}

export function useReorderTurns() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clinicId, turnIds, updatedBy }: {
      clinicId: string
      turnIds: string[]
      updatedBy: string
    }) => TurnService.reorderTurns(clinicId, turnIds, updatedBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTurns(variables.clinicId) })
    },
  })
}

export function useNextInQueue(clinicId: string) {
  return useQuery({
    queryKey: queryKeys.nextInQueue(clinicId),
    queryFn: () => TurnService.getNextInQueue(clinicId),
    enabled: !!clinicId,
    refetchInterval: 10000,
  })
}

// ----------------------------
// Patient hooks
// ----------------------------
export function useClinicPatients(clinicId: string, search?: string) {
  return useQuery({
    queryKey: [...queryKeys.clinicPatients(clinicId), search],
    queryFn: () => PatientService.getPatientsByClinic(clinicId, search),
    enabled: !!clinicId,
  })
}

export function usePatient(patientId: string) {
  return useQuery({
    queryKey: queryKeys.patient(patientId),
    queryFn: () => PatientService.getPatientById(patientId),
    enabled: !!patientId,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => PatientService.createPatient(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clinicPatients(variables.clinicId) })
    },
  })
}

export function useFindOrCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clinicId, phoneNumber, name }: {
      clinicId: string
      phoneNumber: string
      name: string
    }) => PatientService.findOrCreatePatient(clinicId, phoneNumber, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clinicPatients(variables.clinicId) })
    },
  })
}

// ----------------------------
// Queue stats hook
// ----------------------------
export function useQueueStats(clinicId: string, date?: Date) {
  return useQuery({
    queryKey: queryKeys.queueStats(clinicId, date),
    queryFn: () => TurnService.getQueueStats(clinicId, date),
    enabled: !!clinicId,
    refetchInterval: 15000,
  })
}

// ----------------------------
// Clinic hooks
// ----------------------------
export function useClinic(clinicId: string) {
  return useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: () => ClinicService.getClinicById(clinicId),
    enabled: !!clinicId,
  })
}

export function useClinics() {
  return useQuery({
    queryKey: ['clinics'],
    queryFn: () => ClinicService.getClinics(),
  })
}

// ----------------------------
// Notification hooks
// ----------------------------
export function usePendingNotifications(clinicId: string) {
  return useQuery({
    queryKey: ['notifications', 'pending', clinicId],
    queryFn: () => NotificationService.getPendingNotifications(clinicId),
    enabled: !!clinicId,
    refetchInterval: 30000,
  })
}

// ----------------------------
// Utility hooks for turn actions (LOGICA CENTRAL)
// ----------------------------
export function useTurnActions(clinicId: string, userId: string) {
  const queryClient = useQueryClient()
  const updateTurnStatus = useUpdateTurnStatus()
  const createTurn = useCreateTurn()

  const refresh = async () => {
    if (!clinicId) return
    await queryClient.invalidateQueries({ queryKey: queryKeys.todayTurns(clinicId) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.queueStats(clinicId) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.nextInQueue(clinicId) })
  }

  const checkIn = async (turnId: string) => {
    const res = await updateTurnStatus.mutateAsync({
      turnId,
      status: 'WAITING',
      updatedBy: userId,
    })
    await promoteNextIfNeeded(clinicId, userId)
    await refresh()
    return res
  }

  const callNext = async (turnId: string) => {
    // Si vas a poner este como NEXT, asegúrate de que no haya otro NEXT
    await ensureSingleNext(clinicId, userId, turnId)

    const res = await updateTurnStatus.mutateAsync({
      turnId,
      status: 'NEXT',
      updatedBy: userId,
    })
    await refresh()
    return res
  }

  const startConsultation = async (turnId: string) => {
    const res = await updateTurnStatus.mutateAsync({
      turnId,
      status: 'IN_CONSULTATION',
      updatedBy: userId,
    })
    await refresh()
    return res
  }

  const markDone = async (turnId: string, notes?: string) => {
    const res = await updateTurnStatus.mutateAsync({
      turnId,
      status: 'DONE',
      updatedBy: userId,
      notes,
    })
    // Al terminar, promueve automáticamente al siguiente (si no hay activo)
    await promoteNextIfNeeded(clinicId, userId)
    await refresh()
    return res
  }

  const cancelTurn = async (turnId: string) => {
    const res = await updateTurnStatus.mutateAsync({
      turnId,
      status: 'CANCELLED',
      updatedBy: userId,
    })
    await promoteNextIfNeeded(clinicId, userId)
    await refresh()
    return res
  }

  const skipTurn = async (turnId: string) => {
    const res = await updateTurnStatus.mutateAsync({
      turnId,
      status: 'SKIPPED',
      updatedBy: userId,
    })
    await promoteNextIfNeeded(clinicId, userId)
    await refresh()
    return res
  }

  const returnToWaiting = async (turnId: string) => {
    const res = await updateTurnStatus.mutateAsync({
      turnId,
      status: 'WAITING',
      updatedBy: userId,
    })
    // Si no hay activo, puede promoverse este u otro (urgentes primero)
    await promoteNextIfNeeded(clinicId, userId)
    await refresh()
    return res
  }

  const addTurn = async (data: CreateTurnData) => {
    const newTurn: any = await createTurn.mutateAsync({
      ...data,
      clinicId,
      createdBy: userId,
    })

    // Regla: si no hay NEXT/IN_CONSULTATION, promovemos automáticamente
    await promoteNextIfNeeded(clinicId, userId)
    await refresh()
    return newTurn
  }

  return {
    checkIn,
    callNext,
    startConsultation,
    markDone,
    cancelTurn,
    skipTurn,
    returnToWaiting,
    addTurn,
    isLoading: updateTurnStatus.isPending || createTurn.isPending,
  }
}
