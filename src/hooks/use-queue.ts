import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TurnService, PatientService, ClinicService, NotificationService } from '@/lib/services'
import type { Turn, Patient, TurnWithPatient, CreateTurnData, UpdateTurnStatusData, QueueStats } from '@/lib/types'

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

// Turn hooks
export function useTodayTurns(clinicId: string) {
  return useQuery({
    queryKey: queryKeys.todayTurns(clinicId),
    queryFn: () => TurnService.getTodayTurns(clinicId),
    enabled: !!clinicId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
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
    onSuccess: (newTurn, variables) => {
      // Invalidate today's turns for the clinic
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
      status: any
      updatedBy: string
      notes?: string
    }) => TurnService.updateTurnStatus(turnId, status, updatedBy, notes),
    onSuccess: (updatedTurn) => {
      // Invalidate related queries
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
    refetchInterval: 10000, // Check frequently for next patient
  })
}

// Patient hooks
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

// Queue stats hook
export function useQueueStats(clinicId: string, date?: Date) {
  return useQuery({
    queryKey: queryKeys.queueStats(clinicId, date),
    queryFn: () => TurnService.getQueueStats(clinicId, date),
    enabled: !!clinicId,
    refetchInterval: 15000, // Update stats every 15 seconds
  })
}

// Clinic hooks
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

// Notification hooks
export function usePendingNotifications(clinicId: string) {
  return useQuery({
    queryKey: ['notifications', 'pending', clinicId],
    queryFn: () => NotificationService.getPendingNotifications(clinicId),
    enabled: !!clinicId,
    refetchInterval: 30000, // Check for pending notifications every 30 seconds
  })
}

// Utility hooks for turn actions
export function useTurnActions(clinicId: string, userId: string) {
  const updateTurnStatus = useUpdateTurnStatus()
  const createTurn = useCreateTurn()

  const checkIn = (turnId: string) => {
    return updateTurnStatus.mutateAsync({
      turnId,
      status: 'WAITING',
      updatedBy: userId
    })
  }

  const callNext = (turnId: string) => {
    return updateTurnStatus.mutateAsync({
      turnId,
      status: 'NEXT',
      updatedBy: userId
    })
  }

  const startConsultation = (turnId: string) => {
    return updateTurnStatus.mutateAsync({
      turnId,
      status: 'IN_CONSULTATION',
      updatedBy: userId
    })
  }

  const markDone = (turnId: string, notes?: string, serviceType?: string, servicePrice?: number) => {
    return updateTurnStatus.mutateAsync({
      turnId,
      status: 'DONE',
      updatedBy: userId,
      notes
    })
  }

  const cancelTurn = (turnId: string) => {
    return updateTurnStatus.mutateAsync({
      turnId,
      status: 'CANCELLED',
      updatedBy: userId
    })
  }

  const skipTurn = (turnId: string) => {
    return updateTurnStatus.mutateAsync({
      turnId,
      status: 'SKIPPED',
      updatedBy: userId
    })
  }

  const returnToWaiting = (turnId: string) => {
    return updateTurnStatus.mutateAsync({
      turnId,
      status: 'WAITING',
      updatedBy: userId
    })
  }

  const addTurn = (data: CreateTurnData) => {
    return createTurn.mutateAsync({
      ...data,
      clinicId,
      createdBy: userId
    })
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
    isLoading: updateTurnStatus.isPending || createTurn.isPending
  }
}