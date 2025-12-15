// Core types for RimMed system

export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type TurnStatus = 'SCHEDULED' | 'WAITING' | 'NEXT' | 'IN_CONSULTATION' | 'DONE' | 'CANCELLED' | 'SKIPPED'
export type NotificationEventType = 'TURN_REGISTERED' | 'TURN_CHECKED_IN' | 'TURN_NEXT' | 'TURN_IN_CONSULTATION' | 'TURN_DONE' | 'TURN_CANCELLED' | 'TURN_DELAYED'
export type NotificationChannel = 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PUSH'
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'RETRYING'

export interface Clinic {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  timezone: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Profile {
  id: string
  authUserId: string
  clinicId: string
  email: string
  name: string
  phone?: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Patient {
  id: string
  clinicId: string
  phoneNumber: string
  name: string
  email?: string
  dateOfBirth?: Date
  gender?: Gender
  address?: string
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Turn {
  id: string
  clinicId: string
  patientId: string
  turnDate: Date
  queuePosition: number
  status: TurnStatus
  isUrgent: boolean
  scheduledTime?: Date
  checkedInAt?: Date
  calledAt?: Date
  consultationStartAt?: Date
  consultationEndAt?: Date
  completedAt?: Date
  serviceType?: string
  serviceNotes?: string
  servicePrice?: number
  invoiceId?: string
  createdBy: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
  
  // Relations
  patient?: Patient
  creator?: Profile
  updater?: Profile
}

export interface NotificationEvent {
  id: string
  clinicId: string
  turnId: string
  eventType: NotificationEventType
  channel: NotificationChannel
  recipient: string
  payload?: any
  status: NotificationStatus
  sentAt?: Date
  error?: string
  retryCount: number
  createdAt: Date
  updatedAt: Date
}

export interface AuditLog {
  id: string
  clinicId: string
  userId: string
  action: string
  entity: string
  entityId: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// UI State types
export interface QueueStats {
  total: number
  waiting: number
  inConsultation: number
  done: number
  urgent: number
}

export interface TurnWithPatient extends Turn {
  patient: Patient
}

export interface CreateTurnData {
  patientId: string
  isUrgent?: boolean
  scheduledTime?: Date
  serviceType?: string
  notes?: string
}

export interface UpdateTurnStatusData {
  status: TurnStatus
  notes?: string
  serviceType?: string
  servicePrice?: number
}

export interface CreatePatientData {
  name: string
  phoneNumber: string
  email?: string
  dateOfBirth?: Date
  gender?: Gender
  address?: string
  notes?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Real-time subscription types
export interface RealtimeEvent {
  type: 'turn_created' | 'turn_updated' | 'turn_deleted' | 'patient_updated'
  data: any
  clinicId: string
}

// Dashboard types
export interface TodayOverview {
  date: Date
  totalTurns: number
  completedTurns: number
  cancelledTurns: number
  averageWaitTime: number
  currentlyInQueue: number
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  action: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: boolean
}